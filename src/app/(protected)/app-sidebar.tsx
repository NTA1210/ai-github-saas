"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useGetAllProjects } from "@/features/projects/api/use-get-all-projects";
import { cn } from "@/lib/utils";
import {
  Bot,
  CreditCard,
  LayoutDashboard,
  Plus,
  Presentation,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type Item = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const items: Item[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard />,
  },
  {
    label: "Q&A",
    href: "/qa",
    icon: <Bot />,
  },
  {
    label: "Meetings",
    href: "/meetings",
    icon: <Presentation />,
  },
  {
    label: "Billing",
    href: "/billing",
    icon: <CreditCard />,
  },
];

// =============================================
// --- PROJECT SKELETON (loading state) --------
// =============================================

const ProjectSkeleton = () => {
  return Array.from({ length: 3 }).map((_, index) => (
    <SidebarMenuItem key={index}>
      <SidebarMenuSkeleton />
    </SidebarMenuItem>
  ));
};

// =============================================
// --- APP SIDEBAR -----------------------------
// =============================================

const AppSidebar = () => {
  const pathname = usePathname();
  const { open } = useSidebar();

  const { data, isLoading } = useGetAllProjects();
  const projects = data?.projects ?? [];

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Image src={"/logo.png"} alt="Logo" width={40} height={40} />
          {open && (
            <h1 className="text-xl font-bold text-primary/80 truncate">
              AI Github
            </h1>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Application */}
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.href}
                      className={cn({
                        "bg-primary! text-white!": pathname === item.href,
                      })}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Project section */}
        <SidebarGroup>
          <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <ProjectSkeleton />
              ) : projects.length === 0 ? (
                open && (
                  <p className="text-xs text-muted-foreground px-2 py-1">
                    No projects yet.
                  </p>
                )
              ) : (
                projects.map((project) => {
                  const projectHref = `/projects/${project.id}`;
                  const isActive = pathname === projectHref;

                  return (
                    <SidebarMenuItem key={project.id}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={projectHref}
                          className="@container flex justify-center items-center"
                        >
                          <div className="w-full h-full flex justify-center @sm:justify-start @sm:items-center gap-2">
                            <div
                              className={cn(
                                "rounded-sm border size-6 flex shrink-0 items-center justify-center text-sm bg-white text-primary",
                                {
                                  "bg-primary text-white": isActive,
                                },
                              )}
                            >
                              {project.name.charAt(0).toUpperCase()}
                            </div>
                            {open && (
                              <span className="truncate">{project.name}</span>
                            )}
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              )}

              <div className="h-2" />

              {open && (
                <SidebarMenuItem>
                  <Link href="/create">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-fit cursor-pointer"
                    >
                      <Plus />
                      Create Project
                    </Button>
                  </Link>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
