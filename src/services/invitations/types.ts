
import { z } from 'zod';
import { AuthUser } from '@/lib/authTypes';

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

// Export the inviteSchema to be used in validation and forms
export const inviteSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  mentor_id: z.string().uuid({ message: "ID do mentor inválido" })
});

// Define the type for invitation creation parameters
export interface InviteCreateParams {
  email: string;
  name: string;
  mentor: AuthUser | null;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
