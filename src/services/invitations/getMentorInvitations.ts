
import { supabase } from '@/integrations/supabase/client';
import { ErrorService } from '../errorService';
import { InvitationCode } from '@/types/models';

/**
 * Retrieves all invitations sent by a specific mentor
 * This function avoids the recursion policy issue by using a direct query without joins
 * 
 * @param mentorId - The ID of the mentor whose invitations should be fetched
 * @returns Array of invitation objects
 */
export const getMentorInvitations = async (mentorId: string): Promise<InvitationCode[]> => {
  try {
    console.log("Buscando convites para mentor:", mentorId);
    
    // Query without join to avoid RLS recursion
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
    
    return data || [];
  } catch (error: any) {
    console.error("Falha ao obter convites do mentor:", error);
    ErrorService.logError('database_error', error, { mentorId });
    throw new Error(error.message || 'Erro ao buscar convites');
  }
};
