
import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthUser } from '@/lib/authTypes';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Profile } from '@/types/profile';

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDevMode?: boolean;
  error?: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string, role: "mentor" | "client", company?: string, phone?: string, position?: string, bio?: string) => Promise<AuthUser | null>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  toggleDevMode: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDevMode, setIsDevMode] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadSession = async () => {
    setIsLoading(true);
    try {
      console.log("Carregando sessão...");
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        console.log("Sessão encontrada:", session.user.id);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error("Erro ao buscar perfil:", error);
          setIsAuthenticated(false);
          setUser(null);
          
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            console.log("Usando dados do usuário como fallback:", userData.user);
            const userMeta = userData.user.user_metadata || {};
            
            setIsAuthenticated(true);
            setUser({
              id: session.user.id,
              email: userData.user.email || "",
              name: userMeta.name || "Usuário",
              role: (userMeta.role as "mentor" | "client") || "client",
              company: userMeta.company || "",
              phone: userMeta.phone || "",
              position: userMeta.position || "",
              bio: userMeta.bio || "",
              avatar_url: null,
              createdAt: userData.user.created_at || new Date().toISOString(),
              mentor_id: userMeta.mentor_id,
              cnpj: null,
              industry: null,
              address: null,
              city: null,
              state: null,
              zipCode: null,
              website: null,
              is_master_account: userMeta.is_master_account || false
            });
          }
        } else {
          console.log("Perfil encontrado:", profile);
          setIsAuthenticated(true);
          const typedProfile = profile as Profile;
          
          setUser({
            id: typedProfile.id,
            email: typedProfile.email || null,
            name: typedProfile.name || '',
            role: typedProfile.role as "mentor" | "client",
            company: typedProfile.company,
            phone: typedProfile.phone,
            position: typedProfile.position,
            bio: typedProfile.bio,
            avatar_url: typedProfile.avatar_url || null,
            createdAt: typedProfile.created_at,
            mentor_id: typedProfile.mentor_id,
            cnpj: typedProfile.cnpj || null,
            industry: typedProfile.industry || null,
            address: typedProfile.address || null,
            city: typedProfile.city || null,
            state: typedProfile.state || null,
            zipCode: typedProfile.zipCode || null,
            website: typedProfile.website || null,
            is_master_account: typedProfile.is_master_account
          });
        }
      } else {
        console.log("Nenhuma sessão encontrada");
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Erro ao carregar sessão:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDevMode = () => {
    setIsDevMode(prevMode => {
      if (!user?.is_master_account) {
        console.log("Tentativa de ativar modo de desenvolvimento por um usuário não-mestre foi bloqueada");
        toast({
          title: "Acesso Negado",
          description: "Apenas contas mestres podem ativar o modo de desenvolvimento.",
          variant: "destructive"
        });
        return prevMode;
      }

      const newMode = !prevMode;
      console.log("Modo de desenvolvimento:", newMode ? "ATIVADO" : "DESATIVADO");
      
      if (newMode) {
        toast({
          title: "Modo de Desenvolvimento Ativado",
          description: "Algumas restrições foram desativadas para teste.",
          variant: "default"
        });
      } else {
        toast({
          title: "Modo de Desenvolvimento Desativado",
          description: "O sistema agora está em modo normal.",
          variant: "default"
        });
      }
      
      localStorage.setItem("devMode", newMode.toString());
      
      return newMode;
    });
  };

  useEffect(() => {
    const savedDevMode = localStorage.getItem("devMode");
    if (savedDevMode === "true" && user?.is_master_account) {
      setIsDevMode(true);
      console.log("Dev mode ativado a partir do localStorage");
    }
    
    if (import.meta.env.DEV) {
      setIsDevMode(true);
      console.log("App is running in development mode");
    }

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event);
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        loadSession();
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Tentando login com email:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Erro de login:", error.message);
        throw error;
      }
      
      console.log("Login bem-sucedido, dados:", data);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadSession();
    } catch (error) {
      if (error instanceof Error) {
        console.error("Erro capturado durante login:", error.message);
        setError(error.message);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string, 
    password: string, 
    name: string, 
    role: "mentor" | "client",
    company?: string,
    phone?: string,
    position?: string,
    bio?: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: { user: authUser }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            company,
            phone,
            position,
            bio
          }
        }
      });

      if (error) throw error;
      
      if (authUser) {
        await loadSession();
        return user as AuthUser;
      }
      return null;
    } catch (error) {
      if (error instanceof Error) setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<AuthUser>) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user?.id);

      if (error) throw error;
      await loadSession();
    } catch (error) {
      if (error instanceof Error) setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsAuthenticated(false);
      setUser(null);
      navigate('/');
    } catch (error) {
      if (error instanceof Error) setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isDevMode,
    error,
    login,
    logout,
    register,
    updateProfile,
    toggleDevMode,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
