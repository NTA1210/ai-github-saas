"use client";

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useGetQuestions } from "@/features/questions/api/get-questions";
import { useProjectStore } from "@/store/use-project-store";
import AskQuestionCard from "../dashboard/ask-question-card";
import React, { useEffect, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import CodeReferences from "../dashboard/code-references";
import { QASkeleton } from "@/components/ui/page-skeletons";

const QAPage = () => {
  const { selectedProject } = useProjectStore();

  const { data: questions, isLoading } = useGetQuestions(selectedProject?.id);

  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const currentQuestion = questions?.[questionIndex];

  useEffect(() => {
    setQuestionIndex(0);
  }, [selectedProject?.id]);

  if (isLoading) return <QASkeleton />;

  return (
    <Sheet>
      <AskQuestionCard />
      <div className="h-4"></div>
      <h1 className="text-xl font-semibold">Saved Questions</h1>
      <div className="h-2"></div>
      <div className="flex flex-col gap-2">
        {questions?.map((question, index) => {
          return (
            <React.Fragment key={question.id}>
              <SheetTrigger
                onClick={() => {
                  setQuestionIndex(index);
                }}
              >
                <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow border">
                  <img
                    className="rounded-full"
                    width={30}
                    height={30}
                    src={question?.user?.imageUrl || ""}
                  />
                  <div className="text-left flex flex-col">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-gray-700 line-clamp-1 text-lg font-medium">
                        {question?.question}
                      </p>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(question?.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-500 line-clamp-1 text-sm">
                      {question?.answer}
                    </p>
                  </div>
                </div>
              </SheetTrigger>
            </React.Fragment>
          );
        })}
      </div>

      {currentQuestion && (
        <SheetContent className="sm:max-w-[80vw] h-full flex flex-col">
          {/* Title */}
          <SheetHeader>
            <SheetTitle>{currentQuestion?.question}</SheetTitle>
          </SheetHeader>

          {/* Markdown - chiếm toàn bộ phần còn lại */}
          <div className="flex-1 overflow-y-auto px-4">
            <MDEditor.Markdown
              source={currentQuestion?.answer}
              rehypePlugins={[rehypeSanitize]}
              className="h-full"
            />
          </div>

          {/* Footer */}
          <SheetFooter>
            <CodeReferences
              fileReferences={currentQuestion?.fileReferences.map(
                (file) => file.sourceCodeEmbedding,
              )}
            />
          </SheetFooter>
        </SheetContent>
      )}
    </Sheet>
  );
};

export default QAPage;
