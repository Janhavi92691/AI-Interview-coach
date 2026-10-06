"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { InterviewCard } from "@/components/InterviewCard";
import { EmptyState } from "@/components/EmptyState";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { mockDashboardStats } from "@/lib/mock-data";
import { PlusCircle, History } from "lucide-react";

export function formatInterviewForCard(item) {
  return {
    id: item.id,
    jobRole: item.job_role || item.jobRole,
    interviewType: item.interview_type || item.interviewType,
    difficulty: item.difficulty,
    date: item.created_at ? new Date(item.created_at).toLocaleDateString() : (item.date || "Today"),
    status: item.status,
    overallScore: item.overall_score ?? item.overallScore,
    totalQuestions: item.total_questions || item.totalQuestions || 5,
    answeredQuestions: item.status === "completed" ? (item.total_questions || 5) : 1,
  };
}

export default function HistoryPage() {
  const [filterType, setFilterType] = useState("all");
  const [interviews, setInterviews] = useState(mockDashboardStats.recentInterviews);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/interviews")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.interviews && data.interviews.length > 0) {
          setInterviews(data.interviews.map(formatInterviewForCard));
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredInterviews =
    filterType === "all"
      ? interviews
      : interviews.filter((item) => item.interviewType.toLowerCase() === filterType.toLowerCase());

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      {/* Page Title & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Interview History
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Review past mock interview sessions, review rubric evaluations, and resume incomplete sessions.
          </p>
        </div>

        <Link href="/interview/new">
          <Button className="bg-[#4F7CFF] hover:bg-[#4F7CFF]/90 text-white font-semibold gap-2 shrink-0">
            <PlusCircle className="w-4 h-4" />
            New Interview
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between pt-2">
        <Tabs value={filterType} onValueChange={setFilterType} className="w-full sm:w-auto">
          <TabsList className="bg-[#111936] border border-[#232C52] text-slate-400">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#161F42] data-[state=active]:text-white text-xs">
              All Sessions
            </TabsTrigger>
            <TabsTrigger value="technical" className="data-[state=active]:bg-[#161F42] data-[state=active]:text-white text-xs">
              Technical
            </TabsTrigger>
            <TabsTrigger value="hr" className="data-[state=active]:bg-[#161F42] data-[state=active]:text-white text-xs">
              HR / Behavioral
            </TabsTrigger>
            <TabsTrigger value="resume-based" className="data-[state=active]:bg-[#161F42] data-[state=active]:text-white text-xs">
              Resume-Based
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Interview List / Cards or Empty State */}
      {filteredInterviews.length === 0 ? (
        <EmptyState
          title="No interviews found for this category."
          description="Try selecting a different filter or launch a new interview session."
          actionLabel="Start New Interview"
          actionHref="/interview/new"
          icon={History}
        />
      ) : (
        <div className="space-y-3">
          {filteredInterviews.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </div>
      )}
    </div>
  );
}
