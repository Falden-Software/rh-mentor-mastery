export interface InvitationCode {
  id: string;
  code: string;
  email: string;
  mentor_id: string;
  is_used: boolean;
  expires_at: string;
  used_by?: string;
  created_at: string;
}
