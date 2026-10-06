"use client";

import { useState, useEffect } from "react";
import { ResumeUpload } from "@/components/ResumeUpload";
import { ResumeAnalysisView } from "@/components/ResumeAnalysisView";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, HardDrive, Sparkles } from "lucide-react";
import { mockResumes } from "@/lib/mock-data";

export default function ResumePage() {
  const [resumes, setResumes] = useState(mockResumes);
  const [activeResumeId, setActiveResumeId] = useState(
    mockResumes.length > 0 ? mockResumes[0].id : null
  );

  useEffect(() => {
    let isMounted = true;
    fetch("/api/resumes")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.resumes && data.resumes.length > 0) {
          setResumes(data.resumes);
          setActiveResumeId(data.resumes[0].id);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const activeResume = resumes.find((r) => r.id === activeResumeId) || resumes[0];

  const handleUploadSuccess = (newResume) => {
    setResumes((prev) => [newResume, ...prev]);
    setActiveResumeId(newResume.id);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      {/* Title & Info */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#4F7CFF] uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Azure Blob Storage Pipeline</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Resume Analysis & Tailored Interviews
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Upload your PDF resume to extract skills, project summaries, and generate customized interview questions.
        </p>
      </div>

      {/* Upload Component */}
      <ResumeUpload onUploadSuccess={handleUploadSuccess} maxMb={5} />

      {/* List of Previous Resumes */}
      {resumes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Uploaded Resumes ({resumes.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {resumes.map((res) => {
              const isSelected = res.id === activeResume?.id;
              return (
                <button
                  type="button"
                  key={res.id}
                  onClick={() => setActiveResumeId(res.id)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-[#161F42] border-[#4F7CFF] ring-1 ring-[#4F7CFF]"
                      : "bg-[#111936] border-[#232C52] hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-4 h-4 text-[#4F7CFF] shrink-0" />
                      <span className="text-xs font-bold text-white truncate">
                        {res.fileName}
                      </span>
                    </div>
                    {isSelected && (
                      <Badge variant="outline" className="text-[10px] bg-[#4F7CFF]/15 text-[#4F7CFF] border-[#4F7CFF]/30">
                        Active
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(res.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      {(res.fileSizeBytes / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Resume Analysis View */}
      {activeResume && (
        <div className="pt-2">
          <ResumeAnalysisView resume={activeResume} />
        </div>
      )}
    </div>
  );
}
