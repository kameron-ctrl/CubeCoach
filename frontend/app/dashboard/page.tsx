"use client";

import AppLayout from "@/components/AppLayout";
import ProgressChart from "@/components/ProgressChart";
import { mockSolveSessions, mockAlgorithms, getMasteryStats, mockUser } from "@/lib/mockData";
import { Trophy, TrendingUp, Target, Award } from "lucide-react";

export default function DashboardPage() {
  const masteryStats = getMasteryStats();

  const algorithmsWithMastery = mockAlgorithms.map((alg) => {
    const mastery = Math.min(100, ((alg.easeFactor - 1.3) / (4.0 - 1.3)) * 100);
    return { ...alg, mastery };
  });

  const ollAlgorithms = algorithmsWithMastery.filter((alg) => alg.algorithmName.includes("OLL"));
  const pllAlgorithms = algorithmsWithMastery.filter((alg) => alg.algorithmName.includes("PLL"));

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return "bg-green-500";
    if (mastery >= 60) return "bg-green-400";
    if (mastery >= 40) return "bg-yellow-400";
    if (mastery >= 20) return "bg-orange-400";
    return "bg-gray-300";
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Welcome back, {mockUser.username}! 👋</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Keep up your {mockUser.streakDays}-day streak and continue improving your times!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 opacity-80" />
              <span className="text-2xl font-bold">{mockUser.streakDays}</span>
            </div>
            <p className="text-sm opacity-90">Day Streak</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <span className="text-2xl font-bold">{mockUser.avgSolveTime}s</span>
            </div>
            <p className="text-sm opacity-90">Avg Solve Time</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 opacity-80" />
              <span className="text-2xl font-bold">{mockSolveSessions.length}</span>
            </div>
            <p className="text-sm opacity-90">Total Solves</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 opacity-80" />
              <span className="text-2xl font-bold">{masteryStats.mastered}</span>
            </div>
            <p className="text-sm opacity-90">Mastered Algorithms</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <ProgressChart sessions={mockSolveSessions} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Algorithm Mastery</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium mb-4 flex items-center justify-between text-gray-900 dark:text-white">
                <span>OLL Algorithms</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{ollAlgorithms.length} total</span>
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {ollAlgorithms.map((alg) => (
                  <div key={alg.id}
                    className={`aspect-square rounded-md ${getMasteryColor(alg.mastery)} transition-all hover:scale-110 hover:shadow-lg cursor-pointer relative group`}
                    title={`${alg.algorithmName} - ${Math.round(alg.mastery)}% mastered`}>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 rounded-md transition-opacity">
                      <span className="text-xs text-white font-bold">{alg.algorithmName.split("-")[1]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-4 flex items-center justify-between text-gray-900 dark:text-white">
                <span>PLL Algorithms</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{pllAlgorithms.length} total</span>
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {pllAlgorithms.map((alg) => (
                  <div key={alg.id}
                    className={`aspect-square rounded-md ${getMasteryColor(alg.mastery)} transition-all hover:scale-110 hover:shadow-lg cursor-pointer relative group`}
                    title={`${alg.algorithmName} - ${Math.round(alg.mastery)}% mastered`}>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 rounded-md transition-opacity">
                      <span className="text-xs text-white font-bold">{alg.algorithmName.split("-")[1]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-300 rounded" /><span className="text-gray-600 dark:text-gray-400">New (0-20%)</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-400 rounded" /><span className="text-gray-600 dark:text-gray-400">Learning (20-40%)</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-400 rounded" /><span className="text-gray-600 dark:text-gray-400">Familiar (40-60%)</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-400 rounded" /><span className="text-gray-600 dark:text-gray-400">Good (60-80%)</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded" /><span className="text-gray-600 dark:text-gray-400">Mastered (80-100%)</span></div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Current Skill Level</h3>
              <p className="text-3xl font-bold capitalize">{mockUser.skillLevel}</p>
              <p className="text-sm opacity-90 mt-2">Method: {mockUser.currentMethod.toUpperCase()}</p>
            </div>
            <div className="text-right opacity-90">
              <p className="text-sm">Last assessed</p>
              <p className="font-medium">April 1, 2026</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
