
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { buildInviteEmailHtml } from "./emailBuilder.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, clientName, mentorName, mentorCompany, registerUrl } = await req.json();

    console.log('Sending invite email to:', email);

    // Build email HTML content
    const emailHtml = buildInviteEmailHtml(clientName, mentorName, mentorCompany, registerUrl);
    
    // Send email using Resend
    const emailResult = await resend.emails.send({
      from: 'RH Mentor Mastery <onboarding@resend.dev>',
      to: [email],
      subject: 'Convite para RH Mentor Mastery',
      html: emailHtml
    });

    console.log('Email sent successfully:', emailResult);

    return new Response(
      JSON.stringify({
        success: true,
        service: 'Resend',
        id: emailResult.id
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200
      }
    );

  } catch (error) {
    console.error("Erro ao enviar email:", error);
    
    const isDomainError = error.message?.includes('domain');
    const isApiKeyError = error.message?.includes('API key');
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        isDomainError,
        isApiKeyError,
        errorDetails: error
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500
      }
    );
  }
});
