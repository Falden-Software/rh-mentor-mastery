
import { AuthUser } from "@/lib/authTypes";

export interface InvitationResult {
  success: boolean;
  error?: string;
  message?: string;
  errorDetails?: any;
  service?: string;
  id?: string;
  isSmtpError?: boolean;
  isDomainError?: boolean;
  isApiKeyError?: boolean;
}

export interface EmailResult {
  success: boolean;
  error?: string;
  errorDetails?: any;
  isSmtpError?: boolean;
  isDomainError?: boolean;
  isApiKeyError?: boolean;
  service?: string;
  isTestMode?: boolean;
  actualRecipient?: string;
  id?: string;
}

export interface InviteCreateParams {
  email: string;
  name: string;
  mentor: AuthUser | null;
}

export interface CreateInviteParams {
  email: string;
  name: string;
  mentorId: string;
}
