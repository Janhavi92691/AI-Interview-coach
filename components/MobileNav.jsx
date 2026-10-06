"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Sparkles,
  LayoutDashboard,
  PlusCircle,
  History,
  FileText,
  User,
  LogOut,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "New Interview", href: "/interview/new", icon: PlusCircle },
  { label: "History", href: "/history", icon: History },
  { label: "Resume Studio", href: "/resume", icon: FileText },
  { label: "Profile", href: "/profile", icon: User },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "AI Interview Coach";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="lg:hidden p-2 rounded-lg border border-border bg-[#111936] text-slate-200 hover:bg-[#161F42] transition-colors cursor-pointer"
        aria-label="Open mobile navigation menu"
      >
        <Menu className="w-5 h-5" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-72 bg-[#0E152B] border-r border-border p-6 flex flex-col justify-between"
      >
        <div>
          <SheetHeader className="text-left pb-6 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#4F7CFF] to-[#8B5CF6] flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <SheetTitle className="text-white text-base font-bold">
                {appName}
              </SheetTitle>
            </div>
          </SheetHeader>

          <nav className="mt-6 space-y-1.5" aria-label="Mobile Navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#161F42] text-[#4F7CFF] border border-[#232C52]"
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
        </div>

        <div className="pt-4 border-t border-border/60">
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
