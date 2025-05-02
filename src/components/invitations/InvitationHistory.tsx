
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
import { Mail, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { getMentorInvitations, resendInvite } from '@/services/invitations';
import InviteErrorAlert from '@/components/leader/invitation/InviteErrorAlert';

const InvitationHistory = () => {
  const { user } = useAuth();
  const [sendingEmails, setSendingEmails] = useState<Record<string, boolean>>({});
  const [resendError, setResendError] = useState<any>(null);
  
  const { 
    data: invitations, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['invitation-history'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        return await getMentorInvitations(user.id);
      } catch (error) {
        console.error("Erro ao buscar convites:", error);
        throw error;
      }
    },
    enabled: !!user?.id,
  });
  
  // Mutation para reenviar convite
  const resendMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      if (!user?.id) throw new Error("Usuário não autenticado");
      setSendingEmails(prev => ({ ...prev, [inviteId]: true }));
      setResendError(null);
      
      try {
        const result = await resendInvite(inviteId, user.id);
        if (!result.success) {
          throw new Error(result.error || "Erro ao reenviar convite");
        }
        return result;
      } catch (error) {
        console.error("Erro capturado no reenvio:", error);
        throw error;
      }
    },
    onSuccess: (data, inviteId) => {
      toast.success(data.message || "Convite reenviado com sucesso!");
      setSendingEmails(prev => ({ ...prev, [inviteId]: false }));
      refetch();
    },
    onError: (error: any, inviteId) => {
      console.error("Erro ao reenviar convite:", error);
      toast.error("Falha ao reenviar convite");
      setSendingEmails(prev => ({ ...prev, [inviteId]: false }));
      setResendError(error);
    }
  });
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };

  const getStatusBadge = (invite: any) => {
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
  
  const isInviteExpired = (invite: any): boolean => {
    const expiresAt = new Date(invite.expires_at);
    return expiresAt < new Date();
  };
  
  const handleRetry = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Carregando histórico de convites...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-red-500 p-4 border border-red-200 rounded-md bg-red-50">
          <h3 className="font-medium">Erro ao carregar histórico</h3>
          <p>{(error as Error).message || "Erro ao buscar histórico de convites"}</p>
          <Button onClick={handleRetry} variant="outline" size="sm" className="mt-2">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {resendError && (
        <InviteErrorAlert 
          error={(resendError as Error).message} 
          isApiKeyError={resendError.isApiKeyError}
          isDomainError={resendError.isDomainError}
          isSmtpError={resendError.isSmtpError}
          onRetry={handleRetry}
        />
      )}
      
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
              invitations.map((invitation: any) => (
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
    </div>
  );
};

export default InvitationHistory;
