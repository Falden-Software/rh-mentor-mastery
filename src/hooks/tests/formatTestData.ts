
import { iconMap } from "./iconMap";
import { getDummyTestData } from "./dummyTestData";
import { TestData } from "@/types/models";

export const formatTestsData = (clientTests: any[], testsInfo: any[]): TestData[] => {
  console.log("Formatando dados de testes:", { clientTests, testsInfo });
  const formattedTests: TestData[] = [];
  
  const hasAnimalTest = clientTests.some(test => {
    const testInfo = testsInfo.find(t => t.id === test.test_id);
    return testInfo && testInfo.title === "Perfil Comportamental";
  });
  
  const hasEgogramTest = clientTests.some(test => {
    const testInfo = testsInfo.find(t => t.id === test.test_id);
    return testInfo && testInfo.title === "Egograma";
  });
  
  const hasProactivityTest = clientTests.some(test => {
    const testInfo = testsInfo.find(t => t.id === test.test_id);
    return testInfo && testInfo.title === "Formulário de Proatividade";
  });
  
  if (!hasAnimalTest) {
    formattedTests.push(getDummyTestData()[0]);
  }
  
  if (!hasEgogramTest) {
    formattedTests.push(getDummyTestData()[1]);
  }
  
  if (!hasProactivityTest) {
    formattedTests.push(getDummyTestData()[2]);
  }
  
  clientTests.forEach(test => {
    const testInfo = testsInfo?.find(t => t.id === test.test_id);
    
    if (testInfo) {
      console.log("Processando teste:", { 
        testId: test.id,
        title: testInfo.title,
        isCompleted: test.is_completed,
        completedAt: test.completed_at
      });
      
      const category = "comportamental"; 
      const iconKey = testInfo.title.includes("Proatividade") ? "chart" : "brain";
      
      if (
        testInfo.title !== "Perfil Comportamental" && 
        testInfo.title !== "Egograma" && 
        testInfo.title !== "Formulário de Proatividade"
      ) {
        formattedTests.push({
          id: testInfo.id,
          client_test_id: test.id,
          title: testInfo.title,
          description: testInfo.description || "Teste comportamental para avaliar suas habilidades e perfil profissional.",
          status: test.is_completed ? "concluído" : "pendente",
          timeEstimate: "15 minutos",
          icon: iconMap[iconKey],
          category: category,
          startedAt: test.started_at,
          completedAt: test.completed_at,
          dueDate: test.is_completed ? undefined : "Em aberto",
          completedDate: test.is_completed ? (test.completed_at ? new Date(test.completed_at).toLocaleDateString('pt-BR') : "Data não registrada") : undefined,
          type: testInfo.type || "generic", // Adding required type field
          created_at: testInfo.created_at || test.created_at || new Date().toISOString(), // Adding required created_at field
          test_id: testInfo.id // Ensuring test_id is set
        });
      }
    }
  });
  
  console.log("Testes formatados:", formattedTests);
  return formattedTests;
};
