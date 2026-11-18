import { useCallback, useEffect, useRef } from 'react';
import { ArrowRight, Check, ChevronsRight, Settings2, X } from 'lucide-react';
import { motion as m } from 'motion/react';
import { useGame } from '../app/Store';
import { characterName, roundKey } from '../domain/game';
import { useCountdown } from '../hooks/useCountdown';
import {
  CharacterCard,
  CircularTimer,
  IlluminatedFrame,
  MetallicButton,
} from '../components/Cinematic';
export default function Guess() {
  const game = useGame(),
    { session: live, settings, t, settle, advance, saveElapsed, openSettings, motion } = game,
    snapshot = useRef(live!);
  if (live && roundKey(live) === roundKey(snapshot.current)) snapshot.current = live;
  const s = snapshot.current,
    key = roundKey(s),
    isSettled = s.phase === 'settled';
  const expire = useCallback(() => {
    settle('timeout', 0, key);
  }, [settle, key]);
  const save = useCallback((value: number) => saveElapsed(value, key), [saveElapsed, key]);
  const timer = useCountdown(s.duration, s.elapsed, expire, save);
  const remaining = () => Math.max(0, s.duration - Math.floor(timer.measure() / 1000));
  const correct = useCallback(() => {
    timer.pause();
    settle('correct', remaining(), key);
  }, [timer, settle, key]);
  const skip = useCallback(() => {
    timer.pause();
    if (settle('skipped', remaining(), key)) advance();
  }, [timer, settle, advance, key]);
  const next = useCallback(() => {
    timer.pause();
    advance('passed', remaining());
  }, [timer, advance]);
  const autoStarted = useRef(false);
  useEffect(() => {
    const id = setTimeout(() => {
      if (!autoStarted.current && !s.elapsed && !isSettled) {
        autoStarted.current = true;
        timer.toggle();
      }
    }, 80);
    return () => clearTimeout(id);
  }, [timer.toggle, s.elapsed, isSettled]);
  useEffect(() => {
    if (isSettled) timer.pause();
  }, [isSettled, timer.pause]);
  useEffect(() => {
    const primary = () => (isSettled ? next() : timer.toggle());
    window.addEventListener('roulette:primary', primary);
    window.addEventListener('roulette:toggle', timer.toggle);
    window.addEventListener('roulette:finish', correct);
    window.addEventListener('roulette:skip', skip);
    return () => {
      window.removeEventListener('roulette:primary', primary);
      window.removeEventListener('roulette:toggle', timer.toggle);
      window.removeEventListener('roulette:finish', correct);
      window.removeEventListener('roulette:skip', skip);
    };
  }, [isSettled, next, timer.toggle, correct, skip]);
  const outcomeText =
    s.outcome === 'correct'
      ? t('CORRECT!', 'ВЕРНО!')
      : s.outcome === 'timeout'
        ? t('TIME’S UP', 'ВРЕМЯ ВЫШЛО')
        : t('ROUND COMPLETE', 'РАУНД ЗАВЕРШЁН');
  return (
    <section
      className={`guess-screen reference-screen ${isSettled ? `outcome-${s.outcome}` : ''}`}
      aria-labelledby="guess-title"
    >
      <header className="guess-header">
        <button
          type="button"
          className="round-badge"
          aria-label={t(
            `Round ${s.round}. Pause and open game menu`,
            `Раунд ${s.round}. Пауза и меню игры`,
          )}
          onClick={() => {
            timer.pause();
            game.setModal('leave');
          }}
        >
          <IlluminatedFrame tone="blue" shape="button" />
          <span className="metallic-title">
            {t('ROUND', 'РАУНД')} {s.round} / {s.rounds || '∞'}
          </span>
        </button>
        {!settings.stream && (
          <button
            className="guess-settings"
            aria-label={t('Game settings', 'Настройки игры')}
            onClick={openSettings}
          >
            <Settings2 size={17} />
          </button>
        )}
      </header>
      <div className="round-track" aria-hidden="true">
        {Array.from({ length: s.rounds || 10 }, (_, i) => (
          <i
            key={i}
            className={i < s.round - 1 ? 'round-done' : i === s.round - 1 ? 'round-current' : ''}
          />
        ))}
      </div>
      <div className="guess-character">
        <CharacterCard
          front
          character={s.character}
          tone={s.outcome === 'correct' ? 'green' : 'red'}
        />
        {isSettled && (
          <m.div
            className="answer-feedback metallic-title"
            initial={motion ? { opacity: 0, scale: 0.8 } : false}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="outcome-seal">{s.outcome === 'correct' ? <Check /> : <X />}</span>
            <span>{outcomeText}</span>
            <small>{t('ROUND VERIFIED', 'РАУНД ЗАВЕРШЁН')}</small>
          </m.div>
        )}
      </div>
      <div
        className="answer-nameplate"
        aria-label={t('Answer for verification', 'Ответ для проверки')}
      >
        <span>{t('ANSWER FOR VERIFICATION', 'ОТВЕТ ДЛЯ ПРОВЕРКИ')}</span>
        <strong>{s.character ? characterName(s.character, settings.language) : ''}</strong>
        {settings.language === 'ru' && s.character?.nameRu && <small>{s.character.name}</small>}
      </div>
      <h1 id="guess-title" className="metallic-title">
        {t('GUESS', 'УГАДАЙТЕ')}
        <br /> {t('THE CHARACTER!', 'ПЕРСОНАЖА!')}
      </h1>
      <div className="guess-timer">
        <span className="timer-caption">{t('TIME REMAINING', 'ОСТАЛОСЬ ВРЕМЕНИ')}</span>
        <CircularTimer
          remaining={isSettled ? s.remaining : timer.remaining}
          total={s.duration}
          running={timer.running}
          settled={isSettled}
          toggle={timer.toggle}
        />
        <span className="timer-hint">
          {isSettled
            ? t('ROUND COMPLETE', 'РАУНД ЗАВЕРШЁН')
            : timer.running
              ? t('TAP TO PAUSE', 'НАЖМИТЕ ДЛЯ ПАУЗЫ')
              : t('TAP TO RESUME', 'НАЖМИТЕ ДЛЯ ПРОДОЛЖЕНИЯ')}
        </span>
      </div>
      <div className="guess-controls">
        <MetallicButton
          tone="blue"
          shape="tile"
          onClick={skip}
          disabled={isSettled}
          aria-label={t('Skip character', 'Пропустить персонажа')}
        >
          <ChevronsRight />
          <span>{t('SKIP', 'ПРОПУСК')}</span>
        </MetallicButton>
        <MetallicButton
          tone="green"
          shape="tile"
          className="correct-control"
          onClick={correct}
          disabled={isSettled}
          aria-label={t('Correct answer', 'Верный ответ')}
        >
          <Check />
          <span>{t('CORRECT', 'ВЕРНО')}</span>
        </MetallicButton>
        <MetallicButton
          tone="silver"
          shape="tile"
          onClick={next}
          aria-label={t('Next round', 'Следующий раунд')}
        >
          <ArrowRight />
          <span>{t('NEXT', 'ДАЛЕЕ')}</span>
        </MetallicButton>
      </div>
      <p className="guesser-instruction">
        {t(
          'GUESSER: LOOK AWAY · EVERYONE ELSE: GIVE CLUES',
          'УГАДЫВАЮЩИЙ НЕ СМОТРИТ НА ЭКРАН · ОСТАЛЬНЫЕ ПОМОГАЮТ',
        )}
      </p>
    </section>
  );
}
