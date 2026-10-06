"use client";

import { useRouter } from "next/navigation";
import { MobileNav } from "@/components/MobileNav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Sparkles } from "lucide-react";
import { mockUser } from "@/lib/mock-data";

export function Navbar({ title = "Dashboard" }) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-[#0B1020]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <MobileNav />
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-[#111936] text-xs text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-[#4F7CFF]" />
          <span>Azure Cloud Demo</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF] cursor-pointer" aria-label="User account menu">
            <Avatar className="w-9 h-9 border border-[#232C52] bg-[#161F42]">
              <AvatarFallback className="bg-[#161F42] text-white text-xs font-semibold">
                JA
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-[#111936] border-border text-slate-200"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold text-white">
                  {mockUser.name}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {mockUser.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={() => router.push("/profile")}
              className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white"
            >
              <User className="w-4 h-4 text-[#4F7CFF]" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={() => router.push("/login")}
              className="flex items-center gap-2 cursor-pointer text-red-400 hover:text-red-300"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
