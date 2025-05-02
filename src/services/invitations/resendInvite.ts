
import { supabase } from '@/lib/supabase/client';
import { sendInviteEmail } from './emailService';
import { InvitationResult } from './types';
import { ErrorService } from '../errorService';

export const resendInvite = async (inviteId: string, mentorId: string): Promise<InvitationResult> => {
  try {
    // Try to use an RPC function first to avoid recursion
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'resend_invitation',
        { p_invite_id: inviteId, p_mentor_id: mentorId }
      );
      
      if (!rpcError && rpcData) {
        console.log("Convite atualizado via RPC:", rpcData);
        // RPC successful, proceed with email
      } else {
        console.log("Fallback para query direta devido a:", rpcError?.message);
      }
    } catch (rpcException) {
      console.error("Exceção em RPC, usando fallback:", rpcException);
    }
    
    // Fetch invitation details directly (fallback if RPC fails)
    const { data: invite, error: fetchError } = await supabase
      .from('invitation_codes')
      .select('*')
      .eq('id', inviteId)
      .eq('mentor_id', mentorId)
      .maybeSingle();
      
    if (fetchError || !invite) {
      console.error("Error fetching invitation:", fetchError);
      throw new Error("Convite não encontrado ou você não tem permissão para acessá-lo");
    }
    
    // Update invitation expiry without using joins to avoid RLS recursion
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
    
    const { error: updateError } = await supabase
      .from('invitation_codes')
      .update({ expires_at: expiresAt.toISOString() })
      .eq('id', inviteId);
      
    if (updateError) {
      console.error("Error updating invitation:", updateError);
      throw new Error("Erro ao atualizar convite");
    }
    
    // Fetch mentor name - this is done without joining tables to avoid RLS recursion
    const { data: mentorData } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', mentorId)
      .maybeSingle();
    
    const mentorName = mentorData?.name || 'Seu Mentor';
    
    // Send invitation email
    console.log("Resending invitation email to:", invite.email);
    const emailResult = await sendInviteEmail(
      invite.email,
      invite.email.split('@')[0], // Fallback name if not available
      mentorName
    );
    
    if (emailResult.success) {
      return {
        success: true,
        message: `Convite reenviado com sucesso para ${invite.email}`,
        service: emailResult.service
      };
    } else {
      return {
        success: false,
        error: emailResult.error || "Erro ao enviar email",
        isDomainError: emailResult.isDomainError,
        isApiKeyError: emailResult.isApiKeyError,
        isSmtpError: emailResult.isSmtpError
      };
    }
  } catch (error: any) {
    console.error("Error in resendInvite:", error);
    ErrorService.logError('email_error', error, { inviteId, mentorId });
    
    return {
      success: false,
      error: error.message || "Erro inesperado ao reenviar convite"
    };
  }
};
