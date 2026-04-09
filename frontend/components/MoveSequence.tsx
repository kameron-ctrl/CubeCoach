"use client";

import type { SolveStep } from "@/lib/types";
import { CheckCircle2, Circle } from "lucide-react";

interface MoveSequenceProps {
  steps: SolveStep[];
  currentStep: number;
  onStepClick?: (stepNumber: number) => void;
  className?: string;
}

export default function MoveSequence({ steps, currentStep, onStepClick, className = "" }: MoveSequenceProps) {
  return (
    <div className={`${className} space-y-3`}>
      <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Solution Steps</h3>

      {steps.map((step) => {
        const isCurrent = step.stepNumber === currentStep;
        const isPast = step.stepNumber < currentStep;

        return (
          <div
            key={step.stepNumber}
            onClick={() => isPast && onStepClick?.(step.stepNumber)}
            className={`border rounded-lg p-4 transition-all ${
              isCurrent
                ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 shadow-md"
                : isPast
                ? "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 opacity-60 cursor-pointer hover:opacity-80"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 opacity-40"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Circle
                    className={`w-5 h-5 ${
                      isCurrent ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"
                    }`}
                  />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    <span className="text-sm opacity-60 mr-2">Step {step.stepNumber}</span>
                    {step.stepName}
                  </h4>
                  <span className="text-sm opacity-60 text-gray-600 dark:text-gray-400">
                    {step.moves.length} moves
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {step.moves.map((move, i) => (
                    <span
                      key={i}
                      className={`px-2.5 py-1 rounded text-sm font-mono ${
                        isCurrent
                          ? "bg-blue-600 dark:bg-blue-500 text-white"
                          : isPast
                          ? "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {move}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
