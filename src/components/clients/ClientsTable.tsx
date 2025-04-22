
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Client } from "./types";

interface ClientsTableProps {
  clients: Client[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const getInitials = (name: string): string => {
    if (!name) return "??";
    return name
      .split(" ")
      .map(part => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleEmailClient = (email: string) => {
    window.open(`mailto:${email}`);
    toast("Abrindo email para " + email);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Data de Cadastro</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
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
              <TableCell>{client.company || "-"}</TableCell>
              <TableCell>{client.position || "-"}</TableCell>
              <TableCell>
                {client.created_at ? 
                  format(new Date(client.created_at), "dd/MM/yyyy", { locale: ptBR }) :
                  "-"
                }
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleEmailClient(client.email)}
                >
                  <Mail className="h-4 w-4" />
                  <span className="sr-only">Enviar email</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
