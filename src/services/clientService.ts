
import { supabase } from "@/integrations/supabase/client";
import { AuthUser } from "@/lib/authTypes";

/**
 * Obtém a lista de clientes de um mentor usando RPC
 */
export const getMentorClients = async (mentorId: string) => {
  try {
    console.log(`Buscando clientes para o mentor: ${mentorId}`);
    
    const { data: clientsData, error } = await supabase
      .rpc('get_mentor_clients', { 
        input_mentor_id: mentorId  
      });

    if (error) {
      console.error("Erro ao buscar clientes:", error);
      throw error;
    }
    
    return clientsData || [];
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return [];
  }
};

/**
 * Obtém detalhes de um cliente específico
 */
export const getClientDetails = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', clientId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar detalhes do cliente:", error);
    throw error;
  }
};

/**
 * Remove um cliente (atualiza para não ter mentor)
 */
export const removeClient = async (clientId: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        mentor_id: null
      })
      .eq('id', clientId);
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao remover cliente:", error);
    throw error;
  }
};

/**
 * Atualiza os dados de um cliente
 */
export const updateClientProfile = async (clientId: string, data: Partial<AuthUser>) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', clientId);
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar perfil do cliente:", error);
    throw error;
  }
};

/**
 * Verifica se um usuário é mentor de outro
 */
export const isMentorOfClient = async (mentorId: string, clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', clientId)
      .eq('mentor_id', mentorId)
      .single();
    
    if (error) {
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Erro ao verificar relação mentor-cliente:", error);
    return false;
  }
};
