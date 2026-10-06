"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log safe error telemetry client-side if needed
    console.error("Global application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-8 rounded-xl border border-border bg-card space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">Something went wrong</h2>
        <p className="text-sm text-slate-400">
          An unexpected error occurred while loading this view. Please try again.
        </p>
        <Button
          onClick={() => reset()}
          className="w-full bg-[#4F7CFF] hover:bg-[#4F7CFF]/90 text-white font-medium"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
