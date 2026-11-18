import { motion as m } from 'motion/react';
import { ArrowUpRight, ArrowRight, ChevronLeft } from 'lucide-react';
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { useGame } from '../app/Store';
export function Emblem({ small = false }: { small?: boolean }) {
  return (
    <svg
      className={small ? 'emblem small' : 'emblem'}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path d="m24 3 18 10.5v21L24 45 6 34.5v-21L24 3Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="m16 32 8-17 8 17M19 27h10" stroke="currentColor" strokeWidth="2.5" />
      <path d="m6 34.5 8-4.5M42 13.5l-8 4.5" stroke="var(--gold)" strokeWidth="2" />
    </svg>
  );
}
export function Button({
  children,
  variant = 'primary',
  arrow = false,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'quiet';
  arrow?: boolean;
}) {
  const { motion } = useGame();
  return (
    <m.button
      {...(props as Omit<
        typeof props,
        'onAnimationStart' | 'onDragStart' | 'onDrag' | 'onDragEnd'
      >)}
      className={`button button-${variant} ${className}`}
      whileHover={motion ? { y: -2 } : undefined}
      whileTap={motion ? { scale: 0.975, y: 2 } : undefined}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
    >
      <span>{children}</span>
      {arrow && <ArrowRight size={18} />}
      <i aria-hidden="true" />
    </m.button>
  );
}
export function Eyebrow({
  children,
  tone = 'gold',
}: {
  children: ReactNode;
  tone?: 'gold' | 'red' | 'muted';
}) {
  return (
    <div className={`eyebrow tone-${tone}`}>
      <span />
      {children}
    </div>
  );
}
export function ScreenHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  const { motion } = useGame();
  return (
    <header className="screen-heading">
      <Eyebrow>{eyebrow}</Eyebrow>
      <div className="title-mask">
        <m.h1
          initial={motion ? { y: '105%' } : false}
          animate={{ y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          tabIndex={-1}
        >
          {title}
        </m.h1>
      </div>
      {description && <p>{description}</p>}
    </header>
  );
}
export function IconButton({
  label,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      {...props}
      className={`icon-button ${props.className ?? ''}`}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}
export function BackLink({ children }: { children: ReactNode }) {
  const { back } = useGame();
  return (
    <button className="back-link" onClick={back}>
      <ChevronLeft size={16} />
      {children}
    </button>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="setting-toggle">
      <span>
        <strong>{label}</strong>
        {description && <small>{description}</small>}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <i aria-hidden="true" />
    </label>
  );
}
export function Range({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <label className="setting-range">
      <span>
        <strong>{label}</strong>
        <output>{suffix ?? `${Math.round(value * 100)}%`}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--range-value': `${((value - min) / (max - min)) * 100}%` } as CSSProperties}
      />
    </label>
  );
}
export function Meta({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="meta">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
export function LinkArrow() {
  return <ArrowUpRight size={15} aria-hidden="true" />;
}
