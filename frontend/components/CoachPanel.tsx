"use client";

import type { CoachingInteraction, MoodFlag } from "@/lib/types";
import { MessageCircle, Target, Sparkles, AlertCircle } from "lucide-react";
import { useState } from "react";

interface CoachPanelProps {
  coaching: CoachingInteraction;
  onNextStep?: () => void;
  className?: string;
}

const moodColors: Record<MoodFlag, string> = {
  neutral: "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400",
  progressing: "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400",
  breakthrough: "border-amber-500 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-400",
  frustrated: "border-gray-500 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-400",
};

const moodIcons: Record<MoodFlag, typeof MessageCircle> = {
  neutral: MessageCircle,
  progressing: Sparkles,
  breakthrough: Target,
  frustrated: AlertCircle,
};

export default function CoachPanel({ coaching, onNextStep, className = "" }: CoachPanelProps) {
  const [understood, setUnderstood] = useState(false);
  const MoodIcon = moodIcons[coaching.moodFlag];

  return (
    <div className={`${className} space-y-4`}>
      {/* Main coaching text */}
      <div className={`border-l-4 rounded-lg p-6 ${moodColors[coaching.moodFlag]}`}>
        <div className="flex items-start gap-3">
          <MoodIcon className="w-6 h-6 mt-1 flex-shrink-0 text-gray-700 dark:text-gray-300" />
          <div className="flex-1 space-y-3">
            <p className="leading-relaxed text-gray-900 dark:text-gray-100">{coaching.coachingText}</p>
            {coaching.analogyUsed && (
              <p className="text-sm italic opacity-80 text-gray-700 dark:text-gray-300">
                💡 Think of it like: {coaching.analogyUsed}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Check-in question */}
      <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
        <h4 className="text-sm opacity-60 mb-2 text-gray-700 dark:text-gray-300">Check your understanding:</h4>
        <p className="italic text-gray-900 dark:text-gray-100">{coaching.checkInQuestion}</p>
      </div>

      {/* Next physical action */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm opacity-90 mb-1">Next Action:</h4>
            <p>{coaching.nextPhysicalAction}</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setUnderstood(true)}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
            understood
              ? "bg-green-500 text-white"
              : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
          }`}
        >
          {understood ? "✓ Got it!" : "I understand"}
        </button>
        {understood && onNextStep && (
          <button
            onClick={onNextStep}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Next Step →
          </button>
        )}
      </div>
    </div>
  );
}
