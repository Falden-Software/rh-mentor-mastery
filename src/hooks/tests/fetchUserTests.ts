
import { supabase } from "@/integrations/supabase/client";
import { assignAnimalProfileTestToClient } from "@/lib/animalProfileService";
import { formatTestsData } from "./formatTestData";
import { getDummyTestData } from "./dummyTestData";
import { TestData } from "@/types/models";

export const fetchUserTests = async (): Promise<TestData[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    await assignAnimalProfileTestToClient(session.user.id);
    
    try {
      console.log("Buscando testes para o usuário:", session.user.id);
      const { data: clientTests, error: clientTestsError } = await supabase
        .from('client_tests')
        .select('*')
        .eq('client_id', session.user.id);
      
      if (clientTestsError) {
        console.error("Erro ao buscar testes do cliente:", clientTestsError);
        return getDummyTestData();
      }
      
      console.log("Testes encontrados:", clientTests?.length || 0);
      
      if (!clientTests || clientTests.length === 0) {
        console.warn("Nenhum teste encontrado para o usuário");
        return getDummyTestData();
      }
      
      const { data: testsInfo, error: testsInfoError } = await supabase
        .from('tests')
        .select('*')
        .in('id', clientTests.map(test => test.test_id));
      
      if (testsInfoError) {
        console.error("Erro ao buscar informações dos testes:", testsInfoError);
        return getDummyTestData();
      }
      
      console.log("Informações de testes encontradas:", testsInfo?.length || 0);
      
      return formatTestsData(clientTests, testsInfo || []);
    } catch (e) {
      console.error("Erro na consulta:", e);
      return getDummyTestData();
    }
  } catch (error) {
    console.error("Erro ao buscar testes:", error);
    return getDummyTestData();
  }
};
