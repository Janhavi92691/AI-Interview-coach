"use client";

import { useState } from "react";
import Link from "next/link";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { ScoreRing } from "@/components/ScoreRing";
import { ScoreCard } from "@/components/ScoreCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function DevStatesPage() {
  const [tab, setTab] = useState("loading");

  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100 p-6 sm:p-10 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-[#232C52]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#4F7CFF] font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Viva & Demo Inspection Tool</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            UI State Variants Explorer
          </h1>
          <p className="text-xs text-slate-400">
            Preview all mandatory application states (Loading, Empty, Error, and Scores) required by the specification.
          </p>
        </div>

        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="border-[#232C52] text-slate-300 hover:text-white gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to App
          </Button>
        </Link>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="bg-[#111936] border border-[#232C52]">
          <TabsTrigger value="loading" className="data-[state=active]:bg-[#161F42] data-[state=active]:text-white text-xs">
            Loading States
          </TabsTrigger>
          <TabsTrigger value="empty" className="data-[state=active]:bg-[#161F42] data-[state=active]:text-white text-xs">
            Empty States
          </TabsTrigger>
          <TabsTrigger value="error" className="data-[state=active]:bg-[#161F42] data-[state=active]:text-white text-xs">
            Error States
          </TabsTrigger>
          <TabsTrigger value="score" className="data-[state=active]:bg-[#161F42] data-[state=active]:text-white text-xs">
            Scores & Badges
          </TabsTrigger>
        </TabsList>

        {/* Loading States Content */}
        <TabsContent value="loading" className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Question Generation Loading
            </span>
            <LoadingState
              message="Generating interview questions..."
              subtitle="Calibrating 5 questions with Azure OpenAI"
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Answer Evaluation Loading
            </span>
            <LoadingState
              message="Evaluating your answer..."
              subtitle="Running multi-dimensional rubric scoring"
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              3. Resume Analysis Loading
            </span>
            <LoadingState
              message="Analyzing your resume..."
              subtitle="Extracting technical keywords and project summaries"
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              4. Results Preparation Loading
            </span>
            <LoadingState
              message="Preparing your results..."
              subtitle="Generating performance summary and recommended study topics"
            />
          </div>
        </TabsContent>

        {/* Empty States Content */}
        <TabsContent value="empty" className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Dashboard / History Empty State
            </span>
            <EmptyState
              title="You haven't completed any interviews yet."
              description="Choose your target job role and let the AI interviewer guide your preparation."
              actionLabel="Start Your First Interview"
              actionHref="/interview/new"
            />
          </div>
        </TabsContent>

        {/* Error States Content */}
        <TabsContent value="error" className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. AI Generation Failure
            </span>
            <ErrorState
              title="Unable to generate questions"
              message="Unable to generate questions. Please try again."
              onRetry={() => alert("Retry triggered")}
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Database Save Error
            </span>
            <ErrorState
              title="Database Error"
              message="We couldn't save your interview. Please try again."
              onRetry={() => alert("Retry triggered")}
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              3. Resume Upload Error
            </span>
            <ErrorState
              title="Resume Upload Failed"
              message="Resume upload failed. Please check the file and try again."
              onRetry={() => alert("Retry triggered")}
            />
          </div>
        </TabsContent>

        {/* Score Components Content */}
        <TabsContent value="score" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center justify-center p-6 bg-[#111936] rounded-xl border border-[#232C52]">
            <ScoreRing score={92} max={100} size={130} />
            <ScoreRing score={74} max={100} size={130} />
            <ScoreRing score={52} max={100} size={130} />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Answer Rubric Breakdown Widget
            </span>
            <ScoreCard
              score={8}
              correctness={9}
              technicalDepth={8}
              clarity={8}
              relevance={7}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
