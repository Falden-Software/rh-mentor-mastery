
export interface Client {
  id: string;
  name: string;
  email: string;
  created_at: string;
  position?: string;
  company?: string;
}

export interface ClientsListProps {
  refreshTrigger?: number;
  onInviteClick: () => void;
}
