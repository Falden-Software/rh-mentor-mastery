
import { corsHeaders } from './types.ts';

export const createErrorResponse = (
  message: string, 
  details?: any,
  isSmtpError?: boolean
): Response => {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      details,
      isSmtpError,
      isDomainError: message.includes('domain') || message.includes('domínio'),
      isApiKeyError: message.includes('API key') || message.includes('chave')
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
