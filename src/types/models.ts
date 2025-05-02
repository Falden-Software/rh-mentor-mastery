
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
  title?: string;
  description?: string;
  status?: string;
  type?: string;
  created_at: string;
  client_id: string;
  test_id: string;
  is_completed: boolean;
  started_at?: string;
  completed_at?: string;
  client_test_id?: string; // For backwards compatibility
}

export interface TestData {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  created_at: string;
  client_test_id?: string;
  icon?: any;
  timeEstimate?: string;
  category?: string;
  dueDate?: string;
  startedAt?: string;
  completedAt?: string;
  completedDate?: string;
  test_id?: string;
}
