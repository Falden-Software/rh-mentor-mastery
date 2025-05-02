
import { resendInvite } from './resendInvite';
import { getMentorInvitations } from './getMentorInvitations';
import { sendInviteEmail } from './emailService';
import { supabase } from '@/lib/supabase/client';
import { InvitationResult, EmailResult } from './types';
import { createInvite } from './createInvite';

interface InvitationData {
  email: string;
  name?: string;
  mentorId?: string;
}

export const InvitationService = {
  resendInvite,
  getMentorInvitations,
  createInvite,
  
  async createInvite(
    email: string, 
    clientName: string = '', 
    mentor: { id?: string; name?: string } | null = null
  ): Promise<InvitationResult> {
    try {
      if (!email) {
        return { success: false, error: 'Email é obrigatório' };
      }
      
      if (!mentor?.id) {
        return { success: false, error: 'ID do mentor é obrigatório' };
      }
      
      // Gerar código de convite
      const inviteId = crypto.randomUUID();
      const inviteCode = inviteId.substring(0, 8).toUpperCase();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias a partir de hoje
      
      // Inserir convite no banco
      const { error: inviteError } = await supabase
        .from('invitation_codes')
        .insert({
          id: inviteId,
          code: inviteCode,
          email,
          mentor_id: mentor.id,
          is_used: false,
          expires_at: expiresAt.toISOString(),
          role: 'client'
        });
        
      if (inviteError) {
        console.error("Erro ao criar convite:", inviteError);
        return { success: false, error: `Erro ao criar convite: ${inviteError.message}` };
      }
      
      // Enviar email com convite
      const emailResult = await sendInviteEmail(
        email, 
        clientName || email.split('@')[0],
        mentor.name || 'Seu Mentor'
      );
      
      return emailResult;
    } catch (error: any) {
      console.error("Erro no serviço de convites:", error);
      return {
        success: false,
        error: error.message || "Erro inesperado ao criar convite"
      };
    }
  }
};

// Re-export types and functions
export type { InvitationResult, EmailResult };
export { sendInviteEmail, getMentorInvitations, resendInvite, createInvite };
