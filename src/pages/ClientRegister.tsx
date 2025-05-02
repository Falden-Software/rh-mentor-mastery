
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AuthUser } from "@/lib/auth";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  password: z.string().min(6, {
    message: "Senha deve ter pelo menos 6 caracteres.",
  }),
  phone: z.string().optional(),
  position: z.string().optional(),
  bio: z.string().optional()
});

export default function ClientRegister() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      position: "",
      bio: ""
    },
  });

  // Buscar o mentor_id e email do URL search params
  const searchParams = new URLSearchParams(window.location.search);
  const mentorId = searchParams.get("mentor_id");
  const clientEmail = searchParams.get("email");
  const token = searchParams.get("token"); // Token de convite do Supabase

  // Preencher o email do formulário se disponível no URL
  useEffect(() => {
    if (clientEmail) {
      form.setValue("email", clientEmail);
    }
    
    // Se temos um token do Supabase, vamos verificá-lo
    if (token) {
      verifyInviteToken(token);
    }
  }, [clientEmail, token, form]);

  // Verificar o token de convite do Supabase
  const verifyInviteToken = async (token: string) => {
    try {
      // Verificar se o token é válido usando a API do Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'invite'
      });

      if (error) {
        console.error("Erro ao verificar token de convite:", error);
        toast({
          variant: "destructive",
          title: "Convite inválido",
          description: "O link de convite é inválido ou expirou.",
        });
      } else {
        console.log("Token de convite válido:", data);
        // Podemos extrair metadados do convite se necessário
      }
    } catch (error) {
      console.error("Erro ao processar token:", error);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      // Tenta encontrar um convite não utilizado para este email
      const { data: invitationData } = await supabase
        .from('invitation_codes')
        .select('mentor_id')
        .eq('email', values.email)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Determina o mentor_id para vincular ao cliente
      const mentorIdToUse = mentorId || (invitationData?.mentor_id as string | null);

      if (!mentorIdToUse) {
        toast({
          variant: "destructive",
          title: "Erro no registro",
          description: "Não foi possível encontrar um mentor válido para associar à sua conta.",
        });
        setIsLoading(false);
        return;
      }
      
      const result: AuthUser | null = await register(
        values.email, 
        values.password, 
        values.name, 
        "client",
        undefined,
        values.phone,
        values.position,
        values.bio
      );
      
      if (result !== null) {
        // Marcar convites como utilizados
        const { error: updateError } = await supabase
          .from('invitation_codes')
          .update({ 
            is_used: true,
            used_by: result.id
          })
          .eq('email', values.email)
          .eq('is_used', false);
        
        if (updateError) {
          console.error("Erro ao atualizar códigos de convite:", updateError);
        }
        
        // Vincular cliente ao mentor
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ mentor_id: mentorIdToUse })
          .eq('id', result.id);
          
        if (profileError) {
          console.error("Erro ao vincular cliente ao mentor:", profileError);
        }
      }
      
      toast({
        title: "Conta criada com sucesso",
        description: "Bem-vindo! Sua conta foi criada com sucesso.",
      });
      
      navigate("/client/login");
    } catch (error) {
      console.error("Erro no registro:", error);
      toast({
        variant: "destructive",
        title: "Erro no registro",
        description: error instanceof Error ? error.message : "Ocorreu um erro durante o registro.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Criar conta</CardTitle>
            <CardDescription className="text-center">
              Preencha os campos abaixo para criar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo" {...field} />
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
                        <Input placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>Opcional</FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu cargo atual" {...field} />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>Opcional</FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biografia</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Conte um pouco sobre você" {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>Opcional</FormDescription>
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    "Registrar"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link to="/client/login" className="text-primary underline">
                Faça login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
