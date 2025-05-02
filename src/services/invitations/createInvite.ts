
import { supabase } from '@/lib/supabase/client';
import { AuthUser } from '@/lib/authTypes';
import { validateInviteData, handleValidationError } from './validation';
import { updateExistingInvite, createNewInvite, findExistingInvite } from './database';
import { sendInviteEmail } from './emailService';
import { InviteCreateParams, InvitationResult } from './types';
import { ErrorService } from '../errorService';
import { createInviteDirect } from './createInviteDirect';

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

    try {
      // If we're encountering recursion errors, try using the direct approach
      // This bypasses the RLS policy check that's causing the recursion
      if (mentor.is_master_account) {
        console.log("Using direct invite approach for master account to bypass RLS");
        return await createInviteDirect(trimmedEmail, trimmedName, mentor.id);
      }
      
      // Normalize the parameters with trimmed values
      const inviteParams: InviteCreateParams = {
        email: trimmedEmail,
        name: trimmedName,
        mentor
      };

      // Validate the invitation data
      const validatedData = validateInviteData(inviteParams);
      
      // Use RPC function to check for existing invite to avoid RLS recursion
      // This uses the function-based approach which is safer against recursion
      const { data: inviteData, error: inviteError } = await supabase.rpc(
        'create_client_invitation',
        {
          p_email: validatedData.email,
          p_mentor_id: validatedData.mentor_id
        }
      );
      
      if (inviteError) {
        console.error("Error using RPC to create invitation:", inviteError);
        // Fall back to direct database approach if RPC fails
        return await createInviteDirect(trimmedEmail, trimmedName, mentor.id);
      }
      
      let inviteId = inviteData;
      console.log("Invitation created/updated via RPC with ID:", inviteId);

      // Send invitation email
      console.log("Sending email to:", validatedData.email);
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
          errorDetails: emailResult.errorDetails || { error: emailResult.error }
        });
        
        return {
          success: false,
          error: emailResult.error || "Erro ao enviar email de convite",
          id: inviteId,
          isDomainError: emailResult.isDomainError,
          isApiKeyError: emailResult.isApiKeyError,
          isSmtpError: emailResult.isSmtpError,
          errorDetails: emailResult.errorDetails || { error: emailResult.error }
        };
      }
    } catch (validationError) {
      return handleValidationError(validationError, {
        email: trimmedEmail,
        name: trimmedName,
        mentor
      });
    }
  } catch (error) {
    return handleValidationError(error, {
      email,
      name,
      mentor
    });
  }
};
