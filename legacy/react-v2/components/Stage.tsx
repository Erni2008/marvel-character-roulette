import { lazy, memo, Suspense, useCallback, useState } from 'react';
import { useGame } from '../app/Store';
const Scene = lazy(() => import('../graphics/ChamberScene'));
function Fallback() {
  return (
    <svg className="stage-fallback" viewBox="0 0 500 600" aria-hidden="true">
      <defs>
        <linearGradient id="figure-metal" x1="0" x2="1" y2="1">
          <stop stopColor="#4c5667" />
          <stop offset=".5" stopColor="#141a25" />
          <stop offset="1" stopColor="#414b60" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="#414b60">
        <path d="M250 20 430 115 475 305 380 500 120 500 25 305 70 115Z" />
        <ellipse cx="250" cy="530" rx="140" ry="28" stroke="#d9ac60" />
        <circle cx="250" cy="280" r="210" strokeDasharray="3 17" />
        <path d="M80 90A230 230 0 0 1 465 300" stroke="#e83246" strokeWidth="3" />
      </g>
      <g fill="url(#figure-metal)" stroke="#717886" strokeWidth=".6">
        <path d="m213 165-43 20-27 125 19 6 26-82 17 105-10 66 17 101h27l10-142h2l10 142h27l17-101-10-66 17-105 26 82 19-6-27-125-43-20-8-19h-38Z" />
        <path d="m227 91 23-13 23 13 9 26-12 35h-40l-12-35Z" />
      </g>
    </svg>
  );
}
function Stage({
  phase = 'idle',
  identifier,
  compact = false,
}: {
  phase?: 'idle' | 'spin' | 'reveal';
  identifier?: string;
  compact?: boolean;
}) {
  const { motion, active, settings, t } = useGame(),
    [failed, setFailed] = useState(false),
    [ready, setReady] = useState(false),
    [still, setStill] = useState<string | null>(null);
  const markReady = useCallback(() => setReady(true), []);
  const fail = useCallback(() => setFailed(true), []);
  return (
    <div
      className={`chamber ${compact ? 'chamber-compact' : ''}`}
      data-phase={phase}
      data-testid="character-stage"
    >
      <div className="chamber-backlight" />
      <div className="chamber-grid" />
      <div className="chamber-cross cross-left" />
      <div className="chamber-cross cross-right" />
      {(failed || !ready) && <Fallback />}
      {!failed && (
        <Suspense fallback={null}>
          <div className={ready ? 'scene-layer is-ready' : 'scene-layer'}>
            <Scene
              phase={phase}
              motion={motion}
              active={active}
              quality={settings.quality}
              onError={fail}
              onReady={markReady}
              onStill={setStill}
            />
          </div>
        </Suspense>
      )}
      {!motion && still && <img className="chamber-still" src={still} alt="" aria-hidden="true" />}
      <div className="chamber-floor" />
      <div className="stage-ruler ruler-left" />
      <div className="stage-ruler ruler-right" />
      <div className="stage-caption">
        <span className="status-dot" />
        {phase === 'reveal'
          ? t('SELECTION LOCKED', 'ВЫБОР ЗАФИКСИРОВАН')
          : t('CHAMPION ARCHIVE', 'АРХИВ ГЕРОЕВ')}
        <span>{identifier ?? t('AWAITING DISCOVERY', 'ОЖИДАЕТ ОТКРЫТИЯ')}</span>
      </div>
      <span className="stage-coordinate">CR—120 / {t('FULL BODY', 'ПОЛНЫЙ РОСТ')}</span>
    </div>
  );
}
export default memo(Stage);
