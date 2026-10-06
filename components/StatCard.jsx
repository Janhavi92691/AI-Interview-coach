import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({ title, value, subtitle, icon: Icon, trend, className }) {
  return (
    <Card className={cn("bg-[#111936] border-[#232C52] text-slate-100 shadow-sm", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-[#161F42] border border-[#232C52] flex items-center justify-center text-[#4F7CFF]">
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white">
            {value}
          </span>
          {trend && (
            <span className="text-xs font-medium text-emerald-400">
              {trend}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-400 font-medium">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
