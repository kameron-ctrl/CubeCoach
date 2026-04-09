"use client";

import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import FlashCard from "@/components/FlashCard";
import { getDueAlgorithms, getMasteryStats, mockAlgorithms } from "@/lib/mockData";
import type { AlgorithmMastery } from "@/lib/types";
import { Calendar, BookOpen, CheckCircle, Clock } from "lucide-react";

export default function FlashcardsPage() {
  const [dueAlgorithms, setDueAlgorithms] = useState<AlgorithmMastery[]>(getDueAlgorithms());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const masteryStats = getMasteryStats();

  const handleRate = (algorithmId: string, quality: number) => {
    console.log(`Rated ${algorithmId} with quality ${quality}`);
    setReviewedCount(reviewedCount + 1);
    if (currentIndex < dueAlgorithms.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
      setDueAlgorithms([]);
    }
  };

  const currentAlgorithm = dueAlgorithms[currentIndex];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Algorithm Practice</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Master your OLL and PLL algorithms with spaced repetition
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{masteryStats.total}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{masteryStats.mastered}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mastered</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{masteryStats.learning}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Learning</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dueAlgorithms.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Due Today</p>
              </div>
            </div>
          </div>
        </div>

        {dueAlgorithms.length > 0 && currentAlgorithm ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Session Progress</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {reviewedCount} / {dueAlgorithms.length} completed
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(reviewedCount / dueAlgorithms.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8">
              <div className="mb-4 text-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Card {currentIndex + 1} of {dueAlgorithms.length}
                </span>
              </div>
              <FlashCard algorithm={currentAlgorithm} onRate={handleRate} className="max-w-md mx-auto" />
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">All Caught Up! 🎉</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You&apos;ve reviewed all algorithms due today. Great work!
            </p>
            {reviewedCount > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You reviewed {reviewedCount} algorithm{reviewedCount !== 1 ? "s" : ""} in this session.
              </p>
            )}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">All Algorithms</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Notation</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Repetitions</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Ease</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Next Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {mockAlgorithms.slice(0, 10).map((alg) => {
                  const isDue = alg.nextReview <= new Date();
                  const mastery = Math.min(100, ((alg.easeFactor - 1.3) / (4.0 - 1.3)) * 100);
                  return (
                    <tr key={alg.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">{alg.algorithmName}</span>
                          {mastery >= 80 && (
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                              Mastered
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                          {alg.algorithmNotation.length > 30
                            ? alg.algorithmNotation.slice(0, 30) + "..."
                            : alg.algorithmNotation}
                        </code>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-900 dark:text-white">{alg.repetitions}</td>
                      <td className="py-3 px-4 text-center text-gray-900 dark:text-white">{alg.easeFactor.toFixed(1)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={isDue ? "text-red-600 dark:text-red-400 font-semibold" : "text-gray-600 dark:text-gray-400"}>
                          {alg.nextReview.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Showing 10 of {mockAlgorithms.length} algorithms
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
