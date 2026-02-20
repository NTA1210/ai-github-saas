import { QueryKey, useQueryClient } from "@tanstack/react-query";

const useRefetch = ({
  targetQueryKey,
  type,
}: {
  targetQueryKey: QueryKey;
  type?: "all" | "active" | "inactive";
}) => {
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.refetchQueries({ queryKey: targetQueryKey, type });
  };
};

export default useRefetch;
