import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FolderOpen, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title = "You haven't completed any interviews yet.",
  description = "Practice with our adaptive AI interviewer to test your skills, receive real-time feedback, and track your progress over time.",
  actionLabel = "Start Your First Interview",
  actionHref = "/interview/new",
  onAction,
  icon: Icon = FolderOpen,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-[#232C52] bg-[#111936]/50 my-6",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#161F42] border border-[#232C52] flex items-center justify-center text-slate-400 mb-4">
        <Icon className="w-7 h-7 text-[#4F7CFF]" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-md leading-relaxed">
          {description}
        </p>
      )}
      <div className="mt-6">
        {actionHref ? (
          <Link href={actionHref}>
            <Button className="bg-[#4F7CFF] hover:bg-[#4F7CFF]/90 text-white font-semibold gap-2 shadow-sm">
              <PlusCircle className="w-4 h-4" />
              {actionLabel}
            </Button>
          </Link>
        ) : (
          <Button
            onClick={onAction}
            className="bg-[#4F7CFF] hover:bg-[#4F7CFF]/90 text-white font-semibold gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
