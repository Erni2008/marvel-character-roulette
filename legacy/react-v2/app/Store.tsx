import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';
import {
  generateChallenge,
  getChallenge,
  newSession,
  nextRound,
  recordRound,
  retryRound,
  selectChampion,
} from '../domain/game';
import type { Champion, GameSession, Screen } from '../domain/game';
import { defaults, loadSettings, SETTINGS_KEY, validateSettings } from '../domain/settings';
import type { Settings } from '../domain/settings';
export type GameAction =
  | { type: 'start' }
  | { type: 'select'; champion: Champion; challenge: GameSession['challenge']; restriction: number }
  | { type: 'finish'; success: boolean; remaining: number }
  | { type: 'next'; players: number }
  | { type: 'retry' }
  | { type: 'elapsed'; value: number };
export function gameReducer(s: GameSession, a: GameAction): GameSession {
  switch (a.type) {
    case 'start':
      return newSession();
    case 'select':
      return {
        ...s,
        champion: a.champion,
        challenge: a.challenge,
        restriction: a.restriction,
        elapsed: 0,
      };
    case 'finish':
      return recordRound(s, a.success, a.remaining);
    case 'next':
      return nextRound(s, a.players);
    case 'retry':
      return retryRound(s);
    case 'elapsed':
      return { ...s, elapsed: a.value };
  }
}
const screens: Screen[] = ['menu', 'setup', 'roulette', 'challenge', 'result', 'settings'];
const readScreen = (): Screen => {
  const raw = location.hash.replace('#/', '') as Screen;
  return screens.includes(raw) ? raw : 'menu';
};
function recover(): GameSession {
  try {
    const raw = sessionStorage.getItem('roulette.session.v2');
    if (!raw) return newSession();
    const s = JSON.parse(raw) as GameSession;
    if (
      !Number.isInteger(s.round) ||
      s.round < 1 ||
      !Number.isInteger(s.player) ||
      s.player < 1 ||
      s.player > 10 ||
      !Array.isArray(s.history) ||
      !Number.isFinite(s.elapsed) ||
      s.elapsed < 0
    )
      throw Error();
    if (
      s.champion &&
      (!Number.isInteger(s.champion.id) || s.champion.id < 1 || s.champion.id > 120)
    )
      throw Error();
    if (s.challenge && !getChallenge(s.challenge)) throw Error();
    for (const r of s.history)
      if (
        !r.champion ||
        !getChallenge(r.challenge) ||
        !Number.isFinite(r.score) ||
        !Number.isFinite(r.remaining)
      )
        throw Error();
    return s;
  } catch {
    return newSession();
  }
}
export type Modal = 'how' | 'install' | 'leave' | 'camera' | 'reset' | null;
interface Store {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  importSettings: (data: unknown) => void;
  session: GameSession;
  screen: Screen;
  navigate: (screen: Screen) => void;
  openSettings: () => void;
  back: () => void;
  start: () => void;
  select: () => Champion;
  finish: (success: boolean, remaining: number) => void;
  next: () => void;
  retry: () => void;
  saveElapsed: (value: number) => void;
  modal: Modal;
  setModal: (value: Modal) => void;
  toast: string | null;
  setToast: (value: string | null) => void;
  motion: boolean;
  active: boolean;
  stream: boolean;
  t: (en: string, ru: string) => string;
  languageIndex: 0 | 1;
  score: number;
  finished: boolean;
}
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [loaded] = useState(() => loadSettings());
  const [settings, setSettings] = useState(loaded.settings);
  const [session, dispatch] = useReducer(gameReducer, undefined, recover);
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const [screen, setScreen] = useState<Screen>(() => {
    const p = readScreen(),
      s = recover();
    return p === 'challenge' && !s.champion
      ? 'menu'
      : p === 'result' && !s.history.length
        ? 'menu'
        : p;
  });
  const [settingsReturn, setSettingsReturn] = useState<Screen>('menu');
  const [modal, setModal] = useState<Modal>(null);
  const [toast, setToast] = useState<string | null>(loaded.error);
  const [active, setActive] = useState(!document.hidden);
  const systemReduced = useReducedMotion();
  const t = useCallback(
    (en: string, ru: string) => (settings.language === 'ru' ? ru : en),
    [settings.language],
  );
  const navigate = useCallback((next: Screen) => {
    setScreen(next);
    history.pushState(null, '', `#/${next}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  useEffect(() => {
    function pop() {
      const next = readScreen();
      setScreen(
        next === 'challenge' && !session.champion
          ? 'menu'
          : next === 'result' && !session.history.length
            ? 'menu'
            : next,
      );
    }
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, [session]);
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      setToast(
        t(
          'Preferences cannot be saved in this browser. This session still works.',
          'Не удалось сохранить настройки. Текущая игра работает.',
        ),
      );
    }
  }, [settings, t]);
  useEffect(() => {
    try {
      sessionStorage.setItem('roulette.session.v2', JSON.stringify(session));
    } catch {
      /* Private sessions may have no writable storage. */
    }
  }, [session]);
  useEffect(() => {
    document.documentElement.lang = settings.language;
    document.documentElement.dataset.contrast = String(settings.highContrast);
    document.documentElement.dataset.motion = String(
      !(systemReduced || settings.reducedMotion || settings.intensity === 0),
    );
    document.documentElement.style.setProperty(
      '--text-scale',
      String(settings.scale * (settings.largerText ? 1.12 : 1)),
    );
  }, [settings, systemReduced]);
  useEffect(() => {
    const onVisibility = () => setActive(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 6500);
    return () => clearTimeout(id);
  }, [toast]);
  const update = useCallback(
    (patch: Partial<Settings>) => setSettings((s) => validateSettings({ ...s, ...patch })),
    [],
  );
  const importSettings = useCallback(
    (data: unknown) => {
      setSettings(validateSettings(data));
      setToast(
        t('Preferences imported. Your stage is ready.', 'Настройки импортированы. Сцена готова.'),
      );
    },
    [t],
  );
  const back = useCallback(() => {
    if (modal) {
      setModal(null);
      return;
    }
    if (settings.stream && ['roulette', 'challenge', 'result'].includes(screen)) {
      update({ stream: false });
      return;
    }
    if (screen === 'settings') {
      navigate(settingsReturn);
    } else if (screen === 'setup') {
      navigate('menu');
    } else if (screen !== 'menu') {
      window.dispatchEvent(new Event('roulette:pause'));
      setModal('leave');
    }
  }, [modal, settings.stream, screen, settingsReturn, navigate, update]);
  const openSettings = useCallback(() => {
    if (screen === 'settings') return;
    setSettingsReturn(screen);
    navigate('settings');
  }, [screen, navigate]);
  const start = useCallback(() => {
    dispatch({ type: 'start' });
    navigate('roulette');
  }, [navigate]);
  const select = useCallback(() => {
    const champion = selectChampion(
      undefined,
      session.champion?.id ?? session.history.at(-1)?.champion.id,
    );
    dispatch({
      type: 'select',
      champion,
      challenge: generateChallenge(settings.mode),
      restriction: Math.floor(Math.random() * 4),
    });
    return champion;
  }, [session.champion, session.history, settings.mode]);
  const finish = useCallback(
    (success: boolean, remaining: number) => {
      dispatch({ type: 'finish', success, remaining });
      navigate('result');
    },
    [navigate],
  );
  const next = useCallback(() => {
    dispatch({ type: 'next', players: settings.players });
    navigate('roulette');
  }, [settings.players, navigate]);
  const retry = useCallback(() => {
    dispatch({ type: 'retry' });
    navigate('challenge');
  }, [navigate]);
  const saveElapsed = useCallback((value: number) => {
    dispatch({ type: 'elapsed', value });
    // pagehide/update must not wait for React's next passive effect to preserve the clock.
    try {
      sessionStorage.setItem(
        'roulette.session.v2',
        JSON.stringify({ ...sessionRef.current, elapsed: value }),
      );
    } catch {
      /* Storage can be unavailable in a private session. */
    }
  }, []);
  const value = useMemo<Store>(
    () => ({
      settings,
      update,
      importSettings,
      session,
      screen,
      navigate,
      openSettings,
      back,
      start,
      select,
      finish,
      next,
      retry,
      saveElapsed,
      modal,
      setModal,
      toast,
      setToast,
      motion: !systemReduced && !settings.reducedMotion && settings.intensity > 0,
      active,
      stream: settings.stream && ['roulette', 'challenge', 'result'].includes(screen),
      t,
      languageIndex: settings.language === 'en' ? 0 : 1,
      score: session.history.reduce((a, r) => a + r.score, 0),
      finished: settings.rounds !== 0 && session.round >= settings.rounds,
    }),
    [
      settings,
      update,
      importSettings,
      session,
      screen,
      navigate,
      openSettings,
      back,
      start,
      select,
      finish,
      next,
      retry,
      saveElapsed,
      modal,
      toast,
      systemReduced,
      active,
      t,
    ],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useGame() {
  const value = useContext(Context);
  if (!value) throw new Error('Game context is missing');
  return value;
}
export { defaults };
