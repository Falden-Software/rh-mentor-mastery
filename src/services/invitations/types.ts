
export interface EmailRequestBody {
  email: string;
  clientName?: string;
  mentorName?: string;
  mentorCompany?: string;
  registerUrl?: string;
}

export interface EmailResult {
  success: boolean;
  id?: string;
  service?: string;
  error?: string;
  errorDetails?: any;
  isSmtpError: boolean;
  isDomainError: boolean;
  isApiKeyError: boolean;
  isTestMode?: boolean;
  actualRecipient?: string;
}

export interface InvitationResult extends EmailResult {
  message?: string;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
