
import { supabase } from "@/integrations/supabase/client";
import { ErrorService } from "../errorService";
import { InvitationResult } from "./types";

export async function resendInvite(inviteId: string, mentorId: string): Promise<InvitationResult> {
  try {
    if (!inviteId || !mentorId) {
      throw new Error("ID do convite e ID do mentor são obrigatórios");
    }
    
    console.log(`Reenviando convite ${inviteId} do mentor ${mentorId}`);
    
    // Verificar se o convite existe e pertence ao mentor - usando consulta direta para evitar recursão
    const { data: invite, error: fetchError } = await supabase
      .from('invitation_codes')
      .select('id, email, code, expires_at')
      .eq('id', inviteId)
      .eq('mentor_id', mentorId)
      .single();
      
    if (fetchError || !invite) {
      console.error("Erro ao buscar convite:", fetchError);
      throw new Error(`Convite não encontrado ou não pertence ao mentor: ${fetchError?.message || "Não encontrado"}`);
    }
    
    // Atualizar a data de expiração do convite
    const { error: updateError } = await supabase
      .from('invitation_codes')
      .update({
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
      })
      .eq('id', inviteId);
      
    if (updateError) {
      console.error("Erro ao atualizar convite:", updateError);
      throw new Error(`Erro ao atualizar convite: ${updateError.message}`);
    }
    
    return {
      success: true,
      message: "Convite reenviado com sucesso!",
      id: inviteId
    };
  } catch (error: any) {
    console.error("Erro ao reenviar convite:", error);
    ErrorService.logError("invitation_error", error, { inviteId, mentorId });
    
    return {
      success: false,
      error: error.message,
      errorDetails: error
    };
  }
}
