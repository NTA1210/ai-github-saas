import { QueryKey, useQueryClient } from "@tanstack/react-query";

const useRefetch = ({ targetQueryKey }: { targetQueryKey: QueryKey }) => {
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({ queryKey: targetQueryKey });
  };
};

export default useRefetch;
