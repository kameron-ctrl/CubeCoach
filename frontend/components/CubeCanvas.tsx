"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════ */

const DEFAULT_STATE = "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB";

const HEX_MAP: Record<string, string> = {
  U: "#FFFFFF",
  R: "#B90000",
  F: "#009B48",
  D: "#FFD500",
  L: "#FF5900",
  B: "#0045AD",
};

const FACE_LETTERS = ["U", "R", "F", "D", "L", "B"] as const;
const CENTER_INDICES = [4, 13, 22, 31, 40, 49]; // center of each face

function letterToHex(ch: string): string {
  return HEX_MAP[ch] ?? "#333333";
}

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface CubeCanvasProps {
  cubeState?: string;
  onStateChange?: (state: string) => void;
  autoRotate?: boolean;
  movesToPlay?: string[];
  playTrigger?: number;
  resetTrigger?: number;
}

type FaceletClickHandler = (faceletIndex: number) => void;

/* ═══════════════════════════════════════════════════════════════════════════
   RENDERING CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════ */

const CUBIE_SIZE = 0.95;
const CUBIE_GAP = 1.0;
const FACELET_OFFSET = 0.501;
const FACELET_SIZE = 0.85;
const BORDER_COLOR = "#0d0d1a";

const COLOR_PICKER_OPTIONS = [
  { face: "U", color: "#FFFFFF", label: "White" },
  { face: "R", color: "#B90000", label: "Red" },
  { face: "F", color: "#009B48", label: "Green" },
  { face: "D", color: "#FFD500", label: "Yellow" },
  { face: "L", color: "#FF5900", label: "Orange" },
  { face: "B", color: "#0045AD", label: "Blue" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   CUBE STATE VALIDATION
   ═══════════════════════════════════════════════════════════════════════════ */

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validateCubeState(state: string): ValidationResult {
  const errors: string[] = [];

  if (state.length !== 54) {
    errors.push(`State must be 54 characters (got ${state.length})`);
    return { valid: false, errors };
  }

  // Check only valid face letters
  for (let i = 0; i < 54; i++) {
    if (!FACE_LETTERS.includes(state[i] as typeof FACE_LETTERS[number])) {
      errors.push(`Invalid character '${state[i]}' at position ${i}`);
    }
  }
  if (errors.length > 0) return { valid: false, errors };

  // Exactly 9 of each color
  const counts: Record<string, number> = {};
  for (const ch of state) counts[ch] = (counts[ch] || 0) + 1;
  for (const face of FACE_LETTERS) {
    const count = counts[face] || 0;
    if (count !== 9) {
      errors.push(`${face} has ${count} facelets (need exactly 9)`);
    }
  }

  // Centers must match their face
  const expectedCenters = ["U", "R", "F", "D", "L", "B"];
  for (let i = 0; i < 6; i++) {
    if (state[CENTER_INDICES[i]] !== expectedCenters[i]) {
      errors.push(
        `Center of ${expectedCenters[i]} face is ${state[CENTER_INDICES[i]]} (must be ${expectedCenters[i]})`
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

/* ═══════════════════════════════════════════════════════════════════════════
   FACELET ↔ CUBIE MAPPING

   Maps each of the 54 facelet indices to a 3D cubie position and normal.
   Kociemba order: U(0-8) R(9-17) F(18-26) D(27-35) L(36-44) B(45-53)
   ═══════════════════════════════════════════════════════════════════════════ */

interface FaceletDef {
  index: number;
  position: [number, number, number];
  normal: [number, number, number];
}

function buildFaceletMap(): FaceletDef[] {
  const facelets: FaceletDef[] = [];

  // U face (y=1): rows back→front (z:-1,0,1), cols left→right (x:-1,0,1)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      facelets.push({
        index: row * 3 + col,
        position: [col - 1, 1, row - 1],
        normal: [0, 1, 0],
      });
    }
  }

  // R face (x=1): rows top→bottom (y:1,0,-1), cols front→back (z:1,0,-1)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      facelets.push({
        index: 9 + row * 3 + col,
        position: [1, 1 - row, 1 - col],
        normal: [1, 0, 0],
      });
    }
  }

  // F face (z=1): rows top→bottom (y:1,0,-1), cols left→right (x:-1,0,1)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      facelets.push({
        index: 18 + row * 3 + col,
        position: [col - 1, 1 - row, 1],
        normal: [0, 0, 1],
      });
    }
  }

  // D face (y=-1): rows front→back (z:1,0,-1), cols left→right (x:-1,0,1)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      facelets.push({
        index: 27 + row * 3 + col,
        position: [col - 1, -1, 1 - row],
        normal: [0, -1, 0],
      });
    }
  }

  // L face (x=-1): rows top→bottom (y:1,0,-1), cols back→front (z:-1,0,1)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      facelets.push({
        index: 36 + row * 3 + col,
        position: [-1, 1 - row, col - 1],
        normal: [-1, 0, 0],
      });
    }
  }

  // B face (z=-1): rows top→bottom (y:1,0,-1), cols right→left (x:1,0,-1)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      facelets.push({
        index: 45 + row * 3 + col,
        position: [1 - col, 1 - row, -1],
        normal: [0, 0, -1],
      });
    }
  }

  return facelets;
}

const FACELET_MAP = buildFaceletMap();

/* ═══════════════════════════════════════════════════════════════════════════
   MOVE → ROTATION MAPPING (for 3D animation)
   ═══════════════════════════════════════════════════════════════════════════ */

interface MoveRotation {
  axis: "x" | "y" | "z";
  layer: number;
  angle: number;
}

function parseMoveToRotation(move: string): MoveRotation | null {
  const face = move[0];
  const modifier = move.slice(1);

  // In Three.js: -π/2 around Y = CW from above (standard U direction)
  let baseAngle = -Math.PI / 2;
  if (modifier === "'") baseAngle = Math.PI / 2;
  else if (modifier === "2") baseAngle = Math.PI;

  switch (face) {
    case "R": return { axis: "x", layer: 1, angle: baseAngle };
    case "L": return { axis: "x", layer: -1, angle: -baseAngle };
    case "U": return { axis: "y", layer: 1, angle: baseAngle };
    case "D": return { axis: "y", layer: -1, angle: -baseAngle };
    case "F": return { axis: "z", layer: 1, angle: baseAngle };
    case "B": return { axis: "z", layer: -1, angle: -baseAngle };
    default: return null;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   CUBE STATE MANIPULATION — verified 100/100 against kociemba

   cycle4(arr, a, b, c, d): values move a→b→c→d→a
   ═══════════════════════════════════════════════════════════════════════════ */

function cycle4(arr: string[], a: number, b: number, c: number, d: number): void {
  const temp = arr[d];
  arr[d] = arr[c];
  arr[c] = arr[b];
  arr[b] = arr[a];
  arr[a] = temp;
}

function rotateFaceCW(arr: string[], start: number): void {
  cycle4(arr, start, start + 2, start + 8, start + 6);
  cycle4(arr, start + 1, start + 5, start + 7, start + 3);
}

function applyMove(state: string, move: string): string {
  const s = state.split("");
  const face = move[0];
  const modifier = move.slice(1);
  const times = modifier === "2" ? 2 : modifier === "'" ? 3 : 1;

  for (let t = 0; t < times; t++) {
    switch (face) {
      case "U":
        rotateFaceCW(s, 0);
        // Edge ring: B→R→F→L (CW from above in kociemba convention)
        cycle4(s, 18, 36, 45, 9);
        cycle4(s, 19, 37, 46, 10);
        cycle4(s, 20, 38, 47, 11);
        break;
      case "D":
        rotateFaceCW(s, 27);
        // Edge ring: F→L→B→R (CW from below in kociemba convention)
        cycle4(s, 24, 15, 51, 42);
        cycle4(s, 25, 16, 52, 43);
        cycle4(s, 26, 17, 53, 44);
        break;
      case "R":
        rotateFaceCW(s, 9);
        cycle4(s, 20, 2, 51, 29);
        cycle4(s, 23, 5, 48, 32);
        cycle4(s, 26, 8, 45, 35);
        break;
      case "L":
        rotateFaceCW(s, 36);
        cycle4(s, 18, 27, 53, 0);
        cycle4(s, 21, 30, 50, 3);
        cycle4(s, 24, 33, 47, 6);
        break;
      case "F":
        rotateFaceCW(s, 18);
        cycle4(s, 6, 9, 29, 44);
        cycle4(s, 7, 12, 28, 41);
        cycle4(s, 8, 15, 27, 38);
        break;
      case "B":
        rotateFaceCW(s, 45);
        cycle4(s, 2, 36, 33, 17);
        cycle4(s, 1, 39, 34, 14);
        cycle4(s, 0, 42, 35, 11);
        break;
    }
  }

  return s.join("");
}

/* ═══════════════════════════════════════════════════════════════════════════
   THREE.JS SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

function Facelet({
  faceletDef,
  color,
  onClick,
}: {
  faceletDef: FaceletDef;
  color: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const pos: [number, number, number] = [
    faceletDef.position[0] * CUBIE_GAP + faceletDef.normal[0] * FACELET_OFFSET,
    faceletDef.position[1] * CUBIE_GAP + faceletDef.normal[1] * FACELET_OFFSET,
    faceletDef.position[2] * CUBIE_GAP + faceletDef.normal[2] * FACELET_OFFSET,
  ];

  const rotation = useMemo((): [number, number, number] => {
    const [nx, ny, nz] = faceletDef.normal;
    if (ny === 1) return [-Math.PI / 2, 0, 0];
    if (ny === -1) return [Math.PI / 2, 0, 0];
    if (nx === 1) return [0, Math.PI / 2, 0];
    if (nx === -1) return [0, -Math.PI / 2, 0];
    if (nz === -1) return [0, Math.PI, 0];
    return [0, 0, 0];
  }, [faceletDef.normal]);

  return (
    <mesh
      position={pos}
      rotation={rotation}
      scale={hovered ? 1.03 : 1}
      onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
    >
      <planeGeometry args={[FACELET_SIZE, FACELET_SIZE]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function Cubie({ position }: { position: [number, number, number] }) {
  return (
    <mesh
      position={[
        position[0] * CUBIE_GAP,
        position[1] * CUBIE_GAP,
        position[2] * CUBIE_GAP,
      ]}
    >
      <boxGeometry args={[CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE]} />
      <meshStandardMaterial color={BORDER_COLOR} roughness={0.8} metalness={0.2} />
    </mesh>
  );
}

function getCubiePositions(): [number, number, number][] {
  const positions: [number, number, number][] = [];
  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 1; z++)
        if (x !== 0 || y !== 0 || z !== 0)
          positions.push([x, y, z]);
  return positions;
}

const CUBIE_POSITIONS = getCubiePositions();

function AnimatedLayer({
  children,
  rotation,
}: {
  children: React.ReactNode;
  rotation: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef(rotation);
  const currentRotation = useRef<[number, number, number]>([0, 0, 0]);

  useEffect(() => {
    targetRotation.current = rotation;
  }, [rotation]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const speed = 8;
    const curr = currentRotation.current;
    const tgt = targetRotation.current;
    curr[0] += (tgt[0] - curr[0]) * Math.min(1, speed * delta);
    curr[1] += (tgt[1] - curr[1]) * Math.min(1, speed * delta);
    curr[2] += (tgt[2] - curr[2]) * Math.min(1, speed * delta);
    groupRef.current.rotation.set(curr[0], curr[1], curr[2]);
  });

  return <group ref={groupRef}>{children}</group>;
}

function AutoRotateCamera({ enabled }: { enabled: boolean }) {
  const { camera } = useThree();
  useFrame((_, delta) => {
    if (!enabled) return;
    camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), delta * 0.15);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function CubeScene({
  cubeState,
  onFaceletClick,
  autoRotate,
  animatingMove,
}: {
  cubeState: string;
  onFaceletClick: FaceletClickHandler;
  autoRotate: boolean;
  animatingMove: MoveRotation | null;
}) {
  const safeState = cubeState && cubeState.length === 54 ? cubeState : DEFAULT_STATE;

  const colors = useMemo(
    () => Array.from(safeState).map(letterToHex),
    [safeState]
  );

  const animatingIndices = useMemo(() => {
    if (!animatingMove) return new Set<number>();
    const { axis, layer } = animatingMove;
    const indices = new Set<number>();
    for (const f of FACELET_MAP) {
      const axisIdx = axis === "x" ? 0 : axis === "y" ? 1 : 2;
      if (f.position[axisIdx] === layer) indices.add(f.index);
    }
    return indices;
  }, [animatingMove]);

  const layerRotation: [number, number, number] = useMemo(() => {
    if (!animatingMove) return [0, 0, 0];
    const { axis, angle } = animatingMove;
    if (axis === "x") return [angle, 0, 0];
    if (axis === "y") return [0, angle, 0];
    return [0, 0, angle];
  }, [animatingMove]);

  const staticFacelets = FACELET_MAP.filter((f) => !animatingIndices.has(f.index));
  const movingFacelets = FACELET_MAP.filter((f) => animatingIndices.has(f.index));

  const staticCubies = CUBIE_POSITIONS.filter((pos) => {
    if (!animatingMove) return true;
    const axisIdx = animatingMove.axis === "x" ? 0 : animatingMove.axis === "y" ? 1 : 2;
    return pos[axisIdx] !== animatingMove.layer;
  });
  const movingCubies = CUBIE_POSITIONS.filter((pos) => {
    if (!animatingMove) return false;
    const axisIdx = animatingMove.axis === "x" ? 0 : animatingMove.axis === "y" ? 1 : 2;
    return pos[axisIdx] === animatingMove.layer;
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 8, 5]} intensity={0.5} color="#ffffff" />
      <directionalLight position={[-5, -3, -5]} intensity={0.25} color="#ffffff" />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={4}
        maxDistance={12}
        dampingFactor={0.08}
        enableDamping
      />
      <AutoRotateCamera enabled={autoRotate} />

      {staticCubies.map((pos, i) => (
        <Cubie key={`sc-${i}`} position={pos} />
      ))}
      {staticFacelets.map((f) => (
        <Facelet
          key={`sf-${f.index}`}
          faceletDef={f}
          color={colors[f.index]}
          onClick={() => onFaceletClick(f.index)}
        />
      ))}

      {animatingMove && (
        <AnimatedLayer rotation={layerRotation}>
          {movingCubies.map((pos, i) => (
            <Cubie key={`mc-${i}`} position={pos} />
          ))}
          {movingFacelets.map((f) => (
            <Facelet
              key={`mf-${f.index}`}
              faceletDef={f}
              color={colors[f.index]}
              onClick={() => onFaceletClick(f.index)}
            />
          ))}
        </AnimatedLayer>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COLOR PICKER
   ═══════════════════════════════════════════════════════════════════════════ */

function ColorPicker({
  onSelect,
  onClose,
}: {
  onSelect: (face: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute z-50 flex gap-1.5 p-2 rounded-xl bg-surface-800/95 border border-white/10 backdrop-blur-md shadow-2xl animate-fade-in">
      {COLOR_PICKER_OPTIONS.map((opt) => (
        <button
          key={opt.face}
          onClick={() => onSelect(opt.face)}
          className="group relative h-9 w-9 rounded-lg transition-all duration-150 hover:scale-110 active:scale-95"
          style={{ backgroundColor: opt.color }}
          title={opt.label}
        >
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-white/40 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {opt.label}
          </span>
        </button>
      ))}
      <button
        onClick={onClose}
        className="h-9 w-9 rounded-lg bg-surface-600 text-white/50 hover:text-white hover:bg-surface-500 flex items-center justify-center transition-all duration-150"
        title="Cancel"
      >
        ✕
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   VALIDATION BANNER
   ═══════════════════════════════════════════════════════════════════════════ */

function ValidationBanner({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <div className="absolute bottom-3 left-3 right-3 z-40 rounded-lg bg-red-900/90 border border-red-500/40 px-3 py-2 backdrop-blur-sm">
      <p className="text-xs font-semibold text-red-200 mb-1">Invalid cube state:</p>
      {errors.map((err, i) => (
        <p key={i} className="text-xs text-red-300/80">• {err}</p>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATION QUEUE HOOK
   ═══════════════════════════════════════════════════════════════════════════ */

function useAnimationQueue(
  cubeState: string,
  onStateChange: (newState: string) => void
) {
  const [animatingMove, setAnimatingMove] = useState<MoveRotation | null>(null);
  const [displayState, setDisplayState] = useState(cubeState || DEFAULT_STATE);
  const queueRef = useRef<string[]>([]);
  const isAnimating = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!isAnimating.current && cubeState) setDisplayState(cubeState);
  }, [cubeState]);

  const processNext = useCallback(() => {
    if (queueRef.current.length === 0) {
      isAnimating.current = false;
      setAnimatingMove(null);
      return;
    }

    const move = queueRef.current.shift()!;
    const rotation = parseMoveToRotation(move);

    if (!rotation) { processNext(); return; }

    setAnimatingMove(rotation);

    timeoutRef.current = setTimeout(() => {
      setAnimatingMove(null);
      setDisplayState((prev) => {
        const newState = applyMove(prev, move);
        onStateChange(newState);
        return newState;
      });
      timeoutRef.current = setTimeout(processNext, 80);
    }, 350);
  }, [onStateChange]);

  const queueMoves = useCallback(
    (moves: string[]) => {
      queueRef.current.push(...moves);
      if (!isAnimating.current) {
        isAnimating.current = true;
        processNext();
      }
    },
    [processNext]
  );

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  return { displayState, animatingMove, queueMoves, setDisplayState };
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN EXPORTED COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

function CubeCanvas({
  cubeState = DEFAULT_STATE,
  onStateChange,
  autoRotate = false,
  movesToPlay,
  playTrigger = 0,
  resetTrigger = 0,
}: CubeCanvasProps) {
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [pickerPos, setPickerPos] = useState({ x: 0, y: 0 });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStateChange = useCallback(
    (newState: string) => {
      const result = validateCubeState(newState);
      setValidationErrors(result.errors);
      onStateChange?.(newState);
    },
    [onStateChange]
  );

  const { displayState, animatingMove, queueMoves, setDisplayState } =
    useAnimationQueue(cubeState, handleStateChange);

  useEffect(() => {
    if (playTrigger > 0 && movesToPlay && movesToPlay.length > 0) {
      queueMoves(movesToPlay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playTrigger]);

  useEffect(() => {
    if (resetTrigger > 0) {
      setDisplayState(DEFAULT_STATE);
      setValidationErrors([]);
      onStateChange?.(DEFAULT_STATE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetTrigger]);

  const handleFaceletClick = useCallback(
    (faceletIndex: number) => {
      // Prevent editing center facelets
      if (CENTER_INDICES.includes(faceletIndex)) return;

      if (pickerIndex === faceletIndex) { setPickerIndex(null); return; }
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) setPickerPos({ x: rect.width / 2 - 120, y: 16 });
      setPickerIndex(faceletIndex);
    },
    [pickerIndex]
  );

  const handleColorSelect = useCallback(
    (face: string) => {
      if (pickerIndex === null) return;
      const chars = displayState.split("");
      chars[pickerIndex] = face;
      const newState = chars.join("");

      // Validate before accepting
      const result = validateCubeState(newState);
      setValidationErrors(result.errors);

      setDisplayState(newState);
      onStateChange?.(newState);
      setPickerIndex(null);
    },
    [pickerIndex, displayState, onStateChange, setDisplayState]
  );

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[300px]">
      <Canvas
        flat
        camera={{ position: [3.5, 3, 3.5], fov: 45, near: 0.1, far: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <CubeScene
          cubeState={displayState}
          onFaceletClick={handleFaceletClick}
          autoRotate={autoRotate && pickerIndex === null}
          animatingMove={animatingMove}
        />
      </Canvas>

      {pickerIndex !== null && (
        <div className="absolute" style={{ left: pickerPos.x, top: pickerPos.y }}>
          <ColorPicker
            onSelect={handleColorSelect}
            onClose={() => setPickerIndex(null)}
          />
        </div>
      )}

      <ValidationBanner errors={validationErrors} />
    </div>
  );
}

export default CubeCanvas;
export { applyMove, validateCubeState };
export type { ValidationResult };
