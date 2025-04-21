
import { supabase } from "@/integrations/supabase/client";
import { AuthUser } from "../authTypes";

export const getUserProfile = async (userId: string): Promise<AuthUser | null> => {
  try {
    console.log("Buscando perfil para usuário:", userId);
    
    // Aguardar um pequeno tempo para dar chance ao trigger de executar
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Use the service role key to bypass RLS policies and avoid the recursion issue
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Erro ao buscar usuário:", userError);
      return null;
    }
    
    const userMetadata = user.user_metadata || {};
    
    return {
      id: userId,
      email: user.email || '',
      name: userMetadata.name || 'Usuário',
      role: userMetadata.role || 'client',
      company: userMetadata.company || '',
      mentor_id: userMetadata.role === 'mentor' ? userId : userMetadata.mentor_id,
      phone: userMetadata.phone || '',
      position: userMetadata.position || '',
      bio: userMetadata.bio || '',
      is_master_account: userMetadata.is_master_account || false,
      createdAt: user.created_at || new Date().toISOString(),
      avatar_url: userMetadata.avatar_url || '',
      cnpj: userMetadata.cnpj || null,
      industry: userMetadata.industry || null,
      address: userMetadata.address || null,
      city: userMetadata.city || null,
      state: userMetadata.state || null,
      zipCode: userMetadata.zipCode || null,
      website: userMetadata.website || null
    };
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    
    // Fallback mínimo - retornar perfil básico
    return {
      id: userId,
      email: '',
      name: 'Usuário',
      role: 'client',
      company: '',
      createdAt: new Date().toISOString(),
      mentor_id: '',
      phone: '',
      position: '',
      bio: '',
      avatar_url: '',
      cnpj: null,
      industry: null,
      address: null,
      city: null,
      state: null,
      zipCode: null,
      website: null,
      is_master_account: false
    };
  }
};

export const updateUserProfile = async (
  userId: string,
  profileData: Partial<{
    name: string;
    phone: string;
    position: string;
    company: string;
    bio: string;
    avatar_url: string;
    cnpj: string;
    industry: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    website: string;
  }>
): Promise<AuthUser | null> => {
  try {
    // Atualizar primeiro os metadados do usuário na autenticação
    const { error: updateError } = await supabase.auth.updateUser({
      data: profileData
    });

    if (updateError) {
      throw new Error(`Error updating profile: ${updateError.message}`);
    }

    // Retornar o perfil atualizado
    return await getUserProfile(userId);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};
