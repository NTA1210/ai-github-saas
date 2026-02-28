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
  useSidebar,
} from "@/components/ui/sidebar";
import Projects from "./projects";
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
// --- APP SIDEBAR -----------------------------
// =============================================

const AppSidebar = () => {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Image src={"/logo.png"} alt="Logo" width={40} height={40} />
          {open && (
            <h1 className="text-xl font-bold text-primary/80 truncate">
              Github AI
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
              {/* List projects — hydrated từ server, skeleton chỉ hiện khi cần */}
              <Projects />

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
