"use client";

import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useGetAllProjects } from "@/features/projects/api/use-get-all-projects";
import { useProjectStore } from "@/store/use-project-store";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const ProjectSkeleton = () =>
  Array.from({ length: 3 }).map((_, index) => (
    <SidebarMenuItem key={index}>
      <SidebarMenuSkeleton />
    </SidebarMenuItem>
  ));

const Projects = () => {
  const { data, isLoading } = useGetAllProjects();
  const projects = data?.projects ?? [];
  const { open } = useSidebar();
  const router = useRouter();

  const { selectedProject, setSelectedProject } = useProjectStore();

  if (isLoading) return <ProjectSkeleton />;

  if (projects.length === 0) {
    return open ? (
      <p className="text-xs text-muted-foreground px-2 py-1">
        No projects yet.
      </p>
    ) : null;
  }

  return (
    <>
      {projects.map((project) => {
        const isActive = selectedProject?.id === project.id;

        return (
          <SidebarMenuItem key={project.id} className="cursor-pointer">
            <SidebarMenuButton
              onClick={() => {
                setSelectedProject(project);
                router.push(`/dashboard`);
              }}
              className="cursor-pointer"
            >
              <div
                className={cn(
                  "rounded-sm border size-6 flex shrink-0 items-center justify-center text-sm bg-white text-primary",
                  { "bg-primary text-white": isActive },
                )}
              >
                {project.name.charAt(0).toUpperCase()}
              </div>
              {open && <span className="truncate">{project.name}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </>
  );
};

export default Projects;
