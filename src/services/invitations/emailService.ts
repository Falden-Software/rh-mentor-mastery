
import { supabase } from '@/lib/supabase/client';
import { ErrorService } from '../errorService';
import { EmailResult } from './types';

export const sendInviteEmail = async (
  email: string,
  name: string,
  mentorName?: string
): Promise<EmailResult> => {
  try {
    const { data, error } = await supabase.functions.invoke<EmailResult>('send-invite-email', {
      body: {
        email,
        clientName: name || 'Cliente',
        mentorName: mentorName || 'Mentor',
        mentorCompany: 'RH Mentor Mastery',
        registerUrl: `${window.location.origin}/register?type=client&email=${encodeURIComponent(email)}`
      }
    });
    
    if (error) {
      console.error("Function invocation error:", error);
      throw error;
    }
    
    // Make sure we return a complete EmailResult object
    return data || { 
      success: false, 
      error: 'Resposta inválida do servidor',
      isSmtpError: false,
      isDomainError: false,
      isApiKeyError: false
    };
  } catch (error) {
    ErrorService.logError('function_error', error, {
      function: 'send-invite-email',
      email,
      name
    });
    
    // Extract error message for classification
    const errorMsg = error.message || '';
    
    // Ensure all required properties are included in the error response
    return {
      success: false,
      error: 'Erro interno ao enviar email',
      errorDetails: error,
      isSmtpError: Boolean(errorMsg.includes('SMTP') || errorMsg.includes('email')),
      isDomainError: Boolean(errorMsg.includes('domain') || errorMsg.includes('domínio')),
      isApiKeyError: Boolean(errorMsg.includes('API key') || errorMsg.includes('chave API'))
    };
  }
};
