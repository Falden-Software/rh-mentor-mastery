
import { supabase } from '@/lib/supabase/client';
import { sendInviteEmail } from './emailService';
import { InvitationResult } from './types';
import { ErrorService } from '../errorService';

export const resendInvite = async (inviteId: string, mentorId: string): Promise<InvitationResult> => {
  try {
    console.log("Resending invitation:", inviteId, "for mentor:", mentorId);
    
    // Use the RPC function to update invitation without recursion
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      'resend_invitation',
      { 
        p_invite_id: inviteId, 
        p_mentor_id: mentorId 
      }
    );
    
    if (rpcError) {
      console.error("Error using RPC to resend invitation:", rpcError);
      throw new Error(`Erro ao atualizar convite: ${rpcError.message}`);
    }
    
    // Fetch invitation details for sending email
    const { data: invite, error: fetchError } = await supabase
      .from('invitation_codes')
      .select('*')
      .eq('id', inviteId)
      .maybeSingle();
      
    if (fetchError || !invite) {
      console.error("Error fetching invitation details:", fetchError);
      throw new Error("Convite não encontrado após atualização");
    }
    
    // Fetch mentor name to personalize email
    const { data: mentorData } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', mentorId)
      .maybeSingle();
    
    const mentorName = mentorData?.name || 'Seu Mentor';
    
    // Send invitation email
    console.log("Sending invitation email to:", invite.email);
    const emailResult = await sendInviteEmail(
      invite.email,
      invite.email.split('@')[0], // Fallback name
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
