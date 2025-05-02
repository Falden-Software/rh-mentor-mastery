
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getMentorInvitations } from "@/services/invitations/getMentorInvitations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Loader2, Send, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InvitationService } from "@/services/invitations";

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
      
      // Usando a função atualizada que evita recursão
      const data = await getMentorInvitations(user.id);
      console.log("Dados de convites recebidos:", data);
      
      setInvitations(data || []);
    } catch (err: any) {
      console.error("Erro ao carregar histórico de convites:", err);
      setError(err.message || "Erro ao carregar histórico de convites");
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
    if (user?.id) {
      fetchInvitations();
    }
  }, [user?.id]);

  const handleResend = async (inviteId: string) => {
    setSendingId(inviteId);
    
    try {
      if (!user?.id) return;
      
      const result = await InvitationService.resendInvite(inviteId, user.id);
      
      if (result.success) {
        toast({
          title: "Convite reenviado",
          description: "O convite foi reenviado com sucesso."
        });
        // Atualizar lista de convites após reenvio
        await fetchInvitations();
      } else {
        throw new Error(result.error || "Não foi possível reenviar o convite.");
      }
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
    } catch (error) {
      return "Data inválida";
    }
  };

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
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar histórico</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchInvitations} 
              className="mt-2"
            >
              Tentar Novamente
            </Button>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando...</span>
          </div>
        ) : invitations.length === 0 && !error ? (
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
                  <TableHead className="hidden md:table-cell">Data de Envio</TableHead>
                  <TableHead className="hidden md:table-cell">Expira em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation: any) => (
                  <TableRow key={invitation.id}>
                    <TableCell>{invitation.email}</TableCell>
                    <TableCell>
                      {invitation.is_used ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Utilizado</Badge>
                      ) : new Date(invitation.expires_at) < new Date() ? (
                        <Badge variant="destructive">Expirado</Badge>
                      ) : (
                        <Badge variant="outline">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(invitation.created_at)}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(invitation.expires_at)}</TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={invitation.is_used || sendingId === invitation.id || new Date(invitation.expires_at) < new Date()}
                        onClick={() => handleResend(invitation.id)}
                      >
                        {sendingId === invitation.id ? (
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
