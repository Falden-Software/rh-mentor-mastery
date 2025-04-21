
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { buildInviteEmailHtml } from "./emailBuilder.ts";
import { Resend } from "npm:resend@2.0.0";
import { EmailRequestBody, EmailResult } from "./types.ts";
import { corsHeaders } from "./types.ts";

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
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Resend API key not configured',
          isApiKeyError: true
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
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
      return new Response(
        JSON.stringify({ success: false, error: 'Email address is required' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }

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

    // Handle Resend errors
    if (resendError) {
      console.error("Resend API Error:", resendError);
      
      // Check for specific error types
      const isDomainError = resendError.message?.includes('domain');
      const isApiKeyError = resendError.message?.includes('API key');
      
      return new Response(
        JSON.stringify({
          success: false,
          error: resendError.message,
          isDomainError,
          isApiKeyError
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        service: 'Resend',
        id: emailData?.id
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
    );

  } catch (error) {
    console.error("Error processing invitation email:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        errorDetails: error
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
    );
  }
});
