
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Mail, Loader2 } from 'lucide-react';
import { InvitationCode } from '@/types/models';

interface InvitationHistoryTableProps {
  invitations: InvitationCode[];
  sendingEmails: Record<string, boolean>;
  onResend: (inviteId: string) => void;
}

export const InvitationHistoryTable: React.FC<InvitationHistoryTableProps> = ({
  invitations,
  sendingEmails,
  onResend
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };

  const isInviteExpired = (invite: InvitationCode): boolean => {
    const expiresAt = new Date(invite.expires_at);
    return expiresAt < new Date();
  };

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead className="hidden md:table-cell">Data de envio</TableHead>
            <TableHead className="hidden md:table-cell">Expira em</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations && invitations.length > 0 ? (
            invitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell>
                  {invitation.email}
                  <div className="md:hidden text-xs text-gray-500 mt-1">
                    Enviado: {formatDate(invitation.created_at)}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{formatDate(invitation.created_at)}</TableCell>
                <TableCell className="hidden md:table-cell">{formatDate(invitation.expires_at)}</TableCell>
                <TableCell>
                  <StatusBadge invitation={invitation} />
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onResend(invitation.id)}
                    disabled={sendingEmails[invitation.id] || invitation.is_used || isInviteExpired(invitation)}
                    className={invitation.is_used ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    {sendingEmails[invitation.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-1" />
                        Reenviar
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                Nenhum convite enviado ainda.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

interface StatusBadgeProps {
  invitation: InvitationCode;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ invitation }) => {
  const { CheckCircle, Clock, XCircle } = require('lucide-react');
  
  if (invitation.is_used) {
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
        <CheckCircle className="h-3 w-3" /> Utilizado
      </Badge>
    );
  }
  
  const expiresAt = new Date(invitation.expires_at);
  if (expiresAt < new Date()) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" /> Expirado
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200 flex items-center gap-1">
      <Clock className="h-3 w-3" /> Pendente
    </Badge>
  );
};
