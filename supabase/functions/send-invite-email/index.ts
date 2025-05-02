
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { buildInviteEmailHtml } from "./emailBuilder.ts";
import { EmailRequestBody, EmailResult, corsHeaders } from "./types.ts";
import { sendWithResend } from "./emailServices.ts";

// Initialize environment
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ENVIRONMENT = Deno.env.get("ENVIRONMENT") || "production";
const FROM_EMAIL = "convites@rhmaster.space";
const FROM_NAME = "RH Mentor Mastery";

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing invitation email request");

    // Parse request body
    const { 
      email, 
      clientName, 
      mentorName, 
      mentorCompany, 
      registerUrl 
    }: EmailRequestBody = await req.json();

    if (!email) {
      console.error("Email address is required but missing");
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

    // Log information about environment and API key availability
    console.log(`Sending invite email to ${email} in ${ENVIRONMENT} environment`);
    console.log(`RESEND_API_KEY available: ${Boolean(RESEND_API_KEY)}`);
    
    // Build email HTML content
    const emailHtml = buildInviteEmailHtml(
      clientName, 
      mentorName || 'Mentor', 
      mentorCompany || 'RH Mentor Mastery',
      registerUrl
    );
    
    // First try to send email using Resend
    if (RESEND_API_KEY) {
      try {
        console.log("Attempting to send via Resend API");
        
        const result = await sendWithResend(
          email, 
          'Convite para RH Mentor Mastery',
          emailHtml
        );
        
        console.log("Resend API result:", result);
        
        if (result.success) {
          return new Response(
            JSON.stringify({
              success: true,
              service: 'Resend',
              id: result.id,
              isApiKeyError: false,
              isDomainError: false,
              isSmtpError: false
            }),
            { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
          );
        } else {
          console.error("Resend failed:", result);
          // If Resend failed due to domain verification issues, we'll attempt fallback method
          if (result.errorMessage?.includes('domain')) {
            console.log("Domain verification issue detected with Resend, trying fallback");
            // Continue to fallback method
          } else {
            // For other errors, return the error
            return new Response(
              JSON.stringify({
                success: false,
                service: 'Resend',
                error: result.errorMessage,
                errorCode: result.errorCode,
                isApiKeyError: result.errorMessage?.includes('API key'),
                isDomainError: result.errorMessage?.includes('domain'),
                isSmtpError: result.errorMessage?.includes('delivery')
              }),
              { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
            );
          }
        }
      } catch (error) {
        console.error("Error with Resend:", error);
      }
    }
    
    // If Resend is not available or failed, respond with no service available
    return new Response(
      JSON.stringify({
        success: false,
        error: 'No email service is properly configured',
        isApiKeyError: true,
        isDomainError: false,
        isSmtpError: false
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
    );

  } catch (error) {
    console.error("Error in send-invite-email function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error in email sending function',
        isApiKeyError: error.message?.includes('API key'),
        isDomainError: error.message?.includes('domain'),
        isSmtpError: error.message?.includes('SMTP')
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
    );
  }
});
