
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { sendMail } from "https://deno.land/x/sendgrid@0.0.3/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar se a API key está configurada
    if (!SENDGRID_API_KEY) {
      console.error("SendGrid API key não configurada");
      return new Response(
        JSON.stringify({
          success: false,
          error: "SendGrid API key não configurada",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const { to, name, mentorName, subject, type } = await req.json();

    if (!to || !subject) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Destinatário e assunto são obrigatórios",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const personName = name || to.split("@")[0];
    const fromName = "RH Mentor Mastery";
    const fromEmail = "convites@rhmaster.space";
    
    // Defina o tipo de convite (sempre para cliente)
    const registerUrl = "https://rhmaster.space/register?type=client&email=" + encodeURIComponent(to);
    
    // Conteúdo HTML para o email de convite para cliente
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #4F46E5;">Olá ${personName},</h2>
        
        <p>Você foi convidado(a) por <strong>${mentorName || fromName}</strong> para participar da plataforma RH Mentor Mastery como cliente.</p>
        
        <p>Para se registrar, clique no link abaixo:</p>
        
        <p style="text-align: center;">
          <a href="${registerUrl}" style="background-color: #4F46E5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Registrar-se como Cliente</a>
        </p>
        
        <p><em>Este convite é válido por 7 dias.</em></p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #777;">
          Atenciosamente,<br>
          Equipe RH Mentor Mastery
        </p>
      </div>
    `;

    // Enviar email usando SendGrid
    const result = await sendMail({
      to,
      from: {
        name: fromName,
        email: fromEmail,
      },
      subject,
      html: htmlContent,
      apiKey: SENDGRID_API_KEY,
    });

    console.log("Email enviado via SendGrid:", result);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email de convite para cliente enviado com sucesso",
        id: `sg_${Date.now()}`,
        service: "SendGrid"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro desconhecido ao enviar email",
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
