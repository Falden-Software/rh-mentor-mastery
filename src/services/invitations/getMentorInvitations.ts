
import { supabase } from '@/lib/supabase/client';
import { ErrorService } from '../errorService';
import { InvitationCode } from '@/types/models';

/**
 * Retrieves all invitations sent by a specific mentor
 * Uses an RPC function to avoid recursion issues with RLS policies
 * 
 * @param mentorId - The ID of the mentor whose invitations should be fetched
 * @returns Array of invitation objects
 */
export const getMentorInvitations = async (mentorId: string): Promise<InvitationCode[]> => {
  try {
    console.log("Buscando convites para mentor:", mentorId);
    
    // Use the dedicated RPC function to avoid recursion
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'get_mentor_invitations',
      { p_mentor_id: mentorId }
    );
    
    if (rpcError) {
      console.error("Erro ao buscar convites via RPC:", rpcError);
      ErrorService.logError('database_error', rpcError, { mentorId });
      
      // Fallback to direct query if RPC fails
      console.log("Usando fallback para query direta");
      const { data: directData, error: directError } = await supabase
        .from('invitation_codes')
        .select('*')
        .eq('mentor_id', mentorId)
        .order('created_at', { ascending: false });
        
      if (directError) {
        console.error("Erro ao buscar convites do mentor (fallback):", directError);
        throw new Error(`Erro ao buscar histórico de convites: ${directError.message}`);
      }
      
      return directData || [];
    }
    
    console.log("Convites retornados via RPC:", rpcData?.length || 0);
    return rpcData || [];
  } catch (error: any) {
    console.error("Falha ao obter convites do mentor:", error);
    ErrorService.logError('database_error', error, { mentorId });
    throw new Error(error.message || 'Erro ao buscar convites');
  }
};
