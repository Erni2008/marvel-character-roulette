import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motionValue, useMotionValue } from 'motion/react';
import { selectionProgress, wheelStopAngle } from '../domain/game';
import type { Character, SelectionMethod } from '../domain/game';
interface Options {
  method: SelectionMethod;
  entries: Character[];
  prepare: () => Character;
  reveal: () => void;
  continueToGuess: () => void;
  motion: boolean;
  restored: boolean;
}
export function useSelectionSequence({
  method,
  entries,
  prepare,
  reveal,
  continueToGuess,
  motion,
  restored,
}: Options) {
  const progress = useMotionValue(restored ? 1 : 0),
    rotation = useMotionValue(0),
    cardY = useMotionValue(80),
    cardX = useMotionValue(0),
    cardRotateY = useMotionValue(-25),
    cardRotateZ = useMotionValue(-12),
    cardScale = useMotionValue(0.86),
    cardOpacity = useMotionValue(restored ? 1 : 0),
    ghostOpacity = useMotionValue(0),
    wheelOpacity = useMotionValue(1);
  const ghosts = useMemo(
    () =>
      [-2, -1, 1, 2].map((n) => ({
        n,
        x: motionValue(0),
        y: motionValue(0),
        z: motionValue(-100),
        rotate: motionValue(0),
      })),
    [],
  );
  const [character, setCharacter] = useState<Character | null>(null),
    [ready, setReady] = useState(restored),
    [stage, setStage] = useState(0),
    [selectedIndex, setSelectedIndex] = useState(-1),
    [wheelEntries, setWheelEntries] = useState(entries);
  const frame = useRef(0),
    hold = useRef<ReturnType<typeof setTimeout> | null>(null),
    done = useRef(false),
    finishRef = useRef<() => void>(() => {}),
    options = useRef({ prepare, reveal, continueToGuess });
  options.current = { prepare, reveal, continueToGuess };
  useEffect(() => {
    done.current = false;
    const winner = options.current.prepare();
    setCharacter(winner);
    const list = entries.some((c) => c.id === winner.id) ? entries : [winner, ...entries];
    setWheelEntries(list);
    const index = list.findIndex((c) => c.id === winner.id),
      target = wheelStopAngle(index, list.length);
    let start = performance.now(),
      elapsed = 0,
      currentStage = -1;
    const duration = motion ? 4200 : 800;
    function pose(p: number) {
      progress.set(p);
      const wheelP = Math.min(1, p / 0.82);
      rotation.set(target * selectionProgress(wheelP));
      const revealP = Math.max(0, Math.min(1, (p - 0.81) / 0.19));
      if (motion) {
        cardY.set(p < 0.18 ? 100 * (1 - p / 0.18) : Math.sin(p * Math.PI * 5) * (1 - revealP) * 5);
        cardX.set(Math.sin(p * Math.PI * 8) * 5 * (1 - revealP));
        cardRotateY.set(revealP > 0 ? -12 + revealP * 192 : -25 + Math.sin(p * Math.PI * 10) * 12);
        cardRotateZ.set(-12 * (1 - revealP));
        cardScale.set(0.86 + Math.min(1, p / 0.25) * 0.14);
        cardOpacity.set(Math.min(1, p / 0.14));
        ghostOpacity.set(
          p < 0.2 ? 0 : p > 0.78 ? Math.max(0, 1 - (p - 0.78) / 0.1) : Math.min(1, (p - 0.2) / 0.1),
        );
        for (const g of ghosts) {
          g.x.set(g.n * (30 + Math.sin(p * Math.PI * 8 + g.n) * 16));
          g.y.set(12 + Math.cos(p * Math.PI * 8 + g.n) * 15);
          g.z.set(-100 - Math.abs(g.n) * 30);
          g.rotate.set(g.n * (15 + Math.sin(p * Math.PI * 6) * 5));
        }
      } else {
        cardY.set(0);
        cardX.set(0);
        cardRotateZ.set(0);
        cardScale.set(1);
        cardOpacity.set(1);
        cardRotateY.set(p === 1 ? 180 : 0);
        ghostOpacity.set(0);
      }
      wheelOpacity.set(method === 'roulette' && p > 0.84 ? 1 - ((p - 0.84) / 0.16) * 0.55 : 1);
      const step = p < 0.17 ? 0 : p < 0.73 ? 1 : p < 0.84 ? 2 : 3;
      if (step !== currentStage) {
        currentStage = step;
        setStage(step);
        if (step === 3) setSelectedIndex(index);
      }
    }
    function finish() {
      if (done.current) return;
      done.current = true;
      cancelAnimationFrame(frame.current);
      pose(1);
      setSelectedIndex(index);
      setReady(true);
      options.current.reveal();
      hold.current = setTimeout(() => options.current.continueToGuess(), motion ? 600 : 650);
    }
    finishRef.current = finish;
    function tick(now: number) {
      elapsed = Math.min(duration, now - start);
      const p = elapsed / duration;
      pose(p);
      if (p < 1) frame.current = requestAnimationFrame(tick);
      else finish();
    }
    function visibility() {
      if (document.hidden) {
        cancelAnimationFrame(frame.current);
      } else if (!done.current) {
        start = performance.now() - elapsed;
        frame.current = requestAnimationFrame(tick);
      }
    }
    if (restored) finish();
    else frame.current = requestAnimationFrame(tick);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      cancelAnimationFrame(frame.current);
      if (hold.current) clearTimeout(hold.current);
      document.removeEventListener('visibilitychange', visibility);
    };
    // The selected record and trajectory are fixed once per mounted round, independent of render frames.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const skip = useCallback(() => finishRef.current(), []);
  return {
    character,
    ready,
    stage,
    selectedIndex,
    wheelEntries,
    skip,
    progress,
    rotation,
    cardY,
    cardX,
    cardRotateY,
    cardRotateZ,
    cardScale,
    cardOpacity,
    ghostOpacity,
    wheelOpacity,
    ghosts,
  };
}
