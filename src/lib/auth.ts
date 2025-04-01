
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "mentor" | "client";
  company?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Helper para fazer login com Supabase
export const loginUser = async (email: string, password: string): Promise<AuthUser> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("Credenciais inválidas");
  }

  // Buscar dados do perfil do usuário
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profileError) {
    console.error("Erro ao buscar perfil:", profileError);
    throw new Error("Erro ao buscar perfil do usuário");
  }

  if (!profileData) {
    throw new Error("Perfil de usuário não encontrado");
  }

  // Criar objeto AuthUser combinando dados do auth e do perfil
  const authUser: AuthUser = {
    id: data.user.id,
    email: data.user.email || "",
    name: profileData.name,
    role: profileData.role as "mentor" | "client", // Type assertion para garantir tipo correto
    company: profileData.company,
  };

  return authUser;
};

// Helper para fazer logout com Supabase
export const logoutUser = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
};

// Helper para obter o usuário atual do Supabase
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return null;
  }
  
  // Buscar dados do perfil do usuário
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (profileError) {
    console.error("Erro ao buscar perfil:", profileError);
    return null;
  }
  
  if (!profileData) {
    return null;
  }
  
  // Criar objeto AuthUser combinando dados do auth e do perfil
  const authUser: AuthUser = {
    id: session.user.id,
    email: session.user.email || "",
    name: profileData.name,
    role: profileData.role as "mentor" | "client", // Type assertion para garantir tipo correto
    company: profileData.company,
  };
  
  return authUser;
};

// Helper para registrar um novo usuário
export const registerUser = async (
  email: string, 
  password: string, 
  name: string, 
  role: "mentor" | "client",
  company?: string
): Promise<AuthUser> => {
  // 1. Registrar o usuário na autenticação
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
        company
      }
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("Erro ao criar usuário");
  }

  // 2. Verificamos se o perfil já foi criado pelo trigger on_auth_user_created
  let profileData;
  
  // Tentar buscar o perfil algumas vezes, pois pode haver um pequeno atraso na criação
  for (let i = 0; i < 3; i++) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();
      
    if (profile) {
      profileData = profile;
      break;
    }
    
    if (i < 2) {
      // Pequena pausa antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Se ainda não temos o perfil, criamos manualmente
  if (!profileData) {
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert([
        {
          id: data.user.id,
          name: name,
          role: role,
          company: company,
        }
      ])
      .select()
      .single();
      
    if (insertError) {
      console.error("Erro ao criar perfil:", insertError);
      
      // Tentar deletar o usuário de auth se falhar a criação do perfil
      try {
        await supabase.auth.admin.deleteUser(data.user.id);
      } catch (e) {
        console.error("Erro ao limpar usuário após falha no perfil:", e);
      }
      
      throw new Error("Erro ao criar perfil do usuário");
    }
    
    profileData = newProfile;
  }

  // 3. Criar objeto AuthUser com os dados do perfil criado
  const authUser: AuthUser = {
    id: data.user.id,
    email: data.user.email || "",
    name: name,
    role: role,
    company: company,
  };

  return authUser;
};

// Verificar se o usuário tem acesso a uma rota específica com base na função
export const hasAccess = (user: AuthUser | null, role: "mentor" | "client" | "any"): boolean => {
  if (!user) return false;
  if (role === "any") return true;
  return user.role === role;
};
