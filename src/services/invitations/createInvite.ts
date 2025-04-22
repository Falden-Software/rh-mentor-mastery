
import { supabase } from "@/integrations/supabase/client";
import { AuthUser } from "@/lib/authTypes";
import { ErrorService } from "../errorService";
import { InvitationResult } from "./types";

export async function createInvite(email: string, name: string, mentor: AuthUser | null): Promise<InvitationResult> {
  try {
    if (!email || !name || !mentor?.id) {
      throw new Error("Email, nome e ID do mentor são obrigatórios");
    }
    
    console.log(`Criando convite para ${email} do mentor ${mentor.id}`);
    
    // Verificar convites existentes usando uma consulta direta para evitar recursão em RLS
    try {
      // Nota: Evitamos verificações de join que possam acionar recursão de RLS
      const { data: existingInvites, error: checkError } = await supabase
        .from('invitation_codes')
        .select('id, code, expires_at')
        .eq('email', email)
        .eq('mentor_id', mentor.id)
        .is('is_used', false);
        
      if (checkError) {
        console.error("Erro ao verificar convites existentes:", checkError);
        throw new Error(`Erro ao verificar convites existentes: ${checkError.message}`);
      }
      
      let inviteId = '';
      
      // Se já existir um convite, apenas atualize sua data de expiração
      if (existingInvites && existingInvites.length > 0) {
        console.log("Convite existente encontrado, atualizando...");
        inviteId = existingInvites[0].id;
        
        const { error: updateError } = await supabase
          .from('invitation_codes')
          .update({
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
          })
          .eq('id', inviteId);
          
        if (updateError) {
          console.error("Erro ao atualizar convite existente:", updateError);
          throw new Error(`Erro ao atualizar convite: ${updateError.message}`);
        }
      } else {
        // Criar novo convite
        const { data: newInvite, error: insertError } = await supabase.rpc('create_client_invitation', {
          p_email: email,
          p_mentor_id: mentor.id
        });

        if (insertError) {
          console.error("Erro ao criar convite:", insertError);
          throw new Error(`Erro ao criar convite: ${insertError.message}`);
        }
        
        inviteId = newInvite as string;
      }
      
      return {
        success: true,
        message: "Convite criado com sucesso!",
        id: inviteId
      };
    } catch (dbError: any) {
      console.error("Erro na operação do banco de dados:", dbError);
      throw new Error(dbError.message || "Erro ao processar convite no banco de dados");
    }
  } catch (error: any) {
    console.error("Erro no serviço de convites:", error);
    ErrorService.logError("invitation_error", error, { email, mentorId: mentor?.id });
    
    return {
      success: false,
      error: error.message,
      errorDetails: error
    };
  }
}
