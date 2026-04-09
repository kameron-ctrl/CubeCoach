import type { SolveStep, MoodFlag } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

export interface CoachExplainResponse {
  coaching_text: string;
  check_in_question: string;
  next_physical_action: string;
  analogy_used: string | null;
  introduced_notation: string[];
  mood_flag: MoodFlag;
}

export interface SolveSubmitResponse {
  session_id: number;
  total_moves: number;
  optimal_moves: number;
  steps: SolveStep[];
  method_used: string;
}

export interface BackendUser {
  id: number;
  username: string;
  email: string;
  current_method: string;
  skill_level: string;
  streak_days: number;
}

export interface FlashcardData {
  id: number;
  algorithm_name: string;
  algorithm_notation: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review: string;
  last_reviewed: string | null;
}

export interface FlashcardStats {
  total: number;
  due: number;
  mastered: number;
  learning: number;
}

export const api = {
  auth: {
    me: () => request<BackendUser>("/auth/me"),
  },
  solve: {
    submit: (cubeState: string, method: string) =>
      request<SolveSubmitResponse>("/solve/submit", {
        method: "POST",
        body: JSON.stringify({ cube_state: cubeState, method }),
      }),
    complete: (sessionId: number, solveTime: number) =>
      request("/solve/complete", {
        method: "POST",
        body: JSON.stringify({ session_id: sessionId, solve_time_seconds: solveTime }),
      }),
  },
  coach: {
    explain: (data: {
      session_id: number;
      step_number: number;
      cube_state: string;
      move_sequence: string;
      step_name: string;
    }) =>
      request<CoachExplainResponse>("/coach/explain", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  flashcards: {
    due: () => request<FlashcardData[]>("/flashcards/due"),
    all: () => request<FlashcardData[]>("/flashcards/all"),
    stats: () => request<FlashcardStats>("/flashcards/stats"),
    review: (algorithmId: string, quality: number) =>
      request("/flashcards/review", {
        method: "POST",
        body: JSON.stringify({ algorithm_id: algorithmId, quality }),
      }),
  },
};
