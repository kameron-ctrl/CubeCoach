// Shared TypeScript types for CubeCoach

export type SolvingMethod = 'beginner' | 'cfop' | 'roux';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type MoodFlag = 'neutral' | 'frustrated' | 'progressing' | 'breakthrough';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  currentMethod: SolvingMethod;
  skillLevel: SkillLevel;
  streakDays: number;
  lastActive: Date;
  avgSolveTime: number;
}

export interface SolveSession {
  id: string;
  userId: string;
  cubeStateInput: string;
  solutionMoves: string[];
  totalMoves: number;
  optimalMoves: number;
  solveTimeSeconds: number | null;
  methodUsed: string;
  completed: boolean;
  createdAt: Date;
}

export interface AlgorithmMastery {
  id: string;
  userId: string;
  algorithmName: string;
  algorithmNotation: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReview: Date;
  lastReviewed: Date | null;
}

export interface CoachingInteraction {
  id: string;
  sessionId: string;
  stepNumber: number;
  moveSequence: string;
  coachingText: string;
  checkInQuestion: string;
  nextPhysicalAction: string;
  analogyUsed: string | null;
  moodFlag: MoodFlag;
  createdAt: Date;
}

export interface SolveStep {
  stepNumber: number;
  stepName: string;
  moves: string[];
  completed: boolean;
}
