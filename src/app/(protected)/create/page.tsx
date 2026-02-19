"use client";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const schema = z.object({
  repoUrl: z.url("Invalid URL"),
  projectName: z
    .string("Invalid Project Name")
    .min(3, "Project name must be at least 3 characters long"),
  githubToken: z.string("Invalid Github Token").optional(),
});

const CreateProjectPage = () => {
  const { control, handleSubmit, reset } = useForm<FormInput>({
    resolver: zodResolver(schema),
    // mode: "onChange",
  });

  const onSubmit = (data: FormInput) => {
    console.log(data);
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
            Enter the URL o your repository to link it to AI Github
          </p>
        </div>
        <div className="h-4"></div>
        <div>
          <form id="create-project" onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup className="gap-2">
              <Controller
                name="repoUrl"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Input
                      {...field}
                      id="form-rhf-input-username"
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
                      id="form-rhf-input-username"
                      aria-invalid={fieldState.invalid}
                      placeholder="Project Name"
                      autoComplete="username"
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
                      id="form-rhf-input-username"
                      aria-invalid={fieldState.invalid}
                      placeholder="Github Token"
                      autoComplete="username"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
          <div className="h-4"></div>
          <Button type="submit" form="create-project">
            Create Project
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage;
