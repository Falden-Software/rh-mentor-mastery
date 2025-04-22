
import { supabase } from "@/integrations/supabase/client";
import { AuthUser } from "@/lib/authTypes";
import { ErrorService } from "./errorService";
import { Profile } from "@/types/profile";

/**
 * Obtém a lista de clientes de um mentor usando RPC
 */
export const getMentorClients = async (mentorId: string): Promise<Profile[]> => {
  try {
    console.log(`Buscando clientes para o mentor: ${mentorId}`);
    
    const { data: clientsData, error } = await supabase
      .rpc('get_mentor_clients', { 
        input_mentor_id: mentorId  
      });

    if (error) {
      ErrorService.logError("database_error", error, { 
        function: 'getMentorClients',
        mentorId 
      });
      throw error;
    }
    
    return clientsData || [];
  } catch (error) {
    ErrorService.logError("database_error", error, { 
      function: 'getMentorClients',
      mentorId 
    });
    throw error;
  }
};

/**
 * Obtém detalhes de um cliente específico
 */
export const getClientDetails = async (clientId: string): Promise<Profile> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', clientId)
      .single();
    
    if (error) {
      ErrorService.logError("database_error", error, { 
        function: 'getClientDetails',
        clientId 
      });
      throw error;
    }
    
    return data;
  } catch (error) {
    ErrorService.logError("database_error", error, { 
      function: 'getClientDetails',
      clientId 
    });
    throw error;
  }
};

/**
 * Remove um cliente (atualiza para não ter mentor)
 */
export const removeClient = async (clientId: string): Promise<{ success: boolean }> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        mentor_id: null
      })
      .eq('id', clientId);
    
    if (error) {
      ErrorService.logError("database_error", error, { 
        function: 'removeClient',
        clientId 
      });
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    ErrorService.logError("database_error", error, { 
      function: 'removeClient',
      clientId 
    });
    throw error;
  }
};

/**
 * Atualiza os dados de um cliente
 */
export const updateClientProfile = async (clientId: string, data: Partial<Profile>): Promise<{ success: boolean }> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', clientId);
    
    if (error) {
      ErrorService.logError("database_error", error, { 
        function: 'updateClientProfile',
        clientId,
        data
      });
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    ErrorService.logError("database_error", error, { 
      function: 'updateClientProfile',
      clientId 
    });
    throw error;
  }
};

/**
 * Verifica se um usuário é mentor de outro
 */
export const isMentorOfClient = async (mentorId: string, clientId: string): Promise<boolean> => {
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
    ErrorService.logError("database_error", error, { 
      function: 'isMentorOfClient',
      mentorId,
      clientId 
    });
    return false;
  }
};
