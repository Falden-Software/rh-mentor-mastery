
import { supabase } from "@/integrations/supabase/client";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
}

interface SendEmailResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: any;
  service?: string;
}

/**
 * Sends an email using SendGrid through a Supabase Edge Function
 */
export const sendEmail = async (options: SendEmailOptions): Promise<SendEmailResult> => {
  try {
    console.log(`Sending email to ${options.to} with subject "${options.subject}"`);
    
    const { data, error } = await supabase.functions.invoke("send-email-sendgrid", {
      body: options
    });
    
    if (error) {
      console.error("Edge function error:", error);
      return { 
        success: false, 
        error: "Failed to send email: Edge function error", 
        details: error 
      };
    }
    
    return data || { success: true, message: "Email sent successfully", service: "SendGrid" };
  } catch (error) {
    console.error("Email service error:", error);
    return { 
      success: false, 
      error: "Failed to send email: Unexpected error", 
      details: error 
    };
  }
};

/**
 * Sends an invitation email to a client using SendGrid
 */
export const sendInvitationEmail = async (
  clientEmail: string,
  clientName: string,
  mentorName?: string,
  registerUrl?: string
): Promise<SendEmailResult> => {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://rhmaster.space';
    
  const inviteUrl = registerUrl || `${baseUrl}/register?type=client&email=${encodeURIComponent(clientEmail)}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #4F46E5;">Olá ${clientName || 'Cliente'},</h2>
      
      <p>Você foi convidado(a) por <strong>${mentorName || 'um mentor'}</strong> para participar da plataforma RH Mentor Mastery.</p>
      
      <p>Para se registrar, clique no link abaixo:</p>
      
      <p style="text-align: center;">
        <a href="${inviteUrl}" style="background-color: #4F46E5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Registrar-se Agora</a>
      </p>
      
      <p><em>Este convite é válido por 7 dias.</em></p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      
      <p style="font-size: 12px; color: #777;">
        Atenciosamente,<br>
        Equipe RH Mentor Mastery
      </p>
    </div>
  `;
  
  const text = `
    Olá ${clientName || 'Cliente'},
    
    Você foi convidado(a) por ${mentorName || 'um mentor'} para participar da plataforma RH Mentor Mastery.
    
    Para se registrar, acesse o link: ${inviteUrl}
    
    Este convite é válido por 7 dias.
    
    Atenciosamente,
    Equipe RH Mentor Mastery
  `;
  
  return sendEmail({
    to: clientEmail,
    subject: "Convite para RH Mentor Mastery",
    html,
    text,
    fromName: "RH Mentor Mastery",
    replyTo: "contato@rhmaster.space"
  });
};
