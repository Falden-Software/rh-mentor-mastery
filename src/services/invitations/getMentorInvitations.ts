
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
    // Use a direct query instead of a join that might trigger RLS recursion
    const { data, error } = await supabase
      .from('invitation_codes')
      .select('*')
      .eq('mentor_id', mentorId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching mentor invitations:", error);
      ErrorService.logError('database_error', error, { mentorId });
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Failed to get mentor invitations:", error);
    ErrorService.logError('invitation_service_error', error, { mentorId });
    throw error;
  }
};
