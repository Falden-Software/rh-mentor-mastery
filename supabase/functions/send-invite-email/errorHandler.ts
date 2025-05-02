
import { corsHeaders } from './types.ts';

export const createErrorResponse = (
  message: string, 
  details?: any,
  isSmtpError?: boolean
): Response => {
  const isDomainError = message.includes('domain') || message.includes('domínio');
  const isApiKeyError = message.includes('API key') || message.includes('chave');
  
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      details,
      isSmtpError: isSmtpError || message.includes('SMTP') || message.includes('connection') || message.includes('email'),
      isDomainError,
      isApiKeyError
    }),
    {
      status: 200, // Using 200 to ensure the client gets the error details
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  );
};
