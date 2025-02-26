
import { useAITest } from "./ai/useAITest";
import { useAIFunctionsFetch } from "./ai/useAIFunctionsFetch";
import { useAIFunctionMatcher } from "./ai/useAIFunctionMatcher";

export const useAIFunctions = () => {
  const { processTestQuery } = useAITest();
  const { getActiveFunctions } = useAIFunctionsFetch();
  const { findMatchingFunction } = useAIFunctionMatcher();

  return {
    processTestQuery,
    getActiveFunctions,
    findMatchingFunction
  };
};
