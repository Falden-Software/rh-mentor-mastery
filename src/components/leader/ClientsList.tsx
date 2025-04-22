import { useState, useEffect } from "react";
import { useToast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getMentorClients } from "@/services/clientService";
import { ClientCard } from "./components/ClientCard";
import { ClientListLoading } from "./components/ClientListLoading";
import { EmptyClientList } from "./components/EmptyClientList";
import { Client, ClientListProps } from "./types";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { generateInviteEmailHTML, sendInviteEmail } from "@/services/emailService";

export default function ClientsList({ onEdit, onDelete }: ClientListProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (!user?.id) return;
    
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const clientsData = await getMentorClients(user.id);
        setClients(clientsData.map(profile => ({
          id: profile.id,
          name: profile.name || "Sem nome",
          email: profile.email || "Sem email",
          company: profile.company
        })));
      } catch (error: any) {
        console.error("Erro ao carregar clientes:", error);
        setError(error.message || "Não foi possível carregar a lista de clientes.");
        toast.error("Erro ao carregar clientes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [user?.id, retryCount]);

  const handleInviteClient = async (email: string) => {
    if (isSendingInvite) return;
    
    try {
      setIsSendingInvite(true);
      const inviteCode = uuidv4();

      const { data: inviteData, error } = await supabase
        .from('invitation_codes')
        .insert([{ code: inviteCode, email, mentor_id: user?.id }])
        .select('code')
        .single();

      if (error) {
        throw new Error(`Erro ao gerar convite: ${error.message}`);
      }

      const htmlContent = generateInviteEmailHTML(inviteCode, user?.email || 'Equipe RH Mentor Mastery');

      await sendInviteEmail(email, undefined, 'Convite para RH Mentor Mastery', htmlContent);

      toast.success(`Convite enviado com sucesso para ${email}.`);
    } catch (error: any) {
      console.error("Erro ao enviar convite:", error);
      toast.error("Erro ao enviar convite");
    } finally {
      setIsSendingInvite(false);
    }
  };

  if (isLoading) return <ClientListLoading />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (clients.length === 0) return <EmptyClientList />;

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {clients.map((client) => (
        <ClientCard
          key={client.id}
          client={client}
          onEdit={onEdit}
          onDelete={onDelete}
          onInvite={handleInviteClient}
        />
      ))}
    </div>
  );
}
