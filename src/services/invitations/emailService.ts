
import { supabase } from '@/integrations/supabase/client';
import { ErrorService } from '../errorService';
import { EmailResult } from './types';

export const sendInviteEmail = async (
  email: string,
  name: string,
  mentorName?: string
): Promise<EmailResult> => {
  try {
    // Obter a URL base do ambiente atual
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://rhmaster.space';
      
    const registerUrl = `${baseUrl}/register?type=client&email=${encodeURIComponent(email)}`;
    
    const { data, error } = await supabase.functions.invoke<EmailResult>('send-invite-email', {
      body: {
        email,
        clientName: name || 'Cliente',
        mentorName: mentorName || 'Mentor',
        mentorCompany: 'RH Mentor Mastery',
        registerUrl
      }
    });
    
    if (error) {
      console.error("Function invocation error:", error);
      throw error;
    }
    
    console.log("Edge function response:", data);
    
    // Make sure all required properties are present in the response
    return {
      success: Boolean(data?.success), 
      error: data?.error || undefined,
      errorDetails: data?.errorDetails,
      isSmtpError: Boolean(data?.isSmtpError),
      isDomainError: Boolean(data?.isDomainError),
      isApiKeyError: Boolean(data?.isApiKeyError),
      service: data?.service || 'Supabase',
      isTestMode: data?.isTestMode,
      actualRecipient: data?.actualRecipient,
      id: data?.id
    };
  } catch (error) {
    ErrorService.logError('email_error', error, {
      function: 'send-invite-email',
      email,
      name
    });
    
    // Extract error message for classification
    const errorMsg = error?.message || '';
    
    // Return a properly typed error response
    return {
      success: false,
      error: 'Erro interno ao enviar email via Supabase',
      errorDetails: error,
      isSmtpError: Boolean(errorMsg.includes('SMTP') || errorMsg.includes('email')),
      isDomainError: Boolean(errorMsg.includes('domain') || errorMsg.includes('domínio')),
      isApiKeyError: Boolean(errorMsg.includes('API key') || errorMsg.includes('chave API'))
    };
  }
};
