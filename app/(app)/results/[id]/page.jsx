"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/ScoreRing";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  History,
  RotateCcw,
} from "lucide-react";
import { mockInterviewResult } from "@/lib/mock-data";

export function getScoreBadge(score) {
  if (score >= 8) return { label: "Excellent", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" };
  if (score >= 6) return { label: "Good", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" };
  if (score >= 4) return { label: "Fair", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
  return { label: "Needs Work", color: "bg-red-500/15 text-red-400 border-red-500/30" };
}

export default function InterviewResultPage({ params }) {
  const result = mockInterviewResult;

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interview Complete 🎉</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Performance Report: {result.jobRole}
        </h2>
        <div className="flex items-center justify-center gap-2 pt-1">
          <Badge variant="outline" className="bg-[#161F42] border-[#232C52] text-slate-300 text-xs">
            {result.interviewType}
          </Badge>
          <Badge variant="outline" className="bg-[#161F42] border-[#232C52] text-purple-400 text-xs">
            {result.difficulty}
          </Badge>
        </div>
      </div>

      {/* Score Overview Card: Score Ring + 3 Metric Bars */}
      <Card className="bg-[#111936] border-[#232C52] text-slate-100 shadow-xl">
        <CardContent className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Score Ring */}
            <div className="flex justify-center md:border-r md:border-[#232C52] md:pr-6">
              <ScoreRing score={result.overallScore} max={100} size={150} strokeWidth={12} />
            </div>

            {/* 3 Metric Bars */}
            <div className="md:col-span-2 space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Evaluated Competency Dimensions
              </span>

              {/* Technical Knowledge */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white">Technical Knowledge (Depth)</span>
                  <span className="text-[#4F7CFF]">{result.metrics.technicalKnowledge}%</span>
                </div>
                <div className="w-full bg-[#0B1020] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4F7CFF] rounded-full"
                    style={{ width: `${result.metrics.technicalKnowledge}%` }}
                  />
                </div>
              </div>

              {/* Answer Quality */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white">Answer Quality (Correctness & Relevance)</span>
                  <span className="text-emerald-400">{result.metrics.answerQuality}%</span>
                </div>
                <div className="w-full bg-[#0B1020] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${result.metrics.answerQuality}%` }}
                  />
                </div>
              </div>

              {/* Clarity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white">Communication & Articulation Clarity</span>
                  <span className="text-[#8B5CF6]">{result.metrics.clarity}%</span>
                </div>
                <div className="w-full bg-[#0B1020] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#8B5CF6] rounded-full"
                    style={{ width: `${result.metrics.clarity}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Performance Analysis Paragraph */}
      <Card className="bg-[#111936] border-[#232C52] text-slate-100">
        <CardHeader className="pb-3 border-b border-[#232C52]">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#4F7CFF]" />
            AI Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-slate-300 leading-relaxed">
            {result.report.summary}
          </p>
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="bg-[#111936] border-[#232C52] text-slate-100">
          <CardHeader className="pb-3 border-b border-[#232C52]">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Observed Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {result.report.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{s}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Areas to Improve */}
        <Card className="bg-[#111936] border-[#232C52] text-slate-100">
          <CardHeader className="pb-3 border-b border-[#232C52]">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {result.report.weaknesses.map((w, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                <span className="text-amber-400 font-bold">•</span>
                <span>{w}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recommended Topics */}
      <Card className="bg-[#111936] border-[#232C52] text-slate-100">
        <CardHeader className="pb-3 border-b border-[#232C52]">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#4F7CFF]" />
            Recommended Study Topics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-decimal list-inside text-xs sm:text-sm text-slate-300 font-medium">
            {result.report.recommended_topics.map((topic, i) => (
              <li key={i} className="p-3 rounded-lg bg-[#161F42] border border-[#232C52]">
                <span className="text-white font-semibold">{topic}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Per-Question Breakdown (Expandable Accordion) */}
      <Card className="bg-[#111936] border-[#232C52] text-slate-100">
        <CardHeader className="pb-3 border-b border-[#232C52]">
          <CardTitle className="text-base font-bold text-white">
            Question-by-Question Detailed Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Accordion className="space-y-3">
            {result.questions.map((q, idx) => {
              const meta = getScoreBadge(q.answer.score);
              return (
                <AccordionItem
                  key={q.id}
                  value={q.id}
                  className="border border-[#232C52] rounded-lg px-4 bg-[#161F42]/40"
                >
                  <AccordionTrigger className="hover:no-underline py-3 text-left">
                    <div className="flex flex-wrap items-center justify-between gap-2 w-full pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#4F7CFF]">
                          Q{q.questionOrder}:
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-white line-clamp-1">
                          {q.questionText}
                        </span>
                      </div>
                      <Badge variant="outline" className={`text-xs font-bold ${meta.color}`}>
                        Score: {q.answer.score}/10
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-4 border-t border-[#232C52]">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Your Answer
                      </span>
                      <p className="text-xs sm:text-sm text-slate-200 bg-[#0B1020] p-3 rounded-lg border border-[#232C52]">
                        {q.answer.answerText}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Rubric Feedback
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="p-2.5 rounded-lg bg-[#111936] border border-[#232C52]">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase block">
                            Did Well
                          </span>
                          <p className="text-xs text-slate-300 mt-1">
                            {q.answer.feedback.did_well}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#111936] border border-[#232C52]">
                          <span className="text-[10px] font-bold text-amber-400 uppercase block">
                            Missing
                          </span>
                          <p className="text-xs text-slate-300 mt-1">
                            {q.answer.feedback.missing}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#111936] border border-[#232C52]">
                          <span className="text-[10px] font-bold text-[#4F7CFF] uppercase block">
                            Improve
                          </span>
                          <p className="text-xs text-slate-300 mt-1">
                            {q.answer.feedback.improve}
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Bottom Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#232C52]">
        <Link href="/history">
          <Button variant="outline" className="border-[#232C52] text-slate-300 hover:text-white hover:bg-[#161F42] gap-2">
            <History className="w-4 h-4" /> Back to History
          </Button>
        </Link>
        <Link href="/interview/new">
          <Button className="bg-[#4F7CFF] hover:bg-[#4F7CFF]/90 text-white font-bold gap-2 px-6 shadow-md shadow-blue-500/20">
            <RotateCcw className="w-4 h-4" /> Start New Interview
          </Button>
        </Link>
      </div>
    </div>
  );
}
