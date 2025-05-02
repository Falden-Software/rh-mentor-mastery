import { ForwardRefExoticComponent, RefAttributes } from "react";
import { LucideProps } from "lucide-react";

export interface InvitationCode {
  id: string;
  code: string;
  email: string;
  mentor_id: string;
  is_used: boolean;
  used_by?: string | null;
  created_at: string;
  expires_at: string;
  role?: string;
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
  icon?: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  timeEstimate?: string;
  category?: string;
  dueDate?: string;
  startedAt?: string;
  completedAt?: string;
  completedDate?: string;
  test_id?: string;
}
