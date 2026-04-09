"use client";

import type { SolveSession } from "@/lib/types";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface ProgressChartProps {
  sessions: SolveSession[];
  className?: string;
}

export default function ProgressChart({ sessions = [], className = "" }: ProgressChartProps) {
  const chartData = sessions
    .filter((s) => s.solveTimeSeconds !== null)
    .slice(-30)
    .map((session, i) => ({
      id: `${session.id}-${i}`,
      index: i + 1,
      time: session.solveTimeSeconds,
      date: session.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));

  const times = sessions.filter((s) => s.solveTimeSeconds !== null).map((s) => s.solveTimeSeconds as number);
  const avgTime = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  const bestTime = times.length > 0 ? Math.min(...times) : 0;
  const recentAvg = times.slice(-5).length > 0
    ? times.slice(-5).reduce((a, b) => a + b, 0) / times.slice(-5).length
    : 0;

  if (chartData.length === 0) {
    return (
      <div className={className}>
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Solve Time Progress</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No solve data available yet. Start solving to see your progress!
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Solve Time Progress</h3>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Best Time</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{bestTime.toFixed(1)}s</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-600 dark:text-green-400 mb-1">Average</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{avgTime.toFixed(1)}s</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Recent Avg (Last 5)</p>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{recentAvg.toFixed(1)}s</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="index" tick={{ fontSize: 12, fill: "#9ca3af" }} stroke="#9ca3af"
              label={{ value: "Solve Number", position: "insideBottom", offset: -5, fill: "#9ca3af" }} />
            <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} stroke="#9ca3af"
              label={{ value: "Time (seconds)", angle: -90, position: "insideLeft", fill: "#9ca3af" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
              formatter={(value: number) => [`${value.toFixed(1)}s`, "Solve Time"]}
              labelFormatter={(label) => `Solve #${label}`}
            />
            <Line key="solve-time-line" type="monotone" dataKey="time" stroke="#3b82f6" strokeWidth={3}
              dot={{ fill: "#3b82f6", r: 4 }} activeDot={{ r: 6 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Total solves: {sessions.length}
      </div>
    </div>
  );
}
