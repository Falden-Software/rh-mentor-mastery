
import { supabase } from '@/lib/supabase/client';
import { addDays } from 'date-fns';
import { ErrorService } from '../errorService';

export const findExistingInvite = async (email: string, mentorId: string) => {
  const { data, error } = await supabase
    .from('invitation_codes')
    .select('id')
    .eq('email', email)
    .eq('mentor_id', mentorId)
    .maybeSingle();
    
  if (error) throw error;
  return data;
};

export const updateExistingInvite = async (inviteId: string) => {
  const expirationDate = addDays(new Date(), 7).toISOString();
  
  const { error } = await supabase
    .from('invitation_codes')
    .update({
      is_used: false,
      expires_at: expirationDate
    })
    .eq('id', inviteId);
    
  if (error) throw error;
  return inviteId;
};

export const createNewInvite = async (email: string, mentorId: string) => {
  const expirationDate = addDays(new Date(), 7).toISOString();
  const code = Math.random().toString(36).substring(2, 10);
  
  const { data, error } = await supabase
    .from('invitation_codes')
    .insert({
      code,
      mentor_id: mentorId,
      email: email,
      is_used: false,
      expires_at: expirationDate
    })
    .select('id')
    .single();
    
  if (error) throw error;
  if (!data) throw new Error('Falha ao criar convite');
  
  return data.id;
};

export const getMentorInvitations = async (mentorId: string) => {
  try {
    const { data, error } = await supabase
      .from('invitation_codes')
      .select('*')
      .eq('mentor_id', mentorId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    ErrorService.logError('database_error', error, { mentorId });
    throw error;
  }
};
