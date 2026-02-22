"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  createProjectSchema,
  type CreateProjectInput,
} from "@/features/projects/schemas/create-project.schema";
import { useCreateProject } from "@/features/projects/api/use-create-project";
import useRefetch from "@/hooks/useRefetch";
import http from "@/utils/http";
import { useProjectStore } from "@/store/use-project-store";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

const CreateProjectPage = () => {
  const { mutate: createProject, isPending } = useCreateProject();
  const refetch = useRefetch({ targetQueryKey: ["projects"] });
  const router = useRouter();
  const { setSelectedProject } = useProjectStore();
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      repoUrl: "",
      projectName: "",
      githubToken: "",
    },
  });

  const onSubmit = (data: CreateProjectInput) => {
    createProject(data, {
      onSuccess: async ({ project }) => {
        toast.success(`Project "${project.name}" created!`);
        reset();
        await refetch();
        setSelectedProject(project);
        router.push(`/dashboard`);

        // Trigger summarize — client giữ kết nối an toàn trên serverless
        toast.promise(
          http.post(`/projects/${project.id}/summarize`).then((res) => {
            // Summarize xong → invalidate query → commit-log.tsx tự refetch → hiện summary
            queryClient.invalidateQueries({
              queryKey: ["commits", project.id],
            });
            return res;
          }),
          {
            loading: "Summarizing commits with AI...",
            success: "Commits summarized!",
            error: (err: Error) => `Summarize failed: ${err.message}`,
          },
        );
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  return (
    <div className="flex items-center gap-12 h-full justify-center">
      <img src="/github-img.png" alt="Github" className="h-56 w-auto" />

      <div>
        <div>
          <h1 className="font-semibold text-2xl">
            Link your Github Repository
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the URL of your repository to link it to AI Github
          </p>
        </div>

        <div className="h-4" />

        <form id="create-project" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="gap-2">
            <Controller
              name="repoUrl"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    {...field}
                    id="create-project-repo-url"
                    aria-invalid={fieldState.invalid}
                    placeholder="https://github.com/username/repo"
                    autoComplete="url"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="projectName"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    {...field}
                    id="create-project-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="Project Name"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="githubToken"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    {...field}
                    id="create-project-github-token"
                    aria-invalid={fieldState.invalid}
                    placeholder="Github Token (optional)"
                    autoComplete="off"
                    type="password"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <div className="h-4" />

          <Button type="submit" form="create-project" disabled={isPending}>
            {isPending ? "Creating..." : "Create Project"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectPage;
