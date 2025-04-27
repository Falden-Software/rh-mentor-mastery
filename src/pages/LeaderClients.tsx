
import { useState, useEffect } from "react";
import { ClientsList } from "@/components/clients/ClientsList";
import { ClientInviteForm } from "@/components/clients/ClientInviteForm";
import InvitationHistory from "@/components/invitations/InvitationHistory";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export default function LeaderClients() {
  const [activeTab, setActiveTab] = useState("clients");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  
  const handleInviteSent = () => {
    setRefreshTrigger(prev => prev + 1);
    setIsInviteDialogOpen(false);
    setActiveTab("history");
  };
  
  const handleOpenInviteDialog = () => {
    setIsInviteDialogOpen(true);
  };
  
  const handleCloseInviteDialog = () => {
    setIsInviteDialogOpen(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Gestão de Clientes</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="clients" className="flex-1">
            Lista de Clientes
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1">
            Histórico de Convites
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="clients">
          <ClientsList 
            key={`clients-${refreshTrigger}`} 
            refreshTrigger={refreshTrigger}
            onInviteClick={handleOpenInviteDialog}
          />
        </TabsContent>
        
        <TabsContent value="history">
          <InvitationHistory key={`history-${refreshTrigger}`} />
        </TabsContent>
      </Tabs>
      
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Convidar Novo Cliente</DialogTitle>
          </DialogHeader>
          <ClientInviteForm 
            onInviteSent={handleInviteSent}
            onCancel={handleCloseInviteDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
