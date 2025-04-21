
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
        registerUrl: `https://rh-mentor-mastery.vercel.app/register?type=client&email=${encodeURIComponent(email)}`
      }
    });
    
    if (error) throw error;
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
    
    return {
      success: false,
      error: 'Erro interno ao enviar email',
      errorDetails: error,
      isSmtpError: Boolean(error.message?.includes('SMTP') || error.message?.includes('email')),
      isDomainError: Boolean(error.message?.includes('domain') || error.message?.includes('domínio')),
      isApiKeyError: Boolean(error.message?.includes('API key') || error.message?.includes('chave API'))
    };
  }
};
