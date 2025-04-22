
import { createInvite } from './createInvite';
import { resendInvite } from './resendInvite';
import { createInviteDirect } from './createInviteDirect';
import { getMentorInvitations } from './getMentorInvitations';
import type { InvitationResult } from './types';

export class InvitationService {
  static createInvitation = createInvite;
  static resendInvitation = resendInvite;
  static createInvitationDirect = createInviteDirect;
  static getMentorInvitations = getMentorInvitations;
}

export type { InvitationResult };
