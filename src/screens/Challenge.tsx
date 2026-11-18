import { useCallback, useEffect, useRef, useState } from 'react';
import { motion as m } from 'motion/react';
import {
  AudioLines,
  Ban,
  Drama,
  Hand,
  Lightbulb,
  MessageCircleQuestion,
  Pause,
  Play,
  Shuffle,
  Zap,
} from 'lucide-react';
import { useGame } from '../app/Store';
import { getChallenge, restrictions } from '../domain/game';
import { useCountdown } from '../hooks/useCountdown';
import Stage from '../components/Stage';
import { Button, Eyebrow } from '../components/UI';
const icons = {
  taboo: Ban,
  mime: Hand,
  clues: Lightbulb,
  word: AudioLines,
  reverse: MessageCircleQuestion,
  roleplay: Drama,
  speed: Zap,
  chaos: Shuffle,
};
export default function Challenge() {
  const { session, settings, t, languageIndex: l, finish, saveElapsed, stream, motion } = useGame(),
    definition = getChallenge(session.challenge!),
    total = definition.id === 'speed' ? 5 : settings.duration;
  const completed = useRef(false),
    [clues, setClues] = useState(0);
  const expire = useCallback(() => {
    if (!completed.current) {
      completed.current = true;
      finish(false, 0);
    }
  }, [finish]);
  const timer = useCountdown(total, session.elapsed, expire, saveElapsed);
  const complete = useCallback(
    (success: boolean) => {
      if (completed.current) return;
      completed.current = true;
      timer.pause();
      finish(success, Math.max(0, total - Math.floor(timer.measure() / 1000)));
    },
    [timer, total, finish],
  );
  useEffect(() => {
    const primary = () => timer.toggle(),
      win = () => {
        if (timer.hasStarted()) complete(true);
      },
      skip = () => complete(false);
    window.addEventListener('roulette:primary', primary);
    window.addEventListener('roulette:toggle', primary);
    window.addEventListener('roulette:finish', win);
    window.addEventListener('roulette:skip', skip);
    return () => {
      window.removeEventListener('roulette:primary', primary);
      window.removeEventListener('roulette:toggle', primary);
      window.removeEventListener('roulette:finish', win);
      window.removeEventListener('roulette:skip', skip);
    };
  }, [timer, complete]);
  const Icon = icons[definition.id];
  const timerColor = timer.remaining <= 5 && timer.started ? 'var(--red)' : definition.color;
  return (
    <section
      className={`challenge-screen ${stream ? 'presentation' : ''} challenge-${definition.id}`}
      style={{ '--challenge-color': definition.color } as React.CSSProperties}
    >
      <div className="challenge-grid">
        <div className="challenge-copy">
          <Eyebrow>
            {t('THE CHALLENGE', 'ИСПЫТАНИЕ')} / {String(session.round).padStart(2, '0')}
          </Eyebrow>
          <m.div
            className="challenge-icon"
            initial={motion ? { rotate: -12, scale: 0.7, opacity: 0 } : false}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 0.55 }}
          >
            <Icon size={34} strokeWidth={1.25} />
          </m.div>
          <span className="tech-label challenge-tag">{definition.tag[l]}</span>
          <div className="title-mask">
            <m.h1
              initial={motion ? { y: '105%' } : false}
              animate={{ y: 0 }}
              transition={{ duration: 0.65, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {definition.title[l]}
              <span>.</span>
            </m.h1>
          </div>
          <div className="challenge-rule" />
          <p className="challenge-instruction">{definition.instruction[l]}</p>
          {definition.id === 'chaos' && (
            <div className="restriction">
              <Shuffle size={16} />
              <span>{restrictions[session.restriction][l]}</span>
            </div>
          )}
          {definition.id === 'clues' && (
            <div className="clue-panel">
              <div className="clue-slots">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    className={clues >= n ? 'unlocked' : ''}
                    disabled={n > clues + 1 || clues >= n}
                    onClick={() => setClues(n)}
                    aria-label={t(`Reveal clue slot ${n}`, `Открыть слот ${n}`)}
                  >
                    {clues >= n ? '—' : `0${n}`}
                  </button>
                ))}
              </div>
              <small>
                {clues
                  ? t(
                      'Clue content awaits the champion database.',
                      'Подсказки появятся вместе с базой героев.',
                    )
                  : t('Reveal slots one by one.', 'Открывайте слоты по одному.')}
              </small>
            </div>
          )}
          <div className="challenge-identity">
            <span>{t('YOUR CHAMPION', 'ВАШ ГЕРОЙ')}</span>
            <strong>{session.champion?.identifier}</strong>
          </div>
        </div>
        <div className="challenge-stage">
          <Stage phase="reveal" compact identifier={session.champion?.identifier} />
          <div className="challenge-stage-label">{t('THE STAGE IS YOURS', 'СЦЕНА ВАША')}</div>
        </div>
        <aside className={`countdown-panel ${timer.running ? 'is-running' : ''}`}>
          <span className="tech-label">{t('THE CLOCK IS TICKING', 'ВРЕМЯ ИДЁТ')}</span>
          <div className="countdown" style={{ '--timer-color': timerColor } as React.CSSProperties}>
            <svg viewBox="0 0 200 200" aria-hidden="true">
              <circle className="clock-track" cx="100" cy="100" r="94" />
              <circle
                className="clock-progress"
                cx="100"
                cy="100"
                r="94"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset={100 - (timer.remaining / total) * 100}
              />
              <circle className="clock-inner" cx="100" cy="100" r="81" />
            </svg>
            <div>
              <strong
                role="timer"
                aria-label={t(
                  `${timer.remaining} seconds remaining`,
                  `${timer.remaining} секунд осталось`,
                )}
              >
                {String(timer.remaining).padStart(2, '0')}
              </strong>
              <span>
                {!timer.started
                  ? t('READY WHEN YOU ARE', 'ГОТОВЫ К СТАРТУ')
                  : timer.running
                    ? t('SECONDS LEFT', 'СЕКУНД ОСТАЛОСЬ')
                    : t('PAUSED', 'ПАУЗА')}
              </span>
            </div>
          </div>
          <div className="countdown-meta">
            <span>
              {t('ROUND', 'РАУНД')} {String(session.round).padStart(2, '0')}
            </span>
            <span>
              {t('PLAYER', 'ИГРОК')} {String(session.player).padStart(2, '0')}
            </span>
          </div>
          {!stream && (
            <p>
              {t(
                'Good instincts. Quick thinking.\nMake this moment yours.',
                'Интуиция. Быстрая мысль.\nЭто ваш момент.',
              )}
            </p>
          )}
        </aside>
      </div>
      {!stream && (
        <div className="challenge-controls">
          <Button onClick={timer.toggle}>
            {timer.running ? <Pause size={16} /> : <Play size={16} />}{' '}
            {timer.running
              ? t('PAUSE', 'ПАУЗА')
              : timer.started
                ? t('RESUME', 'ПРОДОЛЖИТЬ')
                : t('START CHALLENGE', 'НАЧАТЬ ИСПЫТАНИЕ')}
          </Button>
          <Button variant="secondary" onClick={() => complete(false)}>
            {t('SKIP ROUND', 'ПРОПУСТИТЬ')}
          </Button>
          <Button variant="quiet" disabled={!timer.started} arrow onClick={() => complete(true)}>
            {t('FINISH', 'ГОТОВО')}
          </Button>
          <span className="keyboard-hint">
            {t('SPACE TO PAUSE · G TO FINISH', 'ПРОБЕЛ — ПАУЗА · G — ГОТОВО')}
          </span>
        </div>
      )}
    </section>
  );
}
