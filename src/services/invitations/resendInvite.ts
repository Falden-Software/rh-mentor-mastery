
import { supabase } from "@/integrations/supabase/client";
import { sendInviteEmail } from "./emailService";
import { InvitationResult } from "./types";

/**
 * Reenvia um convite existente
 * @param inviteId ID do convite a ser reenviado
 * @param mentorId ID do mentor que está reenviando o convite
 * @returns Resultado da operação
 */
export const resendInvite = async (inviteId: string, mentorId: string): Promise<InvitationResult> => {
  try {
    console.log(`Reenviando convite ID: ${inviteId} do mentor ID: ${mentorId}`);
    
    // Obter dados do convite
    const { data: invite, error: fetchError } = await supabase
      .from('invitation_codes')
      .select('*, profiles:mentor_id(*)')
      .eq('id', inviteId)
      .eq('mentor_id', mentorId)
      .single();
      
    if (fetchError || !invite) {
      console.error("Erro ao obter dados do convite:", fetchError);
      return {
        success: false,
        error: fetchError?.message || "Convite não encontrado"
      };
    }
    
    if (invite.is_used) {
      return {
        success: false,
        error: "Este convite já foi utilizado"
      };
    }
    
    if (new Date(invite.expires_at) < new Date()) {
      // Atualizar data de expiração
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + 7);
      
      const { error: updateError } = await supabase
        .from('invitation_codes')
        .update({ expires_at: newExpiryDate.toISOString() })
        .eq('id', inviteId);
        
      if (updateError) {
        console.error("Erro ao atualizar data de expiração:", updateError);
        return {
          success: false,
          error: "Erro ao atualizar data de expiração"
        };
      }
    }
    
    // Enviar email
    const mentorName = invite.profiles?.name || 'Seu Mentor';
    const result = await sendInviteEmail(
      invite.email,
      undefined, // Cliente pode não ter um nome registrado ainda
      mentorName
    );
    
    return result;
    
  } catch (error: any) {
    console.error("Erro ao reenviar convite:", error);
    return {
      success: false,
      error: error.message || "Erro desconhecido ao reenviar convite"
    };
  }
};
