import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, ShieldCheck, Cpu } from "lucide-react";

export default function MarketingLandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-3xl space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/80 bg-secondary/50 text-xs font-medium text-slate-300">
          <Sparkles className="w-4 h-4 text-[#4F7CFF]" />
          <span>Cloud Computing viva & live demo ready</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          Practice Smarter.{" "}
          <span className="bg-gradient-to-r from-[#4F7CFF] to-[#8B5CF6] bg-clip-text text-transparent">
            Interview Better.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
          Your AI-powered personal interviewer for technical and HR interview preparation.
          Practice adaptive questions, get immediate rubric evaluations, and accelerate your career.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link href="/signup">
            <Button size="lg" className="bg-[#4F7CFF] hover:bg-[#4F7CFF]/90 text-white gap-2 font-semibold px-6 shadow-lg shadow-blue-500/20">
              Start Interview <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <a href="/api/health" target="_blank" rel="noreferrer">
            <Button size="lg" variant="outline" className="border-border text-slate-300 hover:text-white hover:bg-secondary">
              View Health API
            </Button>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 text-left max-w-lg mx-auto">
          <div className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Cpu className="w-4 h-4 text-[#4F7CFF]" />
              <span>Full Cloud Architecture</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Azure OpenAI, Azure Functions serverless workers, Azure SQL, Blob Storage & App Service.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Scaffold Phase 0 Complete</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Next.js App Router, Tailwind tokens, shadcn/ui components, and health endpoint ready.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
