import catalog from '../../public/characters/manifest.json';
export type Language = 'en' | 'ru';
export type SelectionMethod = 'card' | 'roulette';
export type Screen = 'home' | 'modes' | 'draw' | 'guess' | 'settings' | 'stats' | 'summary' | 'gallery';
export interface Character {
  id: string;
  name: string;
  nameRu?: string;
  imagePath: string;
  enabled: boolean;
}
export interface CharacterRepository {
  all(): readonly Character[];
}
export const placeholders: Character[] = Array.from({ length: 120 }, (_, i) => ({
  id: `champion-${String(i + 1).padStart(3, '0')}`,
  name: `CHAMPION ${String(i + 1).padStart(3, '0')}`,
  imagePath: '',
  enabled: true,
}));
export function parseCharacters(raw: unknown): Character[] {
  if (!Array.isArray(raw)) throw new Error('The character manifest must be an array.');
  const ids = new Set<string>();
  const result = raw.map((item: unknown) => {
    if (!item || typeof item !== 'object') throw new Error('Invalid character entry.');
    const c = item as Record<string, unknown>;
    if (
      typeof c.id !== 'string' ||
      !c.id.trim() ||
      ids.has(c.id) ||
      typeof c.name !== 'string' ||
      !c.name.trim() ||
      typeof c.enabled !== 'boolean' ||
      typeof c.imagePath !== 'string' ||
      (c.nameRu !== undefined && (typeof c.nameRu !== 'string' || !c.nameRu.trim()))
    )
      throw new Error('Each character needs a unique id, name, imagePath and enabled flag.');
    if (
      c.imagePath &&
      (!c.imagePath.startsWith('/characters/') ||
        c.imagePath.includes('..') ||
        !/^\/characters\/[\w ./-]+\.(png|webp)$/i.test(c.imagePath))
    )
      throw new Error('Character artwork must be a local PNG or WebP under /characters/.');
    ids.add(c.id);
    return {
      id: c.id,
      name: c.name,
      ...(typeof c.nameRu === 'string' ? { nameRu: c.nameRu } : {}),
      imagePath: c.imagePath,
      enabled: c.enabled,
    };
  });
  if (!result.some((c) => c.enabled)) throw new Error('Enable at least one character.');
  return result;
}
export const builtInCharacters: Character[] = parseCharacters(catalog);
/** Preview: the first round of every session lands on this character. Set to '' to disable. */
export const PREVIEW_FIRST_ID = 'champion-034';
export function characterName(character: Character, language: Language): string {
  return language === 'ru' ? character.nameRu || character.name : character.name;
}
export function chooseCharacter(
  characters: readonly Character[],
  previousId?: string,
  random = Math.random,
): Character {
  const enabled = characters.filter((c) => c.enabled);
  if (!enabled.length) throw new Error('No enabled characters.');
  const alternatives = enabled.filter((c) => c.id !== previousId),
    pool = alternatives.length ? alternatives : enabled;
  return pool[Math.min(pool.length - 1, Math.max(0, Math.floor(random() * pool.length)))];
}
export function wheelStopAngle(index: number, count: number, turns = 7): number {
  if (index < 0 || index >= count || count < 1) throw new Error('Invalid wheel entry.');
  return turns * 360 + 360 - ((index + 0.5) * 360) / count;
}
export function wheelIndexAtPointer(rotation: number, count: number): number {
  const a = ((-rotation % 360) + 360) % 360;
  return Math.min(count - 1, Math.floor(a / (360 / count)));
}
export function selectionProgress(t: number): number {
  const p = Math.min(1, Math.max(0, t));
  return p < 0.12 ? 0.17 * (p / 0.12) ** 2 : 0.17 + 0.83 * (1 - (1 - (p - 0.12) / 0.88) ** 3);
}
export type Outcome = 'correct' | 'skipped' | 'passed' | 'timeout';
export interface RoundRecord {
  round: number;
  character: Character;
  outcome: Outcome;
  remaining: number;
}
export interface GameSession {
  sessionId: string;
  round: number;
  rounds: number;
  duration: number;
  method: SelectionMethod;
  character: Character | null;
  phase: 'selecting' | 'revealed' | 'guessing' | 'settled' | 'finished';
  outcome: Outcome | null;
  elapsed: number;
  remaining: number;
  records: RoundRecord[];
}
export function createSession(
  method: SelectionMethod,
  rounds: number,
  duration: number,
  id = crypto.randomUUID(),
): GameSession {
  return {
    sessionId: id,
    round: 1,
    rounds,
    duration,
    method,
    character: null,
    phase: 'selecting',
    outcome: null,
    elapsed: 0,
    remaining: duration,
    records: [],
  };
}
export function roundKey(s: GameSession) {
  return `${s.sessionId}:${s.round}`;
}
export function settleRound(
  s: GameSession,
  key: string,
  outcome: Outcome,
  remaining: number,
): GameSession {
  if (roundKey(s) !== key || s.phase !== 'guessing' || s.outcome || !s.character) return s;
  const record = {
    round: s.round,
    character: s.character,
    outcome,
    remaining: Math.min(s.duration, Math.max(0, Math.floor(remaining))),
  };
  return {
    ...s,
    phase: 'settled',
    outcome,
    remaining: record.remaining,
    records: [...s.records, record],
  };
}
export function advanceRound(s: GameSession, duration: number): GameSession {
  if (s.phase !== 'settled') return s;
  if (s.rounds > 0 && s.round >= s.rounds) return { ...s, phase: 'finished' };
  return {
    ...s,
    round: s.round + 1,
    duration,
    phase: 'selecting',
    character: null,
    outcome: null,
    elapsed: 0,
    remaining: duration,
  };
}
export interface Statistics {
  rounds: number;
  correct: number;
  skipped: number;
  passed: number;
  timeouts: number;
  bestRemaining: number;
  streak: number;
  bestStreak: number;
}
export const emptyStatistics: Statistics = {
  rounds: 0,
  correct: 0,
  skipped: 0,
  passed: 0,
  timeouts: 0,
  bestRemaining: 0,
  streak: 0,
  bestStreak: 0,
};
export function recordStatistics(s: Statistics, r: RoundRecord): Statistics {
  const streak = r.outcome === 'correct' ? s.streak + 1 : 0;
  return {
    ...s,
    rounds: s.rounds + 1,
    correct: s.correct + Number(r.outcome === 'correct'),
    skipped: s.skipped + Number(r.outcome === 'skipped'),
    passed: s.passed + Number(r.outcome === 'passed'),
    timeouts: s.timeouts + Number(r.outcome === 'timeout'),
    bestRemaining:
      r.outcome === 'correct' ? Math.max(s.bestRemaining, r.remaining) : s.bestRemaining,
    streak,
    bestStreak: Math.max(s.bestStreak, streak),
  };
}
export interface CameraService {
  listDevices(): Promise<string[]>;
  startPreview(device: string, mirrored: boolean): Promise<void>;
  stopPreview(): Promise<void>;
  dispose(): void;
}
export interface AudioService {
  setVolumes(master: number, music: number, effects: number): void;
  playCue(cue: string): Promise<void>;
  dispose(): void;
}
