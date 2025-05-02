
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { InvitationService } from "@/services/invitations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Loader2, Send, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function InvitationHistory() {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchInvitations = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Buscando histórico de convites para o usuário:", user.id);
      const data = await InvitationService.getMentorInvitations(user.id);
      console.log("Dados de convites recebidos:", data);
      setInvitations(data);
    } catch (err: any) {
      console.error("Erro ao carregar histórico de convites:", err);
      setError("Erro ao carregar histórico de convites");
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar histórico de convites"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [user?.id]);

  const handleResend = async (inviteId: string) => {
    setSendingId(inviteId);
    
    try {
      if (!user?.id) return;
      
      await InvitationService.resendInvite(inviteId, user.id);
      toast({
        title: "Convite reenviado",
        description: "O convite foi reenviado com sucesso."
      });
    } catch (err: any) {
      console.error("Erro ao reenviar convite:", err);
      toast({
        variant: "destructive",
        title: "Erro ao reenviar",
        description: err.message || "Não foi possível reenviar o convite."
      });
    } finally {
      setSendingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Histórico de Convites</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchInvitations}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            {error}. Por favor, tente novamente.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Histórico de Convites</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchInvitations} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando...</span>
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum convite enviado ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Envio</TableHead>
                  <TableHead>Expira em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell>{invite.email}</TableCell>
                    <TableCell>
                      {invite.is_used ? (
                        <Badge variant="success">Utilizado</Badge>
                      ) : new Date(invite.expires_at) < new Date() ? (
                        <Badge variant="destructive">Expirado</Badge>
                      ) : (
                        <Badge variant="outline">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(invite.created_at)}</TableCell>
                    <TableCell>{formatDate(invite.expires_at)}</TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={invite.is_used || sendingId === invite.id || new Date(invite.expires_at) < new Date()}
                        onClick={() => handleResend(invite.id)}
                      >
                        {sendingId === invite.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Enviando
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-1" />
                            Reenviar
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
