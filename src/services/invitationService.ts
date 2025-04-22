
import { supabase } from "@/integrations/supabase/client";
import { AuthUser } from "@/lib/authTypes";
import { ErrorService } from "./errorService";
import { v4 as uuidv4 } from "uuid";

export interface InvitationResult {
  success: boolean;
  error?: string;
  message?: string;
  errorDetails?: any;
  service?: string;
  id?: string;
  isSmtpError?: boolean;
  isDomainError?: boolean;
  isApiKeyError?: boolean;
}

export class InvitationService {
  static async createInvitation(email: string, name: string, mentor: AuthUser | null): Promise<InvitationResult> {
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
          const inviteCode = uuidv4().substring(0, 8);
          console.log(`Gerando novo código de convite: ${inviteCode}`);
          
          const { data: newInvite, error: insertError } = await supabase
            .from('invitation_codes')
            .insert({
              id: uuidv4(),
              code: inviteCode,
              email,
              mentor_id: mentor.id,
              is_used: false,
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
            })
            .select('id')
            .single();

          if (insertError) {
            console.error("Erro ao criar convite:", insertError);
            throw new Error(`Erro ao criar convite: ${insertError.message}`);
          }
          
          inviteId = newInvite.id;
        }
        
        // Simular envio de email bem-sucedido para teste
        console.log(`Convite ${inviteId} criado com sucesso para ${email}`);
        
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

  // Método para reenvio de convites
  static async resendInvitation(inviteId: string, mentorId: string): Promise<InvitationResult> {
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
      
      // Simulação de reenvio de email bem-sucedido para teste
      console.log(`Convite ${inviteId} reenviado com sucesso para ${invite.email}`);
      
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
}
