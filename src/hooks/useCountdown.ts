import { useCallback, useEffect, useRef, useState } from 'react';
/** Monotonic elapsed time; inactive tabs and app switching pause instead of losing seconds. */
export function useCountdown(
  total: number,
  initialElapsed: number,
  onExpire: () => void,
  onSave: (elapsed: number) => void,
) {
  const elapsed = useRef(Math.min(total * 1000, initialElapsed)),
    anchor = useRef(0),
    runningRef = useRef(false),
    startedRef = useRef(initialElapsed > 0),
    expired = useRef(false);
  const [running, setRunning] = useState(false),
    [started, setStarted] = useState(initialElapsed > 0),
    [remaining, setRemaining] = useState(Math.max(0, total - Math.floor(initialElapsed / 1000)));
  const expireRef = useRef(onExpire),
    saveRef = useRef(onSave);
  useEffect(() => {
    expireRef.current = onExpire;
    saveRef.current = onSave;
  });
  const measure = useCallback(
    () => elapsed.current + (runningRef.current ? performance.now() - anchor.current : 0),
    [],
  );
  const pause = useCallback(() => {
    if (runningRef.current) {
      elapsed.current = measure();
      runningRef.current = false;
      setRunning(false);
      saveRef.current(elapsed.current);
    }
  }, [measure]);
  const toggle = useCallback(() => {
    if (expired.current) return;
    if (runningRef.current) {
      pause();
    } else {
      anchor.current = performance.now();
      runningRef.current = true;
      startedRef.current = true;
      setRunning(true);
      setStarted(true);
    }
  }, [pause]);
  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const value = measure();
      const next = Math.max(0, total - Math.floor(value / 1000));
      setRemaining(next);
      if (next === 0 && !expired.current) {
        expired.current = true;
        runningRef.current = false;
        setRunning(false);
        elapsed.current = total * 1000;
        expireRef.current();
      }
    };
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [running, total, measure]);
  useEffect(() => {
    const visibility = () => {
      if (document.hidden) pause();
    };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('blur', pause);
    window.addEventListener('pagehide', pause);
    window.addEventListener('roulette:pause', pause);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('blur', pause);
      window.removeEventListener('pagehide', pause);
      window.removeEventListener('roulette:pause', pause);
      if (runningRef.current) {
        elapsed.current = measure();
        runningRef.current = false;
        saveRef.current(elapsed.current);
      }
    };
  }, [pause, measure]);
  return {
    remaining,
    running,
    started,
    hasStarted: () => startedRef.current,
    toggle,
    pause,
    measure,
  };
}
