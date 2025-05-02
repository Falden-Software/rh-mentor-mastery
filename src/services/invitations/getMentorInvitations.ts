
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
    
    // Use an RPC function to avoid recursion first
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'get_mentor_invitations',
        { p_mentor_id: mentorId }
      );
      
      if (!rpcError && rpcData) {
        console.log("Convites retornados via RPC:", rpcData.length || 0);
        return rpcData;
      } else {
        console.log("Fallback para query direta devido a:", rpcError?.message);
      }
    } catch (rpcException) {
      console.error("Exceção em RPC, usando fallback:", rpcException);
    }
    
    // Fallback: Uso direto da tabela sem referências a tabelas que podem causar recursão
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
    
    console.log("Convites retornados via query direta:", data?.length || 0);
    return data || [];
  } catch (error: any) {
    console.error("Falha ao obter convites do mentor:", error);
    ErrorService.logError('database_error', error, { mentorId });
    throw new Error(error.message || 'Erro ao buscar convites');
  }
};
