
import { Calendar, Mail, MoreVertical } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Client } from "../types";

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
  onInvite: (email: string) => void;
}

export function ClientCard({ client, onEdit, onDelete, onInvite }: ClientCardProps) {
  return (
    <Card className="bg-white shadow-md rounded-lg overflow-hidden">
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={`https://avatar.vercel.sh/${client.name}.png`} />
            <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{client.name}</h3>
            <p className="text-gray-500">{client.email}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(client)}>
              <Calendar className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(client.id)} className="text-red-500">
              <Calendar className="mr-2 h-4 w-4" /> Excluir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInvite(client.email)} className="text-green-500">
              <Mail className="mr-2 h-4 w-4" /> Convidar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <h4 className="text-sm font-medium leading-none">Empresa</h4>
            <p className="text-sm text-gray-500">{client.company || "Não especificada"}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium leading-none">Status</h4>
            <Badge variant="secondary">Ativo</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
