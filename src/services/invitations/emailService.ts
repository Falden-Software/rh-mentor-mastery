
import { supabase } from "@/lib/supabase/client";

/**
 * Envia um email de convite para um cliente
 * @param email Email do cliente a ser convidado
 * @param clientName Nome do cliente (opcional)
 * @param mentorName Nome do mentor que está enviando o convite
 * @returns Resultado da operação
 */
export const sendInviteEmail = async (
  email: string,
  clientName?: string | null,
  mentorName?: string | null
): Promise<{
  success: boolean; 
  error?: string; 
  service?: string;
  id?: string;
  isDomainError?: boolean;
  isApiKeyError?: boolean;
  isSmtpError?: boolean;
  errorDetails?: any;
}> => {
  try {
    // Ensure email is defined and not just whitespace
    if (!email || !email.trim()) {
      console.error("Email vazio enviado para sendInviteEmail");
      return { 
        success: false, 
        error: "Email do destinatário não fornecido" 
      };
    }

    const trimmedEmail = email.trim();
    const name = clientName || trimmedEmail.split('@')[0];
    const mentor = mentorName || "Seu mentor";
    
    // Base URL - verificar ambiente
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://app.rhmentormastery.com';
    const registrationUrl = `${baseUrl}/client/register?email=${encodeURIComponent(trimmedEmail)}`;
    
    console.log(`Enviando email para ${trimmedEmail} com URL de registro: ${registrationUrl}`);

    // Chamar a Edge Function para enviar o email
    const { data, error } = await supabase.functions.invoke('send-invite-email', {
      body: {
        email: trimmedEmail,
        clientName: name,
        mentorName: mentor,
        mentorCompany: 'RH Mentor Mastery',
        registerUrl: registrationUrl
      }
    });

    if (error) {
      console.error("Erro ao chamar função de envio de email:", error);
      
      // Detectar tipos de erro específicos
      const errorMessage = error.message || "Erro ao enviar email";
      const isSmtpError = errorMessage.includes('SMTP') || errorMessage.includes('email') || errorMessage.includes('connection');
      const isDomainError = errorMessage.includes('domain') || errorMessage.includes('domínio') || errorMessage.includes('verify');
      const isApiKeyError = errorMessage.includes('API key') || errorMessage.includes('chave API');
      
      return {
        success: false,
        error: `Erro ao enviar email: ${errorMessage}`,
        isDomainError,
        isApiKeyError,
        isSmtpError,
        errorDetails: error
      };
    }

    if (!data || !data.success) {
      const errorMessage = data?.error || "Erro desconhecido ao enviar email";
      console.error("Falha no serviço de email:", errorMessage, data);
      
      return {
        success: false,
        error: errorMessage,
        isDomainError: data?.isDomainError || false,
        isApiKeyError: data?.isApiKeyError || false,
        isSmtpError: data?.isSmtpError || false,
        errorDetails: data?.details || data
      };
    }

    return {
      success: true,
      service: data.service || "RH Mentor Email",
      id: data.id
    };
  } catch (error: any) {
    console.error("Exceção ao enviar email:", error);
    return {
      success: false,
      error: error.message || "Erro desconhecido ao processar o envio",
      errorDetails: error
    };
  }
};
