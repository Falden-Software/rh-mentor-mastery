
import { supabase } from "@/integrations/supabase/client";
import { AuthUser } from "../authTypes";
import { getUserProfile } from "./userProfile";

export const loginUser = async (email: string, password: string): Promise<AuthUser | null> => {
  try {
    console.log("Tentando login para:", email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error("Erro de autenticação:", error.message);
      throw new Error(error.message);
    }

    if (!data.user) {
      console.error("Usuário não encontrado após login bem-sucedido");
      throw new Error("Usuário não encontrado");
    }

    console.log("Login bem-sucedido, obtendo perfil para:", data.user.id);
    
    // Pequena pausa para garantir que a sessão seja estabelecida
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return await getUserProfile(data.user.id);
  } catch (error) {
    console.error("Erro no processo de login:", error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erro ao fazer logout:", error);
      throw new Error(error.message);
    }
    console.log("Logout bem-sucedido");
  } catch (error) {
    console.error("Erro ao processar logout:", error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    console.log("Verificando sessão atual");
    // Verificação de autenticação
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Erro ao obter sessão:", error);
      throw error;
    }
    
    if (!session || !session.user) {
      console.log("Nenhuma sessão encontrada");
      return null;
    }
    
    const userId = session.user.id;
    console.log("Sessão encontrada, obtendo perfil para:", userId);
    return await getUserProfile(userId);
  } catch (error) {
    console.error("Erro ao obter usuário atual:", error);
    return null;
  }
};
