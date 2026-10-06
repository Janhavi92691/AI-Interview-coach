import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function InterviewCard({ interview }) {
  const isCompleted = interview?.status === "completed";
  const score = interview?.overallScore;

  let scoreBadgeColor = "bg-slate-800 text-slate-300 border-slate-700";
  if (score != null) {
    if (score >= 80) scoreBadgeColor = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    else if (score >= 60) scoreBadgeColor = "bg-amber-500/15 text-amber-400 border-amber-500/30";
    else scoreBadgeColor = "bg-red-500/15 text-red-400 border-red-500/30";
  }

  const href = isCompleted ? `/results/${interview.id}` : `/interview/${interview.id}`;

  return (
    <Link href={href} className="block group">
      <Card className="bg-[#111936] border-[#232C52] text-slate-100 hover:border-[#4F7CFF]/50 transition-all duration-200">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-base text-white group-hover:text-[#4F7CFF] transition-colors">
                {interview.jobRole}
              </span>
              <Badge variant="outline" className="text-xs bg-[#161F42] border-[#232C52] text-slate-300">
                {interview.interviewType}
              </Badge>
              <Badge variant="outline" className="text-xs bg-[#161F42] border-[#232C52] text-slate-400">
                {interview.difficulty}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {new Date(interview.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span>•</span>
              <span>{interview.totalQuestions} Questions</span>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-[#232C52]">
            {isCompleted ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("text-xs font-bold px-2.5 py-1", scoreBadgeColor)}>
                  Score: {score}%
                </Badge>
                <div className="w-8 h-8 rounded-full bg-[#161F42] border border-[#232C52] flex items-center justify-center text-slate-400 group-hover:text-white group-hover:border-[#4F7CFF] transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> In Progress
                </Badge>
                <span className="text-xs font-semibold text-[#4F7CFF] group-hover:underline">
                  Resume →
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
