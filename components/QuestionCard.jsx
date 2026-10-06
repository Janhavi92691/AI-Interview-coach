"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles } from "lucide-react";

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onSubmitAnswer,
  isSubmitting = false,
}) {
  const [answerText, setAnswerText] = useState("");
  const maxChars = 4000;
  const charsRemaining = maxChars - answerText.length;
  const isAnswerValid = answerText.trim().length > 0 && charsRemaining >= 0;

  const handleKeyDown = (e) => {
    // Ctrl + Enter or Cmd + Enter submits
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      if (isAnswerValid && !isSubmitting) {
        e.preventDefault();
        onSubmitAnswer(answerText);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isAnswerValid && !isSubmitting) {
      onSubmitAnswer(answerText);
    }
  };

  return (
    <Card className="bg-[#111936] border-[#232C52] text-slate-100 shadow-lg">
      <CardHeader className="pb-3 border-b border-[#232C52]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge
            variant="outline"
            className="border-[#4F7CFF]/40 bg-[#4F7CFF]/10 text-[#4F7CFF] font-semibold text-xs"
          >
            {question?.topic || "General"}
          </Badge>
          <span className="text-xs font-semibold text-slate-400">
            Category: {question?.category || "Technical"}
          </span>
        </div>
        <CardTitle className="text-lg sm:text-xl font-bold text-white mt-3 leading-relaxed">
          {question?.questionText || "Loading question..."}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="candidate-answer"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
            >
              Your Response
            </label>
            <Textarea
              id="candidate-answer"
              rows={7}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              placeholder="Structure your answer clearly. Explain concepts, implementation details, trade-offs, and examples... (Ctrl + Enter to submit)"
              className="w-full bg-[#0B1020] border-[#232C52] text-slate-100 placeholder:text-slate-500 rounded-lg focus:border-[#4F7CFF] focus:ring-1 focus:ring-[#4F7CFF] resize-y text-sm leading-relaxed p-4"
              maxLength={maxChars}
            />
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-slate-400">
                Press <kbd className="px-1.5 py-0.5 rounded bg-[#161F42] border border-[#232C52] text-[11px] font-mono text-slate-300">Ctrl+Enter</kbd> to submit
              </span>
              <span className={charsRemaining < 200 ? "text-amber-400" : "text-slate-400"}>
                {answerText.length} / {maxChars}
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={!isAnswerValid || isSubmitting}
              className="bg-[#4F7CFF] hover:bg-[#4F7CFF]/90 text-white font-semibold px-6 gap-2"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "Evaluating your answer..." : "Submit Answer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
