import { useEffect, useId, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { motion as m } from 'motion/react';
import type { MotionValue } from 'motion/react';
import type { Character } from '../domain/game';
import { useGame } from '../app/Store';
export type Tone = 'red' | 'blue' | 'green' | 'silver';
const hues: Record<Tone, string> = {
  red: '#ff304c',
  blue: '#258bff',
  green: '#39ff8d',
  silver: '#bfc8d8',
};
function bevel(w: number, h: number, c: number, inset = 0) {
  const x = inset,
    y = inset,
    r = w - inset,
    b = h - inset,
    k = c;
  return `M${x + k} ${y}H${r - k}L${r} ${y + k}V${b - k}L${r - k} ${b}H${x + k}L${x} ${b - k}V${y + k}Z`;
}
export function IlluminatedFrame({
  tone = 'red',
  shape = 'panel',
  className = '',
}: {
  tone?: Tone;
  shape?: 'panel' | 'button' | 'card' | 'tile';
  className?: string;
}) {
  const id = useId().replace(/:/g, ''),
    color = hues[tone],
    w = shape === 'card' ? 700 : 1000,
    h = shape === 'button' ? 245 : shape === 'tile' ? 920 : shape === 'card' ? 1000 : 760,
    c = shape === 'button' ? 90 : shape === 'tile' ? 140 : shape === 'card' ? 45 : 76;
  return (
    <svg
      className={`illuminated-frame ${className}`}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-metal`} x1="0" x2=".85" y2="1">
          <stop stopColor="#ecf4ff" />
          <stop offset=".08" stopColor="#4e5971" />
          <stop offset=".25" stopColor="#141b2c" />
          <stop offset=".49" stopColor="#78819a" />
          <stop offset=".53" stopColor="#171b29" />
          <stop offset=".85" stopColor="#343b51" />
          <stop offset="1" stopColor="#d0d4e0" />
        </linearGradient>
        <linearGradient id={`${id}-surface`} x2=".4" y2="1">
          <stop stopColor={tone === 'red' ? '#300511' : tone === 'green' ? '#06261c' : '#142239'} />
          <stop
            offset=".16"
            stopColor={tone === 'red' ? '#30030f' : tone === 'green' ? '#03251a' : '#0a0c17'}
          />
          <stop
            offset=".55"
            stopColor={tone === 'red' ? '#310410' : tone === 'green' ? '#03180f' : '#070d1a'}
          />
          <stop offset="1" stopColor="#03050b" />
        </linearGradient>
        <linearGradient id={`${id}-edge`} x2="1" y2=".3">
          <stop stopColor={color} stopOpacity=".5" />
          <stop offset=".2" stopColor="#fff4ff" />
          <stop offset=".34" stopColor={color} />
          <stop offset=".7" stopColor={color} />
          <stop offset=".9" stopColor="#fff4ff" />
          <stop offset="1" stopColor={color} />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x2=".7" y2="1">
          <stop stopColor="#fff" stopOpacity=".16" />
          <stop offset=".14" stopColor="#fff" stopOpacity=".015" />
          <stop offset=".46" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".035" />
          <stop offset=".51" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-light`} x="-20%" y="-25%" width="140%" height="150%">
          <feGaussianBlur stdDeviation={shape === 'card' ? 6 : 5} />
        </filter>
      </defs>
      <path d={bevel(w, h, c, 8)} fill="#010208" stroke="#02030a" strokeWidth="17" />
      <path
        className="frame-glow"
        d={bevel(w, h, c, 19)}
        fill="none"
        stroke={color}
        strokeWidth="17"
        opacity=".8"
        filter={`url(#${id}-light)`}
      />
      <path
        d={bevel(w, h, c, 11)}
        fill={`url(#${id}-surface)`}
        stroke={`url(#${id}-metal)`}
        strokeWidth="8"
      />
      <path
        d={bevel(w, h, c - 4, 22)}
        fill="none"
        stroke={`url(#${id}-edge)`}
        strokeWidth={tone === 'silver' ? 2 : tone === 'blue' ? 5 : 8}
      />
      <path
        d={bevel(w, h, c - 10, 31)}
        fill={`url(#${id}-sheen)`}
        stroke={color}
        strokeOpacity=".4"
        strokeWidth="1.4"
      />
      <path
        d={`M${c + 13} 36H${w - c - 13}M36 ${c + 15}V${h - c - 15}M${c + 13} ${h - 36}H${w - c - 13}M${w - 36} ${c + 15}V${h - c - 15}`}
        fill="none"
        stroke="#d5ddec"
        strokeOpacity=".12"
        strokeWidth="2"
      />
      {shape !== 'button' && (
        <g stroke={color} opacity=".55" fill="none" strokeWidth="2">
          <path
            d={`M45 ${c + 12}L${c + 13} 45H${c + 73}L${c + 40} 73H${c + 8}L73 ${c + 8}V${c + 46}L45 ${c + 73}ZM52 ${h - c - 10}L${c + 9} ${h - 52}H${c + 65}L${c + 39} ${h - 77}H${c + 15}L77 ${h - c - 15}V${h - c - 45}Z`}
          />
          <path
            d={`M${w - 45} ${c + 12}L${w - c - 13} 45H${w - c - 73}L${w - c - 40} 73H${w - c - 8}L${w - 73} ${c + 8}V${c + 46}L${w - 45} ${c + 73}Z`}
          />
        </g>
      )}
      <path
        d={`M${w * 0.34} 20H${w * 0.66}M${w * 0.34} ${h - 20}H${w * 0.66}`}
        stroke={color}
        strokeWidth="6"
      />
      <path
        d={`M${w * 0.46} 20H${w * 0.54}M${w * 0.46} ${h - 20}H${w * 0.54}`}
        stroke="#fff1f4"
        strokeWidth="3"
      />
      <g fill="#a0adc4" opacity=".45">
        <circle cx="28" cy={h * 0.26} r="3" />
        <circle cx={w - 28} cy={h * 0.74} r="3" />
      </g>
    </svg>
  );
}
export function MetallicButton({
  children,
  tone = 'red',
  shape = 'button',
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: Tone;
  shape?: 'button' | 'tile';
  children: ReactNode;
}) {
  const { motion } = useGame();
  const { onAnimationStart: _, onDrag: __, onDragStart: ___, onDragEnd: ____, ...props } = rest;
  return (
    <m.button
      type="button"
      {...props}
      className={`metallic-button tone-${tone} ${shape === 'tile' ? 'metallic-tile' : ''} ${className}`}
      style={{ '--accent': hues[tone], ...props.style } as CSSProperties}
      whileTap={motion ? { scale: 0.965, y: 2 } : undefined}
      whileHover={motion ? { scale: 1.015 } : undefined}
      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
    >
      <IlluminatedFrame tone={tone} shape={shape} />
      <span className="metallic-button-content">{children}</span>
      <span className="button-sweep" aria-hidden="true" />
    </m.button>
  );
}
export function BrandEmblem({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 160 180" className={`brand-emblem ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-silver`} x1=".1" y1="0" x2=".9" y2="1">
          <stop stopColor="#eef5ff" />
          <stop offset=".29" stopColor="#6b7897" />
          <stop offset=".5" stopColor="#f4f7ff" />
          <stop offset=".58" stopColor="#69728c" />
          <stop offset=".8" stopColor="#1c2436" />
          <stop offset="1" stopColor="#c9d4e8" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="91" r="57" fill="#060a13" stroke="#05060b" strokeWidth="11" />
      <circle
        cx="80"
        cy="87"
        r="57"
        fill="none"
        stroke={`url(#${id}-silver)`}
        strokeWidth="4"
        strokeDasharray="285 75"
        transform="rotate(-40 80 87)"
      />
      <path
        d="M103 10 40 99 75 89 57 164 123 66 88 79Z"
        fill="#03050a"
        stroke="#03040a"
        strokeWidth="8"
        transform="translate(3 5)"
      />
      <path
        d="M103 10 40 99 75 89 57 164 123 66 88 79Z"
        fill={`url(#${id}-silver)`}
        stroke="#c0cadc"
        strokeWidth="1"
      />
      <path
        d="m103 10-27 78-36 11m83-33-36 29-30 69"
        stroke="#e9324a"
        opacity=".7"
        fill="none"
        strokeWidth="1.4"
      />
    </svg>
  );
}
function NeutralSilhouette() {
  return (
    <svg className="neutral-silhouette" viewBox="0 0 300 460" aria-hidden="true">
      <defs>
        <radialGradient id="silhouette-halo">
          <stop stopColor="#ff583d" />
          <stop offset=".45" stopColor="#bb102a" stopOpacity=".5" />
          <stop offset="1" stopColor="#21020f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="silhouette-ink" x2=".6" y2="1">
          <stop stopColor="#100d15" />
          <stop offset="1" stopColor="#02040a" />
        </linearGradient>
      </defs>
      <ellipse cx="150" cy="233" rx="158" ry="218" fill="url(#silhouette-halo)" />
      <path
        d="M122 120c-8-10-15-30-12-49 1-30 12-46 40-46s39 16 40 46c3 19-4 39-12 49l4 20 42 20 22 113-20 9-24-73-9 85 11 53-15 93h-24l-13-126h-4l-13 126h-24l-15-93 11-53-9-85-24 73-20-9 22-113 42-20Z"
        fill="url(#silhouette-ink)"
        stroke="#f5505a"
        strokeWidth="1.1"
        strokeOpacity=".26"
      />
      <path
        d="M125 123c6 10 13 16 25 16s19-6 25-16M105 168l45 23 45-23"
        fill="none"
        stroke="#f03948"
        opacity=".13"
      />
    </svg>
  );
}
export function CharacterCard({
  character,
  front = false,
  tone = 'red',
  className = '',
}: {
  character?: Character | null;
  front?: boolean;
  tone?: Tone;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  return (
    <div
      className={`character-card ${front ? 'card-front' : 'card-back'} ${className}`}
      style={{ '--accent': hues[tone] } as CSSProperties}
      data-character-id={character?.id}
    >
      <IlluminatedFrame tone={tone} shape="card" />
      <div className="card-content">
        <div className="card-hex-texture" />
        <div className="card-diagonal-sheen" />
        {front ? (
          <>
            {character?.imagePath && !broken ? (
              <img
                className="character-art"
                src={character.imagePath}
                alt={character.name}
                onError={() => setBroken(true)}
                draggable={false}
              />
            ) : (
              <>
                <NeutralSilhouette />
                <span className="mystery-question" aria-hidden="true">
                  ?
                </span>
              </>
            )}
          </>
        ) : (
          <BrandEmblem />
        )}
      </div>
      <div className="card-lens-flare top-flare" />
      <div className="card-lens-flare bottom-flare" />
      {front && character && <div className="character-name">{character.name}</div>}
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
export function RouletteWheel({
  rotation = 0,
  count = 120,
  selectedIndex = -1,
  decorative = false,
}: {
  rotation?: number | MotionValue<number>;
  count?: number;
  selectedIndex?: number;
  decorative?: boolean;
}) {
  const id = useId().replace(/:/g, '');
  const rotor = useRef<SVGGElement>(null);
  useEffect(() => {
    if (typeof rotation === 'number') return;
    return rotation.on('change', (v) =>
      rotor.current?.setAttribute('transform', `rotate(${v} 180 180)`),
    );
  }, [rotation]);
  const angle = 360 / count;
  const polar = (r: number, a: number) => [
    180 + r * Math.cos(((a - 90) * Math.PI) / 180),
    180 + r * Math.sin(((a - 90) * Math.PI) / 180),
  ];
  const arc = (start: number, end: number) => {
    const a = polar(149, start),
      b = polar(149, end),
      c = polar(114, end),
      d = polar(114, start);
    return `M${a.join(' ')}A149 149 0 ${end - start > 180 ? 1 : 0} 1 ${b.join(' ')}L${c.join(' ')}A114 114 0 ${end - start > 180 ? 1 : 0} 0 ${d.join(' ')}Z`;
  };
  return (
    <div className={`roulette-wheel ${decorative ? 'wheel-decorative' : ''}`}>
      <svg viewBox="0 0 360 360" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-rim`} x2=".7" y2="1">
            <stop stopColor="#f5f7ff" />
            <stop offset=".2" stopColor="#31496f" />
            <stop offset=".42" stopColor="#11162b" />
            <stop offset=".6" stopColor="#a5b4cf" />
            <stop offset=".72" stopColor="#26304b" />
            <stop offset="1" stopColor="#d6dced" />
          </linearGradient>
          <radialGradient id={`${id}-hub`}>
            <stop stopColor="#222c43" />
            <stop offset=".7" stopColor="#080b15" />
            <stop offset=".9" stopColor="#4a5672" />
            <stop offset="1" stopColor="#0b101c" />
          </radialGradient>
        </defs>
        <circle cx="180" cy="180" r="171" fill="#02040b" stroke="#04070e" strokeWidth="11" />
        <circle
          cx="180"
          cy="180"
          r="168"
          fill="#0b1527"
          stroke={`url(#${id}-rim)`}
          strokeWidth="7"
        />
        <circle
          cx="180"
          cy="180"
          r="159"
          fill="none"
          stroke="#258bff"
          strokeWidth="2"
          className="wheel-light"
        />
        <g
          ref={rotor}
          className="wheel-rotor"
          transform={`rotate(${typeof rotation === 'number' ? rotation : rotation.get()} 180 180)`}
        >
          {Array.from({ length: count }, (_, i) => (
            <path
              key={i}
              d={arc(i * angle + 0.25, (i + 1) * angle - 0.25)}
              fill={
                i === selectedIndex
                  ? '#ff4b60'
                  : i % 10 < 5
                    ? i % 2
                      ? '#102442'
                      : '#182e50'
                    : i % 2
                      ? '#651022'
                      : '#330919'
              }
              stroke="#a4afc3"
              strokeOpacity=".27"
              strokeWidth=".6"
              data-wheel-index={i}
              data-selected={i === selectedIndex ? true : undefined}
            />
          ))}
          {Array.from({ length: Math.min(count, 24) }, (_, i) => {
            const a = (360 / Math.min(count, 24)) * i,
              p = polar(154, a),
              q = polar(164, a);
            return (
              <path
                key={i}
                d={`M${p.join(' ')}L${q.join(' ')}`}
                stroke={i % 2 ? '#ff304c' : '#68b4ff'}
                strokeWidth={i % 3 === 0 ? 3 : 1}
              />
            );
          })}
          {!decorative &&
            Array.from({ length: Math.min(count, 12) }, (_, i) => {
              const index = Math.floor((i * count) / Math.min(count, 12)),
                p = polar(129, (index + 0.5) * angle);
              return (
                <text
                  key={i}
                  x={p[0]}
                  y={p[1]}
                  fill="#edf4ff"
                  fontSize="8"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${(index + 0.5) * angle} ${p[0]} ${p[1]})`}
                >
                  {String(index + 1).padStart(3, '0')}
                </text>
              );
            })}
        </g>
        <circle cx="180" cy="180" r="108" fill="none" stroke={`url(#${id}-rim)`} strokeWidth="7" />
        <circle cx="180" cy="180" r="95" fill="none" stroke="#375b90" strokeWidth="1" />
        <circle
          cx="180"
          cy="180"
          r="76"
          fill={`url(#${id}-hub)`}
          stroke="#aab3c9"
          strokeWidth="3"
        />
        <path d="M180 10 190 30 180 26 170 30Z" fill="#f5f7ff" stroke="#ff304c" strokeWidth="2" />
        <g stroke="#b7c4db" strokeWidth="1" opacity=".6">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const p = polar(103, a),
              q = polar(109, a);
            return <path key={a} d={`M${p.join(' ')}L${q.join(' ')}`} />;
          })}
        </g>
      </svg>
      <BrandEmblem className="wheel-emblem" />
      <div className="wheel-flare flare-blue" />
      <div className="wheel-flare flare-red" />
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
    time = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
  return (
    <button
      className={`circular-timer ${running ? 'is-running' : ''} ${remaining <= 10 ? 'urgent' : ''}`}
      onClick={toggle}
      disabled={settled}
      aria-label={
        settled
          ? t('Round complete', 'Раунд завершён')
          : running
            ? t('Pause timer', 'Приостановить таймер')
            : t('Resume timer', 'Продолжить таймер')
      }
    >
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <radialGradient id={`${id}-center`}>
            <stop stopColor="#171d2a" />
            <stop offset=".8" stopColor="#050811" />
            <stop offset="1" stopColor="#33111d" />
          </radialGradient>
        </defs>
        <circle
          cx="100"
          cy="100"
          r="87"
          fill={`url(#${id}-center)`}
          stroke="#481020"
          strokeWidth="13"
        />
        <circle
          className="timer-segments"
          cx="100"
          cy="100"
          r="88"
          pathLength="180"
          fill="none"
          stroke="#ff304c"
          strokeWidth="13"
          strokeDasharray=".55 .45"
        />
        <circle
          className="timer-progress"
          cx="100"
          cy="100"
          r="88"
          fill="none"
          stroke="#ffdbdd"
          strokeWidth="3.5"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={100 - (remaining / total) * 100}
        />
        <circle
          cx="100"
          cy="100"
          r="77"
          fill="none"
          stroke="#a93b4a"
          strokeWidth=".6"
          strokeOpacity=".5"
        />
      </svg>
      <span
        role="timer"
        aria-label={t(`${remaining} seconds remaining`, `${remaining} секунд осталось`)}
      >
        {time}
      </span>
      {!running && !settled && <small>{t('PAUSED', 'ПАУЗА')}</small>}
    </button>
  );
}
export function AtmosphericBackground({ city = false }: { city?: boolean }) {
  return (
    <div
      className={`atmospheric-background ${city ? 'city-background' : 'vault-background'}`}
      aria-hidden="true"
    >
      <div className="art-layer" />
      <div className="atmosphere-shade" />
      <div className="edge-light left-edge" />
      <div className="edge-light right-edge" />
      <div className="environment-sparks">
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <i key={n} style={{ '--spark': n } as CSSProperties} />
        ))}
      </div>
    </div>
  );
}
export function CinematicPanel({
  children,
  tone = 'blue',
  className = '',
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <section className={`cinematic-panel tone-${tone} ${className}`}>
      <IlluminatedFrame tone={tone} />
      <div className="cinematic-panel-content">{children}</div>
    </section>
  );
}
