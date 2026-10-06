"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/LoadingState";
import { Sparkles, ArrowRight, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createInterviewSession } from "@/lib/interview-store";

const ROLE_PRESETS = [
  "Software Developer",
  "Full Stack Developer",
  "Java Developer",
  "Python Developer",
  "Data Analyst",
  "AI/ML Engineer",
  "Cloud Engineer",
  "Web Developer",
  "Other",
];

const INTERVIEW_TYPES = [
  { id: "Technical", label: "Technical", desc: "Algorithms, frameworks & architectures" },
  { id: "HR", label: "HR / Behavioral", desc: "Situational & communication metrics" },
  { id: "Mixed", label: "Mixed", desc: "Balanced technical + behavioral" },
  { id: "Resume-Based", label: "Resume-Based", desc: "Tailored to your projects & skills" },
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const QUESTION_COUNTS = [5, 10, 15];

export function InterviewSetupForm({ resumes = [], initialType, initialResumeId }) {
  const router = useRouter();

  const [selectedRolePreset, setSelectedRolePreset] = useState("Full Stack Developer");
  const [customRole, setCustomRole] = useState("");
  const [interviewType, setInterviewType] = useState(
    initialType === "resume" ? "Resume-Based" : "Technical"
  );
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [questionCount, setQuestionCount] = useState(5);
  const [selectedResumeId, setSelectedResumeId] = useState(
    initialResumeId || (resumes.length > 0 ? resumes[0].id : "")
  );
  const [isLoading, setIsLoading] = useState(false);

  const effectiveRole =
    selectedRolePreset === "Other" ? customRole.trim() : selectedRolePreset;

  const isRoleValid =
    effectiveRole.length >= 2 && effectiveRole.length <= 60;

  const isResumeValid =
    interviewType !== "Resume-Based" || (selectedResumeId && resumes.length > 0);

  const canSubmit = isRoleValid && isResumeValid && !isLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      if (!isRoleValid) toast.error("Job role must be between 2 and 60 characters.");
      else if (!isResumeValid) toast.error("Please upload or select a resume for a Resume-Based interview.");
      return;
    }

    setIsLoading(true);

    try {
      const selectedResume = resumes.find((r) => r.id === selectedResumeId);
      const session = await createInterviewSession({
        role: effectiveRole,
        type: interviewType,
        difficulty,
        count: questionCount,
        resumeAnalysis: selectedResume?.analysis || null,
      });

      toast.success("Interview created successfully.");
      router.push(`/interview/${session.id}`);
    } catch {
      setIsLoading(false);
      toast.error("Unable to generate questions. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-[#111936] border-[#232C52] text-slate-100 p-6">
        <LoadingState
          message="Generating interview questions..."
          subtitle={`Calibrating ${questionCount} ${difficulty} questions for ${effectiveRole}`}
        />
      </Card>
    );
  }

  return (
    <Card className="bg-[#111936] border-[#232C52] text-slate-100 shadow-xl">
      <CardHeader className="pb-4 border-b border-[#232C52]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#4F7CFF] uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Configure Your Session</span>
        </div>
        <CardTitle className="text-xl font-bold text-white">
          Interview Setup
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role-select" className="text-sm font-semibold text-slate-200">
              Target Job Role <span className="text-red-400">*</span>
            </Label>
            <Select
              value={selectedRolePreset}
              onValueChange={(val) => setSelectedRolePreset(val)}
            >
              <SelectTrigger id="role-select" className="bg-[#0B1020] border-[#232C52] text-white">
                <SelectValue placeholder="Select target role" />
              </SelectTrigger>
              <SelectContent className="bg-[#111936] border-[#232C52] text-slate-200">
                {ROLE_PRESETS.map((role) => (
                  <SelectItem key={role} value={role} className="cursor-pointer hover:bg-[#161F42]">
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedRolePreset === "Other" && (
              <div className="pt-2">
                <Input
                  id="custom-role-input"
                  placeholder="e.g. Site Reliability Engineer (2–60 chars)"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="bg-[#0B1020] border-[#232C52] text-white"
                  maxLength={60}
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Enter your exact target job title.
                </p>
              </div>
            )}
          </div>

          {/* Interview Type Selection (Segmented Control) */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-200">
              Interview Type <span className="text-red-400">*</span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {INTERVIEW_TYPES.map((type) => {
                const isSelected = interviewType === type.id;
                return (
                  <button
                    type="button"
                    key={type.id}
                    onClick={() => setInterviewType(type.id)}
                    className={`p-3 rounded-lg border text-left transition-all duration-150 ${
                      isSelected
                        ? "bg-[#161F42] border-[#4F7CFF] ring-1 ring-[#4F7CFF] text-white"
                        : "bg-[#0B1020] border-[#232C52] text-slate-400 hover:text-slate-200 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{type.label}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#4F7CFF]" />}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      {type.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* If Resume-Based: Resume Picker */}
          {interviewType === "Resume-Based" && (
            <div className="p-4 rounded-xl bg-[#161F42]/80 border border-[#232C52] space-y-3">
              <Label htmlFor="resume-picker" className="text-xs font-semibold text-white flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-[#4F7CFF]" />
                Select Analyzed Resume
              </Label>
              {resumes.length > 0 ? (
                <Select
                  value={selectedResumeId}
                  onValueChange={(val) => setSelectedResumeId(val)}
                >
                  <SelectTrigger id="resume-picker" className="bg-[#0B1020] border-[#232C52] text-white text-xs">
                    <SelectValue placeholder="Choose resume" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111936] border-[#232C52] text-slate-200">
                    {resumes.map((res) => (
                      <SelectItem key={res.id} value={res.id} className="cursor-pointer">
                        {res.fileName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-xs text-amber-400 flex items-center justify-between">
                  <span>No uploaded resumes found.</span>
                  <Link href="/resume" className="text-[#4F7CFF] underline underline-offset-2 font-semibold">
                    Upload a resume first
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Difficulty Segmented Control */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-200">
              Difficulty Level <span className="text-red-400">*</span>
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((diff) => {
                const isSelected = difficulty === diff;
                return (
                  <button
                    type="button"
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                      isSelected
                        ? "bg-[#161F42] border-[#4F7CFF] text-[#4F7CFF]"
                        : "bg-[#0B1020] border-[#232C52] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Count Segmented Control */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-200">
              Number of Questions <span className="text-red-400">*</span>
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {QUESTION_COUNTS.map((cnt) => {
                const isSelected = questionCount === cnt;
                return (
                  <button
                    type="button"
                    key={cnt}
                    onClick={() => setQuestionCount(cnt)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                      isSelected
                        ? "bg-[#161F42] border-[#4F7CFF] text-[#4F7CFF]"
                        : "bg-[#0B1020] border-[#232C52] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {cnt} Questions
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configuration Summary Card */}
          <div className="p-4 rounded-xl bg-[#0B1020] border border-[#232C52] space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Session Summary
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-[#161F42] border-[#232C52] text-white text-xs">
                {effectiveRole || "Unspecified Role"}
              </Badge>
              <Badge variant="outline" className="bg-[#161F42] border-[#232C52] text-[#4F7CFF] text-xs">
                {interviewType}
              </Badge>
              <Badge variant="outline" className="bg-[#161F42] border-[#232C52] text-purple-400 text-xs">
                {difficulty}
              </Badge>
              <Badge variant="outline" className="bg-[#161F42] border-[#232C52] text-emerald-400 text-xs">
                {questionCount} Questions
              </Badge>
            </div>
          </div>

          {/* Start Action */}
          <Button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-[#4F7CFF] hover:bg-[#4F7CFF]/90 text-white font-bold py-6 text-base gap-2 shadow-lg shadow-blue-500/20"
          >
            Start Interview <ArrowRight className="w-5 h-5" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
