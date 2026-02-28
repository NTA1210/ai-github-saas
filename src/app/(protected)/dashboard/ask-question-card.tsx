"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useProjectStore } from "@/store/use-project-store";
import http from "@/utils/http";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SourceCodeEmbedding } from "../../../../generated/prisma/client";
import rehypeSanitize from "rehype-sanitize";
import CodeReferences from "./code-references";
import MDEditor from "@uiw/react-md-editor";
import { useSaveAnswer } from "@/features/questions/api/save-answer";
import { useQueryClient } from "@tanstack/react-query";

const AskQuestionCard = () => {
  const { selectedProject } = useProjectStore();
  const [question, setQuestion] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [answer, setAnswer] = useState<string>("");
  const [sources, setSources] = useState<SourceCodeEmbedding[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { mutate: saveAnswer, isPending } = useSaveAnswer();
  const queryClient = useQueryClient();

  // Giữ ref để cleanup EventSource khi component unmount hoặc dialog đóng
  const eventSourceRef = useRef<EventSource | null>(null);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  const closeStream = () => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
  };

  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      closeStream();
    }
    setOpen(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProject) return;
    if (!question.trim()) {
      toast.warning("Please enter a question first");
      return;
    }

    // Đóng stream cũ nếu còn mở
    closeStream();

    // Reset state cho lần hỏi mới
    setAnswer("");
    setSources([]);
    setIsLoading(true);

    try {
      const { sessionId } = await http.post<{ sessionId: string }>(
        `/projects/${selectedProject.id}/ask/sessions`,
        {
          question,
          projectId: selectedProject.id,
        },
      );

      setOpen(true);

      const eventSource = new EventSource(
        `/api/projects/${selectedProject.id}/ask/stream?sessionId=${sessionId}`,
      );
      eventSourceRef.current = eventSource;

      let fullAnswer = "";

      eventSource.addEventListener("sources", (event) => {
        try {
          const parsedSources = JSON.parse(event.data);
          setSources(parsedSources);
        } catch (e) {
          console.error("[AskQuestion] Failed to parse sources:", e);
        }
      });

      eventSource.addEventListener("token", (event) => {
        fullAnswer += event.data;
        setAnswer(fullAnswer);
        // Tắt loading khi bắt đầu nhận token
        setIsLoading(false);
      });

      eventSource.addEventListener("done", () => {
        setIsLoading(false);
        closeStream();
      });

      eventSource.addEventListener("error", (event) => {
        // Phân biệt lỗi từ server (SSE error event) và lỗi kết nối
        if (event instanceof MessageEvent) {
          toast.error("An error occurred while processing the question");
        } else {
          // Lỗi kết nối - browser sẽ tự reconnect nếu không close
          toast.error("Connection lost, please try again");
        }
        setIsLoading(false);
        closeStream();
      });
    } catch (err) {
      console.error("[AskQuestion] Failed to create session:", err);
      toast.error("Failed to create session, please try again");
      setIsLoading(false);
    }
  };

  const handleSaveAnswer = () => {
    saveAnswer(
      {
        question,
        answer,
        projectId: selectedProject?.id!,
        fileReferences: sources,
      },
      {
        onSuccess: () => {
          toast.success("Answer saved successfully");
          queryClient.invalidateQueries({
            queryKey: ["questions", selectedProject?.id],
          });
        },
        onError: (err) => {
          toast.error(err.message);
        },
      },
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[80vw]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle className="flex items-center gap-2">
                <Image src="/logo.png" alt="logo" width={40} height={40} />
                <span>Ask a question</span>
              </DialogTitle>
              {answer && (
                <Button
                  variant={"outline"}
                  onClick={handleSaveAnswer}
                  disabled={isPending}
                >
                  {isPending ? "Saving..." : "Save answer"}
                </Button>
              )}
            </div>
          </DialogHeader>

          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm animate-pulse">
              <span>AI is thinking...</span>
            </div>
          )}

          {answer && (
            <MDEditor.Markdown
              source={answer}
              className="max-w-[70vw] h-full! max-h-[40vh] overflow-scroll"
              rehypePlugins={[rehypeSanitize]}
            />
          )}

          <CodeReferences fileReferences={sources} />
        </DialogContent>
      </Dialog>

      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isLoading}
            />
            <div className="h-4" />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Ask AI"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
