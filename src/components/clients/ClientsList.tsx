
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, UserPlus, Mail, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getMentorClients } from "@/services/clientService";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type Client = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  last_login?: string;
  position?: string;
};

export function ClientsList() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const loadClients = async () => {
    if (!user?.id) {
      setError("Usuário não autenticado");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const clientsData = await getMentorClients(user.id);
      
      if (!clientsData || clientsData.length === 0) {
        console.log("Nenhum cliente encontrado");
      } else {
        console.log(`${clientsData.length} clientes encontrados`);
      }
      
      setClients(clientsData || []);
    } catch (error: any) {
      console.error("Erro ao carregar clientes:", error);
      setError(error.message || "Não foi possível carregar a lista de clientes.");
      toast({
        variant: "destructive",
        title: "Erro ao carregar clientes",
        description: "Não foi possível carregar a lista de clientes.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (user?.id) {
      loadClients();
    }
  }, [user?.id, retryCount]);
  
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.position && client.position.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map(part => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seus Clientes</CardTitle>
          <CardDescription>
            Gerencie seus clientes e veja seus detalhes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar clientes</AlertTitle>
            <AlertDescription>
              <p>{error}</p>
              <Button 
                onClick={handleRetry} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Seus Clientes</CardTitle>
          <CardDescription>
            Gerencie seus clientes e veja seus detalhes
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadClients}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="ml-2" asChild>
            <a href="#invite-client">
              <UserPlus className="h-4 w-4 mr-2" />
              Convidar
            </a>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando clientes...</span>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {clients.length === 0
              ? "Você ainda não tem clientes. Convide novos clientes para começar."
              : "Nenhum cliente encontrado com os critérios de busca."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{client.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.position || "-"}</TableCell>
                    <TableCell>
                      {client.created_at ? 
                        format(new Date(client.created_at), "dd/MM/yyyy", { locale: ptBR }) :
                        "-"
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`mailto:${client.email}`}>
                          <Mail className="h-4 w-4" />
                          <span className="sr-only">Enviar email</span>
                        </a>
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

export default ClientsList;
