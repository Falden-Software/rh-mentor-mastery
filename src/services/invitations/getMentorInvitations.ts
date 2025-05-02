
import { supabase } from '@/integrations/supabase/client';
import { ErrorService } from '../errorService';
import { InvitationCode } from '@/types/models';

/**
 * Retrieves all invitations sent by a specific mentor
 * This function avoids the recursion policy issue by using a direct query
 * 
 * @param mentorId - The ID of the mentor whose invitations should be fetched
 * @returns Array of invitation objects
 */
export const getMentorInvitations = async (mentorId: string): Promise<InvitationCode[]> => {
  try {
    console.log("Buscando convites para mentor:", mentorId);
    
    // Abordagem sem junção para evitar recursão de RLS
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
    
    console.log(`Encontrados ${data?.length || 0} convites para o mentor`);
    
    // Se não houver erro mas data for null, retornar array vazio
    return data || [];
  } catch (error) {
    console.error("Falha ao obter convites do mentor:", error);
    ErrorService.logError('database_error', error, { mentorId });
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro desconhecido ao buscar convites');
  }
};
