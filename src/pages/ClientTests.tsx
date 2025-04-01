
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClipboardCheck, Clock, CheckCircle, AlertCircle, Brain, Heart, Users, Loader2 } from "lucide-react";
import ClientLayout from "@/components/client/ClientLayout";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuthUser } from "@/lib/auth";

// Interface para os dados dos testes
interface TestData {
  id: string;
  title: string;
  description: string | null;
  icon: any;
  timeEstimate: string;
  status: "pendente" | "concluído";
  category: string;
  dueDate?: string;
  completedDate?: string;
  startedAt?: string | null;
  completedAt?: string | null;
}

// Mapeamento de ícones
const iconMap: Record<string, any> = {
  "brain": Brain,
  "heart": Heart,
  "users": Users,
  "clipboard": ClipboardCheck,
};

const ClientTests = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Função para buscar os testes do usuário atual
  const fetchUserTests = async () => {
    try {
      // Primeiro, obter o usuário atual
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Buscar todos os testes associados ao usuário (cliente)
      const { data: clientTests, error: clientTestsError } = await supabase
        .from('client_tests')
        .select(`
          id,
          is_completed,
          started_at,
          completed_at,
          tests (
            id,
            title,
            description
          )
        `)
        .eq('client_id', session.user.id);
      
      if (clientTestsError) {
        throw new Error(`Erro ao buscar testes do cliente: ${clientTestsError.message}`);
      }
      
      if (!clientTests || clientTests.length === 0) {
        // Retornar um array vazio se não houver testes
        return [];
      }
      
      // Transformar os dados para o formato esperado pelo componente
      const formattedTests: TestData[] = clientTests.map((test: any) => {
        // Definir valores padrão para categorias e ícones baseados em alguma lógica
        const category = "comportamental"; // Podemos melhorar isso no futuro
        const iconKey = category === "comportamental" ? "brain" : "clipboard";
        
        return {
          id: test.tests.id,
          title: test.tests.title,
          description: test.tests.description || "Sem descrição disponível",
          status: test.is_completed ? "concluído" : "pendente",
          timeEstimate: "20 minutos", // Podemos adicionar esse campo na tabela de testes no futuro
          icon: iconMap[iconKey],
          category: category,
          startedAt: test.started_at,
          completedAt: test.completed_at,
          dueDate: test.is_completed ? undefined : "15/06/2023", // Placeholder, pode ser melhorado
          completedDate: test.is_completed ? (test.completed_at ? new Date(test.completed_at).toLocaleDateString('pt-BR') : "Data não registrada") : undefined
        };
      });
      
      return formattedTests;
      
    } catch (error) {
      console.error("Erro ao buscar testes:", error);
      throw error;
    }
  };

  // Usar React Query para gerenciar o estado da busca
  const { data: testData = [], isLoading, isError, error } = useQuery({
    queryKey: ['clientTests'],
    queryFn: fetchUserTests,
    retry: 1,
  });

  // Mostrar um erro se ocorrer algum problema
  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Erro ao carregar testes",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  // Função para iniciar um teste
  const handleStartTest = (testId: string) => {
    // Aqui você poderia redirecionar para a página específica do teste
    // ou atualizar o status do teste para "iniciado"
    console.log(`Iniciando teste ${testId}`);
    toast({
      title: "Teste iniciado",
      description: "Você será redirecionado para o teste em breve.",
    });
    // navigate(`/client/test/${testId}`);
  };

  // Função para ver os resultados de um teste
  const handleViewResults = (testId: string) => {
    console.log(`Visualizando resultados do teste ${testId}`);
    toast({
      title: "Carregando resultados",
      description: "Os resultados do teste serão exibidos em breve.",
    });
    // navigate(`/client/test/${testId}/results`);
  };

  // Renderizar estados de carregamento ou erro
  if (isLoading) {
    return (
      <ClientLayout title="Meus Testes">
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
          <p className="text-muted-foreground">Carregando seus testes...</p>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout title="Meus Testes">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="completed">Concluídos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {testData.filter(test => test.status === "pendente").length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {testData.filter(test => test.status === "pendente").map((test) => (
                <Card key={test.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 pb-4">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                        Pendente
                      </Badge>
                      <div className="flex items-center text-amber-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-xs">Prazo: {test.dueDate}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 mt-3">
                      <div className="bg-purple-100 p-2 rounded-md">
                        <test.icon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{test.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {test.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">0%</span>
                        </div>
                        <Progress value={0} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Tempo estimado: {test.timeEstimate}</span>
                        </div>
                        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
                          {test.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 py-3">
                    <Button className="w-full" onClick={() => handleStartTest(test.id)}>Iniciar Teste</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-gray-100 inline-flex rounded-full p-3 mb-4">
                <ClipboardCheck className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">Nenhum teste pendente</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Você não tem nenhum teste pendente no momento. Todos os seus testes
                serão exibidos aqui quando estiverem disponíveis.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {testData.filter(test => test.status === "concluído").length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {testData.filter(test => test.status === "concluído").map((test) => (
                <Card key={test.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 pb-4">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                        Concluído
                      </Badge>
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs">Realizado: {test.completedDate}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 mt-3">
                      <div className="bg-purple-100 p-2 rounded-md">
                        <test.icon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{test.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {test.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">100%</span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Tempo estimado: {test.timeEstimate}</span>
                        </div>
                        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
                          {test.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 py-3">
                    <Button variant="outline" className="w-full" onClick={() => handleViewResults(test.id)}>
                      Ver Resultados
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-gray-100 inline-flex rounded-full p-3 mb-4">
                <CheckCircle className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">Nenhum teste concluído</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Você ainda não concluiu nenhum teste. Após concluir seus testes, 
                eles serão exibidos aqui com seus resultados.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </ClientLayout>
  );
};

export default ClientTests;
