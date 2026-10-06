"use client";

import { useState, useRef } from "react";
import { UploadCloud, File, X, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export function ResumeUpload({ onUploadSuccess, maxMb = 5 }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStep, setUploadStep] = useState(null); // 'uploading' | 'analyzing' | null
  const [errorMessage, setErrorMessage] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    setErrorMessage(null);
    if (!file) return false;

    // Check MIME and extension
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Only PDF files are supported.");
      toast.error("Only PDF files are supported.");
      return false;
    }

    // Check max size
    if (file.size > maxMb * 1024 * 1024) {
      const msg = `File is too large. Maximum allowed size is ${maxMb} MB.`;
      setErrorMessage(msg);
      toast.error(msg);
      return false;
    }

    if (file.size === 0) {
      const msg = "File is empty (0 bytes). Please upload a valid resume.";
      setErrorMessage(msg);
      toast.error(msg);
      return false;
    }

    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadStep("uploading");
      // Simulate stepped progression for Phase 1 UI demo
      await new Promise((r) => setTimeout(r, 1000));
      setUploadStep("analyzing");
      await new Promise((r) => setTimeout(r, 1400));

      toast.success("Resume uploaded and analyzed successfully!");
      setUploadStep(null);
      if (onUploadSuccess) {
        onUploadSuccess({
          id: "res_new_" + Date.now(),
          fileName: selectedFile.name,
          fileSizeBytes: selectedFile.size,
          createdAt: new Date().toISOString(),
        });
      }
      setSelectedFile(null);
    } catch {
      setUploadStep(null);
      setErrorMessage("Resume upload failed. Please check the file and try again.");
      toast.error("Resume upload failed. Please check the file and try again.");
    }
  };

  return (
    <Card className="bg-[#111936] border-[#232C52] text-slate-100">
      <CardContent className="p-6">
        <form
          onDragEnter={handleDrag}
          onSubmit={(e) => e.preventDefault()}
          className="space-y-4"
        >
          {/* Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            aria-label="Upload Resume Dropzone"
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 outline-none focus-visible:border-[#4F7CFF] ${
              dragActive
                ? "border-[#4F7CFF] bg-[#161F42]/80"
                : "border-[#232C52] hover:border-[#4F7CFF]/50 hover:bg-[#161F42]/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-[#161F42] border border-[#232C52] flex items-center justify-center text-[#4F7CFF] mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">
              Drop your resume or{" "}
              <span className="text-[#4F7CFF] underline underline-offset-2">
                browse
              </span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              PDF only, up to {maxMb} MB (Text-based, not scanned)
            </p>
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Selected file pill */}
          {selectedFile && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#161F42] border border-[#232C52]">
              <div className="flex items-center gap-2.5 truncate">
                <File className="w-4 h-4 text-[#4F7CFF] shrink-0" />
                <span className="text-xs font-semibold text-white truncate">
                  {selectedFile.name}
                </span>
                <span className="text-[11px] text-slate-400 shrink-0">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                disabled={uploadStep != null}
                className="text-slate-400 hover:text-red-400 p-1"
                aria-label="Remove selected resume"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Stepped Progress or Submit Button */}
          {uploadStep ? (
            <div className="p-4 rounded-xl bg-[#161F42] border border-[#232C52] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-white">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4F7CFF]" />
                  {uploadStep === "uploading"
                    ? "Uploading resume to Azure Blob..."
                    : "Analyzing your resume with AI..."}
                </span>
                <span className="text-slate-400">
                  {uploadStep === "uploading" ? "Step 1 of 2" : "Step 2 of 2"}
                </span>
              </div>
              <div className="w-full bg-[#0B1020] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r from-[#4F7CFF] to-[#8B5CF6] transition-all duration-700 ${
                    uploadStep === "uploading" ? "w-1/2" : "w-full"
                  }`}
                />
              </div>
            </div>
          ) : (
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile}
              className="w-full bg-[#4F7CFF] hover:bg-[#4F7CFF]/90 text-white font-semibold gap-2 py-5"
            >
              <UploadCloud className="w-4 h-4" />
              Upload & Analyze Resume
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
