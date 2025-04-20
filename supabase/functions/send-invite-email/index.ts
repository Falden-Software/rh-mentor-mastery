
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { buildInviteEmailHtml } from "./emailBuilder.ts";
import { sendWithResend } from "./emailServices.ts";

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
    const { email, clientName, mentorName, mentorCompany } = await req.json();

    // Build email HTML content
    const emailHtml = buildInviteEmailHtml(clientName, mentorName, mentorCompany);
    
    // Send email using Resend
    const emailResult = await sendWithResend(
      email,
      'Convite para a RH Mentor Mastery',
      emailHtml
    );

    if (!emailResult.success) {
      console.error("Erro ao enviar email:", emailResult);
      return new Response(
        JSON.stringify({
          success: false,
          error: emailResult.errorMessage,
          details: emailResult
        }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 500
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email enviado com sucesso',
        service: emailResult.service,
        id: emailResult.id
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200
      }
    );

  } catch (error) {
    console.error("Erro não tratado:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erro interno do servidor',
        details: error
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500
      }
    );
  }
});
