
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

// Don't import InvitationService from itself - it creates a circular import
// Instead import from the index file where it's actually defined
import { InvitationService } from "./invitations/index";
export { InvitationService };

/**
 * Cria um convite para um novo cliente
 */
export const createClientInvitation = async (email: string, name: string, mentorId: string) => {
  try {
    if (!email || !name || !mentorId) {
      throw new Error("Email, nome e ID do mentor são obrigatórios");
    }
    
    // Verificar se já existe um convite pendente para este email
    const { data: existingInvites, error: checkError } = await supabase
      .from('invites')  // Usar o nome correto da tabela
      .select('*')
      .eq('email', email)
      .eq('status', 'pending');
      
    if (checkError) {
      console.error("Erro ao verificar convites existentes:", checkError);
      throw new Error(`Erro ao verificar convites existentes: ${checkError.message}`);
    }
    
    if (existingInvites && existingInvites.length > 0) {
      throw new Error("Já existe um convite pendente para este email");
    }
    
    // Criar novo convite
    const { data, error } = await supabase
      .from('invites')  // Usar o nome correto da tabela
      .insert({
        id: uuidv4(),
        email,
        name,
        status: 'pending',
        mentor_id: mentorId,
        created_at: new Date().toISOString()
      })
      .select();
      
    if (error) {
      console.error("Erro ao criar convite:", error);
      throw new Error(`Erro ao criar convite: ${error.message}`);
    }
    
    return data[0];
  } catch (error: any) {
    console.error("Erro no serviço de convites:", error);
    throw new Error(error.message || "Erro ao criar convite");
  }
};

/**
 * Envia email de convite para um cliente
 */
export const sendInviteEmail = async (inviteId: string) => {
  try {
    if (!inviteId) {
      throw new Error("ID do convite não fornecido");
    }
    
    // Obter dados do convite
    const { data: invite, error: inviteError } = await supabase
      .from('invites')  // Usar o nome correto da tabela
      .select('*, profiles!mentor_id(*)')
      .eq('id', inviteId)
      .single();
      
    if (inviteError || !invite) {
      console.error("Erro ao obter convite:", inviteError);
      throw new Error(`Erro ao obter convite: ${inviteError?.message || "Convite não encontrado"}`);
    }
    
    // Chamar função do Supabase para enviar email
    const { data, error } = await supabase.functions.invoke('send-invite-email', {
      body: { inviteId }
    });
    
    if (error) {
      console.error("Erro ao enviar email de convite:", error);
      throw new Error(`Erro ao enviar email de convite: ${error.message}`);
    }
    
    return data;
  } catch (error: any) {
    console.error("Erro no serviço de envio de email:", error);
    throw new Error(error.message || "Erro ao enviar email de convite");
  }
};
