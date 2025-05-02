
import { supabase } from '@/lib/supabase/client';
import { AuthUser } from '@/lib/authTypes';
import { validateInviteData, handleValidationError } from './validation';
import { updateExistingInvite, createNewInvite, findExistingInvite } from './database';
import { sendInviteEmail } from './emailService';
import { InviteCreateParams, InvitationResult } from './types';
import { ErrorService } from '../errorService';

export const createInvite = async (
  email: string, 
  name: string, 
  mentor: AuthUser | null
): Promise<InvitationResult> => {
  try {
    // Ensure email is defined, not null, and not just whitespace
    const trimmedEmail = email && typeof email === 'string' ? email.trim() : '';
    if (!trimmedEmail) {
      return { 
        success: false, 
        error: "Email é obrigatório" 
      };
    }

    // Ensure name is defined and not just whitespace
    const trimmedName = name && typeof name === 'string' ? name.trim() : '';
    if (!trimmedName) {
      return { 
        success: false, 
        error: "Nome é obrigatório" 
      };
    }

    if (!mentor?.id) {
      return { 
        success: false, 
        error: "Mentor não autenticado" 
      };
    }

    // Normalize the parameters with trimmed values
    const inviteParams: InviteCreateParams = {
      email: trimmedEmail,
      name: trimmedName,
      mentor
    };

    try {
      // Validate the invitation data
      const validatedData = validateInviteData(inviteParams);
      
      // Check for existing invite
      const existingInvite = await findExistingInvite(validatedData.email, validatedData.mentor_id);
      
      let inviteId;
      if (existingInvite) {
        // Update existing invite
        inviteId = await updateExistingInvite(existingInvite.id);
        console.log("Convite existente atualizado:", inviteId);
      } else {
        // Create new invite
        inviteId = await createNewInvite(validatedData.email, validatedData.mentor_id, validatedData.name);
        console.log("Novo convite criado:", inviteId);
      }
      
      // Send invitation email
      console.log("Enviando email para:", validatedData.email);
      const emailResult = await sendInviteEmail(
        validatedData.email,
        validatedData.name,
        mentor.name || 'Mentor'
      );
      
      if (emailResult.success) {
        return {
          success: true,
          message: `Convite enviado com sucesso para ${validatedData.email}`,
          id: inviteId,
          service: emailResult.service
        };
      } else {
        ErrorService.logError('email_error', new Error(emailResult.error || 'Unknown email error'), {
          email: validatedData.email,
          inviteId,
          errorDetails: emailResult.errorDetails
        });
        
        return {
          success: false,
          error: emailResult.error || "Erro ao enviar email de convite",
          id: inviteId,
          isDomainError: emailResult.isDomainError,
          isApiKeyError: emailResult.isApiKeyError,
          isSmtpError: emailResult.isSmtpError,
          errorDetails: emailResult.errorDetails
        };
      }
    } catch (validationError) {
      return handleValidationError(validationError, inviteParams);
    }
  } catch (error) {
    return handleValidationError(error, {
      email,
      name,
      mentor
    });
  }
};
