import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { PerformanceChart } from "@/components/PerformanceChart";
import { CategoryChart } from "@/components/CategoryChart";
import { InterviewCard } from "@/components/InterviewCard";
import { EmptyState } from "@/components/EmptyState";
import {
  PlusCircle,
  TrendingUp,
  Award,
  BookOpen,
  ArrowUpRight,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export default async function DashboardPage({ searchParams }) {
  const sp = await searchParams;
  const user = await getCurrentUser({ requireAuth: false });

  let interviews = [];
  let answers = [];

  if (user?.id) {
    try {
      const intRes = await query(
        `SELECT id, job_role, interview_type, difficulty, total_questions,
                status, overall_score, created_at, completed_at
         FROM dbo.interviews
         WHERE user_id = @user_id
         ORDER BY created_at DESC`,
        { user_id: user.id }
      );
      interviews = intRes.recordset || [];

      const ansRes = await query(
        `SELECT a.score, a.correctness, a.technical_depth, a.clarity, a.relevance, q.category, q.topic
         FROM dbo.answers a
         JOIN dbo.questions q ON a.question_id = q.id
         JOIN dbo.interviews i ON q.interview_id = i.id
         WHERE i.user_id = @user_id`,
        { user_id: user.id }
      );
      answers = ansRes.recordset || [];
    } catch (e) {
      console.error("[Dashboard Query Error]", e);
    }
  }

  const completed = interviews.filter((i) => i.status === "completed" && i.overall_score !== null);
  const totalInterviews = completed.length;
  const isEmptyState = sp?.state === "empty" || totalInterviews === 0;

  const displayName = user?.name || "Candidate";
  const firstName = displayName.split(" ")[0];

  // Aggregate stats from real database rows
  const avgScore = totalInterviews > 0
    ? Math.round(completed.reduce((acc, curr) => acc + curr.overall_score, 0) / totalInterviews)
    : 0;

  const bestScore = totalInterviews > 0
    ? Math.max(...completed.map((i) => i.overall_score))
    : 0;

  // Domain averages
  const techAnswers = answers.filter((a) => a.category === "Technical");
  const hrAnswers = answers.filter((a) => a.category === "HR");
  const techAvg = techAnswers.length > 0
    ? Math.round((techAnswers.reduce((sum, a) => sum + a.score, 0) / techAnswers.length) * 10)
    : 0;
  const hrAvg = hrAnswers.length > 0
    ? Math.round((hrAnswers.reduce((sum, a) => sum + a.score, 0) / hrAnswers.length) * 10)
    : 0;

  // Topic aggregations
  const topicMap = new Map();
  for (const ans of answers) {
    if (!ans.topic) continue;
    if (!topicMap.has(ans.topic)) {
      topicMap.set(ans.topic, { topic: ans.topic, totalScore: 0, count: 0 });
    }
    const curr = topicMap.get(ans.topic);
    curr.totalScore += ans.score;
    curr.count += 1;
  }

  const aggregatedTopics = Array.from(topicMap.values()).map((t) => ({
    topic: t.topic,
    count: t.count,
    score: Math.round((t.totalScore / t.count) * 10) / 10,
  }));

  aggregatedTopics.sort((a, b) => b.score - a.score);
  const strongestTopics = aggregatedTopics.slice(0, 3);
  const weakestTopics = [...aggregatedTopics].reverse().slice(0, 3);

  // Performance history for chart
  const performanceHistory = completed
    .slice()
    .reverse()
    .map((int, idx) => ({
      name: `Session ${idx + 1}`,
      score: int.overall_score,
      date: new Date(int.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));

  return (
    <div className="space-y-8">
      {/* Welcome Banner & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#4F7CFF] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interview Readiness Dashboard</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {firstName}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Track your performance metrics, study topic weaknesses, and launch adaptive mock interviews.
          </p>
        </div>

        <Link href="/interview/new">
          <Button className="bg-[#4F7CFF] hover:bg-[#4F7CFF]/90 text-white font-bold gap-2 px-5 py-5 shadow-lg shadow-blue-500/20 shrink-0">
            <PlusCircle className="w-4 h-4" />
            Start New Interview
          </Button>
        </Link>
      </div>

      {isEmptyState ? (
        <EmptyState
          title="You haven't completed any interviews yet."
          description="Select your target job role, customize difficulty, and let the AI interviewer test your technical depth and behavioral readiness."
          actionLabel="Start Your First Interview"
          actionHref="/interview/new"
        />
      ) : (
        <>
          {/* 3 Stat Cards + Tech vs HR Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Interviews Completed"
              value={totalInterviews}
              subtitle="All-time mock sessions"
              icon={BookOpen}
            />
            <StatCard
              title="Average Score"
              value={`${avgScore}%`}
              subtitle="Across technical & HR"
              icon={TrendingUp}
              trend={totalInterviews > 1 ? "+4% recently" : undefined}
            />
            <StatCard
              title="Best Score"
              value={`${bestScore}%`}
              subtitle="Highest scored session"
              icon={Award}
            />
            <Card className="bg-[#111936] border-[#232C52] text-slate-100 shadow-sm">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Domain Averages
                </span>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300">Technical</span>
                    <span className="text-[#4F7CFF]">{techAvg}%</span>
                  </div>
                  <div className="w-full bg-[#0B1020] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#4F7CFF] h-full rounded-full" style={{ width: `${techAvg}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold pt-1">
                    <span className="text-slate-300">HR / Behavioral</span>
                    <span className="text-[#8B5CF6]">{hrAvg}%</span>
                  </div>
                  <div className="w-full bg-[#0B1020] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#8B5CF6] h-full rounded-full" style={{ width: `${hrAvg}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PerformanceChart data={performanceHistory} />
            </div>
            <div className="lg:col-span-1">
              <CategoryChart
                techAvg={techAvg}
                hrAvg={hrAvg}
                resumeAvg={techAvg}
              />
            </div>
          </div>

          {/* Strongest vs Weakest Topics */}
          {aggregatedTopics.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strongest */}
              <Card className="bg-[#111936] border-[#232C52] text-slate-100">
                <CardHeader className="pb-3 border-b border-[#232C52]">
                  <CardTitle className="text-sm font-bold text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      Strongest Topics
                    </span>
                    <span className="text-xs font-normal text-slate-400">Avg answer score</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {strongestTopics.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#161F42] border border-[#232C52]"
                    >
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {item.topic}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {item.count} evaluated answers
                        </span>
                      </div>
                      <span className="text-sm font-extrabold text-emerald-400">
                        {item.score} / 10
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Weakest */}
              <Card className="bg-[#111936] border-[#232C52] text-slate-100">
                <CardHeader className="pb-3 border-b border-[#232C52]">
                  <CardTitle className="text-sm font-bold text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-amber-400" />
                      Topics to Reinforce
                    </span>
                    <span className="text-xs font-normal text-slate-400">Recommended focus</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {weakestTopics.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#161F42] border border-[#232C52]"
                    >
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {item.topic}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {item.count} evaluated answers
                        </span>
                      </div>
                      <span className="text-sm font-extrabold text-amber-400">
                        {item.score} / 10
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Interviews List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Recent Interviews</h3>
              <Link href="/history" className="text-xs text-[#4F7CFF] hover:underline font-semibold">
                View all history →
              </Link>
            </div>
            <div className="space-y-3">
              {interviews.slice(0, 5).map((interview) => (
                <InterviewCard
                  key={interview.id}
                  interview={{
                    id: interview.id,
                    jobRole: interview.job_role,
                    interviewType: interview.interview_type,
                    difficulty: interview.difficulty,
                    createdAt: interview.created_at,
                    status: interview.status,
                    overallScore: interview.overall_score,
                    totalQuestions: interview.total_questions,
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
