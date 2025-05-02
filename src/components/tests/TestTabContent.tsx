
import React from 'react';
import { TestData } from "@/types/models";
import AnimalProfileTestCard from "@/components/tests/AnimalProfileTestCard";
import EgogramaTestCard from "@/components/tests/EgogramaTestCard";
import ProactivityTestCard from "@/components/tests/ProactivityTestCard";
import GenericTestCard from "@/components/tests/GenericTestCard";
import EmptyTestState from "@/components/tests/EmptyTestState";

interface TestTabContentProps {
  testData: TestData[];
  type: "pending" | "completed";
  isStarting: string | null;
  onStartAnimalTest: (testId: string) => void;
  onStartEgogramTest: (testId: string) => void;
  onStartProactivityTest: (testId: string) => void;
  onStartTest: (test: TestData) => void;
  onViewResults: (testId: string) => void;
}

export const TestTabContent = ({
  testData,
  type,
  isStarting,
  onStartAnimalTest,
  onStartEgogramTest,
  onStartProactivityTest,
  onStartTest,
  onViewResults,
}: TestTabContentProps) => {
  const isPending = type === "pending";
  const filteredTests = testData.filter(test => isPending ? test.status === "pendente" : test.status === "concluído");
  
  if (filteredTests.length === 0) {
    return <EmptyTestState type={type} />;
  }

  const animalTest = testData.find(test => test.title === "Perfil Comportamental");
  const egogramTest = testData.find(test => test.title === "Egograma");
  const proactivityTest = testData.find(test => test.title === "Formulário de Proatividade");

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {animalTest && animalTest.status === (isPending ? "pendente" : "concluído") && (
        <AnimalProfileTestCard
          test={{
            id: animalTest.client_test_id,
            client_id: '',
            test_id: animalTest.id,
            is_completed: !isPending,
            started_at: animalTest.startedAt,
            completed_at: animalTest.completedAt,
            created_at: animalTest.created_at
          }}
          isStarting={isStarting === animalTest.client_test_id}
          onStartTest={onStartAnimalTest}
        />
      )}
      
      {egogramTest && egogramTest.status === (isPending ? "pendente" : "concluído") && (
        <EgogramaTestCard
          test={{
            id: egogramTest.client_test_id,
            client_id: '',
            test_id: egogramTest.id,
            is_completed: !isPending,
            started_at: egogramTest.startedAt,
            completed_at: egogramTest.completedAt,
            created_at: egogramTest.created_at
          }}
          isStarting={isStarting === egogramTest.client_test_id}
          onStartTest={onStartEgogramTest}
        />
      )}
      
      {proactivityTest && proactivityTest.status === (isPending ? "pendente" : "concluído") && (
        <ProactivityTestCard
          test={{
            id: proactivityTest.client_test_id,
            client_id: '',
            test_id: proactivityTest.id,
            is_completed: !isPending,
            started_at: proactivityTest.startedAt,
            completed_at: proactivityTest.completedAt,
            created_at: proactivityTest.created_at
          }}
          isStarting={isStarting === proactivityTest.client_test_id}
          onStartTest={onStartProactivityTest}
        />
      )}
      
      {filteredTests
        .filter(test => 
          test.title !== "Perfil Comportamental" && 
          test.title !== "Egograma" && 
          test.title !== "Formulário de Proatividade")
        .map((test) => (
          <GenericTestCard
            key={test.client_test_id}
            test={test}
            isStarting={isStarting === test.client_test_id}
            onStartTest={onStartTest}
            onViewResults={onViewResults}
          />
        ))}
    </div>
  );
};
