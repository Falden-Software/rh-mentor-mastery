
import { supabase } from "@/integrations/supabase/client";

// Safely get client tests for a specific user
export const getClientTestsForUser = async (userId: string) => {
  try {
    try {
      const { data, error } = await supabase
        .rpc('get_client_tests_for_user', { user_id: userId });

      if (error) {
        console.error("Error fetching client tests from RPC:", error);
        throw error;
      }

      return data;
    } catch (rpcError) {
      console.log("Fallback to direct query after RPC failure");
      
      // Fallback to direct query if RPC fails
      const { data: directData, error: directError } = await supabase
        .from('client_tests')
        .select('*')
        .eq('client_id', userId);
        
      if (directError) {
        console.error("Error in direct query:", directError);
        throw directError;
      }
      
      return directData;
    }
  } catch (error) {
    console.error("Error in getClientTestsForUser:", error);
    return []; // Retorna array vazio em caso de erro para evitar quebrar componentes
  }
};

// Fetch information about tests in batch
export const getTestInfoBatch = async (testIds: string[]) => {
  if (testIds.length === 0) return [];
  
  try {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .in('id', testIds);
      
    if (error) {
      console.error("Error fetching test info:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in getTestInfoBatch:", error);
    return []; // Retorna array vazio em caso de erro
  }
};

// Fetch test results in batch
export const getTestResultsBatch = async (clientTestIds: string[]) => {
  if (clientTestIds.length === 0) return [];
  
  try {
    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .in('client_test_id', clientTestIds);
      
    if (error) {
      console.error("Error fetching test results:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in getTestResultsBatch:", error);
    return []; // Retorna array vazio em caso de erro
  }
};

// Função melhorada para buscar clientes de um mentor com tratamento de erros robusto
export const getMentorClients = async (mentorId: string) => {
  try {
    // Primeiro tenta buscar usando a função RPC (mais segura)
    try {
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_mentor_clients', { mentor_id: mentorId });
      
      if (!rpcError && rpcData) {
        console.log('Clientes obtidos via RPC:', rpcData.length);
        return rpcData;
      }
      // Se houver erro na RPC, registra e continua para o fallback
      console.warn('Erro ao buscar clientes via RPC:', rpcError);
    } catch (rpcException) {
      console.warn('Exceção ao chamar RPC:', rpcException);
    }
    // Fallback 1: Tenta buscar diretamente da tabela profiles com filtros
    console.log('Tentando fallback 1: Busca direta na tabela profiles');
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, email, company, role, created_at, updated_at')
      .eq('mentor_id', mentorId)
      .eq('role', 'client');
    if (!profilesError && profilesData) {
      console.log('Clientes obtidos via profiles:', profilesData.length);
      return profilesData;
    }
    // Se houver erro no fallback 1, registra e continua para o fallback 2
    console.warn('Erro no fallback 1:', profilesError);
    // Fallback 2: Tenta buscar da tabela mentor_clients (caso exista)
    console.log('Tentando fallback 2: Busca na tabela de relacionamento');
    try {
      const { data: relationData, error: relationError } = await supabase
        .from('mentor_clients')
        .select('client_id')
        .eq('mentor_id', mentorId);
      if (!relationError && relationData && relationData.length > 0) {
        // Obtém os IDs dos clientes
        const clientIds = relationData.map(item => item.client_id);
        // Busca os perfis desses clientes
        const { data: clientsData, error: clientsError } = await supabase
          .from('profiles')
          .select('id, name, email, company, role, created_at, updated_at')
          .in('id', clientIds);
        if (!clientsError && clientsData) {
          console.log('Clientes obtidos via relacionamento:', clientsData.length);
          return clientsData;
        }
      }
    } catch (relationException) {
      console.warn('Exceção no fallback 2:', relationException);
    }
    // Se todos os métodos falharem, retorna array vazio
    console.error('Todos os métodos de busca de clientes falharam');
    return [];
  } catch (error) {
    console.error('Erro geral em getMentorClients:', error);
    return [];
  }
};

// Create a default test
export const createDefaultTest = async (mentorId: string, title: string, description: string) => {
  try {
    const { data, error } = await supabase
      .from('tests')
      .insert([{ 
        mentor_id: mentorId,
        title,
        description
      }])
      .select('*')
      .single();
      
    if (error) {
      console.error("Error creating default test:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in createDefaultTest:", error);
    return null; // Retorna null em caso de erro
  }
};

// Assign test to client
export const assignTestToClient = async (clientId: string, testId: string) => {
  try {
    // Check if assignment already exists
    const { data: existingData, error: checkError } = await supabase
      .from('client_tests')
      .select('*')
      .eq('client_id', clientId)
      .eq('test_id', testId)
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking existing assignment:", checkError);
      throw checkError;
    }
    
    // If assignment doesn't exist, create it
    if (!existingData) {
      const { data, error } = await supabase
        .from('client_tests')
        .insert([{ 
          client_id: clientId,
          test_id: testId,
          is_completed: false
        }])
        .select('*')
        .single();
        
      if (error) {
        console.error("Error assigning test to client:", error);
        throw error;
      }
      
      return data;
    }
    
    return existingData;
  } catch (error) {
    console.error("Error in assignTestToClient:", error);
    return null; // Retorna null em caso de erro
  }
};

// Buscar todos os testes disponíveis
export const getAllTests = async () => {
  try {
    const { data, error } = await supabase
      .from('tests')
      .select('*');
      
    if (error) {
      console.error("Error fetching tests:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in getAllTests:", error);
    return []; // Retorna array vazio em caso de erro
  }
};

// Buscar um teste específico por título
export const getTestByTitle = async (title: string) => {
  try {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .ilike('title', `%${title}%`)
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching test by title:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in getTestByTitle:", error);
    return null; // Retorna null em caso de erro
  }
};
