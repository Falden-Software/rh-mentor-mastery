
import { supabase } from "@/integrations/supabase/client";

interface EmailResult {
  success: boolean;
  message?: string;
  id?: string;
  error?: string;
  service?: string;
}

export const sendInvitationEmail = async (
  to: string,
  name?: string,
  mentorName?: string
): Promise<EmailResult> => {
  try {
    console.log(`Enviando email de convite para cliente ${to} via SendGrid...`);

    const { data, error } = await supabase.functions.invoke('send-email-sendgrid', {
      body: {
        to,
        name: name || to.split('@')[0],
        mentorName: mentorName || 'RH Mentor Mastery',
        subject: 'Convite para RH Mentor Mastery como Cliente',
        type: 'client_invitation'
      }
    });
    
    if (error) {
      console.error('Erro ao enviar email:', error);
      return {
        success: false,
        error: error.message || 'Falha ao enviar email',
        service: 'SendGrid'
      };
    }

    console.log('Resposta do envio de email:', data);
    
    return {
      success: true,
      message: 'Convite para cliente enviado com sucesso',
      id: data?.id,
      service: 'SendGrid'
    };
  } catch (error: any) {
    console.error('Erro no serviço de envio de email:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido ao enviar email',
      service: 'SendGrid'
    };
  }
};
