
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
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
import { Mail, Loader2, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import useNotifications from '@/hooks/useNotifications';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InvitationService } from '@/services/invitations';
import { InvitationCode } from '@/types/models';

const InvitationHistory = () => {
  const { user } = useAuth();
  const notify = useNotifications();
  const [sendingEmails, setSendingEmails] = useState<Record<string, boolean>>({});
  
  const { data: invitations, isLoading, error, refetch } = useQuery({
    queryKey: ['invitation-history'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        return await InvitationService.getMentorInvitations(user.id);
      } catch (error) {
        console.error("Error fetching invitation history:", error);
        throw new Error("Error loading invitation history");
      }
    },
    enabled: !!user?.id,
  });
  
  // Mutation for resending invitations
  const resendMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      setSendingEmails(prev => ({ ...prev, [inviteId]: true }));
      
      try {
        const { data, error } = await supabase.functions.invoke('resend-invitation', {
          body: { inviteId }
        });
        
        if (error || !data?.success) {
          throw error || new Error(data?.error || "Unknown error");
        }
        
        return data;
      } catch (error) {
        console.error("Error in resend mutation:", error);
        throw error;
      }
    },
    onSuccess: (data, inviteId) => {
      notify.success(data.message || "Convite reenviado com sucesso!");
      setSendingEmails(prev => ({ ...prev, [inviteId]: false }));
      refetch();
    },
    onError: (error: any, inviteId) => {
      console.error("Error resending invitation:", error);
      notify.error(error.message || "Falha ao reenviar convite");
      setSendingEmails(prev => ({ ...prev, [inviteId]: false }));
    }
  });
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };

  const getStatusBadge = (invite: InvitationCode) => {
    if (invite.is_used) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Utilizado
        </Badge>
      );
    }
    
    const expiresAt = new Date(invite.expires_at);
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
  
  const isInviteExpired = (invite: InvitationCode): boolean => {
    const expiresAt = new Date(invite.expires_at);
    return expiresAt < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Erro ao carregar histórico de convites"}
        </AlertDescription>
      </Alert>
    );
  }

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
            invitations.map((invitation: InvitationCode) => (
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
                  {getStatusBadge(invitation)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resendMutation.mutate(invitation.id)}
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

export default InvitationHistory;
