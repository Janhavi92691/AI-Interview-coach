import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-8 rounded-xl border border-border bg-card space-y-4">
        <h2 className="text-4xl font-extrabold text-[#4F7CFF]">404</h2>
        <h3 className="text-xl font-bold text-slate-100">Page Not Found</h3>
        <p className="text-sm text-slate-400">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="block">
          <Button className="w-full bg-[#4F7CFF] hover:bg-[#4F7CFF]/90 text-white font-medium gap-2">
            <Home className="w-4 h-4" /> Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
