"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  History,
  FileText,
  User,
  Sparkles,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "New Interview", href: "/interview/new", icon: PlusCircle },
  { label: "History", href: "/history", icon: History },
  { label: "Resume Studio", href: "/resume", icon: FileText },
  { label: "Profile", href: "/profile", icon: User },
];

export function Sidebar({ className }) {
  const pathname = usePathname();
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "AI Interview Coach";

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-64 border-r border-border bg-[#0E152B] p-4 select-none shrink-0",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-4 mb-4 border-b border-border/60">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4F7CFF] to-[#8B5CF6] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-base tracking-tight text-white block">
            {appName}
          </span>
          <span className="text-[11px] text-slate-400 font-medium block">
            Cloud Computing MVP
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5" aria-label="Main Navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#161F42] text-[#4F7CFF] border border-[#232C52] shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#161F42]/50"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4",
                  isActive ? "text-[#4F7CFF]" : "text-slate-400"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="pt-4 border-t border-border/60 mt-auto">
        <Link
          href="/login"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </Link>
      </div>
    </aside>
  );
}
