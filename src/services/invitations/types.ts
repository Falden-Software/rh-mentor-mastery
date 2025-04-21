
import { z } from 'zod';
import { AuthUser } from '@/lib/authTypes';

export const inviteSchema = z.object({
  email: z.string().email('Por favor, insira um email válido').toLowerCase(),
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres').max(100, 'O nome deve ter no máximo 100 caracteres').trim(),
  mentor_id: z.string().uuid('ID de mentor inválido')
});

export type InviteData = z.infer<typeof inviteSchema>;

export interface InvitationResult {
  success: boolean;
  error?: string;
  errorDetails?: any;
  message?: string;
  isApiKeyError?: boolean;
  isDomainError?: boolean;
  isSmtpError?: boolean;
  isTestMode?: boolean;
  actualRecipient?: string;
  intendedRecipient?: string;
  service?: string;
  id?: string;
}

export interface EmailResult {
  success: boolean;
  error?: string;
  isTestMode?: boolean;
  actualRecipient?: string;
  errorDetails?: any;
  service?: string;
  isSmtpError?: boolean;
  isDomainError?: boolean;
  isApiKeyError?: boolean;
  id?: string;
}

export interface InviteCreateParams {
  email: string;
  name: string;
  mentor: AuthUser | null;
}
