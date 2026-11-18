export type Mode = 'party' | 'knowledge' | 'chaos';
export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';
export type Language = 'en' | 'ru';
export type Screen = 'menu' | 'setup' | 'roulette' | 'challenge' | 'result' | 'settings';
export type ChallengeId =
  'taboo' | 'mime' | 'clues' | 'word' | 'reverse' | 'roleplay' | 'speed' | 'chaos';
export interface Champion {
  id: number;
  identifier: string;
}
export interface CharacterRepository {
  all(): readonly Champion[];
}
export const placeholderRepository: CharacterRepository = {
  all: () =>
    Array.from({ length: 120 }, (_, i) => ({
      id: i + 1,
      identifier: `CHAMPION_${String(i + 1).padStart(3, '0')}`,
    })),
};
export function selectChampion(
  repository: CharacterRepository = placeholderRepository,
  exclude?: number,
  random = Math.random,
): Champion {
  const pool = repository.all().filter((c) => c.id !== exclude);
  if (!pool.length) throw new Error('No champions available');
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
}
export interface ChallengeDefinition {
  id: ChallengeId;
  title: [string, string];
  tag: [string, string];
  instruction: [string, string];
  color: string;
}
export const challenges: readonly ChallengeDefinition[] = [
  {
    id: 'taboo',
    title: ['Taboo', 'Табу'],
    tag: ['THE ART OF AVOIDANCE', 'ИСКУССТВО ОБЪЯСНЕНИЯ'],
    instruction: [
      'Explain your champion without the forbidden words. Character-specific word lists will arrive with the champion database.',
      'Объясните героя без запрещённых слов. Списки слов появятся вместе с базой героев.',
    ],
    color: '#E83246',
  },
  {
    id: 'mime',
    title: ['Mime', 'Пантомима'],
    tag: ['LET YOUR BODY TALK', 'ЯЗЫК ТЕЛА'],
    instruction: [
      'No words. No sounds. Bring your champion to life using gestures alone.',
      'Ни слов, ни звуков. Покажите героя только жестами.',
    ],
    color: '#8DB5D8',
  },
  {
    id: 'clues',
    title: ['Three clues', 'Три подсказки'],
    tag: ['ONE REVEAL AT A TIME', 'ШАГ ЗА ШАГОМ'],
    instruction: [
      'Reveal one clue slot at a time. Character facts are not connected yet; no invented clues will be shown.',
      'Открывайте по одному слоту. Факты о героях пока не подключены — выдуманных подсказок не будет.',
    ],
    color: '#D9AC60',
  },
  {
    id: 'word',
    title: ['One word', 'Одно слово'],
    tag: ['MAKE IT COUNT', 'ВЫБИРАЙТЕ ТОЧНО'],
    instruction: [
      'One champion. Exactly one word. Give your team the word that unlocks the answer.',
      'Один герой. Ровно одно слово. Дайте команде ключ к ответу.',
    ],
    color: '#9EC3AA',
  },
  {
    id: 'reverse',
    title: ['Reverse guess', 'Угадай себя'],
    tag: ['THE ANSWER IS YOU', 'ОТВЕТ — ЭТО ВЫ'],
    instruction: [
      'Turn away from the stage. Ask yes/no questions to discover your own champion.',
      'Отвернитесь от сцены. Задавайте вопросы с ответами «да» или «нет», чтобы угадать своего героя.',
    ],
    color: '#B5A0CC',
  },
  {
    id: 'roleplay',
    title: ['Roleplay', 'В роли героя'],
    tag: ['BECOME THE LEGEND', 'СТАНЬТЕ ЛЕГЕНДОЙ'],
    instruction: [
      'Act and speak as your champion. Stay in character while the others guess.',
      'Действуйте и говорите от лица героя. Не выходите из роли, пока остальные угадывают.',
    ],
    color: '#D5A186',
  },
  {
    id: 'speed',
    title: ['Speed guess', 'Блиц'],
    tag: ['FIVE SECONDS. ALL IN.', 'ПЯТЬ СЕКУНД. ВА-БАНК.'],
    instruction: [
      'Five seconds. One chance. Help your team guess before the clock runs out.',
      'Пять секунд. Один шанс. Помогите команде угадать до конца отсчёта.',
    ],
    color: '#E4C778',
  },
  {
    id: 'chaos',
    title: ['Random chaos', 'Случайный хаос'],
    tag: ['EXPECT THE UNEXPECTED', 'БУДЬТЕ ГОТОВЫ КО ВСЕМУ'],
    instruction: [
      'Your champion comes with an unexpected restriction. Play by the rule below.',
      'К герою прилагается неожиданное ограничение. Соблюдайте правило ниже.',
    ],
    color: '#CA93B2',
  },
];
const pools: Record<Mode, ChallengeId[]> = {
  party: ['taboo', 'mime', 'word', 'reverse', 'roleplay', 'speed'],
  knowledge: ['taboo', 'clues', 'word', 'reverse', 'speed'],
  chaos: challenges.map((c) => c.id),
};
export function generateChallenge(mode: Mode, random = Math.random): ChallengeId {
  const pool = pools[mode];
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
}
export function getChallenge(id: ChallengeId) {
  return challenges.find((c) => c.id === id)!;
}
export const restrictions: [string, string][] = [
  ['Speak only in questions.', 'Говорите только вопросами.'],
  ['Keep both hands behind your back.', 'Держите обе руки за спиной.'],
  ['Use a dramatic whisper.', 'Говорите драматичным шёпотом.'],
  ['Explain without using any names.', 'Объясняйте без имён.'],
];
export interface RoundRecord {
  champion: Champion;
  challenge: ChallengeId;
  remaining: number;
  success: boolean;
  score: number;
}
export interface GameSession {
  round: number;
  player: number;
  champion: Champion | null;
  challenge: ChallengeId | null;
  restriction: number;
  history: RoundRecord[];
  elapsed: number;
}
export function newSession(): GameSession {
  return {
    round: 1,
    player: 1,
    champion: null,
    challenge: null,
    restriction: 0,
    history: [],
    elapsed: 0,
  };
}
export function recordRound(s: GameSession, success: boolean, remaining: number): GameSession {
  if (!s.champion || !s.challenge) throw new Error('Round has no selection');
  const seconds = Math.max(0, Math.floor(remaining));
  return {
    ...s,
    history: [
      ...s.history,
      {
        champion: s.champion,
        challenge: s.challenge,
        remaining: seconds,
        success,
        score: success ? 100 + seconds * 5 : 0,
      },
    ],
  };
}
export function nextRound(s: GameSession, players: number): GameSession {
  return {
    ...s,
    round: s.round + 1,
    player: (s.player % players) + 1,
    champion: null,
    challenge: null,
    elapsed: 0,
  };
}
export function retryRound(s: GameSession): GameSession {
  return { ...s, history: s.history.slice(0, -1), elapsed: 0 };
}
// Future integration boundaries. No implementations request a camera or play audio.
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
