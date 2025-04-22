
import { supabase } from "@/lib/supabase/client";
import { AuthUser } from '@/lib/authTypes';
import { v4 as uuidv4 } from 'uuid';
import { InvitationResult } from './types';
import { sendInviteEmail } from './emailService';
import { ErrorService } from '../errorService';

export class InvitationService {
  static async createInvitation(email: string, name: string, mentor: AuthUser | null): Promise<InvitationResult> {
    try {
      if (!email || !name || !mentor?.id) {
        throw new Error("Email, nome e ID do mentor são obrigatórios");
      }
      
      // Check for existing pending invites
      const { data: existingInvites, error: checkError } = await supabase
        .from('invitation_codes')
        .select('id, code, expires_at')
        .eq('email', email)
        .eq('mentor_id', mentor.id)
        .is('used_by', null);
        
      if (checkError) {
        console.error("Erro ao verificar convites existentes:", checkError);
        throw new Error("Erro ao verificar convites existentes");
      }
      
      let inviteCode = '';
      
      // If invitation already exists, update it instead of creating a new one
      if (existingInvites && existingInvites.length > 0) {
        console.log("Convite existente encontrado, atualizando...");
        const existingInvite = existingInvites[0];
        inviteCode = existingInvite.id;
        
        // Update the existing invitation with new expiry date
        const { error: updateError } = await supabase
          .from('invitation_codes')
          .update({
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
          })
          .eq('id', inviteCode);
          
        if (updateError) {
          console.error("Erro ao atualizar convite existente:", updateError);
          throw new Error("Erro ao atualizar convite existente");
        }
      } else {
        // Create new invitation with required code field
        inviteCode = uuidv4();
        const { error: insertError } = await supabase
          .from('invitation_codes')
          .insert({
            id: inviteCode,
            code: inviteCode.substring(0, 8), // Generate a shorter code from the UUID
            email,
            mentor_id: mentor.id,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
          });

        if (insertError) {
          console.error("Erro ao criar convite:", insertError);
          throw new Error("Erro ao criar convite no banco de dados");
        }
      }

      // Send invitation email using the email service
      const emailResult = await sendInviteEmail(
        email,
        name,
        mentor.name
      );

      if (!emailResult.success) {
        console.error("Erro ao enviar email:", emailResult.error);
        throw new Error(emailResult.error || "Erro ao enviar email de convite");
      }

      return {
        success: true,
        message: "Convite enviado com sucesso",
        service: emailResult.service,
        id: emailResult.id,
        isSmtpError: false,
        isDomainError: false,
        isApiKeyError: false
      };
      
    } catch (error: any) {
      console.error("Erro no serviço de convites:", error);
      return {
        success: false,
        error: error.message,
        errorDetails: error,
        isDomainError: Boolean(error.message?.includes('domain') || error.message?.includes('domínio')),
        isApiKeyError: Boolean(error.message?.includes('API key') || error.message?.includes('chave')),
        isSmtpError: Boolean(error.message?.includes('SMTP') || error.message?.includes('email'))
      };
    }
  }

  static async resendInvitation(inviteId: string, mentorId: string): Promise<InvitationResult> {
    try {
      const { data: invite, error: fetchError } = await supabase
        .from('invitation_codes')
        .select('*, mentor:profiles!invitation_codes_mentor_id_fkey(*)')
        .eq('id', inviteId)
        .eq('mentor_id', mentorId)
        .single();

      if (fetchError || !invite) {
        console.error("Erro ao buscar convite:", fetchError);
        throw new Error("Convite não encontrado");
      }

      // Update invitation expiry
      const { error: updateError } = await supabase
        .from('invitation_codes')
        .update({
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .eq('id', inviteId);

      if (updateError) {
        console.error("Erro ao atualizar convite:", updateError);
        throw new Error("Erro ao atualizar convite");
      }

      // Use email service to resend invitation
      const emailResult = await sendInviteEmail(
        invite.email,
        invite.email.split('@')[0], // Fallback if name doesn't exist
        invite.mentor?.name || 'Mentor'
      );

      if (!emailResult.success) {
        console.error("Erro ao reenviar email:", emailResult);
        throw new Error(emailResult.error || "Erro ao reenviar email");
      }

      return {
        success: true,
        message: "Convite reenviado com sucesso",
        service: emailResult.service,
        isSmtpError: false,
        isDomainError: false,
        isApiKeyError: false
      };
      
    } catch (error: any) {
      console.error("Erro ao reenviar convite:", error);
      ErrorService.logError('resend_invitation_error', error, { inviteId, mentorId });
      
      return {
        success: false,
        error: error.message,
        errorDetails: error,
        isSmtpError: Boolean(error.message?.includes('SMTP') || error.message?.includes('email')),
        isDomainError: Boolean(error.message?.includes('domain') || error.message?.includes('domínio')),
        isApiKeyError: Boolean(error.message?.includes('API key') || error.message?.includes('chave'))
      };
    }
  }
}
