import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function getScoreLabel(value) {
  if (value >= 10) return { label: "Excellent", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" };
  if (value >= 8) return { label: "Very Good", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" };
  if (value >= 6) return { label: "Good", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" };
  if (value >= 4) return { label: "Fair", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
  return { label: "Needs Work", color: "bg-red-500/15 text-red-400 border-red-500/30" };
}

export function ScoreCard({
  score = 0,
  correctness = 0,
  technicalDepth = 0,
  clarity = 0,
  relevance = 0,
  className,
}) {
  const metrics = [
    { name: "Correctness (40%)", val: correctness },
    { name: "Technical Depth (30%)", val: technicalDepth },
    { name: "Clarity (15%)", val: clarity },
    { name: "Relevance (15%)", val: relevance },
  ];

  const overall = getScoreLabel(score);

  return (
    <Card className={cn("bg-[#111936] border-[#232C52] text-slate-100", className)}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#232C52]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Evaluated Score
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-white">
                {score}
              </span>
              <span className="text-xs text-slate-400">/ 10</span>
            </div>
          </div>
          <Badge variant="outline" className={cn("text-xs font-semibold px-2.5 py-1", overall.color)}>
            {overall.label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {metrics.map((m) => {
            const meta = getScoreLabel(m.val);
            return (
              <div key={m.name} className="p-2.5 rounded-lg bg-[#161F42] border border-[#232C52]/80">
                <span className="text-[11px] font-medium text-slate-400 block truncate">
                  {m.name}
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-bold text-white">
                    {m.val}/10
                  </span>
                  <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded border", meta.color)}>
                    {meta.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
