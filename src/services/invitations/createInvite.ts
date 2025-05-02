
import { supabase } from '@/lib/supabase/client';
import { AuthUser } from '@/lib/authTypes';
import { validateInviteData, handleValidationError } from './validation';
import { createExistingInvite, createNewInvite, findExistingInvite } from './database';
import { sendInviteEmail } from './emailService';
import { InviteCreateParams, InvitationResult } from './types';
import { ErrorService } from '../errorService';

export const createInvite = async (
  email: string, 
  name: string, 
  mentor: AuthUser | null
): Promise<InvitationResult> => {
  try {
    if (!email || !email.trim()) {
      return { 
        success: false, 
        error: "Email é obrigatório" 
      };
    }

    if (!mentor?.id) {
      return { 
        success: false, 
        error: "Mentor não autenticado" 
      };
    }

    // Normalize the parameters
    const inviteParams: InviteCreateParams = {
      email: email.trim(),
      name: name.trim(),
      mentor
    };

    // Validate the invitation data
    const validatedData = validateInviteData(inviteParams);
    
    // Check for existing invite
    const existingInvite = await findExistingInvite(validatedData.email, validatedData.mentor_id);
    
    let inviteId;
    if (existingInvite) {
      // Update existing invite
      inviteId = await createExistingInvite(existingInvite.id);
      console.log("Convite existente atualizado:", inviteId);
    } else {
      // Create new invite
      inviteId = await createNewInvite(validatedData.email, validatedData.mentor_id);
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
      ErrorService.logError('email_error', new Error(emailResult.error), {
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
  } catch (error) {
    return handleValidationError(error, {
      email,
      name,
      mentor
    });
  }
};
