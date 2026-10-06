import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ErrorState({
  title = "Something went wrong",
  message = "Unable to complete request. Please try again.",
  onRetry,
  className,
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-xl border border-red-500/20 bg-red-500/5 my-6",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-white tracking-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm">
        {message}
      </p>
      {onRetry && (
        <div className="mt-4">
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="border-red-500/30 text-red-300 hover:text-white hover:bg-red-500/20 gap-2 text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
