import { describe, expect, it } from 'vitest';
import {
  advanceRound,
  chooseCharacter,
  createSession,
  emptyStatistics,
  parseCharacters,
  placeholders,
  recordStatistics,
  roundKey,
  selectionProgress,
  settleRound,
  wheelIndexAtPointer,
  wheelStopAngle,
} from '../src/domain/game';
import { defaults, loadSettings, SETTINGS_KEY, validateSettings } from '../src/domain/settings';
const guessing = () => ({
  ...createSession('card', 5, 60, 'test'),
  character: placeholders[0],
  phase: 'guessing' as const,
});
describe('selection and catalog', () => {
  it('selects enabled entries before animation, excludes immediate repeats, supports a single entry', () => {
    const entries = [{ ...placeholders[0], enabled: false }, placeholders[1], placeholders[2]];
    expect(chooseCharacter(entries, placeholders[1].id, () => 0).id).toBe(placeholders[2].id);
    expect(chooseCharacter([placeholders[0]], placeholders[0].id).id).toBe(placeholders[0].id);
    expect(() => chooseCharacter([])).toThrow();
  });
  it('validates local PNGs, unique IDs and a usable catalog', () => {
    expect(
      parseCharacters([{ ...placeholders[0], imagePath: '/characters/local-hero.png' }])[0].name,
    ).toBe('CHAMPION 001');
    for (const imagePath of [
      'https://example.com/a.png',
      '/characters/../a.png',
      '/characters/a.jpg',
    ])
      expect(() => parseCharacters([{ ...placeholders[0], imagePath }])).toThrow();
    expect(() => parseCharacters([placeholders[0], placeholders[0]])).toThrow();
    expect(() => parseCharacters([{ ...placeholders[0], enabled: false }])).toThrow();
  });
  it('stops the physical wheel at exactly the selected segment for every catalog entry', () => {
    for (const count of [1, 2, 7, 120])
      for (let index = 0; index < count; index++)
        expect(wheelIndexAtPointer(wheelStopAngle(index, count), count)).toBe(index);
  });
  it('has monotonic acceleration and deceleration and a complete timeline', () => {
    expect(selectionProgress(0)).toBe(0);
    expect(selectionProgress(1)).toBe(1);
    const samples = Array.from({ length: 101 }, (_, i) => selectionProgress(i / 100));
    expect(samples.every((x, i) => i === 0 || x >= samples[i - 1])).toBe(true);
    expect(samples[99] - samples[98]).toBeLessThan(samples[50] - samples[49]);
  });
});
describe('session integrity', () => {
  it('settles once and ignores stale round callbacks', () => {
    const s = guessing(),
      settled = settleRound(s, roundKey(s), 'correct', 58);
    expect(settled.records).toHaveLength(1);
    expect(settleRound(settled, roundKey(s), 'correct', 57)).toBe(settled);
    const next = advanceRound(settled, 30);
    expect(next.duration).toBe(30);
    expect(next.round).toBe(2);
    expect(next.character).toBeNull();
    expect(
      settleRound(
        { ...next, phase: 'guessing', character: placeholders[1] },
        roundKey(s),
        'timeout',
        0,
      ).records,
    ).toHaveLength(1);
  });
  it('finishes finite sessions and keeps unlimited sessions running', () => {
    const s = guessing();
    expect(advanceRound(settleRound({ ...s, round: 5 }, 'test:5', 'skipped', 12), 60).phase).toBe(
      'finished',
    );
    expect(
      advanceRound(settleRound({ ...s, round: 500, rounds: 0 }, 'test:500', 'passed', 12), 60)
        .round,
    ).toBe(501);
    expect(advanceRound(s, 60)).toBe(s);
  });
  it('records only correct answers as a streak and counts all outcomes separately', () => {
    let stats = { ...emptyStatistics };
    for (const outcome of ['correct', 'correct', 'timeout', 'skipped', 'passed'] as const)
      stats = recordStatistics(stats, {
        round: 1,
        character: placeholders[0],
        outcome,
        remaining: 22,
      });
    expect(stats).toMatchObject({
      rounds: 5,
      correct: 2,
      timeouts: 1,
      skipped: 1,
      passed: 1,
      bestStreak: 2,
      streak: 0,
      bestRemaining: 22,
    });
  });
});
describe('preferences', () => {
  it('starts at one minute and endless rounds, validates imports and clamps values', () => {
    expect(defaults).toMatchObject({ duration: 3600, rounds: 0 });
    expect(validateSettings({ scale: 99, duration: 3, rounds: -2, master: -1 })).toMatchObject({
      scale: 1.2,
      duration: 3600,
      rounds: 0,
      master: 0,
    });
    expect(() => validateSettings('broken')).toThrow();
  });
  it('migrates reusable v2 preferences while using the new one-minute default', () => {
    const storage = {
      getItem: (key: string) =>
        key === 'character-roulette.settings.v2'
          ? JSON.stringify({ language: 'ru', duration: 45, reducedMotion: true, stream: true })
          : null,
    };
    expect(loadSettings(storage).settings).toMatchObject({
      language: 'ru',
      duration: 3600,
      reducedMotion: true,
      stream: true,
    });
    expect(
      loadSettings({ getItem: (key) => (key === SETTINGS_KEY ? 'bad' : null) }).error,
    ).toBeTruthy();
  });
});
