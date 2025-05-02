
import { supabase } from '@/lib/supabase/client';
import { EmailResult } from './types';

/**
 * Envia um email de convite para um cliente através da Edge Function
 * 
 * @param email - Email do cliente a ser convidado
 * @param clientName - Nome do cliente (opcional)
 * @param mentorName - Nome do mentor para personalizar o email (opcional)
 * @returns Objeto com resultado do envio
 */
export const sendInviteEmail = async (
  email: string,
  clientName: string = 'Cliente',
  mentorName: string = 'Mentor'
): Promise<EmailResult> => {
  try {
    if (!email) {
      return {
        success: false,
        error: 'Email não fornecido',
        errorDetails: { reason: 'missing_email' }
      };
    }
    
    const baseUrl = window.location.origin;
    const registerUrl = `${baseUrl}/register?type=client&email=${encodeURIComponent(email)}`;
    
    const { data, error } = await supabase.functions.invoke('send-invite-email', {
      body: {
        email,
        clientName,
        mentorName,
        registerUrl
      }
    });
    
    console.log("Edge function result:", data);
    
    if (error) {
      console.error("Error invoking edge function:", error);
      return {
        success: false,
        error: error.message || 'Erro ao enviar convite',
        isSmtpError: true,
        errorDetails: error
      };
    }
    
    if (!data.success) {
      return {
        success: false,
        error: data.error || 'Erro ao enviar email',
        service: data.service || 'Email',
        isApiKeyError: data.isApiKeyError,
        isDomainError: data.isDomainError, 
        isSmtpError: data.isSmtpError,
        errorDetails: data.errorDetails || data
      };
    }
    
    return {
      success: true,
      message: 'Convite enviado com sucesso',
      service: data.service,
      id: data.id
    };
  } catch (error: any) {
    console.error("Error in sendInviteEmail:", error);
    
    return {
      success: false,
      error: error.message || 'Erro desconhecido ao enviar email',
      isSmtpError: true,
      errorDetails: error
    };
  }
};
