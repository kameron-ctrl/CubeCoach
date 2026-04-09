"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Timer, Play, Pause, RotateCcw, Send, Loader2 } from "lucide-react";
import { SOLVED_STATE } from "@/lib/cubeState";
import AppLayout from "@/components/AppLayout";
import CoachPanel from "@/components/CoachPanel";
import MoveSequence from "@/components/MoveSequence";
import { api } from "@/lib/api";
import type { CoachExplainResponse } from "@/lib/api";
import type { SolveStep, CoachingInteraction } from "@/lib/types";
import { mockCoachingInteraction, mockSolveSteps, mockCurrentSession } from "@/lib/mockData";

const CubeCanvas = dynamic(() => import("@/components/CubeCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center">
      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 animate-pulse" />
    </div>
  ),
});

export default function SolvePage() {
  const [cubeState, setCubeState] = useState(SOLVED_STATE);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [steps, setSteps] = useState<SolveStep[]>(mockSolveSteps);
  const [currentStep, setCurrentStep] = useState(3);
  const [totalMoves, setTotalMoves] = useState(mockCurrentSession.totalMoves);
  const [optimalMoves, setOptimalMoves] = useState(mockCurrentSession.optimalMoves);
  const [methodUsed, setMethodUsed] = useState("cfop");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Coach state
  const [coaching, setCoaching] = useState<CoachingInteraction>(mockCoachingInteraction);
  const [coachLoading, setCoachLoading] = useState(false);

  // Timer
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerRunning]);

  const handleSubmitCube = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await api.solve.submit(cubeState, methodUsed);
      setSessionId(res.session_id);
      // Map backend steps to our camelCase type
      const mappedSteps: SolveStep[] = res.steps.map((s: Record<string, unknown>, i: number) => ({
        stepNumber: (s.step_number as number) ?? (s.stepNumber as number) ?? i + 1,
        stepName: (s.step_name as string) ?? (s.stepName as string) ?? `Step ${i + 1}`,
        moves: (s.moves as string[]) ?? [],
        completed: false,
      }));
      setSteps(mappedSteps);
      setTotalMoves(res.total_moves);
      setOptimalMoves(res.optimal_moves);
      setCurrentStep(1);
      setIsTimerRunning(true);
      setElapsedTime(0);
      fetchCoaching(res.session_id, mappedSteps[0]);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchCoaching = async (sessId: number, step: SolveStep) => {
    setCoachLoading(true);
    try {
      const res: CoachExplainResponse = await api.coach.explain({
        session_id: sessId,
        step_number: step.stepNumber,
        cube_state: cubeState,
        move_sequence: step.moves.join(" "),
        step_name: step.stepName,
      });
      setCoaching({
        id: "live",
        sessionId: String(sessId),
        stepNumber: step.stepNumber,
        moveSequence: step.moves.join(" "),
        coachingText: res.coaching_text,
        checkInQuestion: res.check_in_question,
        nextPhysicalAction: res.next_physical_action,
        analogyUsed: res.analogy_used,
        moodFlag: res.mood_flag,
        createdAt: new Date(),
      });
    } catch {
      setCoaching(mockCoachingInteraction);
    } finally {
      setCoachLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      const nextIdx = currentStep;
      setCurrentStep(currentStep + 1);
      if (sessionId && steps[nextIdx]) fetchCoaching(sessionId, steps[nextIdx]);
    } else {
      setIsTimerRunning(false);
      if (sessionId) api.solve.complete(sessionId, elapsedTime).catch(() => {});
    }
  };

  const handleStepClick = (stepNumber: number) => {
    setCurrentStep(stepNumber);
    if (sessionId && steps[stepNumber - 1]) fetchCoaching(sessionId, steps[stepNumber - 1]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Practice Session</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {sessionId
                ? "Follow along with the AI coach to solve your cube step by step"
                : "Set your cube state below, then click Solve to start a coached session"}
            </p>
          </div>

          {/* Timer */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-4">
            <div className="text-center">
              <div className="flex items-center gap-2 text-2xl font-mono font-bold text-gray-900 dark:text-white">
                <Timer className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                {formatTime(elapsedTime)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Solve Time</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`p-2 rounded-lg transition-colors ${
                  isTimerRunning
                    ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                    : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                }`}
              >
                {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button
                onClick={() => { setIsTimerRunning(false); setElapsedTime(0); }}
                className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main solving interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side - 3D Cube and Move Sequence */}
          <div className="space-y-6">
            {/* 3D Cube */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Interactive Cube</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">Click facelets to set colors, drag to rotate</span>
              </div>
              <div className="w-full h-96 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                <CubeCanvas cubeState={cubeState} onStateChange={setCubeState} autoRotate={false} />
              </div>
              {/* Submit button */}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleSubmitCube}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {isSubmitting ? "Solving..." : "Solve This Cube"}
                </button>
                <select
                  value={methodUsed}
                  onChange={(e) => setMethodUsed(e.target.value)}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                >
                  <option value="beginner">Beginner</option>
                  <option value="cfop">CFOP</option>
                </select>
              </div>
              {submitError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{submitError}</p>
              )}
            </div>

            {/* Session info */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-6">
              <h3 className="font-semibold mb-4">Session Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm opacity-80">Total Moves</p>
                  <p className="text-2xl font-bold">{totalMoves}</p>
                </div>
                <div>
                  <p className="text-sm opacity-80">Optimal</p>
                  <p className="text-2xl font-bold">{optimalMoves}</p>
                </div>
                <div>
                  <p className="text-sm opacity-80">Current Step</p>
                  <p className="text-2xl font-bold">{currentStep} / {steps.length}</p>
                </div>
                <div>
                  <p className="text-sm opacity-80">Method</p>
                  <p className="text-2xl font-bold">{methodUsed.toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* Move Sequence */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <MoveSequence steps={steps} currentStep={currentStep} onStepClick={handleStepClick} />
            </div>
          </div>

          {/* Right side - Coaching Panel */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 sticky top-24">
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">AI Coach</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Personalized guidance for step {currentStep}: {steps[currentStep - 1]?.stepName}
                </p>
              </div>

              {coachLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="ml-3 text-gray-500">Thinking...</span>
                </div>
              ) : (
                <CoachPanel coaching={coaching} onNextStep={handleNextStep} />
              )}

              {/* Progress indicator */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.round((currentStep / steps.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
