
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { buildInviteEmailHtml } from "./emailBuilder.ts";
import { Resend } from "npm:resend@2.0.0";
import { EmailRequestBody, EmailResult, corsHeaders } from "./types.ts";

// Initialize Resend with API key from environment variable
const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(resendApiKey);

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if API key is configured
    if (!resendApiKey) {
      console.error("Resend API key not configured");
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Resend API key not configured',
          isApiKeyError: true,
          isDomainError: false,
          isSmtpError: false
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
      );
    }

    // Parse request body
    const { 
      email, 
      clientName, 
      mentorName, 
      mentorCompany, 
      registerUrl 
    }: EmailRequestBody = await req.json();

    if (!email) {
      console.error("Email address is required");
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email address is required',
          isApiKeyError: false,
          isDomainError: false,
          isSmtpError: false
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
      );
    }

    // Add detailed logging
    console.log(`Sending invite email to ${email} via Resend API`);
    
    // Build email HTML content
    const emailHtml = buildInviteEmailHtml(
      clientName, 
      mentorName || 'Mentor', 
      mentorCompany || 'RH Mentor Mastery', 
      registerUrl
    );
    
    // Send email using Resend
    const { data: emailData, error: resendError } = await resend.emails.send({
      from: 'RH Mentor Mastery <onboarding@resend.dev>', // Change to your verified domain
      to: [email],
      subject: 'Convite para RH Mentor Mastery',
      html: emailHtml
    });

    // Log response
    console.log("Resend API response:", { data: emailData, error: resendError });

    // Handle Resend errors
    if (resendError) {
      console.error("Resend API Error:", resendError);
      
      // Check for specific error types
      const errorMessage = resendError.message || 'Unknown error';
      const isDomainError = errorMessage.includes('domain') || errorMessage.includes('sender');
      const isApiKeyError = errorMessage.includes('API key') || errorMessage.includes('authentication');
      const isSmtpError = errorMessage.includes('SMTP') || 
                          errorMessage.includes('email') ||
                          errorMessage.includes('server');
      
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          errorDetails: resendError,
          isDomainError: Boolean(isDomainError),
          isApiKeyError: Boolean(isApiKeyError),
          isSmtpError: Boolean(isSmtpError)
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        service: 'Resend',
        id: emailData?.id,
        isApiKeyError: false,
        isDomainError: false,
        isSmtpError: false
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
    );

  } catch (error) {
    console.error("Error processing invitation email:", error);
    
    // Determine error type
    const errorMessage = error.message || 'Unknown error';
    const isDomainError = errorMessage.includes('domain') || errorMessage.includes('sender');
    const isApiKeyError = errorMessage.includes('API key') || errorMessage.includes('authentication');
    const isSmtpError = errorMessage.includes('SMTP') || 
                        errorMessage.includes('email') || 
                        errorMessage.includes('server');
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        errorDetails: error,
        isApiKeyError: Boolean(isApiKeyError),
        isDomainError: Boolean(isDomainError),
        isSmtpError: Boolean(isSmtpError)
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
    );
  }
});
