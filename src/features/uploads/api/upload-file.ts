import http from "@/utils/http";
import { useMutation } from "@tanstack/react-query";

export const uploadFile = async (fileName: string) => {
  const response = await http.post<{ signedUrl: string }>("/api/upload-url", {
    fileName,
  });
  return response;
};

export const useUploadFile = (fileName: string) => {
  return useMutation({
    mutationFn: () => uploadFile(fileName),
  });
};
