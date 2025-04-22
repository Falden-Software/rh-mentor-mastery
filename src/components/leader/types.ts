
export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
}

export interface ClientListProps {
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}
