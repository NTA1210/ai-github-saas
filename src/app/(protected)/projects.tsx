"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useGetAllProjects } from "@/features/projects/api/use-get-all-projects";
import { cn } from "@/lib/utils";

const ProjectSkeleton = () =>
  Array.from({ length: 3 }).map((_, index) => (
    <SidebarMenuItem key={index}>
      <SidebarMenuSkeleton />
    </SidebarMenuItem>
  ));

const Projects = () => {
  const { data, isLoading } = useGetAllProjects();
  const projects = data?.projects ?? [];
  const pathname = usePathname();
  const { open } = useSidebar();

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
        const projectHref = `/projects/${project.id}`;
        const isActive = pathname === projectHref;

        return (
          <SidebarMenuItem key={project.id}>
            <SidebarMenuButton asChild>
              <Link href={projectHref}>
                <div
                  className={cn(
                    "rounded-sm border size-6 flex shrink-0 items-center justify-center text-sm bg-white text-primary",
                    { "bg-primary text-white": isActive },
                  )}
                >
                  {project.name.charAt(0).toUpperCase()}
                </div>
                {open && <span className="truncate">{project.name}</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </>
  );
};

export default Projects;
