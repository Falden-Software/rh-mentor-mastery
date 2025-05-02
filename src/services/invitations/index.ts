
import { getMentorInvitations } from './getMentorInvitations';
import { createInvite } from './createInvite';
import { resendInvite } from './resendInvite';
import { sendInviteEmail } from './sendInviteEmail';

export const InvitationService = {
  getMentorInvitations,
  createInvite,
  resendInvite,
  sendInviteEmail
};
