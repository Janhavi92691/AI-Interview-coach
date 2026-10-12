"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { QuestionCard } from "@/components/QuestionCard";
import { FeedbackCard } from "@/components/FeedbackCard";
import { LoadingState } from "@/components/LoadingState";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function LiveInterviewPage({ params }) {
  const unwrappedParams = use(params);
  const interviewId = unwrappedParams.id;
  const router = useRouter();

  // Always initialize null and fetch real session from Azure SQL
  const [interview, setInterview] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  // Fetch session and questions from server API
  useEffect(() => {
    if (!interviewId) return;

    let isMounted = true;
    fetch(`/api/interviews/${interviewId}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || "Failed to load interview session");
        }
        return res.json();
      })
      .then((data) => {
        if (!isMounted || !data) return;
        const { interview: inv, questions = [], answers = [] } = data;

        // Sort questions ascending by order
        const sortedQuestions = [...questions].sort(
          (a, b) => (a.question_order || 0) - (b.question_order || 0)
        );

        const questionsWithAnswers = sortedQuestions.map((q) => {
          const qIdStr = String(q.id).toLowerCase();
          const ans = answers.find((a) => String(a.question_id).toLowerCase() === qIdStr);
          return {
            id: q.id,
            question: q.question_text,
            questionText: q.question_text,
            question_text: q.question_text,
            topic: q.topic,
            category: q.category,
            questionOrder: q.question_order,
            answer: ans
              ? {
                  id: ans.id,
                  score: ans.score,
                  correctness: ans.correctness,
                  technicalDepth: ans.technical_depth,
                  clarity: ans.clarity,
                  relevance: ans.relevance,
                  feedback: ans.feedback,
                }
              : null,
          };
        });

        const formattedSession = {
          id: inv.id,
          jobRole: inv.job_role,
          interviewType: inv.interview_type,
          difficulty: inv.difficulty,
          totalQuestions: inv.total_questions,
          status: inv.status,
          questions: questionsWithAnswers,
        };

        setInterview(formattedSession);
        const firstUnanswered = questionsWithAnswers.findIndex((q) => q.answer == null);
        setCurrentIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
      })
      .catch((err) => {
        console.error("[LiveInterviewPage Load Error]:", err);
        if (isMounted) {
          toast.error(err.message || "Could not load interview session.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [interviewId]);

  // If session is already completed, redirect to results
  useEffect(() => {
    if (interview && interview.status === "completed") {
      const allDone = interview.questions.every((q) => q.answer != null);
      if (allDone) {
        router.replace(`/results/${interview.id}`);
      }
    }
  }, [interview, router]);

  if (!interview) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <LoadingState
          message="Loading interview session..."
          subtitle="Retrieving questions and current progress"
        />
      </div>
    );
  }

  const currentQuestion = interview.questions[currentIndex] || interview.questions[0];
  const isAnswered = currentQuestion?.answer != null;
  const isLastQuestion = currentIndex === interview.questions.length - 1;
  const progressPercent = Math.round(((currentIndex + 1) / interview.questions.length) * 100);

  const handleSubmitAnswer = async (answerText) => {
    setIsEvaluating(true);

    try {
      const res = await fetch(`/api/interviews/${interview.id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: currentQuestion.id,
          answer_text: answerText,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Failed to submit answer (Status: ${res.status}). Please try again.`);
      }

      const data = await res.json();
      const ans = data.answer;
      const evaluationResult = {
        id: ans.id,
        score: ans.score,
        correctness: ans.correctness,
        technicalDepth: ans.technical_depth,
        clarity: ans.clarity,
        relevance: ans.relevance,
        feedback: ans.feedback,
        followUp: ans.follow_up,
      };

      // Update state with evaluated answer
      setInterview((prev) => {
        const updatedQuestions = [...prev.questions];
        updatedQuestions[currentIndex] = {
          ...updatedQuestions[currentIndex],
          answer: evaluationResult,
        };
        return {
          ...prev,
          questions: updatedQuestions,
        };
      });

      toast.success("Answer evaluated!");
    } catch (err) {
      console.error("[handleSubmitAnswer Error]:", err);
      toast.error(err.message || "Unable to evaluate your answer. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = async () => {
    if (isLastQuestion) {
      setIsFinishing(true);
      try {
        const res = await fetch(`/api/interviews/${interview.id}/complete`, {
          method: "POST",
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || "Failed to complete interview session.");
        }

        toast.success("Interview completed! Generating report...");
        router.push(`/results/${interview.id}`);
      } catch (err) {
        setIsFinishing(false);
        console.error("[handleNextQuestion Error]:", err);
        toast.error(err.message || "Unable to complete interview.");
      }
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (isFinishing) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <LoadingState
          message="Preparing your results..."
          subtitle="Synthesizing AI performance analysis, strengths, and study topics"
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      {/* Header with Title and Metadata Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#232C52]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#4F7CFF] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Interview Session</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {interview.jobRole} Interview
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-[#161F42] border-[#232C52] text-slate-300 text-xs">
            {interview.interviewType}
          </Badge>
          <Badge variant="outline" className="bg-[#161F42] border-[#232C52] text-purple-400 text-xs">
            {interview.difficulty}
          </Badge>
        </div>
      </div>

      {/* Progress Bar & Counter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-white">
            Question {currentIndex + 1} of {interview.questions.length}
          </span>
          <span className="text-slate-400">{progressPercent}% Completed</span>
        </div>
        <Progress value={progressPercent} className="h-2 bg-[#111936]" />
      </div>

      {/* Main Interactive Stage: Question vs Evaluating vs Feedback */}
      {isEvaluating ? (
        <LoadingState
          message="Evaluating your answer..."
          subtitle="Running AI scoring across correctness, technical depth, clarity, and relevance"
        />
      ) : isAnswered ? (
        <FeedbackCard
          score={currentQuestion.answer.score}
          correctness={currentQuestion.answer.correctness}
          technicalDepth={currentQuestion.answer.technicalDepth}
          clarity={currentQuestion.answer.clarity}
          relevance={currentQuestion.answer.relevance}
          feedback={currentQuestion.answer.feedback}
          followUp={currentQuestion.answer.followUp}
          isLastQuestion={isLastQuestion}
          onNext={handleNextQuestion}
        />
      ) : (
        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={interview.questions.length}
          onSubmitAnswer={handleSubmitAnswer}
          isSubmitting={isEvaluating}
        />
      )}
    </div>
  );
}
