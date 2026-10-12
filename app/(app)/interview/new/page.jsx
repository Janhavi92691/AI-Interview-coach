import { InterviewSetupForm } from "@/components/InterviewSetupForm";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export default async function NewInterviewPage({ searchParams }) {
  const sp = await searchParams;
  const initialType = sp?.type;
  const initialResumeId = sp?.resumeId;

  const user = await getCurrentUser({ requireAuth: false });
  let userResumes = [];

  if (user?.id) {
    try {
      const res = await query(
        `SELECT id, file_name, analysis, created_at
         FROM dbo.resumes
         WHERE user_id = @user_id
         ORDER BY created_at DESC`,
        { user_id: user.id }
      );
      userResumes = (res.recordset || []).map((r) => ({
        id: r.id,
        fileName: r.file_name,
        analysis: typeof r.analysis === "string" ? JSON.parse(r.analysis) : r.analysis,
        createdAt: r.created_at,
      }));
    } catch (e) {
      console.error("[NewInterviewPage Resumes Query Error]", e);
    }
  }

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
        resumes={userResumes}
        initialType={initialType}
        initialResumeId={initialResumeId}
      />
    </div>
  );
}
