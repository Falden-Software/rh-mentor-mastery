
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { InvitationService } from '@/services/invitations/invitationService';

// Define the form schema directly to avoid import issues
const formSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
});

// Create a type from the schema
type InviteFormData = z.infer<typeof formSchema>;

interface InviteClientFormProps {
  onInviteSent?: () => void;
}

export function InviteClientForm({ onInviteSent }: InviteClientFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize the form
  const form = useForm<InviteFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const handleSubmit = async (data: InviteFormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      console.log("Sending invite to:", data.email);
      
      const result = await InvitationService.createInvitation(
        data.email,
        data.name,
        user
      );

      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Convite enviado com sucesso!",
          variant: "default",
        });
        
        form.reset();
        
        // Call the onInviteSent callback if provided
        if (onInviteSent) onInviteSent();
      } else {
        // Show specific error messages based on the error type
        if (result.isApiKeyError) {
          toast({
            title: "Erro de configuração",
            description: "API de email não configurada. Contate o administrador do sistema.",
            variant: "destructive",
          });
        } else if (result.isDomainError) {
          toast({
            title: "Erro de domínio",
            description: "O domínio de email não está verificado. Contate o administrador.",
            variant: "destructive",
          });
        } else if (result.isSmtpError) {
          toast({
            title: "Erro de conexão",
            description: "Não foi possível conectar ao servidor de email. Tente novamente mais tarde.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro",
            description: result.error || "Falha ao enviar convite. Tente novamente.",
            variant: "destructive",
          });
        }
        
        console.error("Invitation error:", result);
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar seu convite.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Convidar Novo Cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nome do cliente" 
                      {...field}
                      disabled={isSubmitting} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="email@exemplo.com" 
                      {...field}
                      disabled={isSubmitting} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Convite"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default InviteClientForm;
