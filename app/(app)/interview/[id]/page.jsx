"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { QuestionCard } from "@/components/QuestionCard";
import { FeedbackCard } from "@/components/FeedbackCard";
import { LoadingState } from "@/components/LoadingState";
import { mockActiveInterview } from "@/lib/mock-data";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function LiveInterviewPage({ params }) {
  const router = useRouter();
  const [interview, setInterview] = useState(mockActiveInterview);
  const [currentIndex, setCurrentIndex] = useState(0); // 0-indexed
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const currentQuestion = interview.questions[currentIndex];
  const isAnswered = currentQuestion?.answer != null;
  const isLastQuestion = currentIndex === interview.questions.length - 1;
  const progressPercent = Math.round(((currentIndex + 1) / interview.questions.length) * 100);

  const handleSubmitAnswer = async (answerText) => {
    setIsEvaluating(true);

    try {
      // Phase 1 UI simulation
      await new Promise((r) => setTimeout(r, 1200));

      const simulatedEvaluation = {
        id: `ans_${Date.now()}`,
        answerText,
        score: 8,
        correctness: 8,
        technicalDepth: 8,
        clarity: 9,
        relevance: 9,
        feedback: {
          did_well: "Comprehensive explanation covering the critical mechanics and direct trade-offs.",
          missing: "Could mention specific failure modes or production concurrency scenarios.",
          improve: "Strengthen the response by citing benchmark numbers or concrete architectural examples.",
        },
      };

      setInterview((prev) => {
        const updatedQuestions = [...prev.questions];
        updatedQuestions[currentIndex] = {
          ...updatedQuestions[currentIndex],
          answer: simulatedEvaluation,
        };
        return {
          ...prev,
          questions: updatedQuestions,
        };
      });

      setIsEvaluating(false);
      toast.success("Answer evaluated!");
    } catch {
      setIsEvaluating(false);
      toast.error("Unable to evaluate your answer. Please try again.");
    }
  };

  const handleNextQuestion = async () => {
    if (isLastQuestion) {
      setIsFinishing(true);
      await new Promise((r) => setTimeout(r, 1200));
      toast.success("Interview completed! Generating report...");
      router.push(`/results/${interview.id}`);
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
          isLastQuestion={isLastQuestion}
          onNext={handleNextQuestion}
        />
      ) : (
        <QuestionCard
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
