"use client";

import { cn } from "@/lib/utils";

export function ScoreRing({ score = 0, max = 100, size = 140, strokeWidth = 10, className }) {
  const percentage = Math.min(100, Math.max(0, Math.round((score / max) * 100)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let colorClass = "text-emerald-500 stroke-emerald-500";
  let labelText = "Strong Performance";

  if (percentage < 60) {
    colorClass = "text-red-500 stroke-red-500";
    labelText = "Needs Work";
  } else if (percentage < 80) {
    colorClass = "text-amber-500 stroke-amber-500";
    labelText = "Proficient";
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-[#161F42]"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Indicator */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={cn("transition-all duration-1000 ease-out", colorClass)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {score}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            out of {max}
          </span>
        </div>
      </div>
      <span className={cn("mt-2 text-xs font-semibold", colorClass.split(" ")[0])}>
        {labelText}
      </span>
    </div>
  );
}
