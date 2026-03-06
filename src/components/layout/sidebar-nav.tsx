"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/assets", label: "Asset Console" },
  { href: "/sync-status", label: "Sync Status" },
  { href: "/activity", label: "Activity" },
  { href: "/settings", label: "Settings" },
  { href: "/support", label: "Support" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 h-screen w-full max-w-[250px] border-r bg-[var(--surface)] px-4 py-6">
      <div className="mb-8 border-b pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">GSIS</p>
        <h1 className="text-lg font-bold text-[var(--text)]">Data Operations Console</h1>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-[var(--rose-blush)] text-[var(--accent-contrast)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
