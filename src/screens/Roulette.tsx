import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion as m } from 'motion/react';
import { Crosshair, FastForward } from 'lucide-react';
import Stage from '../components/Stage';
import { Button, Eyebrow, Meta } from '../components/UI';
import { useGame } from '../app/Store';
import type { Champion } from '../domain/game';
function profile(t: number) {
  return t < 0.12 ? 0.17 * (t / 0.12) ** 2 : 0.17 + 0.83 * (1 - (1 - (t - 0.12) / 0.88) ** 3);
}
export default function Roulette() {
  const { t, session, settings, stream, motion, select, navigate } = useGame();
  const [phase, setPhase] = useState<'idle' | 'spin' | 'reveal'>(
      session.champion ? 'reveal' : 'idle',
    ),
    [identifier, setIdentifier] = useState(session.champion?.identifier ?? 'CHAMPION_001'),
    [progress, setProgress] = useState(0);
  const frame = useRef(0),
    winner = useRef<Champion | null>(session.champion),
    startedAt = useRef(0),
    lastSlot = useRef(-1),
    spinning = useRef(false);
  const reveal = useCallback(() => {
    if (!winner.current) return;
    cancelAnimationFrame(frame.current);
    spinning.current = false;
    setIdentifier(winner.current.identifier);
    setProgress(1);
    setPhase('reveal');
  }, []);
  const spin = useCallback(() => {
    if (spinning.current || phase === 'reveal') return;
    winner.current = select();
    spinning.current = true;
    setPhase('spin');
    startedAt.current = performance.now();
    lastSlot.current = -1;
    const duration = motion ? 4400 : 800;
    function tick(now: number) {
      const p = Math.min(1, (now - startedAt.current) / duration),
        slot = Math.floor(profile(p) * 54);
      if (slot !== lastSlot.current) {
        lastSlot.current = slot;
        setIdentifier(
          `CHAMPION_${String(((slot * 13 + winner.current!.id) % 120) + 1).padStart(3, '0')}`,
        );
        setProgress(p);
      }
      if (p < 1) frame.current = requestAnimationFrame(tick);
      else reveal();
    }
    frame.current = requestAnimationFrame(tick);
  }, [phase, select, motion, reveal]);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  useEffect(() => {
    const primary = () => {
      if (phase === 'reveal') navigate('challenge');
      else spin();
    };
    window.addEventListener('roulette:primary', primary);
    return () => window.removeEventListener('roulette:primary', primary);
  }, [phase, spin, navigate]);
  const title =
    phase === 'reveal'
      ? t('Fate has chosen.', 'Судьба сделала выбор.')
      : phase === 'spin'
        ? t('Trust the unknown.', 'Доверьтесь неизвестному.')
        : t('Who will you become?', 'Кем вы станете?');
  return (
    <section className={`roulette-screen phase-${phase} ${stream ? 'presentation' : ''}`}>
      <header className="roulette-heading">
        <Eyebrow tone={phase === 'reveal' ? 'gold' : 'red'}>
          {t(
            phase === 'reveal' ? 'CHAMPION SELECTED' : 'CHAMPION SELECTION',
            phase === 'reveal' ? 'ГЕРОЙ ВЫБРАН' : 'ВЫБОР ГЕРОЯ',
          )}
        </Eyebrow>
        <AnimatePresence mode="wait">
          <m.h1
            key={phase}
            initial={motion ? { y: 16, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {title}
          </m.h1>
        </AnimatePresence>
      </header>
      <div className="roulette-environment">
        <aside className="roulette-brief">
          <span className="big-index">
            {String(session.round).padStart(2, '0')}
            <i>/</i>
          </span>
          <div className="side-line" />
          <h2>
            {t('One moment.', 'Один момент.')}
            <br />
            {t('Endless possibilities.', 'Тысячи возможностей.')}
          </h2>
          <p>
            {t(
              'A new identity. A new challenge. Let the chamber decide your next move.',
              'Новая роль. Новое испытание. Доверьте камере свой следующий ход.',
            )}
          </p>
          <Meta
            label={t('SESSION MODE', 'РЕЖИМ СЕССИИ')}
            value={t(
              settings.mode.toUpperCase(),
              { party: 'ВЕЧЕРИНКА', knowledge: 'ЗНАТОКИ', chaos: 'ХАОС' }[settings.mode],
            )}
          />
        </aside>
        <m.div
          className="roulette-stage-wrap"
          animate={
            motion && phase === 'reveal'
              ? { x: [0, -3, 3, -1, 0], scale: [1, 0.995, 1.02, 1] }
              : { x: 0, scale: 1 }
          }
          transition={{ duration: 0.6 }}
        >
          <Stage phase={phase} identifier={phase === 'reveal' ? identifier : undefined} />
          <div className="selection-reticle" />
          <div className="identifier-window" aria-live={phase === 'reveal' ? 'polite' : 'off'}>
            <span className="identifier-prefix">
              {phase === 'spin'
                ? t('SCANNING', 'ПОИСК')
                : phase === 'reveal'
                  ? t('LOCKED', 'ВЫБРАН')
                  : t('STANDBY', 'ОЖИДАНИЕ')}
            </span>
            <m.strong
              key={identifier}
              initial={motion && phase === 'spin' ? { y: 15, opacity: 0.25, scale: 0.97 } : false}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.08 }}
            >
              {identifier}
            </m.strong>
            <div className="selection-progress">
              <i
                style={{
                  transform: `scaleX(${phase === 'spin' ? progress : phase === 'reveal' ? 1 : 0})`,
                }}
              />
            </div>
          </div>
          {phase === 'reveal' && (
            <m.div
              className="selection-impact"
              initial={motion ? { opacity: 0.5, scale: 0.9 } : false}
              animate={{ opacity: 0, scale: 1.12 }}
              transition={{ duration: 0.75 }}
              aria-hidden="true"
            />
          )}
        </m.div>
        <aside className="roulette-details">
          <Crosshair size={24} strokeWidth={1} />
          <span className="tech-label">{t('SELECTION PROTOCOL', 'ПРОТОКОЛ ВЫБОРА')}</span>
          <div className="protocol-list">
            <span>
              <i />
              120 {t('POSSIBILITIES', 'ВОЗМОЖНОСТЕЙ')}
            </span>
            <span>
              <i />
              {t('ONE CHAMPION', 'ОДИН ГЕРОЙ')}
            </span>
            <span>
              <i />
              {t('YOUR NEXT STORY', 'ВАША НОВАЯ ИСТОРИЯ')}
            </span>
          </div>
          <div className="orbit-diagram" aria-hidden="true">
            <i />
            <i />
            <i />
            <span>CR</span>
          </div>
          <p>{t('THE NEXT MOVE IS YOURS.', 'СЛЕДУЮЩИЙ ХОД — ВАШ.')}</p>
        </aside>
      </div>
      <div className="roulette-actions">
        {!stream && (
          <Button
            arrow
            disabled={phase === 'spin'}
            onClick={phase === 'reveal' ? () => navigate('challenge') : spin}
          >
            {phase === 'reveal'
              ? t('START CHALLENGE', 'НАЧАТЬ ИСПЫТАНИЕ')
              : phase === 'spin'
                ? t('SELECTING…', 'ВЫБИРАЕМ…')
                : t('START ROULETTE', 'ЗАПУСТИТЬ РУЛЕТКУ')}
          </Button>
        )}
        {phase === 'spin' && !stream && (
          <button className="text-action" onClick={reveal}>
            <FastForward size={14} />
            {t('Skip sequence', 'Пропустить анимацию')}
          </button>
        )}
        <span>
          {phase === 'reveal'
            ? t('A NEW CHALLENGE AWAITS', 'ВАС ЖДЁТ НОВОЕ ИСПЫТАНИЕ')
            : phase === 'spin'
              ? t('LET FATE TAKE ITS COURSE', 'ПУСТЬ СУДЬБА РЕШИТ')
              : t('54 BEATS. ONE REVEAL.', '54 МГНОВЕНИЯ. ОДИН ГЕРОЙ.')}
        </span>
      </div>
    </section>
  );
}
