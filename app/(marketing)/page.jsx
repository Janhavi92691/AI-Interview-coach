import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  ArrowRight,
  Bot,
  Zap,
  FileCheck2,
  BarChart3,
  History,
  ShieldCheck,
  CheckCircle2,
  PlayCircle,
  HelpCircle,
  Layers,
} from "lucide-react";

export default function MarketingLandingPage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "AI Interview Coach";

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1020] text-slate-100">
      {/* Sticky Navigation */}
      <header className="sticky top-0 z-40 border-b border-[#232C52] bg-[#0B1020]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4F7CFF] to-[#8B5CF6] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">
            {appName}
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#benefits" className="hover:text-white transition-colors">
            Benefits
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-[#161F42]">
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-[#4F7CFF] hover:bg-[#4F7CFF]/90 text-white font-semibold">
              Sign Up
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 sm:py-28 px-6 text-center max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#232C52] bg-[#111936] text-xs font-semibold text-slate-300 shadow-sm">
          <Sparkles className="w-4 h-4 text-[#4F7CFF]" />
          <span>Azure Cloud Architecture • College Viva & Demo Ready</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          Practice Smarter.{" "}
          <span className="bg-gradient-to-r from-[#4F7CFF] via-[#7B61FF] to-[#8B5CF6] bg-clip-text text-transparent">
            Interview Better.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Your AI-powered personal interviewer for technical and HR interview preparation.
          Master questions calibrated to your skills, receive instant multi-metric feedback, and analyze your performance.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link href="/signup">
            <Button size="lg" className="bg-[#4F7CFF] hover:bg-[#4F7CFF]/90 text-white font-bold px-8 py-6 text-base gap-2 shadow-xl shadow-blue-500/20">
              Start Interview <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="border-[#232C52] bg-[#111936] text-slate-200 hover:bg-[#161F42] hover:text-white px-8 py-6 text-base">
              Log in to Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section (6 Cards) */}
      <section id="features" className="py-20 px-6 border-t border-[#232C52] bg-[#0E152B]/60">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-[#4F7CFF] uppercase tracking-wider">
              Comprehensive Prep
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Engineered for Rigorous Interview Practice
            </h2>
            <p className="text-sm text-slate-400">
              Every feature provides structured, actionable evaluation to help you succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <Card className="bg-[#111936] border-[#232C52] text-slate-100 p-6 space-y-3 hover:border-[#4F7CFF]/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#161F42] border border-[#232C52] flex items-center justify-center text-[#4F7CFF]">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">AI-Generated Questions</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Adaptive questions calibrated to Beginner, Intermediate, and Advanced difficulties across Technical and HR roles.
              </p>
            </Card>

            {/* Card 2 */}
            <Card className="bg-[#111936] border-[#232C52] text-slate-100 p-6 space-y-3 hover:border-[#4F7CFF]/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#161F42] border border-[#232C52] flex items-center justify-center text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Instant Feedback & Scoring</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Receive 0–10 scoring with breakdown across Correctness, Technical Depth, Clarity, and Relevance after every answer.
              </p>
            </Card>

            {/* Card 3 */}
            <Card className="bg-[#111936] border-[#232C52] text-slate-100 p-6 space-y-3 hover:border-[#4F7CFF]/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#161F42] border border-[#232C52] flex items-center justify-center text-[#8B5CF6]">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Resume-Aware Interviews</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Upload your PDF resume to generate tailored interview questions that cross-examine your listed projects and skills.
              </p>
            </Card>

            {/* Card 4 */}
            <Card className="bg-[#111936] border-[#232C52] text-slate-100 p-6 space-y-3 hover:border-[#4F7CFF]/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#161F42] border border-[#232C52] flex items-center justify-center text-amber-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Performance Analytics</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Longitudinal progress charts, strongest and weakest topic diagnostics, and technical vs behavioral domain comparisons.
              </p>
            </Card>

            {/* Card 5 */}
            <Card className="bg-[#111936] border-[#232C52] text-slate-100 p-6 space-y-3 hover:border-[#4F7CFF]/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#161F42] border border-[#232C52] flex items-center justify-center text-blue-400">
                <History className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Interview History</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Review complete transcripts, individual question scores, and AI recommendations from previous mock sessions.
              </p>
            </Card>

            {/* Card 6 */}
            <Card className="bg-[#111936] border-[#232C52] text-slate-100 p-6 space-y-3 hover:border-[#4F7CFF]/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#161F42] border border-[#232C52] flex items-center justify-center text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Secure & Cloud-Powered</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Built on Azure App Service, serverless Azure Functions, private Azure Blob Storage, and Azure SQL with signed JWT sessions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section (4 Steps) */}
      <section id="how-it-works" className="py-20 px-6 border-t border-[#232C52]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              How AI Interview Coach Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-xl bg-[#111936] border border-[#232C52] space-y-3">
              <span className="text-2xl font-black text-[#4F7CFF]">01</span>
              <h3 className="text-base font-bold text-white">Choose Setup</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Select your target role, difficulty, interview type, and number of questions or connect an analyzed resume.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-xl bg-[#111936] border border-[#232C52] space-y-3">
              <span className="text-2xl font-black text-[#4F7CFF]">02</span>
              <h3 className="text-base font-bold text-white">Answer Prompts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Type your structured response with automatic char counting and keyboard shortcuts (Ctrl+Enter).
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-xl bg-[#111936] border border-[#232C52] space-y-3">
              <span className="text-2xl font-black text-[#4F7CFF]">03</span>
              <h3 className="text-base font-bold text-white">Get Feedback</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive instant evaluations detailing what you did well, what was missing, and how to improve.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-xl bg-[#111936] border border-[#232C52] space-y-3">
              <span className="text-2xl font-black text-[#4F7CFF]">04</span>
              <h3 className="text-base font-bold text-white">Review & Improve</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Examine your overall score report, strengths, weaknesses, and personalized study topics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-6 border-t border-[#232C52] bg-[#0E152B]/40">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold text-[#4F7CFF] uppercase tracking-wider">
              Student Advantages
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Why Practice With AI Interview Coach?
            </h2>
            <ul className="space-y-3.5 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Zero judgment — build confidence at your own pace before high-stakes campus placement interviews.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Instant rubric-driven scores with concrete suggestions rather than vague generalities.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Deep resume integration cross-checks claims against industry technical standards.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-[#111936] border border-[#232C52] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#232C52]">
              <span className="text-xs font-bold text-slate-400 uppercase">Live Evaluation Preview</span>
              <span className="text-xs text-emerald-400 font-semibold">9 / 10 Score</span>
            </div>
            <p className="text-xs text-slate-300 italic">
              &quot;Strong explanation of horizontal scaling and stateless backend design. To reach full marks, mention Redis cache invalidation strategies.&quot;
            </p>
            <div className="flex gap-2">
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                Correctness: 9/10
              </span>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-semibold">
                Depth: 9/10
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Band */}
      <section className="py-20 px-6 border-t border-[#232C52] text-center bg-gradient-to-b from-[#0B1020] to-[#111936]">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-base text-slate-400 max-w-xl mx-auto">
            Create your account in seconds, configure your first mock session, and practice with immediate AI feedback.
          </p>
          <div className="pt-2">
            <Link href="/signup">
              <Button size="lg" className="bg-[#4F7CFF] hover:bg-[#4F7CFF]/90 text-white font-bold px-8 py-6 text-base gap-2 shadow-xl shadow-blue-500/25">
                Start Interview Now <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#232C52] bg-[#0E152B] py-8 px-6 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#4F7CFF] flex items-center justify-center text-white text-[10px] font-bold">
              AI
            </div>
            <span className="font-semibold text-slate-300">{appName}</span>
          </div>
          <p>© 2026 AI Interview Coach. Built for Cloud Computing submission and viva demonstration.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="/api/health" className="hover:text-white transition-colors">
              Health Status
            </a>
            <Link href="/dev/states" className="hover:text-[#4F7CFF] transition-colors">
              UI States Explorer
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
