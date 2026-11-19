import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { motion as m } from 'motion/react';
import type { MotionValue } from 'motion/react';
import { characterName } from '../domain/game';
import type { Character } from '../domain/game';
import { asset, identity, monogram } from '../domain/identity';
import { useGame } from '../app/Store';
import { sfx } from '../fx/sound';

export type Tone = 'red' | 'blue' | 'green' | 'silver' | 'gold';
const hues: Record<Tone, string> = {
  red: '#ff2e43',
  blue: '#3d8bff',
  green: '#2fe38a',
  silver: '#c9d2e3',
  gold: '#f3c56b',
};

/** Kept for API compatibility: a thin luminous corner frame. */
export function IlluminatedFrame({ tone = 'red', className = '' }: { tone?: Tone; shape?: string; className?: string }) {
  return <span className={`lux-frame ${className}`} style={{ '--accent': hues[tone] } as CSSProperties} aria-hidden="true" />;
}

export function MetallicButton({
  children,
  tone = 'red',
  shape = 'button',
  className = '',
  onClick,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; shape?: 'button' | 'tile'; children: ReactNode }) {
  const { motion } = useGame();
  const { onAnimationStart: _a, onDrag: _b, onDragStart: _c, onDragEnd: _d, ...props } = rest;
  return (
    <m.button
      type="button"
      {...props}
      onClick={(e) => {
        sfx.click();
        onClick?.(e);
      }}
      className={`metallic-button tone-${tone} ${shape === 'tile' ? 'metallic-tile' : ''} ${className}`}
      style={{ '--accent': hues[tone], ...props.style } as CSSProperties}
      whileTap={motion ? { scale: 0.96 } : undefined}
      transition={{ type: 'spring', stiffness: 520, damping: 28 }}
    >
      <span className="btn-plate" aria-hidden="true" />
      <span className="metallic-button-content">{children}</span>
      <span className="button-sweep" aria-hidden="true" />
    </m.button>
  );
}

export function BrandEmblem({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 200 200" className={`brand-emblem ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fff3d1" />
          <stop offset=".35" stopColor="#f0b34a" />
          <stop offset=".55" stopColor="#8a5a16" />
          <stop offset=".8" stopColor="#f7d488" />
          <stop offset="1" stopColor="#7a4e12" />
        </linearGradient>
        <radialGradient id={`${id}-c`}>
          <stop stopColor="#ff3a4c" />
          <stop offset=".7" stopColor="#8c0717" />
          <stop offset="1" stopColor="#3a020a" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="92" fill={`url(#${id}-c)`} stroke={`url(#${id}-g)`} strokeWidth="7" />
      <circle cx="100" cy="100" r="78" fill="none" stroke="#ffd98a" strokeOpacity=".35" strokeWidth="1.5" strokeDasharray="2 5" />
      <path d="M100 26 L117 79 L173 79 L128 111 L145 165 L100 132 L55 165 L72 111 L27 79 L83 79 Z" fill={`url(#${id}-g)`} stroke="#3a0208" strokeWidth="3" />
    </svg>
  );
}

function Pattern({ kind }: { kind: string }) {
  return <div className={`cc-pattern pattern-${kind}`} aria-hidden="true" />;
}

export function CharacterCard({
  character,
  front = false,
  className = '',
  showName = true,
}: {
  character?: Character | null;
  front?: boolean;
  tone?: Tone;
  className?: string;
  showName?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  const { settings } = useGame();
  const name = character ? characterName(character, settings.language) : '';
  const id = identity(character);
  const style = { '--a': id.a, '--b': id.b, '--glow': id.glow } as CSSProperties;
  if (!front || !character)
    return (
      <div className={`character-card card-back ${className}`} aria-hidden="true">
        <div className="cb-field" />
        <div className="cb-rays" />
        <div className="cb-border" />
        <BrandEmblem className="cb-emblem" />
        <span className="cb-word cb-top">CHARACTER</span>
        <span className="cb-word cb-bottom">ROULETTE</span>
        <div className="cc-foil" />
      </div>
    );
  const art = character.imagePath && !broken;
  return (
    <div className={`character-card card-front ${className}`} style={style} data-character-id={character.id}>
      <div className="cc-bg" />
      <Pattern kind={id.pattern} />
      <div className="cc-halftone" />
      {art ? (
        <img className="character-art" src={asset(character.imagePath)} alt={name} onError={() => setBroken(true)} draggable={false} />
      ) : (
        <div className="cc-mono neutral-silhouette" aria-hidden="true">
          <span className="cc-mono-shadow">{monogram(character.name)}</span>
          <span className="cc-mono-fill">{monogram(character.name)}</span>
        </div>
      )}
      <div className="cc-vignette" />
      <div className="cc-foil" />
      <div className="cc-border" />
      <span className="cc-number">№ {character.id.replace(/\D/g, '').padStart(3, '0')}</span>
      {showName && (
        <div className="character-name" title={name}>
          <span>{name}</span>
        </div>
      )}
    </div>
  );
}

export function CardFan() {
  return (
    <div className="card-fan" aria-hidden="true">
      {[-2, -1, 1, 2, 0].map((n) => (
        <div className={`fan-leaf leaf-${n + 2}`} key={n} style={{ '--leaf': n } as CSSProperties}>
          <CharacterCard />
        </div>
      ))}
    </div>
  );
}

const C = 500;
const polar = (r: number, a: number) => [C + r * Math.cos(((a - 90) * Math.PI) / 180), C + r * Math.sin(((a - 90) * Math.PI) / 180)];
function arc(r1: number, r2: number, a1: number, a2: number) {
  const big = a2 - a1 > 180 ? 1 : 0,
    p = polar(r2, a1),
    q = polar(r2, a2),
    s = polar(r1, a2),
    t = polar(r1, a1);
  return `M${p.join(' ')}A${r2} ${r2} 0 ${big} 1 ${q.join(' ')}L${s.join(' ')}A${r1} ${r1} 0 ${big} 0 ${t.join(' ')}Z`;
}

export function RouletteWheel({
  rotation = 0,
  count = 40,
  entries,
  selectedIndex = -1,
  decorative = false,
}: {
  rotation?: number | MotionValue<number>;
  count?: number;
  entries?: Character[];
  selectedIndex?: number;
  decorative?: boolean;
}) {
  const id = useId().replace(/:/g, '');
  const spin = useRef<HTMLDivElement>(null);
  const { settings } = useGame();
  const n = entries?.length || count;
  useEffect(() => {
    if (typeof rotation === 'number') return;
    const apply = (v: number) => {
      if (spin.current) spin.current.style.transform = `rotate(${v}deg)`;
    };
    apply(rotation.get());
    return rotation.on('change', apply);
  }, [rotation]);
  const step = 360 / n;
  const segments = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => {
        const c = entries?.[i],
          ident = identity(c ?? { id: `x-${i}`, name: '', imagePath: '', enabled: true });
        return { c, ident, d: arc(250, 452, i * step, (i + 1) * step) };
      }),
    [n, entries, step],
  );
  const bulbs = 36;
  return (
    <div className={`roulette-wheel ${decorative ? 'wheel-decorative' : ''}`}>
      <div className="wheel-shadow" />
      <svg className="wheel-frame" viewBox="0 0 1000 1000" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#fff1c9" />
            <stop offset=".22" stopColor="#c8891f" />
            <stop offset=".45" stopColor="#5e3a08" />
            <stop offset=".62" stopColor="#f6d27f" />
            <stop offset=".82" stopColor="#8a5a12" />
            <stop offset="1" stopColor="#ffe6a3" />
          </linearGradient>
        </defs>
        <circle cx={C} cy={C} r="496" fill="#07070c" />
        <circle cx={C} cy={C} r="486" fill="none" stroke={`url(#${id}-gold)`} strokeWidth="22" />
        <circle cx={C} cy={C} r="470" fill="#14070b" />
        <g className="wheel-bulbs">
          {Array.from({ length: bulbs }, (_, i) => {
            const [x, y] = polar(486, (360 / bulbs) * i);
            return <circle key={i} cx={x} cy={y} r="6.5" className={`bulb bulb-${i % 2}`} />;
          })}
        </g>
      </svg>
      <div className="wheel-spin" ref={spin} style={typeof rotation === 'number' ? { transform: `rotate(${rotation}deg)` } : undefined}>
        <svg viewBox="0 0 1000 1000" aria-hidden="true">
          <defs>
            <radialGradient id={`${id}-shade`} cx="50%" cy="50%" r="50%">
              <stop offset=".5" stopColor="#000" stopOpacity=".55" />
              <stop offset=".75" stopColor="#000" stopOpacity="0" />
              <stop offset=".93" stopColor="#000" stopOpacity=".05" />
              <stop offset="1" stopColor="#000" stopOpacity=".5" />
            </radialGradient>
          </defs>
          <g className="wheel-rotor">
            {segments.map(({ d, ident }, i) => (
              <path
                key={i}
                d={d}
                fill={i % 2 ? ident.a : ident.b}
                className={i === selectedIndex ? 'seg seg-win' : 'seg'}
                style={{ '--glow': ident.glow } as CSSProperties}
                stroke="#f3c56b"
                strokeOpacity=".55"
                strokeWidth="1.6"
                data-wheel-index={i}
                data-selected={i === selectedIndex ? true : undefined}
              />
            ))}
            <circle cx={C} cy={C} r="452" fill={`url(#${id}-shade)`} pointerEvents="none" />
            {!decorative &&
              segments.map(({ c }, i) => {
                const a = (i + 0.5) * step,
                  [x, y] = polar(352, a),
                  label = c ? characterName(c, settings.language) : String(i + 1).padStart(2, '0');
                const size = n > 48 ? 15 : n > 30 ? 19 : 24;
                return (
                  <text
                    key={`t${i}`}
                    x={x}
                    y={y}
                    className={i === selectedIndex ? 'seg-label seg-label-win' : 'seg-label'}
                    fontSize={label.length > 15 ? size * 0.82 : size}
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${a - 90} ${x} ${y})`}
                  >
                    {label.toUpperCase()}
                  </text>
                );
              })}
            {Array.from({ length: n }, (_, i) => {
              const [x1, y1] = polar(452, i * step),
                [x2, y2] = polar(250, i * step);
              return <line key={`l${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f7d488" strokeOpacity=".7" strokeWidth="2" />;
            })}
          </g>
        </svg>
      </div>
      <svg className="wheel-hub" viewBox="0 0 1000 1000" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-hub`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#fff1c9" />
            <stop offset=".3" stopColor="#b47a1a" />
            <stop offset=".55" stopColor="#4a2c05" />
            <stop offset=".75" stopColor="#e9bf63" />
            <stop offset="1" stopColor="#6b430c" />
          </linearGradient>
          <radialGradient id={`${id}-core`}>
            <stop stopColor="#2a0910" />
            <stop offset=".8" stopColor="#0b0306" />
            <stop offset="1" stopColor="#000" />
          </radialGradient>
        </defs>
        <circle cx={C} cy={C} r="252" fill="none" stroke={`url(#${id}-hub)`} strokeWidth="14" />
        <circle cx={C} cy={C} r="238" fill={`url(#${id}-core)`} />
        <circle cx={C} cy={C} r="205" fill="none" stroke="#f3c56b" strokeOpacity=".3" strokeWidth="2" strokeDasharray="3 9" />
      </svg>
      <div className="wheel-center">
        <BrandEmblem />
      </div>
      <div className="wheel-gloss" />
      <div className="wheel-pointer" aria-hidden="true">
        <svg viewBox="0 0 80 110">
          <defs>
            <linearGradient id={`${id}-ptr`} x1="0" x2="1">
              <stop stopColor="#fff3d1" />
              <stop offset=".5" stopColor="#e0a33a" />
              <stop offset="1" stopColor="#7a4e12" />
            </linearGradient>
          </defs>
          <path d="M40 106 L8 30 A34 34 0 1 1 72 30 Z" fill={`url(#${id}-ptr)`} stroke="#3a0208" strokeWidth="3" />
          <circle cx="40" cy="34" r="13" fill="#c8102e" stroke="#fff1c9" strokeWidth="3" />
        </svg>
      </div>
    </div>
  );
}

export function CircularTimer({
  remaining,
  total,
  running,
  settled,
  toggle,
}: {
  remaining: number;
  total: number;
  running: boolean;
  settled: boolean;
  toggle: () => void;
}) {
  const { t } = useGame(),
    id = useId().replace(/:/g, ''),
    ratio = total ? remaining / total : 0,
    urgent = remaining <= 10 && !settled,
    time = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`;
  const R = 88,
    L = 2 * Math.PI * R;
  const [x, y] = [100 + R * Math.sin(ratio * 2 * Math.PI), 100 - R * Math.cos(ratio * 2 * Math.PI)];
  return (
    <button
      className={`circular-timer ${running ? 'is-running' : ''} ${urgent ? 'urgent' : ''} ${settled ? 'is-settled' : ''}`}
      onClick={toggle}
      disabled={settled}
      aria-label={settled ? t('Round complete', 'Раунд завершён') : running ? t('Pause timer', 'Приостановить таймер') : t('Resume timer', 'Продолжить таймер')}
    >
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-arc`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor={urgent ? '#ff8a8a' : '#ffe6a3'} />
            <stop offset="1" stopColor={urgent ? '#ff1f3d' : '#e0a33a'} />
          </linearGradient>
          <filter id={`${id}-blur`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <circle cx="100" cy="100" r="98" className="tm-plate" />
        <circle cx="100" cy="100" r={R} fill="none" stroke="#ffffff" strokeOpacity=".07" strokeWidth="9" />
        {Array.from({ length: 60 }, (_, i) => (
          <line key={i} x1="100" y1="22" x2="100" y2={i % 5 ? 26 : 30} stroke="#fff" strokeOpacity={i % 5 ? 0.15 : 0.4} strokeWidth={i % 5 ? 0.8 : 1.4} transform={`rotate(${i * 6} 100 100)`} />
        ))}
        <circle cx="100" cy="100" r={R} fill="none" stroke={`url(#${id}-arc)`} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${L * ratio} ${L}`} transform="rotate(-90 100 100)" filter={`url(#${id}-blur)`} opacity=".8" className="tm-arc" />
        <circle cx="100" cy="100" r={R} fill="none" stroke={`url(#${id}-arc)`} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${L * ratio} ${L}`} transform="rotate(-90 100 100)" className="tm-arc" />
        {ratio > 0 && <circle cx={x} cy={y} r="6" fill="#fff" className="tm-head" />}
      </svg>
      <span role="timer" aria-label={t(`${remaining} seconds remaining`, `${remaining} секунд осталось`)}>
        {time}
      </span>
      <small>{settled ? t('DONE', 'ГОТОВО') : running ? t('TAP TO PAUSE', 'ПАУЗА — ТАП') : t('PAUSED', 'ПАУЗА')}</small>
    </button>
  );
}

export function AtmosphericBackground({ city = false }: { city?: boolean }) {
  return (
    <div className={`atmospheric-background ${city ? 'is-home' : ''}`} aria-hidden="true">
      <div className="bg-base" />
      <div className="bg-beam beam-1" />
      <div className="bg-beam beam-2" />
      <div className="bg-beam beam-3" />
      <div className="bg-floor" />
      <div className="bg-embers">
        {Array.from({ length: 16 }, (_, n) => (
          <i key={n} style={{ '--i': n, '--x': `${(n * 61) % 100}%`, '--d': `${9 + ((n * 7) % 9)}s`, '--delay': `${-((n * 13) % 17)}s` } as CSSProperties} />
        ))}
      </div>
      <div className="bg-grain" />
      <div className="bg-vignette" />
    </div>
  );
}

export function CinematicPanel({ children, tone = 'blue', className = '' }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <section className={`cinematic-panel tone-${tone} ${className}`} style={{ '--accent': hues[tone] } as CSSProperties}>
      <div className="cinematic-panel-content">{children}</div>
    </section>
  );
}

/** Radial burst of particles for big moments. Pure CSS, mounted only briefly. */
export function Burst({ color = '#f3c56b', count = 28 }: { color?: string; count?: number }) {
  const parts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        a: (360 / count) * i + Math.random() * 8,
        d: 140 + Math.random() * 220,
        s: 4 + Math.random() * 8,
        h: i % 3,
      })),
    [count],
  );
  return (
    <div className="burst" aria-hidden="true" style={{ '--c': color } as CSSProperties}>
      <i className="burst-ring" />
      <i className="burst-ring r2" />
      {parts.map((p, i) => (
        <b key={i} className={`bp h${p.h}`} style={{ '--a': `${p.a}deg`, '--d': `${p.d}px`, '--s': `${p.s}px` } as CSSProperties} />
      ))}
    </div>
  );
}
