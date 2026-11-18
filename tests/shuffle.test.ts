import { expect, it } from 'vitest';
import { cardShufflePose, DECK_SIZE } from '../src/domain/shuffle';
import { builtInCharacters, characterName, parseCharacters } from '../src/domain/game';
it('moves the cards into two packets, changes their order, then reveals only the winner', () => {
  const packet = Array.from({ length: DECK_SIZE }, (_, i) => cardShufflePose(i, 0.32));
  expect(packet.some((p) => p.x < -60)).toBe(true);
  expect(packet.some((p) => p.x > 60)).toBe(true);
  const frontAt = (p: number) =>
    Array.from({ length: DECK_SIZE }, (_, i) => ({ i, ...cardShufflePose(i, p) })).sort(
      (a, b) => b.layer - a.layer,
    )[0].i;
  expect(frontAt(0.12)).toBe(0);
  expect(frontAt(0.49)).not.toBe(0);
  expect(frontAt(0.77)).toBe(0);
  expect(cardShufflePose(0, 1)).toMatchObject({ yaw: 180, opacity: 1, x: 0, y: 0 });
  for (let i = 1; i < DECK_SIZE; i++) expect(cardShufflePose(i, 1).opacity).toBe(0);
});
it('keeps visible trajectories continuous and all poses finite throughout the timeline', () => {
  for (let i = 0; i < DECK_SIZE; i++)
    for (let t = 0; t <= 1000; t++) {
      const p = cardShufflePose(i, t / 1000),
        prev = cardShufflePose(i, (t - 1) / 1000);
      expect(Object.values(p).every(Number.isFinite)).toBe(true);
      expect(p.opacity).toBeGreaterThanOrEqual(0);
      expect(p.opacity).toBeLessThanOrEqual(1);
      if (p.opacity > 0.05 && prev.opacity > 0.05) {
        expect(Math.abs(p.x - prev.x)).toBeLessThan(8);
        expect(Math.abs(p.y - prev.y)).toBeLessThan(8);
      }
    }
});
it('ships named text-only characters and retains optional localized names in custom catalogs', () => {
  expect(builtInCharacters.length).toBe(40);
  expect(
    builtInCharacters.every((c) => c.enabled && !c.imagePath && !/^CHAMPION/.test(c.name)),
  ).toBe(true);
  const c = parseCharacters([
    { id: 'custom', name: 'A custom name', nameRu: 'Своё имя', imagePath: '', enabled: true },
  ])[0];
  expect(characterName(c, 'ru')).toBe('Своё имя');
  expect(characterName(c, 'en')).toBe('A custom name');
  expect(characterName({ ...c, nameRu: undefined }, 'ru')).toBe('A custom name');
});
