
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
  error?: any;
  errorCode?: string;
  errorMessage?: string;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
