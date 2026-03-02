"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useArchiveProject } from "@/features/projects/api/use-archive-project";
import useRefetch from "@/hooks/useRefetch";
import { useProjectStore } from "@/store/use-project-store";
import { useState } from "react";
import { toast } from "sonner";

const ArchiveButton = () => {
  const { selectedProject } = useProjectStore();
  const { mutate: archiveProject, isPending } = useArchiveProject();
  const refetch = useRefetch({ targetQueryKey: ["projects"] });
  const { clearSelectedProject } = useProjectStore();
  const [open, setOpen] = useState<boolean>(false);

  const handleArchiveProject = () => {
    if (!selectedProject) return;
    archiveProject(selectedProject.id, {
      onSuccess: () => {
        toast.success("Project archived successfully");
        clearSelectedProject();
        refetch();
        setOpen(false);
      },
      onError: () => {
        toast.error("Failed to archive project");
      },
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive this project?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleArchiveProject} disabled={isPending}>
              {isPending && <Spinner className="mr-2 h-4 w-4" />}
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => setOpen(true)}
        className="cursor-pointer border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-200"
      >
        Archive
      </Button>
    </>
  );
};

export default ArchiveButton;
