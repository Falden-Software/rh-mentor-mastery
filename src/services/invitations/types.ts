
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

export interface CreateInviteParams {
  email: string;
  name: string;
  mentorId: string;
}

