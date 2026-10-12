"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function SignOutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out successfully");
      router.push("/");
      router.refresh();
    } catch {
      router.push("/");
    }
  };

  return (
    <Button
      type="button"
      onClick={handleLogout}
      variant="outline"
      className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-2 shrink-0 text-xs font-semibold cursor-pointer"
    >
      <LogOut className="w-4 h-4" />
      Sign Out of Account
    </Button>
  );
}
