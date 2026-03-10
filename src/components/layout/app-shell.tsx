import { ReactNode } from "react";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { TopBar } from "@/components/layout/top-bar";
import { getServerSyncOverview } from "@/services/operationServerService";

interface AppShellProps {
  children: ReactNode;
}

export async function AppShell({ children }: AppShellProps) {
  const overview = await getServerSyncOverview();

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto flex max-w-[1500px]">
        <SidebarNav />
        <main className="w-full px-6 py-6">
          <TopBar mode={overview.mode} />
          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
