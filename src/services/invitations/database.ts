
import { supabase } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Procura um convite existente para um email e mentor específico
 */
export const findExistingInvite = async (email: string, mentorId: string) => {
  const { data, error } = await supabase
    .from('invitation_codes')
    .select('*')
    .eq('email', email)
    .eq('mentor_id', mentorId)
    .eq('is_used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
    
  if (error) {
    console.error("Erro ao procurar convite existente:", error);
    return null;
  }
  
  return data;
};

/**
 * Atualiza um convite existente, renovando sua data de expiração
 */
export const updateExistingInvite = async (inviteId: string) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias a partir de hoje
  
  const { data, error } = await supabase
    .from('invitation_codes')
    .update({ expires_at: expiresAt.toISOString() })
    .eq('id', inviteId)
    .select()
    .single();
    
  if (error) {
    console.error("Erro ao atualizar convite:", error);
    throw new Error(`Erro ao atualizar convite: ${error.message}`);
  }
  
  return inviteId;
};

/**
 * Cria um novo convite para um cliente
 */
export const createNewInvite = async (email: string, mentorId: string, clientName?: string) => {
  const inviteId = uuidv4();
  const inviteCode = inviteId.substring(0, 8).toUpperCase();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias a partir de hoje
  
  const { data, error } = await supabase
    .from('invitation_codes')
    .insert({
      id: inviteId,
      code: inviteCode,
      email: email,
      mentor_id: mentorId,
      is_used: false,
      expires_at: expiresAt.toISOString(),
      role: 'client'
    })
    .select()
    .single();
    
  if (error) {
    console.error("Erro ao criar convite:", error);
    throw new Error(`Erro ao criar convite: ${error.message}`);
  }
  
  return inviteId;
};

/**
 * Valida se um convite está disponível para uso
 */
export const validateInviteCode = async (code: string, email?: string) => {
  let query = supabase
    .from('invitation_codes')
    .select('*')
    .eq('code', code)
    .eq('is_used', false)
    .gt('expires_at', new Date().toISOString());
    
  if (email) {
    query = query.eq('email', email);
  }
  
  const { data, error } = await query.maybeSingle();
  
  if (error) {
    console.error("Erro ao validar código de convite:", error);
    throw new Error(`Erro ao validar código de convite: ${error.message}`);
  }
  
  return data;
};

/**
 * Marca um convite como utilizado
 */
export const markInviteAsUsed = async (inviteId: string, userId: string) => {
  const { data, error } = await supabase
    .from('invitation_codes')
    .update({ 
      is_used: true,
      used_by: userId
    })
    .eq('id', inviteId)
    .select();
    
  if (error) {
    console.error("Erro ao marcar convite como usado:", error);
    throw new Error(`Erro ao marcar convite como usado: ${error.message}`);
  }
  
  return data;
};
