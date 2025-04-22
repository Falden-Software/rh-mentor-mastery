
import { supabase } from "@/integrations/supabase/client";
import { ErrorService } from "../errorService";
import { InvitationResult } from "./types";

export async function createInviteDirect(email: string, name: string, mentorId: string): Promise<InvitationResult> {
  try {
    if (!email || !name || !mentorId) {
      throw new Error("Email, nome e ID do mentor são obrigatórios");
    }
    
    console.log(`Criando convite direto para ${email} com o mentor ${mentorId}`);
    
    // Use the RPC function to create invitation
    const { data: inviteId, error: rpcError } = await supabase.rpc('create_client_invitation', {
      p_email: email,
      p_mentor_id: mentorId
    });
    
    if (rpcError) {
      console.error("Erro ao criar convite via RPC:", rpcError);
      throw new Error(`Erro ao criar convite: ${rpcError.message}`);
    }
    
    // Success
    return {
      success: true,
      message: "Convite criado com sucesso!",
      id: inviteId as string
    };
    
  } catch (error: any) {
    console.error("Erro no serviço de convites (método direto):", error);
    ErrorService.logError("invitation_error", error, { 
      email, 
      mentorId,
      method: 'createInvitationDirect'
    });
    
    return {
      success: false,
      error: error.message,
      errorDetails: error
    };
  }
}
