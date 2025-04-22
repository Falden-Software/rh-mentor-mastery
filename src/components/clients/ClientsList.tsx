
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/context/AuthContext";
import { getMentorClients } from "@/services/clientService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Profile } from "@/types/profile";
import { Client, ClientsListProps } from "./types";
import { ClientSearchBar } from "./ClientSearchBar";
import { ClientsTable } from "./ClientsTable";
import { ClientsError } from "./ClientsError";

export function ClientsList({ refreshTrigger = 0, onInviteClick }: ClientsListProps) {
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
      console.log("Iniciando busca de clientes para o mentor:", user.id);
      const profileData: Profile[] = await getMentorClients(user.id);
      console.log("Dados recebidos:", profileData);
      
      const clientsData: Client[] = profileData.map((profile) => ({
        id: profile.id,
        name: profile.name || "Sem nome",
        email: profile.email || "Sem email",
        created_at: profile.created_at || "",
        position: profile.position,
        company: profile.company,
      }));
      
      if (!clientsData || clientsData.length === 0) {
        console.log("Nenhum cliente encontrado");
      } else {
        console.log(`${clientsData.length} clientes encontrados`);
      }
      
      setClients(clientsData);
    } catch (error: any) {
      console.error("Erro ao carregar clientes:", error);
      setError(error.message || "Não foi possível carregar a lista de clientes.");
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de clientes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (user?.id) {
      loadClients();
    }
  }, [user?.id, retryCount, refreshTrigger]);
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const filteredClients = clients.filter(client => 
    client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.position && client.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (client.company && client.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  if (error) {
    return <ClientsError error={error} onRetry={handleRetry} />;
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
        <ClientSearchBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onInviteClick={onInviteClick}
        />
        
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
          <ClientsTable clients={filteredClients} />
        )}
      </CardContent>
    </Card>
  );
}

export default ClientsList;
