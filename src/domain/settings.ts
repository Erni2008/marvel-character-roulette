import type { Mode, Difficulty, Language } from './game';
export interface Settings {
  players: number;
  duration: number;
  rounds: number;
  mode: Mode;
  difficulty: Difficulty;
  language: Language;
  stream: boolean;
  overlays: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  largerText: boolean;
  scale: number;
  intensity: number;
  master: number;
  music: number;
  effects: number;
  safeMargin: number;
  quality: 'auto' | 'high' | 'low';
  resolution: string;
}
export const defaults: Settings = {
  players: 4,
  duration: 45,
  rounds: 10,
  mode: 'party',
  difficulty: 'normal',
  language: 'en',
  stream: false,
  overlays: true,
  reducedMotion: false,
  highContrast: false,
  largerText: false,
  scale: 1,
  intensity: 0.65,
  master: 0.8,
  music: 0.5,
  effects: 0.8,
  safeMargin: 3,
  quality: 'auto',
  resolution: '1920 × 1080',
};
export const SETTINGS_KEY = 'character-roulette.settings.v2';
export function validateSettings(input: unknown): Settings {
  if (typeof input === 'string') input = JSON.parse(input);
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new Error('Invalid settings file');
  const m = input as Record<string, unknown>,
    s = { ...defaults };
  const num = (key: keyof Settings, min: number, max: number) =>
    typeof m[key] === 'number' && Number.isFinite(m[key])
      ? Math.min(max, Math.max(min, m[key] as number))
      : (defaults[key] as number);
  s.players = Math.round(num('players', 1, 10));
  s.duration = [15, 30, 45, 60, 90].includes(m.duration as number) ? (m.duration as number) : 45;
  s.rounds = [0, 5, 10, 15, 20].includes(m.rounds as number) ? (m.rounds as number) : 10;
  s.mode =
    ((['party', 'knowledge', 'chaos'].includes(m.mode as string)
      ? m.mode
      : typeof m.mode === 'number'
        ? ['party', 'knowledge', 'chaos'][m.mode]
        : defaults.mode) as Mode) || defaults.mode;
  s.difficulty =
    ((['easy', 'normal', 'hard', 'expert'].includes(m.difficulty as string)
      ? m.difficulty
      : typeof m.difficulty === 'number'
        ? ['easy', 'normal', 'hard', 'expert'][m.difficulty]
        : defaults.difficulty) as Difficulty) || defaults.difficulty;
  s.language = m.language === 'ru' ? 'ru' : 'en';
  for (const k of ['stream', 'overlays', 'reducedMotion', 'highContrast', 'largerText'] as const)
    if (typeof m[k] === 'boolean') s[k] = m[k];
  s.scale = num('scale', 0.85, 1.2);
  s.intensity = num('intensity', 0, 1);
  s.master = num('master', 0, 1);
  s.music = num('music', 0, 1);
  s.effects = num('effects', 0, 1);
  s.safeMargin = num('safeMargin', 0, 8);
  s.quality = ['auto', 'high', 'low'].includes(m.quality as string)
    ? (m.quality as Settings['quality'])
    : 'auto';
  s.resolution = ['1280 × 720', '1920 × 1080', '2560 × 1440'].includes(m.resolution as string)
    ? (m.resolution as string)
    : defaults.resolution;
  return s;
}
export function loadSettings(storage?: Pick<Storage, 'getItem'>): {
  settings: Settings;
  error: string | null;
} {
  try {
    const source = storage ?? window.localStorage;
    const raw =
      source.getItem(SETTINGS_KEY) ??
      source.getItem('flutter.settings.v1') ??
      source.getItem('settings.v1');
    return { settings: raw ? validateSettings(JSON.parse(raw)) : defaults, error: null };
  } catch {
    return {
      settings: defaults,
      error: 'Saved preferences could not be read. Defaults are active.',
    };
  }
}
