/** Seven physical cards: fan, split, alternating interleave, second cut, collection, reveal.
 * Pure normalized choreography, independent of the randomly selected character and frame rate.
 */
export interface CardPose {
  x: number;
  y: number;
  rotate: number;
  yaw: number;
  scale: number;
  opacity: number;
  layer: number;
}
export const DECK_SIZE = 7;
const original = [0, 1, 2, 3, 4, 5, 6],
  first = [3, 0, 4, 1, 5, 2, 6],
  final = [0, 5, 2, 6, 1, 4, 3];
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (1 - Math.cos(Math.PI * clamp(x))) / 2;
function mix(a: CardPose, b: CardPose, t: number): CardPose {
  const u = ease(t);
  return {
    x: a.x + (b.x - a.x) * u,
    y: a.y + (b.y - a.y) * u,
    rotate: a.rotate + (b.rotate - a.rotate) * u,
    yaw: a.yaw + (b.yaw - a.yaw) * u,
    scale: a.scale + (b.scale - a.scale) * u,
    opacity: a.opacity + (b.opacity - a.opacity) * u,
    layer: u < 0.15 ? a.layer : b.layer,
  };
}
// Units: x / y are percentages of the card size, so packets never overlap on any screen.
function stack(index: number, order: number[]): CardPose {
  const rank = order.indexOf(index);
  return { x: rank * 0.6, y: rank * -0.9, rotate: -2 + rank * 0.4, yaw: 0, scale: 1, opacity: 1, layer: 40 - rank };
}
function fan(index: number): CardPose {
  const rank = [0, -1, 1, -2, 2, -3, 3][index];
  return {
    x: rank * 17,
    y: Math.abs(rank) * 5 - 4,
    rotate: rank * 9,
    yaw: 0,
    scale: 1 - Math.abs(rank) * 0.03,
    opacity: 1,
    layer: 40 - Math.abs(rank) * 2 + (rank > 0 ? 1 : 0),
  };
}
function split(index: number, order: number[], pass: number): CardPose {
  const rank = order.indexOf(index),
    side = rank < 3 ? -1 : 1,
    packet = rank < 3 ? rank : rank - 3;
  return {
    x: side * (64 + packet * 1.2),
    y: (pass === 1 ? 4 : -2) - packet * 1.4,
    rotate: side * (pass === 1 ? 7 : 10) + packet * 0.6,
    yaw: 0,
    scale: 0.96,
    opacity: 1,
    layer: 20 + (side > 0 ? 8 : 0) - packet,
  };
}
function interleave(index: number, old: number[], next: number[], pass: number, t: number): CardPose {
  const rank = next.indexOf(index),
    delay = (6 - rank) * 0.07,
    u = clamp((t - delay) / 0.55),
    pose = mix(split(index, old, pass), stack(index, next), u);
  // each card lifts in an arc as it is riffled onto the pile
  return { ...pose, y: pose.y - Math.sin(Math.PI * ease(u)) * 16, scale: pose.scale + Math.sin(Math.PI * u) * 0.04 };
}
export function cardShufflePose(index: number, progress: number): CardPose {
  const p = clamp(progress),
    initial = stack(index, original);
  if (p < 0.12) return mix({ ...initial, y: initial.y + 60, scale: 0.9, opacity: 0 }, initial, p / 0.12);
  if (p < 0.22) return mix(initial, fan(index), (p - 0.12) / 0.1);
  if (p < 0.32) return mix(fan(index), split(index, original, 1), (p - 0.22) / 0.1);
  if (p < 0.49) return interleave(index, original, first, 1, (p - 0.32) / 0.17);
  if (p < 0.59) return mix(stack(index, first), split(index, first, 2), (p - 0.49) / 0.1);
  if (p < 0.77) return interleave(index, first, final, 2, (p - 0.59) / 0.18);
  if (p < 0.86) {
    const from = stack(index, final),
      rank = final.indexOf(index);
    return mix(
      from,
      index === 0
        ? { x: 0, y: -6, rotate: 0, yaw: 0, scale: 1.06, opacity: 1, layer: 50 }
        : { ...from, x: from.x, y: 30 + rank * 2, rotate: from.rotate, scale: 0.9, opacity: 0, layer: 10 - rank },
      (p - 0.77) / 0.09,
    );
  }
  if (index !== 0) return { ...stack(index, final), opacity: 0, layer: 0 };
  const flip = ease((p - 0.86) / 0.14);
  return { x: 0, y: 6 * flip - 6, rotate: 0, yaw: flip * 180, scale: 1.06 - 0.06 * flip, opacity: 1, layer: 50 };
}
