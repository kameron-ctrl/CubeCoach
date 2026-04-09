import type { UserProfile, SolveSession, AlgorithmMastery, CoachingInteraction, SolveStep } from './types';

// Deterministic pseudo-random to avoid SSR/client hydration mismatch
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export const mockUser: UserProfile = {
  id: 'user-1',
  username: 'CubeNewbie',
  email: 'user@example.com',
  currentMethod: 'cfop',
  skillLevel: 'intermediate',
  streakDays: 12,
  lastActive: new Date('2026-04-09'),
  avgSolveTime: 45.3,
};

export const mockSolveSessions: SolveSession[] = Array.from({ length: 30 }, (_, i) => ({
  id: `session-${i}`,
  userId: 'user-1',
  cubeStateInput: 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB',
  solutionMoves: ['R', 'U', "R'", 'U', "R'", 'F', "R'", "F'", 'R'],
  totalMoves: Math.floor(seededRandom(i * 3 + 1) * 40) + 40,
  optimalMoves: Math.floor(seededRandom(i * 3 + 2) * 10) + 20,
  solveTimeSeconds: seededRandom(i * 3 + 3) * 30 + 30 + (30 - i) * 0.5,
  methodUsed: 'cfop',
  completed: true,
  createdAt: new Date(Date.UTC(2026, 3, 9) - (29 - i) * 24 * 60 * 60 * 1000),
}));

const ollAlgorithms = [
  { name: 'OLL-1', notation: "R U2 R' U' R U' R'" },
  { name: 'OLL-2', notation: "F R U R' U' F' f R U R' U' f'" },
  { name: 'OLL-21', notation: "R U R' U R U' R' U R U2 R'" },
  { name: 'OLL-22', notation: "R U2 R2 U' R2 U' R2 U2 R" },
  { name: 'OLL-23', notation: "R2 D R' U2 R D' R' U2 R'" },
  { name: 'OLL-24', notation: "r U R' U' r' F R F'" },
  { name: 'OLL-25', notation: "F' r U R' U' r' F R" },
  { name: 'OLL-26', notation: "R U2 R' U' R U' R'" },
  { name: 'OLL-27', notation: "R U R' U R U2 R'" },
  { name: 'OLL-45', notation: "F R U R' U' F'" },
];

const pllAlgorithms = [
  { name: 'PLL-Aa', notation: "x R' U R' D2 R U' R' D2 R2 x'" },
  { name: 'PLL-Ab', notation: "x R2 D2 R U R' D2 R U' R x'" },
  { name: 'PLL-T', notation: "R U R' U' R' F R2 U' R' U' R U R' F'" },
  { name: 'PLL-Ja', notation: "x R2 F R F' R U2 r' U r U2 x'" },
  { name: 'PLL-Jb', notation: "R U R' F' R U R' U' R' F R2 U' R'" },
  { name: 'PLL-Ra', notation: "R U R' F' R U2 R' U2 R' F R U R U2 R'" },
  { name: 'PLL-Rb', notation: "R' U2 R U2 R' F R U R' U' R' F' R2" },
  { name: 'PLL-F', notation: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R" },
  { name: 'PLL-Ua', notation: "R U' R U R U R U' R' U' R2" },
  { name: 'PLL-Ub', notation: "R2 U R U R' U' R' U' R' U R'" },
];

export const mockAlgorithms: AlgorithmMastery[] = [
  ...ollAlgorithms,
  ...pllAlgorithms,
].map((alg, i) => ({
  id: `alg-${i}`,
  userId: 'user-1',
  algorithmName: alg.name,
  algorithmNotation: alg.notation,
  easeFactor: +(2.5 + seededRandom(i * 7 + 100) * 0.5).toFixed(2),
  intervalDays: Math.floor(seededRandom(i * 7 + 101) * 10) + 1,
  repetitions: Math.floor(seededRandom(i * 7 + 102) * 5),
  nextReview: new Date(Date.UTC(2026, 3, 9) + Math.floor(seededRandom(i * 7 + 103) * 7) * 24 * 60 * 60 * 1000),
  lastReviewed: seededRandom(i * 7 + 104) > 0.3
    ? new Date(Date.UTC(2026, 3, 9) - Math.floor(seededRandom(i * 7 + 105) * 3) * 24 * 60 * 60 * 1000)
    : null,
}));

export const mockCurrentSession: SolveSession = {
  id: 'current-session',
  userId: 'user-1',
  cubeStateInput: 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB',
  solutionMoves: ['F', 'R', 'U', "R'", "U'", "F'", 'U', 'R', 'U', "R'"],
  totalMoves: 10,
  optimalMoves: 8,
  solveTimeSeconds: null,
  methodUsed: 'cfop',
  completed: false,
  createdAt: new Date('2026-04-09'),
};

export const mockSolveSteps: SolveStep[] = [
  { stepNumber: 1, stepName: 'White Cross', moves: ['F', 'R', 'U'], completed: true },
  { stepNumber: 2, stepName: 'F2L Pair 1', moves: ["R'", "U'", "F'"], completed: true },
  { stepNumber: 3, stepName: 'F2L Pair 2', moves: ['U', 'R', 'U'], completed: false },
  { stepNumber: 4, stepName: 'F2L Pair 3', moves: ["R'", 'U2', 'R'], completed: false },
  { stepNumber: 5, stepName: 'F2L Pair 4', moves: ['U', "R'", 'F', "R'"], completed: false },
  { stepNumber: 6, stepName: 'OLL', moves: ['R', 'U', "R'", 'U', 'R', 'U2', "R'"], completed: false },
  { stepNumber: 7, stepName: 'PLL', moves: ['R', 'U', "R'", "F'", 'R', 'U', "R'"], completed: false },
];

export const mockCoachingInteraction: CoachingInteraction = {
  id: 'coaching-1',
  sessionId: 'current-session',
  stepNumber: 3,
  moveSequence: "U R U R'",
  coachingText:
    "Great progress! You've completed the white cross and two F2L pairs. Now let's tackle the third pair. Notice how the corner and edge pieces are positioned—they're like puzzle pieces that need to connect.",
  checkInQuestion: 'Can you spot where the orange-white corner piece is located?',
  nextPhysicalAction: 'Rotate the top layer (U) to bring the corner above its target slot.',
  analogyUsed: 'puzzle pieces connecting',
  moodFlag: 'progressing',
  createdAt: new Date('2026-04-09'),
};

export const getDueAlgorithms = (): AlgorithmMastery[] => {
  const now = new Date('2026-04-09');
  return mockAlgorithms.filter((alg) => alg.nextReview <= now).slice(0, 5);
};

export const getMasteryStats = () => {
  const total = mockAlgorithms.length;
  const mastered = mockAlgorithms.filter((alg) => alg.easeFactor > 2.8 && alg.repetitions >= 3).length;
  const learning = mockAlgorithms.filter(
    (alg) => alg.repetitions > 0 && (alg.easeFactor <= 2.8 || alg.repetitions < 3)
  ).length;
  const new_ = mockAlgorithms.filter((alg) => alg.repetitions === 0).length;
  return { total, mastered, learning, new: new_ };
};
