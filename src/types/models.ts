
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

export interface ClientTest {
  id: string;
  title: string;
  description: string;
  status: string;
  type: string;
  created_at: string;
  client_id: string;
}

export interface TestData {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  created_at: string;
}
