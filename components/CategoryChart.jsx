"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CategoryChart({
  techAvg = 81,
  hrAvg = 74,
  resumeAvg = 79,
}) {
  const data = [
    { category: "Technical", score: techAvg, color: "#4F7CFF" },
    { category: "HR / Behavioral", score: hrAvg, color: "#8B5CF6" },
    { category: "Resume Experience", score: resumeAvg, color: "#22C55E" },
  ];

  return (
    <Card className="bg-[#111936] border-[#232C52] text-slate-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-white flex items-center justify-between">
          <span>Category Breakdown</span>
          <span className="text-xs font-normal text-slate-400">Average %</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#232C52" vertical={false} />
              <XAxis
                dataKey="category"
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "#232C52" }}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "#232C52" }}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip
                formatter={(val) => [`${val}%`, "Average Score"]}
                contentStyle={{
                  backgroundColor: "#0E152B",
                  borderColor: "#232C52",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#F1F5F9",
                }}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.category} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
