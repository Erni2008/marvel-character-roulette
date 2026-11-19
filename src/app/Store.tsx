import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';
import {
  advanceRound,
  chooseCharacter, PREVIEW_FIRST_ID,
  createSession,
  emptyStatistics,
  parseCharacters,
  builtInCharacters,
  recordStatistics,
  roundKey,
  settleRound,
} from '../domain/game';
import type {
  Character,
  GameSession,
  Outcome,
  Screen,
  SelectionMethod,
  Statistics,
} from '../domain/game';
import { defaults, loadSettings, SETTINGS_KEY, validateSettings } from '../domain/settings';
import type { Settings } from '../domain/settings';
const SESSION_KEY = 'roulette.session.v3',
  STATS_KEY = 'roulette.stats.v3';
function recoverSession(): GameSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as GameSession;
    if (
      typeof s.sessionId !== 'string' ||
      !Number.isInteger(s.round) ||
      s.round < 1 ||
      ![15, 30, 45, 60, 90, 120].includes(s.duration) ||
      ![0, 5, 10, 15, 20].includes(s.rounds) ||
      !Number.isFinite(s.remaining) ||
      !Array.isArray(s.records) ||
      !Number.isFinite(s.elapsed) ||
      s.elapsed < 0 ||
      !['selecting', 'revealed', 'guessing', 'settled', 'finished'].includes(s.phase) ||
      !['card', 'roulette'].includes(s.method)
    )
      return null;
    if (s.character) {
      parseCharacters([{ ...s.character, enabled: true }]);
      if (/^CHAMPION[ _]\d+$/.test(s.character.name)) {
        const index = Number(s.character.id.match(/(\d+)$/)?.[1] ?? 1) - 1;
        s.character =
          builtInCharacters[
            ((index % builtInCharacters.length) + builtInCharacters.length) %
              builtInCharacters.length
          ];
      }
    }
    return s;
  } catch {
    return null;
  }
}
function recoverStats(): Statistics {
  try {
    const raw = JSON.parse(localStorage.getItem(STATS_KEY) ?? 'null');
    if (!raw) return emptyStatistics;
    const s = { ...emptyStatistics };
    for (const k of Object.keys(s) as (keyof Statistics)[])
      if (typeof raw[k] === 'number' && Number.isFinite(raw[k]))
        s[k] = Math.max(0, Math.floor(raw[k]));
    return s;
  } catch {
    return emptyStatistics;
  }
}
function readScreen(session: GameSession | null): Screen {
  const key = location.hash.replace('#/', ''),
    aliases: Record<string, Screen> = {
      menu: 'home',
      setup: 'modes',
      roulette: 'draw',
      challenge: 'guess',
      result: 'summary',
    };
  const candidate = aliases[key] ?? key;
  const valid = ['home', 'modes', 'draw', 'guess', 'settings', 'stats', 'summary'];
  if (!valid.includes(candidate)) return 'home';
  if (['guess', 'summary'].includes(candidate) && !session?.character) return 'home';
  if (candidate === 'draw' && !session) return 'modes';
  if (candidate === 'draw' && session?.phase === 'finished') return 'summary';
  if (candidate === 'draw' && session && ['guessing', 'settled'].includes(session.phase))
    return 'guess';
  if (candidate === 'guess' && session && ['selecting', 'revealed'].includes(session.phase))
    return 'draw';
  return candidate as Screen;
}
const REMOVED_KEY = 'character-roulette.removed.v1';
export type Modal = 'install' | 'help' | 'leave' | 'reset' | 'camera' | null;
interface Store {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  importSettings: (data: unknown) => void;
  session: GameSession | null;
  statistics: Statistics;
  characters: Character[];
  catalogReady: boolean;
  removedCount: number;
  removeCurrent: (remaining?: number) => void;
  restorePool: () => void;
  finish: (remaining?: number) => void;
  screen: Screen;
  navigate: (s: Screen) => void;
  back: () => void;
  openSettings: () => void;
  start: (m: SelectionMethod) => void;
  prepare: () => Character;
  reveal: () => void;
  enterGuess: () => void;
  settle: (outcome: Outcome, remaining: number, key?: string) => boolean;
  advance: (outcome?: Outcome, remaining?: number) => void;
  saveElapsed: (value: number, key?: string) => void;
  resetStatistics: () => void;
  modal: Modal;
  setModal: (m: Modal) => void;
  toast: string | null;
  setToast: (s: string | null) => void;
  motion: boolean;
  active: boolean;
  t: (en: string, ru: string) => string;
}
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [loaded] = useState(() => loadSettings()),
    [settings, setSettings] = useState(loaded.settings),
    [session, setSession] = useState(recoverSession),
    [statistics, setStatistics] = useState(recoverStats),
    [characters, setCharacters] = useState<Character[]>(builtInCharacters),
    [catalogReady, setCatalogReady] = useState(false),
    [screen, setScreen] = useState<Screen>(() => readScreen(recoverSession())),
    [settingsReturn, setSettingsReturn] = useState<Screen>('home'),
    [modal, setModal] = useState<Modal>(null),
    [toast, setToast] = useState<string | null>(loaded.error),
    [active, setActive] = useState(!document.hidden),
    [removed, setRemoved] = useState<string[]>(() => {
      try {
        const v = JSON.parse(localStorage.getItem(REMOVED_KEY) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
      } catch {
        return [];
      }
    });
  const sessionRef = useRef(session),
    statsRef = useRef(statistics),
    settingsRef = useRef(settings);
  sessionRef.current = session;
  statsRef.current = statistics;
  settingsRef.current = settings;
  const reduced = useReducedMotion(),
    motion = !reduced && !settings.reducedMotion && settings.intensity > 0;
  const t = useCallback(
    (en: string, ru: string) => (settings.language === 'ru' ? ru : en),
    [settings.language],
  );
  const commit = useCallback((next: GameSession | null) => {
    sessionRef.current = next;
    setSession(next);
    try {
      if (next) sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
      else sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* Storage is optional. */
    }
  }, []);
  const navigate = useCallback((next: Screen) => {
    setScreen(next);
    history.pushState(null, '', `#/${next}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  useEffect(() => {
    const pop = () => {
      window.dispatchEvent(new Event('roulette:pause'));
      setScreen(readScreen(sessionRef.current));
    };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  useEffect(() => {
    const abort = new AbortController();
    fetch(import.meta.env.BASE_URL + 'characters/manifest.json', { signal: abort.signal })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((data) => {
        setCharacters(parseCharacters(data));
        setCatalogReady(true);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') {
          setCatalogReady(true);
          setToast(
            t(
              'The local character catalog is unavailable. The bundled text catalog is ready.',
              'Локальный каталог недоступен. Используется встроенный текстовый каталог.',
            ),
          );
        }
      });
    return () => abort.abort();
  }, [t]);
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      setToast(
        t(
          'Preferences cannot be saved in this browser.',
          'В этом браузере настройки не сохраняются.',
        ),
      );
    }
    document.documentElement.lang = settings.language;
    document.documentElement.dataset.motion = String(motion);
    const lowPower =
      navigator.hardwareConcurrency <= 4 ||
      ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4;
    document.documentElement.dataset.quality =
      settings.quality === 'auto' ? (lowPower || reduced ? 'low' : 'high') : settings.quality;
    document.documentElement.dataset.contrast = String(settings.highContrast);
    document.documentElement.style.setProperty(
      '--ui-text-scale',
      String(settings.scale * (settings.largerText ? 1.12 : 1)),
    );
  }, [settings, motion, reduced, t]);
  useEffect(() => {
    const change = () => setActive(!document.hidden);
    document.addEventListener('visibilitychange', change);
    return () => document.removeEventListener('visibilitychange', change);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 5500);
    return () => clearTimeout(id);
  }, [toast]);
  const update = useCallback(
    (patch: Partial<Settings>) => setSettings((s) => validateSettings({ ...s, ...patch })),
    [],
  );
  const importSettings = useCallback(
    (raw: unknown) => {
      setSettings(validateSettings(raw));
      setToast(t('Preferences imported.', 'Настройки импортированы.'));
    },
    [t],
  );
  const openSettings = useCallback(() => {
    if (screen === 'settings') return;
    window.dispatchEvent(new Event('roulette:pause'));
    setSettingsReturn(screen);
    navigate('settings');
  }, [screen, navigate]);
  const back = useCallback(() => {
    if (modal) {
      setModal(null);
      return;
    }
    if (screen === 'settings') {
      navigate(settingsReturn);
      return;
    }
    if (screen === 'stats' || screen === 'modes' || screen === 'summary') {
      navigate('home');
      return;
    }
    if (screen !== 'home') {
      window.dispatchEvent(new Event('roulette:pause'));
      setModal('leave');
    }
  }, [modal, screen, settingsReturn, navigate]);
  const start = useCallback(
    (method: SelectionMethod) => {
      update({ method });
      commit(createSession(method, settingsRef.current.rounds, settingsRef.current.duration));
      navigate('draw');
    },
    [commit, navigate, update],
  );
  const pool = useMemo(() => {
    const live = characters.map((c) => (removed.includes(c.id) ? { ...c, enabled: false } : c));
    return live.some((c) => c.enabled) ? live : characters;
  }, [characters, removed]);
  const saveRemoved = useCallback((next: string[]) => {
    setRemoved(next);
    try {
      localStorage.setItem(REMOVED_KEY, JSON.stringify(next));
    } catch {
      /* optional */
    }
  }, []);
  const restorePool = useCallback(() => saveRemoved([]), [saveRemoved]);
  const prepare = useCallback(() => {
    const s = sessionRef.current;
    if (!s) throw Error('Start a session first.');
    if (s.character) return s.character;
    const forced = !s.records.length && PREVIEW_FIRST_ID ? pool.find((c) => c.id === PREVIEW_FIRST_ID && c.enabled) : undefined;
    const character = forced ?? chooseCharacter(pool, s.records.at(-1)?.character.id);
    if (character.imagePath) new Image().src = import.meta.env.BASE_URL + character.imagePath.replace(/^\//, '');
    commit({ ...s, character, phase: 'selecting' });
    return character;
  }, [pool, commit]);
  const reveal = useCallback(() => {
    const s = sessionRef.current;
    if (s?.character && s.phase === 'selecting') commit({ ...s, phase: 'revealed' });
  }, [commit]);
  const enterGuess = useCallback(() => {
    const s = sessionRef.current;
    if (!s?.character) return;
    if (s.phase === 'revealed') commit({ ...s, phase: 'guessing', elapsed: 0 });
    navigate('guess');
  }, [commit, navigate]);
  const settle = useCallback(
    (outcome: Outcome, remaining: number, key?: string) => {
      const s = sessionRef.current;
      if (!s) return false;
      const next = settleRound(s, key ?? roundKey(s), outcome, remaining);
      if (next === s) return false;
      const stats = recordStatistics(statsRef.current, next.records.at(-1)!);
      statsRef.current = stats;
      setStatistics(stats);
      try {
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
      } catch {
        /* Current session remains functional. */
      }
      commit(next);
      return true;
    },
    [commit],
  );
  const advance = useCallback(
    (outcome: Outcome = 'passed', remaining = 0) => {
      let s = sessionRef.current;
      if (!s || !['guessing', 'settled'].includes(s.phase)) return;
      if (s.phase === 'guessing') settle(outcome, remaining, roundKey(s));
      s = sessionRef.current!;
      const next = advanceRound(s, settingsRef.current.duration);
      commit(next);
      navigate(next.phase === 'finished' ? 'summary' : 'draw');
    },
    [commit, navigate, settle],
  );
  /** End the endless session and show the results. */
  const finish = useCallback(
    (remaining = 0) => {
      let s = sessionRef.current;
      if (!s) return navigate('home');
      if (s.phase === 'guessing') settle('passed', remaining, roundKey(s));
      s = sessionRef.current!;
      commit({ ...s, phase: 'finished' });
      navigate('summary');
    },
    [commit, navigate, settle],
  );
  /** Take the current hero out of the pool and go straight to the next one. */
  const removeCurrent = useCallback(
    (remaining = 0) => {
      const s = sessionRef.current;
      if (!s?.character) return;
      const id = s.character.id,
        left = pool.filter((c) => c.enabled && c.id !== id).length;
      saveRemoved(left ? [...new Set([...removed, id])] : []);
      if (!left) setToast(t('All heroes were used — the deck is full again.', 'Все герои использованы — колода снова полная.'));
      advance('skipped', remaining);
    },
    [pool, removed, saveRemoved, advance, t],
  );
  const saveElapsed = useCallback(
    (elapsed: number, key?: string) => {
      const s = sessionRef.current;
      if (s?.phase === 'guessing' && (!key || roundKey(s) === key)) commit({ ...s, elapsed });
    },
    [commit],
  );
  const resetStatistics = useCallback(() => {
    statsRef.current = emptyStatistics;
    setStatistics(emptyStatistics);
    try {
      localStorage.removeItem(STATS_KEY);
    } catch {
      /* optional */
    }
  }, []);
  const value = useMemo<Store>(
    () => ({
      settings,
      update,
      importSettings,
      session,
      statistics,
      characters: pool,
      catalogReady,
      removedCount: removed.filter((id) => characters.some((c) => c.id === id)).length,
      removeCurrent,
      restorePool,
      finish,
      screen,
      navigate,
      back,
      openSettings,
      start,
      prepare,
      reveal,
      enterGuess,
      settle,
      advance,
      saveElapsed,
      resetStatistics,
      modal,
      setModal,
      toast,
      setToast,
      motion,
      active,
      t,
    }),
    [
      settings,
      update,
      importSettings,
      session,
      statistics,
      pool,
      removed,
      catalogReady,
      removeCurrent,
      restorePool,
      finish,
      screen,
      navigate,
      back,
      openSettings,
      start,
      prepare,
      reveal,
      enterGuess,
      settle,
      advance,
      saveElapsed,
      resetStatistics,
      modal,
      toast,
      motion,
      active,
      t,
    ],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useGame() {
  const s = useContext(Context);
  if (!s) throw Error('Game context is unavailable.');
  return s;
}
export { defaults };
