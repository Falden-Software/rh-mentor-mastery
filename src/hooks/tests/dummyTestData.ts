
import { TestData } from "@/types/models";
import { Brain, LineChart } from "lucide-react";

export const getDummyTestData = (): TestData[] => {
  return [
    {
      id: "dummy-animal-test-id",
      client_test_id: "dummy-client-test-id",
      title: "Perfil Comportamental",
      description: "Descubra seu perfil comportamental através de nossa metáfora de animais.",
      icon: Brain,
      timeEstimate: "10 minutos",
      status: "pendente",
      category: "comportamental",
      dueDate: "Em aberto",
      startedAt: null,
      completedAt: null,
      type: "animal-profile", // Adding required type field
      created_at: new Date().toISOString(), // Adding required created_at field
      test_id: "dummy-animal-test-id" // Adding test_id for consistency
    },
    {
      id: "dummy-egogram-test-id",
      client_test_id: "dummy-egogram-client-test-id",
      title: "Egograma",
      description: "Descubra como se distribuem os estados de ego em sua personalidade.",
      icon: Brain,
      timeEstimate: "10 minutos",
      status: "pendente",
      category: "comportamental",
      dueDate: "Em aberto",
      startedAt: null,
      completedAt: null,
      type: "egogram", // Adding required type field
      created_at: new Date().toISOString(), // Adding required created_at field
      test_id: "dummy-egogram-test-id" // Adding test_id for consistency
    },
    {
      id: "dummy-proactivity-test-id",
      client_test_id: "dummy-proactivity-client-test-id",
      title: "Formulário de Proatividade",
      description: "Avalie seu nível de proatividade e iniciativa no ambiente de trabalho.",
      icon: LineChart,
      timeEstimate: "8 minutos",
      status: "pendente",
      category: "profissional",
      dueDate: "Em aberto",
      startedAt: null,
      completedAt: null,
      type: "proactivity", // Adding required type field
      created_at: new Date().toISOString(), // Adding required created_at field
      test_id: "dummy-proactivity-test-id" // Adding test_id for consistency
    }
  ];
};
