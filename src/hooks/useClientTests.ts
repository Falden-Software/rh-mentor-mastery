
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TestData } from "@/types/models";
import { fetchUserTests } from "./tests/fetchUserTests";

export const useClientTests = () => {
  const [isStartingTest, setIsStartingTest] = useState<string | null>(null);

  const { data: testData = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['clientTests'],
    queryFn: fetchUserTests,
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  return {
    testData,
    isLoading,
    isError,
    error,
    refetch,
    isStartingTest,
    setIsStartingTest
  };
};
