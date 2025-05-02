
import { getMentorInvitations } from './getMentorInvitations';
import { createInvite } from './createInvite';
import { resendInvite } from './resendInvite';
import { sendInviteEmail } from './emailService';
import { createInviteDirect } from './createInviteDirect';

export const InvitationService = {
  getMentorInvitations,
  createInvite,
  resendInvite,
  sendInviteEmail,
  createInviteDirect
};
