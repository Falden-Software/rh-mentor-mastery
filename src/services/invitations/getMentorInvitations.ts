
import { supabase } from '@/lib/supabase/client';
import { ErrorService } from '../errorService';
import { InvitationCode } from '@/types/models';

/**
 * Retrieves all invitations sent by a specific mentor
 * This function completely avoids recursion by using a direct fetch without joins
 * 
 * @param mentorId - The ID of the mentor whose invitations should be fetched
 * @returns Array of invitation objects
 */
export const getMentorInvitations = async (mentorId: string): Promise<InvitationCode[]> => {
  try {
    console.log("Buscando convites para mentor:", mentorId);
    
    // Uso direto da tabela sem referências a tabelas que podem causar recursão
    // Solicitação simples para evitar problemas de RLS
    const { data, error } = await supabase
      .from('invitation_codes')
      .select('*')
      .eq('mentor_id', mentorId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Erro ao buscar convites do mentor:", error);
      ErrorService.logError('database_error', error, { mentorId });
      throw new Error(`Erro ao buscar histórico de convites: ${error.message}`);
    }
    
    console.log("Convites retornados:", data?.length || 0);
    return data || [];
  } catch (error: any) {
    console.error("Falha ao obter convites do mentor:", error);
    ErrorService.logError('database_error', error, { mentorId });
    throw new Error(error.message || 'Erro ao buscar convites');
  }
};
