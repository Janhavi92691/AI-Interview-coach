"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-[#232C52] bg-[#0E152B] p-3 shadow-xl text-xs">
        <p className="font-bold text-white mb-1">{data.role}</p>
        <p className="text-slate-400">Date: <span className="text-slate-200">{data.date}</span></p>
        <p className="text-[#4F7CFF] font-semibold mt-1">Score: {data.score}%</p>
      </div>
    );
  }
  return null;
}

export function PerformanceChart({ data = [] }) {
  return (
    <Card className="bg-[#111936] border-[#232C52] text-slate-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-white flex items-center justify-between">
          <span>Performance Over Time</span>
          <span className="text-xs font-normal text-slate-400">Last 10 sessions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-64 w-full">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No completed interview data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232C52" vertical={false} />
                <XAxis
                  dataKey="date"
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
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#4F7CFF"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#4F7CFF", stroke: "#0B1020", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#8B5CF6", stroke: "#F1F5F9", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
