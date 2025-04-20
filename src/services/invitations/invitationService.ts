
import { InviteCreateParams, InvitationResult } from './types';
import { validateInviteData, handleValidationError } from './validation';
import { findExistingInvite, updateExistingInvite, createNewInvite, getMentorInvitations } from './database';
import { sendInviteEmail } from './emailService';
import { ErrorService } from '../errorService';

export class InvitationService {
  static async createInvitation(email: string, name: string, mentor: AuthUser | null): Promise<InvitationResult> {
    try {
      const params: InviteCreateParams = { email, name, mentor };
      const validatedData = validateInviteData(params);
      
      const existingInvite = await findExistingInvite(validatedData.email, validatedData.mentor_id);
      const inviteId = existingInvite 
        ? await updateExistingInvite(existingInvite.id)
        : await createNewInvite(validatedData.email, validatedData.mentor_id);
      
      const emailResult = await sendInviteEmail(validatedData.email, validatedData.name, mentor?.name);
      
      if (!emailResult.success) {
        if (emailResult.error?.includes('API key') || emailResult.error?.includes('Configuração')) {
          return {
            success: false,
            error: 'Configuração de email ausente. Contate o administrador.',
            isApiKeyError: true,
            errorDetails: emailResult.errorDetails
          };
        }
        
        if (emailResult.isDomainError) {
          return {
            success: false,
            error: 'É necessário verificar um domínio para enviar emails.',
            isDomainError: true,
            errorDetails: emailResult.errorDetails
          };
        }
        
        return {
          success: false,
          error: emailResult.error || 'Erro ao enviar email',
          errorDetails: emailResult.errorDetails,
          isSmtpError: emailResult.isSmtpError,
          service: emailResult.service
        };
      }
      
      if (emailResult.isTestMode && emailResult.actualRecipient !== validatedData.email) {
        return {
          success: true,
          message: 'Convite criado com sucesso, mas o email foi enviado para o proprietário da conta (modo de teste)',
          isTestMode: true,
          actualRecipient: emailResult.actualRecipient,
          intendedRecipient: validatedData.email,
          service: emailResult.service
        };
      }
      
      return {
        success: true,
        message: 'Convite enviado com sucesso',
        service: emailResult.service
      };
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return handleValidationError(error, { email, name, mentor });
      }
      
      ErrorService.logError('unknown_error', error, { email, name, mentorId: mentor?.id });
      return {
        success: false,
        error: ErrorService.getUserFriendlyMessage(error),
        errorDetails: error
      };
    }
  }

  static async resendInvitation(inviteId: string, mentorId: string): Promise<InvitationResult> {
    try {
      const { data: invites, error: fetchError } = await supabase
        .from('invitation_codes')
        .select('*, mentor:profiles!invitation_codes_mentor_id_fkey(name)')
        .eq('id', inviteId)
        .eq('mentor_id', mentorId);
      
      if (fetchError) throw fetchError;
      if (!invites || invites.length === 0) {
        return {
          success: false,
          error: 'Convite não encontrado ou sem permissão'
        };
      }
      
      const invite = invites[0];
      
      await updateExistingInvite(inviteId);
      
      const emailResult = await sendInviteEmail(
        invite.email,
        'Cliente',
        invite.mentor?.name
      );
      
      if (!emailResult.success) {
        return {
          success: false,
          error: emailResult.error || 'Erro ao reenviar email',
          errorDetails: emailResult.errorDetails,
          isSmtpError: emailResult.isSmtpError
        };
      }
      
      return {
        success: true,
        message: 'Convite reenviado com sucesso'
      };
    } catch (error) {
      ErrorService.logError('unknown_error', error, { inviteId, mentorId });
      return {
        success: false,
        error: ErrorService.getUserFriendlyMessage(error),
        errorDetails: error
      };
    }
  }

  static getInvitationsByMentor = getMentorInvitations;
}

// Re-export types
export * from './types';
