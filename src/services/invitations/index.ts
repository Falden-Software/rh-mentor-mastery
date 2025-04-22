
import { createInvite } from './createInvite';
import { resendInvite } from './resendInvite';
import { createInviteDirect } from './createInviteDirect';
import type { InvitationResult } from './types';

export class InvitationService {
  static createInvitation = createInvite;
  static resendInvitation = resendInvite;
  static createInvitationDirect = createInviteDirect;
}

export type { InvitationResult };
