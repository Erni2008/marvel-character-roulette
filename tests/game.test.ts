import { describe, expect, it } from 'vitest';
import {
  generateChallenge,
  newSession,
  nextRound,
  placeholderRepository,
  recordRound,
  retryRound,
  selectChampion,
  challenges,
} from '../src/domain/game';
import { defaults, loadSettings, SETTINGS_KEY, validateSettings } from '../src/domain/settings';
describe('Preserved game semantics', () => {
  it('selects only valid placeholder IDs and excludes the previous selection', () => {
    for (let i = 0; i < 1000; i++) {
      const next = selectChampion(placeholderRepository, 23, () => i / 1000);
      expect(next.id).toBeGreaterThanOrEqual(1);
      expect(next.id).toBeLessThanOrEqual(120);
      expect(next.id).not.toBe(23);
      expect(next.identifier).toMatch(/^CHAMPION_\d{3}$/);
    }
  });
  it('keeps the original mode pools and all eight chaos formats', () => {
    const chaos = new Set(
      Array.from({ length: 80 }, (_, i) => generateChallenge('chaos', () => i / 80)),
    );
    expect(chaos.size).toBe(8);
    expect(challenges).toHaveLength(8);
    for (let i = 0; i < 80; i++) {
      expect(generateChallenge('party', () => i / 80)).not.toBe('clues');
      expect(['taboo', 'clues', 'word', 'reverse', 'speed']).toContain(
        generateChallenge('knowledge', () => i / 80),
      );
    }
  });
  it('scores successes, replaces retries, and rotates players', () => {
    const s = {
      ...newSession(),
      champion: selectChampion(undefined, undefined, () => 0),
      challenge: 'mime' as const,
    };
    const recorded = recordRound(s, true, 12);
    expect(recorded.history[0].score).toBe(160);
    expect(recordRound(s, false, 12).history[0].score).toBe(0);
    expect(retryRound(recorded).history).toEqual([]);
    const next = nextRound(recorded, 2);
    expect(next.player).toBe(2);
    expect(next.round).toBe(2);
    expect(next.champion).toBeNull();
    expect(nextRound(next, 2).player).toBe(1);
    expect(next.history).toHaveLength(1);
  });
});
describe('Portable preferences', () => {
  it('imports original numeric Flutter settings and validates every boundary', () => {
    const migrated = validateSettings({
      mode: 2,
      difficulty: 3,
      players: 12,
      duration: 90,
      language: 'ru',
      scale: 4,
      reducedMotion: true,
    });
    expect(migrated).toMatchObject({
      mode: 'chaos',
      difficulty: 'expert',
      players: 10,
      duration: 90,
      language: 'ru',
      scale: 1.2,
      reducedMotion: true,
    });
    expect(validateSettings({ duration: 17, rounds: 2, master: NaN }).duration).toBe(45);
    expect(validateSettings({ mode: 99 }).mode).toBe('party');
    expect(() => validateSettings(null)).toThrow();
  });
  it('round-trips settings and recovers corrupt or blocked storage', () => {
    const storage = new Map([
      [SETTINGS_KEY, JSON.stringify({ ...defaults, players: 7, language: 'ru' })],
    ]);
    expect(loadSettings({ getItem: (key) => storage.get(key) ?? null }).settings.players).toBe(7);
    expect(loadSettings({ getItem: () => '{broken' }).error).not.toBeNull();
    expect(
      loadSettings({
        getItem: () => {
          throw Error('blocked');
        },
      }).settings,
    ).toEqual(defaults);
    expect(loadSettings({ getItem: () => null }).error).toBeNull();
  });
});
