
import { AuthUser } from "@/lib/authTypes";
import { createInvite } from "./createInvite";
import { createInviteDirect } from "./createInviteDirect";
import { getMentorInvitations } from "./getMentorInvitations";
import { resendInvite } from "./resendInvite";
import { InvitationResult } from "./types";

export class InvitationService {
  /**
   * Creates an invitation for a new client through regular flow
   */
  static async createInvitation(
    email: string,
    name: string,
    mentor: AuthUser | null
  ): Promise<InvitationResult> {
    return await createInvite(email, name, mentor);
  }
  
  /**
   * Creates an invitation directly to bypass RLS recursion issues
   */
  static async createInvitationDirect(
    email: string,
    name: string,
    mentorId: string
  ): Promise<InvitationResult> {
    return await createInviteDirect(email, name, mentorId);
  }
  
  /**
   * Resends an invitation by ID
   */
  static async resendInvitation(
    inviteId: string,
    mentorId: string
  ): Promise<InvitationResult> {
    return await resendInvite(inviteId, mentorId);
  }
  
  /**
   * Gets all invitations for a mentor
   */
  static async getMentorInvitations(mentorId: string) {
    return await getMentorInvitations(mentorId);
  }
}
