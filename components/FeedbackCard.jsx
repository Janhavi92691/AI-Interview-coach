import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Lightbulb, ArrowRight, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScoreCard } from "@/components/ScoreCard";

export function FeedbackCard({
  score = 0,
  correctness = 0,
  technicalDepth = 0,
  clarity = 0,
  relevance = 0,
  feedback = { did_well: "", missing: "", improve: "" },
  followUp = null,
  isLastQuestion = false,
  onNext,
  isLoadingNext = false,
}) {
  return (
    <div className="space-y-6">
      {/* Score Grid & Category Chips */}
      <ScoreCard
        score={score}
        correctness={correctness}
        technicalDepth={technicalDepth}
        clarity={clarity}
        relevance={relevance}
      />

      {/* Structured Rubric Feedback Blocks */}
      <Card className="bg-[#111936] border-[#232C52] text-slate-100">
        <CardHeader className="pb-3 border-b border-[#232C52]">
          <CardTitle className="text-base font-bold text-white flex items-center justify-between">
            <span>Interviewer Feedback</span>
            <Badge variant="outline" className="border-[#4F7CFF]/40 text-[#4F7CFF] bg-[#4F7CFF]/10 text-xs">
              AI Rubric Evaluation
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {/* What you did well */}
          <div className="p-4 rounded-xl bg-[#161F42]/80 border border-[#232C52]">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>What you did well</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-6">
              {feedback?.did_well || "Your answer addressed the core components accurately."}
            </p>
          </div>

          {/* What was missing */}
          <div className="p-4 rounded-xl bg-[#161F42]/80 border border-[#232C52]">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold mb-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>What was missing</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-6">
              {feedback?.missing || "No major omissions identified."}
            </p>
          </div>

          {/* How to improve */}
          <div className="p-4 rounded-xl bg-[#161F42]/80 border border-[#232C52]">
            <div className="flex items-center gap-2 text-[#4F7CFF] text-sm font-semibold mb-1.5">
              <Lightbulb className="w-4 h-4 shrink-0" />
              <span>How to improve</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-6">
              {feedback?.improve || "Keep articulating concrete real-world trade-offs in future responses."}
            </p>
          </div>

          {followUp && (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <span className="text-xs font-semibold text-purple-400 block uppercase tracking-wider mb-1">
                Optional Follow-up Consideration
              </span>
              <p className="text-xs sm:text-sm text-slate-200">{followUp}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Continue Action */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={onNext}
          disabled={isLoadingNext}
          className="bg-[#4F7CFF] hover:bg-[#4F7CFF]/90 text-white font-semibold px-6 gap-2"
        >
          {isLastQuestion ? (
            <>
              <Flag className="w-4 h-4" /> Finish Interview
            </>
          ) : (
            <>
              Next Question <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
