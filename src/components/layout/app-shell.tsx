import { ReactNode } from "react";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { TopBar } from "@/components/layout/top-bar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto flex max-w-[1500px]">
        <SidebarNav />
        <main className="w-full px-6 py-6">
          <TopBar mode="LIVE" />
          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
