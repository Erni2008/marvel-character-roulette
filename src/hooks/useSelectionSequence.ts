import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motionValue, useMotionValue } from 'motion/react';
import { cardShufflePose, DECK_SIZE } from '../domain/shuffle';
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
    wheelOpacity = useMotionValue(1);
  const deck = useMemo(
    () =>
      Array.from({ length: DECK_SIZE }, (_, index) => ({
        index,
        x: motionValue(0),
        y: motionValue(0),
        rotate: motionValue(0),
        yaw: motionValue(0),
        scale: motionValue(1),
        opacity: motionValue(0),
        layer: motionValue(DECK_SIZE - index),
      })),
    [],
  );
  const [character, setCharacter] = useState<Character | null>(null),
    [ready, setReady] = useState(restored),
    [frontVisible, setFrontVisible] = useState(restored),
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
      currentStage = -1,
      currentFront = restored;
    const duration = motion ? (method === 'card' ? 4600 : 4200) : 800;
    function pose(p: number) {
      progress.set(p);
      const wheelP = Math.min(1, p / 0.82);
      rotation.set(target * selectionProgress(wheelP));
      if (method === 'card') {
        const facing = motion ? cardShufflePose(0, p).yaw >= 90 : p === 1;
        if (facing !== currentFront) {
          currentFront = facing;
          setFrontVisible(facing);
        }
        for (const card of deck) {
          const v = motion
            ? cardShufflePose(card.index, p)
            : {
                ...cardShufflePose(card.index, 1),
                opacity: card.index === 0 ? 1 : 0,
                yaw: p === 1 ? 180 : 0,
              };
          card.x.set(v.x);
          card.y.set(v.y);
          card.rotate.set(v.rotate);
          card.yaw.set(v.yaw);
          card.scale.set(v.scale);
          card.opacity.set(v.opacity);
          card.layer.set(v.layer);
        }
      }
      wheelOpacity.set(method === 'roulette' && p > 0.84 ? 1 - ((p - 0.84) / 0.16) * 0.55 : 1);
      const step =
        method === 'card'
          ? p < 0.12
            ? 0
            : p < 0.77
              ? 1
              : p < 0.86
                ? 2
                : 3
          : p < 0.17
            ? 0
            : p < 0.73
              ? 1
              : p < 0.84
                ? 2
                : 3;
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
    frontVisible,
    stage,
    selectedIndex,
    wheelEntries,
    skip,
    progress,
    rotation,
    wheelOpacity,
    deck,
  };
}
