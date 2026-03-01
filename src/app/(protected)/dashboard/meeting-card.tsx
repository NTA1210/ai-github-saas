"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Presentation, Upload } from "lucide-react";
import { useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { useUploadFile } from "@/features/uploads/api/upload-file";
import { toast } from "sonner";
import { useCreateMeeting } from "@/features/meetings/api/create-meeting";
import { useProjectStore } from "@/store/use-project-store";
import { useRouter } from "next/navigation";

const MeetingCard = () => {
  const [progress, setProgress] = useState(0);
  const { selectedProject } = useProjectStore();
  const { mutate: uploadFile } = useUploadFile();
  const { mutate: createMeeting } = useCreateMeeting();
  const [isPending, setIsPending] = useState(false);
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a"],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
    onDrop: async (acceptedFiles) => {
      setProgress(0); // Reset trước mỗi lần upload mới
      setIsPending(true);
      const file = acceptedFiles[0];
      console.log(acceptedFiles);

      await handleUpload(file);
    },
    onDropRejected: (fileRejections: FileRejection[]) => {
      const errorCode = fileRejections[0]?.errors[0]?.code;
      if (errorCode === "file-too-large") {
        toast.error("File size exceeds the limit of 5MB.");
      } else if (errorCode === "file-invalid-type") {
        toast.error(
          "File type is not supported. Only .mp3, .wav, .m4a files are allowed.",
        );
      } else {
        toast.error("File is invalid.");
      }
      setIsPending(false);
    },
  });
  const router = useRouter();

  const handleUpload = async (file: File) => {
    const fileName = file.name;
    uploadFile(
      {
        fileName,
        projectId: selectedProject!.id,
      },
      {
        onSuccess: (data) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", data.signedUrl);
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);

              setProgress(percent);
            }
          };
          xhr.onload = () => {
            const fileUrl = data.filePath;
            createMeeting(
              {
                projectId: selectedProject!.id,
                meetingUrl: fileUrl,
                name: fileName,
              },
              {
                onSuccess: (meeting) => {
                  toast.success("Meeting created! Processing in background...");
                  router.push("/meetings");
                  setIsPending(false);

                  // Fire-and-forget: xử lý AI ở background, không block UI
                  void fetch("/api/issues", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ meetingId: meeting.id }),
                  });
                },
                onError: () => {
                  toast.error("Failed to create meeting");
                },
                onSettled: () => {
                  setIsPending(false);
                },
              },
            );
          };
          xhr.onerror = () => {
            toast.error("Upload failed.");
            setIsPending(false);
          };
          xhr.send(file);
        },
        onError: () => {
          toast.error("Failed to get upload URL.");
          setIsPending(false);
        },
      },
    );
  };

  return (
    <Card
      className="col-span-2 flex-col items-center justify-center p-10"
      {...getRootProps()}
    >
      {!isPending && (
        <>
          <Presentation className="h-10 w-10 animate-bounce" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Create a new meeting
          </h3>
          <p className="mt-1 text-center text-sm text-gray-500">
            Analyze your meeting with GitHub AI
            <br />
            Upload an audio file
          </p>
          <div className="mt-6">
            <Button disabled={isPending}>
              <Upload className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Upload Meeting
              <input className="hidden" {...getInputProps()} />
            </Button>
          </div>
        </>
      )}
      {isPending && (
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 relative">
            <CircularProgressbar
              value={progress}
              styles={buildStyles({
                pathColor: "#2563eb",
                textColor: "#1e40af",
                trailColor: "#dbeafe",
              })}
            />
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-gray-500">
              {progress}%
            </span>
          </div>
          <p className="text-sm text-gray-500 text-center">
            Uploading your meeting...
          </p>
        </div>
      )}
    </Card>
  );
};

export default MeetingCard;
