import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockUser, mockDashboardStats } from "@/lib/mock-data";
import { Mail, Calendar, LogOut, Award, BookOpen, TrendingUp, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="max-w-3xl mx-auto py-4 space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Candidate Profile
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          View your session identity, membership status, and preparation achievements.
        </p>
      </div>

      {/* User Information Card */}
      <Card className="bg-[#111936] border-[#232C52] text-slate-100 shadow-md">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="w-20 h-20 border-2 border-[#4F7CFF] bg-[#161F42]">
              <AvatarFallback className="bg-[#161F42] text-white text-2xl font-bold">
                JA
              </AvatarFallback>
            </Avatar>

            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {mockUser.name}
                </h3>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    {mockUser.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Joined {mockUser.memberSince}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                <Badge variant="outline" className="bg-[#161F42] border-[#232C52] text-slate-200 text-xs">
                  Full Stack Candidate
                </Badge>
                <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-xs">
                  Active Session
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#111936] border-[#232C52] text-slate-100 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Total Sessions</span>
            <BookOpen className="w-4 h-4 text-[#4F7CFF]" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">
            {mockDashboardStats.totalInterviews}
          </p>
          <span className="text-[11px] text-slate-400">Completed interviews</span>
        </Card>

        <Card className="bg-[#111936] border-[#232C52] text-slate-100 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Average Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">
            {mockDashboardStats.avgScore}%
          </p>
          <span className="text-[11px] text-slate-400">Overall proficiency</span>
        </Card>

        <Card className="bg-[#111936] border-[#232C52] text-slate-100 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Best Score</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">
            {mockDashboardStats.bestScore}%
          </p>
          <span className="text-[11px] text-slate-400">Top performance</span>
        </Card>
      </div>

      {/* Session Security & Log Out Action */}
      <Card className="bg-[#111936] border-[#232C52] text-slate-100">
        <CardHeader className="pb-3 border-b border-[#232C52]">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#4F7CFF]" />
            Session Security
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-slate-400 max-w-md">
            Your session is secured using an <code className="text-[#4F7CFF]">httpOnly</code> signed JWT cookie with HS256 encryption. Passwords are never returned in responses.
          </p>

          <Link href="/login">
            <Button
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-2 shrink-0 text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Sign Out of Account
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
