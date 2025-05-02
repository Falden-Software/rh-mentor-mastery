
import { InvitationService } from './invitations/index';
import { supabase } from "@/integrations/supabase/client";
import { AuthUser } from '@/lib/authTypes';

export const createClientInvitation = async (email: string, name: string, mentorId: string) => {
  const mentor = { id: mentorId, name: 'Mentor' }; // Simplificado para compatibilidade
  return InvitationService.createInvite(email, name, mentor as AuthUser);
};

export const sendInviteEmail = async (inviteId: string) => {
  // Adaptar para usar o método de reenvio do InvitationService
  const mentorId = await getMentorIdFromInvite(inviteId);
  if (!mentorId) {
    throw new Error("Convite não encontrado");
  }
  return InvitationService.resendInvite(inviteId, mentorId);
};

// Função auxiliar para obter o mentor_id de um convite
async function getMentorIdFromInvite(inviteId: string) {
  const { data } = await supabase
    .from('invitation_codes')
    .select('mentor_id')
    .eq('id', inviteId)
    .single();
  return data?.mentor_id;
}
