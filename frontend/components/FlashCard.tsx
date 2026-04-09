"use client";

import type { AlgorithmMastery } from "@/lib/types";
import { useState } from "react";
import { RotateCcw } from "lucide-react";

interface FlashCardProps {
  algorithm: AlgorithmMastery;
  onRate: (algorithmId: string, quality: number) => void;
  className?: string;
}

const qualityOptions = [
  { label: "Again", quality: 1, color: "bg-red-500 hover:bg-red-600" },
  { label: "Hard", quality: 3, color: "bg-orange-500 hover:bg-orange-600" },
  { label: "Good", quality: 4, color: "bg-green-500 hover:bg-green-600" },
  { label: "Easy", quality: 5, color: "bg-blue-500 hover:bg-blue-600" },
];

export default function FlashCard({ algorithm, onRate, className = "" }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleRate = (quality: number) => {
    setShowResult(true);
    setTimeout(() => {
      onRate(algorithm.id, quality);
      setIsFlipped(false);
      setShowResult(false);
    }, 1000);
  };

  const handleFlip = () => {
    if (!showResult) setIsFlipped(!isFlipped);
  };

  const getPattern = (name: string) => {
    if (name.includes("OLL")) return "🔶";
    if (name.includes("PLL")) return "🔷";
    return "◇";
  };

  return (
    <div className={`${className}`} style={{ perspective: "1000px" }}>
      <div
        className="relative w-full h-80 cursor-pointer transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
        onClick={handleFlip}
      >
        {/* Front */}
        <div
          className="absolute inset-0 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="text-6xl mb-6">{getPattern(algorithm.algorithmName)}</span>
          <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{algorithm.algorithmName}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {algorithm.repetitions > 0 ? `Reviewed ${algorithm.repetitions} times` : "New algorithm"}
          </p>
          <div className="mt-auto text-sm text-gray-400 dark:text-gray-500 flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Click to reveal notation
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <h3 className="text-xl font-bold mb-6">{algorithm.algorithmName}</h3>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 mb-8">
            <p className="text-lg font-mono text-center leading-relaxed">{algorithm.algorithmNotation}</p>
          </div>

          {!showResult ? (
            <div className="w-full space-y-3">
              <p className="text-sm text-center mb-2 opacity-90">How well did you know this?</p>
              <div className="grid grid-cols-2 gap-2">
                {qualityOptions.map((option) => (
                  <button
                    key={option.quality}
                    onClick={(e) => { e.stopPropagation(); handleRate(option.quality); }}
                    className={`${option.color} text-white px-4 py-3 rounded-lg font-medium transition-colors`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center"><p className="text-lg">✓ Recorded!</p></div>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Ease Factor</p>
          <p className="font-semibold text-gray-900 dark:text-white">{algorithm.easeFactor.toFixed(1)}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Interval</p>
          <p className="font-semibold text-gray-900 dark:text-white">{algorithm.intervalDays}d</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Next Review</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {algorithm.nextReview.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </div>
      </div>
    </div>
  );
}
