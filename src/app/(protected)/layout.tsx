import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import React from "react";
import AppSidebar from "./app-sidebar";
import { getProjects } from "@/features/projects/queries/get-projects";

type Props = {
  children: React.ReactNode;
};

const SideBarLayout = async ({ children }: Props) => {
  const queryClient = new QueryClient();

  // Prefetch projects trên server — client sẽ có data ngay, không cần skeleton
  await queryClient.prefetchQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full m-2">
          <div className="flex items-center gap-2 border-sidebar-border bg-sidebar border shadow-sm rounded-md py-2 px-4">
            {/* Search Bar */}
            <div className="ml-auto"></div>
            <UserButton />
          </div>
          <div className="h-4"></div>
          <div className="border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-scroll h-[calc(100vh-6rem)] p-4">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </HydrationBoundary>
  );
};

export default SideBarLayout;
