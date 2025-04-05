import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  company?: string;
  mentor_id?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const getUserProfile = async (user: User): Promise<AuthUser | null> => {
  try {
    console.log("Buscando perfil para usuário:", user.id);
    // Primeiro tenta buscar o perfil do usuário
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Erro ao buscar perfil:', error);
      
      // Se for erro "não encontrado", podemos criar um perfil padrão
      if (error.code === 'PGRST116') {
        console.log("Perfil não encontrado, tentando criar perfil padrão");
        return null;
      }
      
      throw error;
    }
    
    if (!data) {
      console.error('Perfil não encontrado para o usuário:', user.id);
      return null;
    }
    
    console.log("Perfil encontrado:", data);
    
    // Verifica se os dados essenciais estão presentes
    if (!data.name || !data.role) {
      console.error('Dados de perfil incompletos:', data);
      
      // Tenta criar um perfil padrão se não houver um perfil completo
      const userMetadata = user.user_metadata || {};
      const defaultProfile: AuthUser = {
        id: user.id,
        email: user.email || '',
        name: userMetadata.name || 'Usuário',
        role: userMetadata.role || 'client',
        company: data.company || userMetadata.company,
        mentor_id: data.mentor_id
      };
      
      return defaultProfile;
    }
    
    return {
      id: data.id,
      email: user.email || '',
      name: data.name,
      role: data.role,
      company: data.company,
      mentor_id: data.mentor_id
    };
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    // Retorna null em vez de lançar erro para evitar quebrar o fluxo de autenticação
    return null;
  }
};

export const registerUser = async (
  email: string,
  password: string,
  name: string, 
  role: "mentor" | "client", 
  company?: string
): Promise<AuthUser | null> => {
  try {
    console.log("Iniciando registro de usuário:", { email, name, role, company });
    
    // Validate inputs more strictly
    if (!email || !email.includes('@') || !email.includes('.')) {
      throw new Error("Email inválido");
    }
    
    if (!password || password.length < 6) {
      throw new Error("Senha deve ter pelo menos 6 caracteres");
    }
    
    if (!name || name.trim() === '') {
      throw new Error("Nome é obrigatório");
    }
    
    // Validate company field for mentors at the application level
    if (role === "mentor" && (!company || company.trim() === '')) {
      throw new Error("Empresa é obrigatória para mentores");
    }
    
    // Certifique-se de que company esteja definida como string vazia se for undefined
    const userMetadata = {
      name: name.trim(),
      role,
      company: company ? company.trim() : ''
    };
    
    console.log("Registrando usuário com metadados:", userMetadata);
    
    // Step 1: Registrar o usuário no authentication service
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userMetadata
      }
    });
    
    if (error) {
      console.error("Erro no signUp:", error);
      if (error.message.includes('User already registered')) {
        throw new Error("Email já registrado. Por favor, faça login ou use outro email.");
      }
      throw new Error(`Erro ao registrar: ${error.message}`);
    }
    
    console.log("Usuário registrado no auth:", data);
    
    if (!data.user) {
      console.error("Nenhum usuário retornado do signUp");
      throw new Error("Falha ao criar usuário");
    }
    
    // Step 2: Garantir que o perfil exista
    // Aguardar um momento para garantir que o perfil foi criado pelo trigger
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // Verifica se o perfil foi criado automaticamente pelo trigger
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      console.log("Verificação de perfil após registro:", { profileData, profileError });
      
      if (profileError || !profileData) {
        console.log("Perfil não criado automaticamente, criando perfil manualmente");
        
        // Tenta criar o perfil manualmente se não foi criado automaticamente
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name: name.trim(),
            role,
            company: company ? company.trim() : ''
          });
        
        if (insertError) {
          console.error("Erro ao criar perfil manualmente:", insertError);
          if (insertError.message.includes('duplicate key value violates unique constraint')) {
            console.log("Perfil já existe, ignorando erro de duplicação");
          } else if (insertError.message.includes('violates row-level security policy')) {
            throw new Error("Erro de segurança ao criar perfil. Verifique as políticas RLS.");
          } else {
            throw new Error(`Erro ao criar perfil: ${insertError.message}`);
          }
        }
      }
      
      // Busca o perfil novamente para confirmar
      const { data: confirmedProfile, error: confirmedError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (confirmedError || !confirmedProfile) {
        throw new Error("Não foi possível confirmar a criação do perfil");
      }
      
      console.log("Perfil confirmado após registro:", confirmedProfile);
      
      return {
        id: data.user.id,
        email: data.user.email || '',
        name: name.trim(),
        role,
        company: company ? company.trim() : ''
      };
    } catch (profileError) {
      console.error("Erro ao verificar/criar perfil:", profileError);
      if (profileError instanceof Error) {
        throw profileError;
      }
      throw new Error("Erro ao finalizar registro do usuário");
    }
    
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<AuthUser | null> => {
  try {
    console.log("Tentando login para:", email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    }
    
    console.log("Login bem-sucedido:", data);
    
    if (data.user) {
      try {
        console.log("Buscando perfil após login");
        const profile = await getUserProfile(data.user);
        
        if (!profile) {
          console.warn("Perfil não encontrado após login, usando dados básicos");
          // Fallback para um perfil básico se não conseguir buscar o perfil
          const userMetadata = data.user.user_metadata || {};
          return {
            id: data.user.id,
            email: data.user.email || '',
            name: userMetadata.name || 'Usuário',
            role: userMetadata.role || 'client',
            company: userMetadata.company
          };
        }
        
        console.log("Perfil recuperado após login:", profile);
        return profile;
      } catch (profileError) {
        console.error('Erro ao buscar perfil após login:', profileError);
        
        // Fallback para um perfil básico se não conseguir buscar o perfil
        const userMetadata = data.user.user_metadata || {};
        return {
          id: data.user.id,
          email: data.user.email || '',
          name: userMetadata.name || 'Usuário',
          role: userMetadata.role || 'client',
          company: userMetadata.company
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    console.log("Iniciando logout");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erro ao fazer logout:", error);
      throw error;
    }
    console.log("Logout bem-sucedido");
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    console.log("Verificando sessão atual");
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Erro ao obter sessão:", error);
      throw error;
    }
    
    if (data.session?.user) {
      console.log("Sessão encontrada para usuário:", data.session.user.id);
      try {
        return await getUserProfile(data.session.user);
      } catch (profileError) {
        console.error('Erro ao buscar perfil do usuário atual:', profileError);
        
        // Fallback para um perfil básico
        const userMetadata = data.session.user.user_metadata || {};
        return {
          id: data.session.user.id,
          email: data.session.user.email || '',
          name: userMetadata.name || 'Usuário',
          role: userMetadata.role || 'client',
          company: userMetadata.company
        };
      }
    }
    
    console.log("Nenhuma sessão encontrada");
    return null;
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    return null;
  }
};

export const hasAccess = (user: AuthUser | null, requiredRole: "mentor" | "client" | "any"): boolean => {
  if (!user) return false;
  
  if (requiredRole === "any") return true;
  
  return user.role === requiredRole;
};
