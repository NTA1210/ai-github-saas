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
import { useState } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { SourceCodeEmbedding } from "../../../../generated/prisma/client";

const AskQuestionCard = () => {
  const { selectedProject } = useProjectStore();
  const [question, setQuestion] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [answer, setAnswer] = useState<string>("");
  const [sources, setSources] = useState<SourceCodeEmbedding[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProject) return;
    if (!question.trim()) {
      toast.warning("Please enter a question first");
      return;
    }

    const { sessionId } = await http.post<{ sessionId: string }>(
      `/projects/${selectedProject.id}/ask/sessions`,
      {
        question,
        projectId: selectedProject.id,
      },
    );

    //Open SSE
    const eventSource = new EventSource(
      `/api/projects/${selectedProject.id}/ask/stream?sessionId=${sessionId}`,
    );

    setOpen(true);
    let fullAnswer = "";

    eventSource.addEventListener("sources", (event) => {
      try {
        const parsedSources = JSON.parse(event.data);
        console.log(parsedSources);

        setSources(parsedSources);
      } catch (e) {
        console.error("Failed to parse sources", e);
      }
    });

    eventSource.addEventListener("token", (event) => {
      fullAnswer += event.data;
      setAnswer(fullAnswer);
    });

    // Server gửi event "done", không phải "end"
    eventSource.addEventListener("done", () => {
      eventSource.close(); // Đóng để tránh browser tự reconnect → gây lỗi 400
    });

    eventSource.addEventListener("error", () => {
      eventSource.close();
      toast.error("Something went wrong");
    });
  };
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <Image src="/logo.png" alt="logo" width={40} height={40} />
              <p>Ask a question</p>
              <ReactMarkdown>{answer}</ReactMarkdown>
              {sources.length > 0 && (
                <div>
                  <p>Source code</p>
                  <ul>
                    {sources.map((source) => (
                      <li key={source.id}>{source.fileName}</li>
                    ))}
                  </ul>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
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
            />
            <div className="h-4" />
            <Button type="submit">Ask AI</Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
