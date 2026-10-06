import { InterviewSetupForm } from "@/components/InterviewSetupForm";
import { mockResumes } from "@/lib/mock-data";

export default async function NewInterviewPage({ searchParams }) {
  const sp = await searchParams;
  const initialType = sp?.type;
  const initialResumeId = sp?.resumeId;

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Configure New Interview Session
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Customize role parameters, difficulty, and questions to calibrate your AI interviewer.
        </p>
      </div>

      <InterviewSetupForm
        resumes={mockResumes}
        initialType={initialType}
        initialResumeId={initialResumeId}
      />
    </div>
  );
}
