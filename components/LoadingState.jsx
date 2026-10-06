import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingState({
  message = "Generating interview questions...",
  subtitle = "Leveraging Azure OpenAI to calibrate your session",
  className,
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-xl border border-[#232C52] bg-[#111936] my-6",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-[#161F42] border border-[#232C52] flex items-center justify-center text-[#4F7CFF] mb-4 shadow-md shadow-blue-500/10">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <h3 className="text-base font-bold text-white tracking-tight">
        {message}
      </h3>
      {subtitle && (
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm">
          {subtitle}
        </p>
      )}
    </div>
  );
}
