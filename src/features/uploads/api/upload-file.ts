import http from "@/utils/http";
import { useMutation } from "@tanstack/react-query";

export const uploadFile = async (
  fileName: string,
): Promise<{ signedUrl: string }> => {
  const response = await http.post<{ signedUrl: string }>("/upload-url", {
    fileName,
  });
  return response;
};

export const useUploadFile = () => {
  return useMutation({
    mutationFn: uploadFile,
  });
};
