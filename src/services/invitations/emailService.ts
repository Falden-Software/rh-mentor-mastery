
import { supabase } from '@/integrations/supabase/client';
import { ErrorService } from '../errorService';
import { EmailResult } from './types';

export const sendInviteEmail = async (
  email: string,
  name: string,
  mentorName?: string
): Promise<EmailResult> => {
  try {
    // Get base URL from current environment
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
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    // Return a properly typed error response
    return {
      success: false,
      error: 'Erro interno ao enviar email via Supabase',
      errorDetails: error,
      isSmtpError: errorMsg.includes('SMTP') || errorMsg.includes('email'),
      isDomainError: errorMsg.includes('domain') || errorMsg.includes('domínio'),
      isApiKeyError: errorMsg.includes('API key') || errorMsg.includes('chave API')
    };
  }
};
