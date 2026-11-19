import type { Language, SelectionMethod } from './game';
export interface Settings {
  duration: number;
  rounds: number;
  method: SelectionMethod;
  language: Language;
  langV: number;
  reducedMotion: boolean;
  quality: 'auto' | 'high' | 'low';
  highContrast: boolean;
  largerText: boolean;
  stream: boolean;
  safeMargin: number;
  scale: number;
  intensity: number;
  master: number;
  music: number;
  effects: number;
  resolution: string;
}
export const defaults: Settings = {
  duration: 3600,
  rounds: 0,
  method: 'card',
  language: 'ru',
  langV: 2,
  reducedMotion: false,
  quality: 'auto',
  highContrast: false,
  largerText: false,
  stream: false,
  safeMargin: 3,
  scale: 1,
  intensity: 0.65,
  master: 0.8,
  music: 0.5,
  effects: 0.8,
  resolution: '1920 × 1080',
};
export const SETTINGS_KEY = 'character-roulette.settings.v3';
export function validateSettings(input: unknown): Settings {
  if (typeof input === 'string') input = JSON.parse(input);
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw Error('Invalid preferences.');
  const m = input as Record<string, unknown>,
    s = { ...defaults };
  const num = (k: keyof Settings, min: number, max: number) =>
    typeof m[k] === 'number' && Number.isFinite(m[k])
      ? Math.max(min, Math.min(max, m[k] as number))
      : (defaults[k] as number);
  s.duration = 3600; // stopwatch mode: we measure how long a guess takes
  s.rounds = 0; // endless: the host decides when to stop
  s.method = m.method === 'roulette' ? 'roulette' : 'card';
  s.language = m.language === 'en' && m.langV === 2 ? 'en' : 'ru';
  s.langV = 2;
  s.quality = ['auto', 'high', 'low'].includes(m.quality as string)
    ? (m.quality as Settings['quality'])
    : 'auto';
  for (const k of ['reducedMotion', 'highContrast', 'largerText', 'stream'] as const)
    if (typeof m[k] === 'boolean') s[k] = m[k];
  s.safeMargin = num('safeMargin', 0, 8);
  s.scale = num('scale', 0.85, 1.2);
  s.intensity = num('intensity', 0, 1);
  s.master = num('master', 0, 1);
  s.music = num('music', 0, 1);
  s.effects = num('effects', 0, 1);
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
    const source = storage ?? window.localStorage,
      current = source.getItem(SETTINGS_KEY);
    if (current) return { settings: validateSettings(JSON.parse(current)), error: null };
    const legacy =
      source.getItem('character-roulette.settings.v2') ??
      source.getItem('flutter.settings.v1') ??
      source.getItem('settings.v1');
    if (legacy) {
      const old = JSON.parse(legacy);
      const migrated = validateSettings(old);
      if (migrated.duration === 45) migrated.duration = 60;
      return { settings: migrated, error: null };
    }
    return { settings: defaults, error: null };
  } catch {
    return { settings: defaults, error: 'Preferences could not be restored. Defaults are active.' };
  }
}
