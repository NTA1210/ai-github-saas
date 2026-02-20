import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./app-sidebar";
import UserButtonWithLoading from "../../components/dashboard/user-button-with-loading";

type Props = {
  children: React.ReactNode;
};

const SideBarLayout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full m-2">
        <div className="flex items-center gap-2 border-sidebar-border bg-sidebar border shadow-sm rounded-md py-2 px-4">
          <div className="ml-auto"></div>
          <UserButtonWithLoading />
        </div>
        <div className="h-4"></div>
        <div className="border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-scroll h-[calc(100vh-6rem)] p-4">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default SideBarLayout;
