
import { InviteForm } from './invite/InviteForm';

interface ClientInviteFormProps {
  onInviteSent: () => void;
  onCancel: () => void;
}

export function ClientInviteForm(props: ClientInviteFormProps) {
  return <InviteForm {...props} />;
}
