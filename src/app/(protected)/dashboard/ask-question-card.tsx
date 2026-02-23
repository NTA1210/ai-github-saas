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
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

const AskQuestionCard = () => {
  const { selectedProject } = useProjectStore();
  const [question, setQuestion] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProject) return;
    if (!question.trim()) {
      toast.warning("Please enter a question first");
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <Image src="/logo.png" alt="logo" width={40} height={40} />
              <p>Ask a question</p>
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
