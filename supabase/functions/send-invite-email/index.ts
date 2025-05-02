
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { buildInviteEmailHtml } from "./emailBuilder.ts";
import { EmailRequestBody, EmailResult, corsHeaders } from "./types.ts";
import { sendWithResend } from "./emailServices.ts";

// Initialize environment
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ENVIRONMENT = Deno.env.get("ENVIRONMENT") || "production";
const FROM_EMAIL = "contato@rhmaster.space";
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

    // Validate email - ensure it exists and is not just whitespace
    if (!email || typeof email !== 'string' || !email.trim()) {
      console.error("Email address is required but missing or empty");
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email do destinatário é obrigatório',
          isApiKeyError: false,
          isDomainError: false,
          isSmtpError: false
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
      );
    }

    // Validate client name
    if (!clientName || typeof clientName !== 'string' || !clientName.trim()) {
      console.error("Client name is required but missing or empty");
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Nome do cliente é obrigatório',
          isApiKeyError: false,
          isDomainError: false,
          isSmtpError: false
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
      );
    }

    const trimmedEmail = email.trim();
    const trimmedClientName = clientName.trim();

    // Log information about environment and API key availability
    console.log(`Sending invite email to ${trimmedEmail} in ${ENVIRONMENT} environment`);
    console.log(`RESEND_API_KEY available: ${Boolean(RESEND_API_KEY)}`);
    
    // Build email HTML content
    const emailHtml = buildInviteEmailHtml(
      trimmedClientName, 
      mentorName || 'Mentor', 
      mentorCompany || 'RH Mentor Mastery',
      registerUrl
    );
    
    // First try to send email using Resend
    if (RESEND_API_KEY) {
      try {
        console.log("Attempting to send via Resend API");
        
        const result = await sendWithResend(
          trimmedEmail, 
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
          
          // Check for domain verification error and provide clear message
          if (result.errorMessage?.includes('verify a domain') || result.errorMessage?.includes('own email address')) {
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Você precisa verificar um domínio no Resend antes de enviar emails para outros destinatários.',
                details: 'Acesse resend.com/domains para verificar seu domínio.',
                service: 'Resend',
                isDomainError: true,
                isApiKeyError: false,
                isSmtpError: false
              }),
              { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
            );
          }
          
          // For other errors, return the error
          return new Response(
            JSON.stringify({
              success: false,
              service: 'Resend',
              error: result.errorMessage || 'Erro desconhecido ao enviar email',
              errorCode: result.errorCode,
              isApiKeyError: result.errorMessage?.includes('API key'),
              isDomainError: result.errorMessage?.includes('domain'),
              isSmtpError: result.errorMessage?.includes('delivery')
            }),
            { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
          );
        }
      } catch (error) {
        console.error("Error with Resend:", error);
      }
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Chave API do Resend não configurada',
          isApiKeyError: true,
          isDomainError: false,
          isSmtpError: false
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
      );
    }
    
    // If Resend is not available or failed, respond with no service available
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Nenhum serviço de email está configurado corretamente',
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
        error: error.message || 'Erro desconhecido na função de envio de email',
        isApiKeyError: error.message?.includes('API key'),
        isDomainError: error.message?.includes('domain'),
        isSmtpError: error.message?.includes('SMTP')
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
    );
  }
});
