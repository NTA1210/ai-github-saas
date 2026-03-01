import http from "@/utils/http";
import { useMutation } from "@tanstack/react-query";

async function getSignedUrl(filePath: string) {
  const { signedUrl } = await http.post<{ signedUrl: string }>("/signed-url", {
    filePath,
  });

  return signedUrl;
}

export const useGetSignedUrl = () => {
  return useMutation({
    mutationFn: getSignedUrl,
  });
};
