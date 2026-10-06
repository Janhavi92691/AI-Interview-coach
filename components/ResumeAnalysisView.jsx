import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Code2,
  Cpu,
  FolderGit2,
  GraduationCap,
  Award,
  Briefcase,
  Play,
} from "lucide-react";

export function ResumeAnalysisView({ resume }) {
  if (!resume || !resume.analysis) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 bg-[#111936] rounded-xl border border-[#232C52]">
        No structured resume analysis available.
      </div>
    );
  }

  const { analysis } = resume;

  return (
    <div className="space-y-6">
      {/* Header with CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-[#232C52] bg-[#111936]">
        <div>
          <h3 className="text-base font-bold text-white">
            Resume Analysis: {resume.fileName}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            AI extracted skills, technical proficiencies, and experience highlights.
          </p>
        </div>
        <Link href={`/interview/new?type=resume&resumeId=${resume.id}`}>
          <Button className="bg-[#4F7CFF] hover:bg-[#4F7CFF]/90 text-white font-semibold gap-2 shadow-sm shrink-0">
            <Play className="w-4 h-4 fill-current" />
            Start Resume-Based Interview
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Skills */}
        <Card className="bg-[#111936] border-[#232C52] text-slate-100">
          <CardHeader className="pb-3 border-b border-[#232C52]">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#4F7CFF]" />
              Core Competencies & Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {analysis.skills?.length > 0 ? (
                analysis.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="bg-[#161F42] border-[#232C52] text-slate-200 text-xs px-2.5 py-1"
                  >
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-slate-500">None detected</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Technologies */}
        <Card className="bg-[#111936] border-[#232C52] text-slate-100">
          <CardHeader className="pb-3 border-b border-[#232C52]">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#8B5CF6]" />
              Technologies & Frameworks
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {analysis.technologies?.length > 0 ? (
                analysis.technologies.map((tech) => (
                  <Badge
                    key={tech}
                    variant="outline"
                    className="bg-purple-500/10 border-purple-500/30 text-purple-300 text-xs px-2.5 py-1"
                  >
                    {tech}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-slate-500">None detected</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects */}
      <Card className="bg-[#111936] border-[#232C52] text-slate-100">
        <CardHeader className="pb-3 border-b border-[#232C52]">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-[#4F7CFF]" />
            Highlighted Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-3">
          {analysis.projects?.length > 0 ? (
            analysis.projects.map((proj, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-[#161F42] border border-[#232C52] space-y-1"
              >
                <span className="text-xs font-bold text-white block">
                  {proj.name}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {proj.summary}
                </p>
              </div>
            ))
          ) : (
            <span className="text-xs text-slate-500">No project summaries found</span>
          )}
        </CardContent>
      </Card>

      {/* Experience, Education & Certifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Experience */}
        <Card className="bg-[#111936] border-[#232C52] text-slate-100 md:col-span-1">
          <CardHeader className="pb-3 border-b border-[#232C52]">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {analysis.experience?.length > 0 ? (
              analysis.experience.map((exp, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="text-xs font-bold text-white block">
                    {exp.title}
                  </span>
                  <span className="text-[11px] text-[#4F7CFF] block">
                    {exp.organization}
                  </span>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {exp.summary}
                  </p>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-500">No experience listed</span>
            )}
          </CardContent>
        </Card>

        {/* Education */}
        <Card className="bg-[#111936] border-[#232C52] text-slate-100 md:col-span-1">
          <CardHeader className="pb-3 border-b border-[#232C52]">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {analysis.education?.length > 0 ? (
              analysis.education.map((edu, idx) => (
                <div key={idx} className="text-xs text-slate-200">
                  {edu}
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-500">None detected</span>
            )}
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card className="bg-[#111936] border-[#232C52] text-slate-100 md:col-span-1">
          <CardHeader className="pb-3 border-b border-[#232C52]">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-[#8B5CF6]" />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {analysis.certifications?.length > 0 ? (
              analysis.certifications.map((cert, idx) => (
                <div key={idx} className="text-xs text-slate-200">
                  {cert}
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-500">None detected</span>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
