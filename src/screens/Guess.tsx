import { useCallback, useEffect, useRef } from 'react';
import { ArrowRight, Check, ChevronsRight, Settings2, Trash2, X } from 'lucide-react';
import { motion as m, useMotionValue, useTransform, animate } from 'motion/react';
import { useGame } from '../app/Store';
import { characterName, roundKey } from '../domain/game';
import { useCountdown } from '../hooks/useCountdown';
import type { CSSProperties } from 'react';
import { Burst, CharacterCard, CircularTimer, MetallicButton } from '../components/Cinematic';
import { identity } from '../domain/identity';
import { sfx } from '../fx/sound';
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
    if (game.modal) {
      autoStarted.current = true;
      return;
    }
    const id = setTimeout(() => {
      if (!autoStarted.current && !s.elapsed && !isSettled) {
        autoStarted.current = true;
        timer.toggle();
      }
    }, 80);
    return () => clearTimeout(id);
  }, [timer.toggle, s.elapsed, isSettled, game.modal]);
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
  const shown = isSettled ? s.remaining : timer.remaining;
  useEffect(() => {
    if (!isSettled && timer.running && shown <= 5 && shown > 0) sfx.beep(shown <= 3);
  }, [shown, isSettled, timer.running]);
  useEffect(() => {
    if (!isSettled) return;
    if (s.outcome === 'correct') sfx.correct();
    else if (s.outcome === 'timeout') sfx.fail();
  }, [isSettled, s.outcome]);
  const id = identity(s.character);
  const drag = useMotionValue(0),
    tilt = useTransform(drag, [-300, 300], [-14, 14]),
    fade = useTransform(drag, [-320, -140, 0, 140, 320], [0.2, 0.85, 1, 0.85, 0.2]);
  const removing = useRef(false);
  const remove = useCallback(
    (dir = 1) => {
      if (removing.current) return;
      removing.current = true;
      timer.pause();
      sfx.slide();
      const done = () => game.removeCurrent(isSettled ? s.remaining : remaining());
      if (motion) void animate(drag, dir * 900, { duration: 0.35, ease: [0.4, 0, 1, 1] }).then(done);
      else done();
    },
    [timer, game, isSettled, s.remaining, motion, drag],
  );
  const outcomeText =
    s.outcome === 'correct'
      ? t('CORRECT!', 'ВЕРНО!')
      : s.outcome === 'timeout'
        ? t('TIME’S UP', 'ВРЕМЯ ВЫШЛО')
        : t('ROUND COMPLETE', 'РАУНД ЗАВЕРШЁН');
  const name = s.character ? characterName(s.character, settings.language) : '';
  return (
    <section
      className={`guess-screen reference-screen ${isSettled ? `outcome-${s.outcome}` : ''} ${shown <= 10 && !isSettled ? 'is-urgent' : ''}`}
      style={{ '--a': id.a, '--b': id.b, '--glow': id.glow } as CSSProperties}
      aria-labelledby="selected-name"
    >
      <div className="guess-aura" aria-hidden="true" />
      <header className="guess-header">
        <button
          type="button"
          className="round-badge"
          aria-label={t(`Round ${s.round}. Pause and open game menu`, `Раунд ${s.round}. Пауза и меню игры`)}
          onClick={() => {
            timer.pause();
            game.setModal('leave');
          }}
        >
          <span className="rb-label">{t('ROUND', 'РАУНД')}</span>
          <span className="rb-value">
            {s.round}
          </span>
        </button>
        <div className="pool-info" aria-hidden="true">
          {t(`${game.characters.filter((c) => c.enabled).length} heroes in the deck`, `В колоде героев: ${game.characters.filter((c) => c.enabled).length}`)}
        </div>
        {!settings.stream && (
          <button className="guess-settings" aria-label={t('Game settings', 'Настройки игры')} onClick={openSettings}>
            <Settings2 size={18} />
          </button>
        )}
      </header>
      <div className="guess-character">
        <m.div
          className="guess-card-wrap"
          drag="x"
          dragSnapToOrigin
          dragElastic={0.6}
          style={{ x: drag, rotate: tilt, opacity: fade }}
          onDragEnd={(_, info) => {
            if (Math.abs(info.offset.x) > 120 || Math.abs(info.velocity.x) > 700) remove(info.offset.x > 0 ? 1 : -1);
          }}
          initial={motion ? { scale: 0.88, y: 30 } : false}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 110, damping: 16 }}
        >
          <CharacterCard front character={s.character} />
        </m.div>
        {isSettled && (
          <m.div
            className="answer-feedback metallic-title"
            initial={motion ? { opacity: 0, scale: 1.8, rotate: -14 } : false}
            animate={{ opacity: 1, scale: 1, rotate: -8 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <span className="outcome-seal">{s.outcome === 'correct' ? <Check /> : <X />}</span>
            <span>{outcomeText}</span>
          </m.div>
        )}
        {isSettled && s.outcome === 'correct' && motion && <Burst color="#2fe38a" count={36} />}
      </div>
      <div className="guess-panel">
        <div className="answer-nameplate" aria-label={t('Answer for verification', 'Ответ для проверки')}>
          <span>{t('GUESS THE CHARACTER!', 'УГАДАЙ ПЕРСОНАЖА!')}</span>
          <m.strong id="selected-name" initial={motion ? { opacity: 0, x: 40 } : false} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>
            {name}
          </m.strong>
          {settings.language === 'ru' && s.character?.nameRu && <small>{s.character.name}</small>}
        </div>
        <div className="guess-timer">
          <CircularTimer remaining={shown} total={s.duration} running={timer.running} settled={isSettled} toggle={timer.toggle} />
        </div>
        <div className="guess-controls">
          <MetallicButton tone="silver" shape="tile" onClick={skip} disabled={isSettled} aria-label={t('Skip character', 'Пропустить персонажа')}>
            <ChevronsRight />
            <span>{t('SKIP', 'ПРОПУСК')}</span>
          </MetallicButton>
          <MetallicButton tone="green" shape="tile" className="correct-control" onClick={correct} disabled={isSettled} aria-label={t('Correct answer', 'Верный ответ')}>
            <Check />
            <span>{t('CORRECT', 'ВЕРНО')}</span>
          </MetallicButton>
          <MetallicButton tone="red" shape="tile" className="remove-control" onClick={() => remove(1)} aria-label={t('Remove hero from the deck', 'Убрать героя из колоды')}>
            <Trash2 />
            <span>{t('REMOVE', 'УБРАТЬ')}</span>
          </MetallicButton>
          <MetallicButton tone={isSettled ? 'gold' : 'silver'} shape="tile" className={isSettled ? 'next-ready' : ''} onClick={next} aria-label={t('Next round', 'Следующий раунд')}>
            <ArrowRight />
            <span>{t('NEXT', 'ДАЛЕЕ')}</span>
          </MetallicButton>
        </div>
        <p className="guesser-instruction">
          {t('SWIPE THE CARD LEFT OR RIGHT TO REMOVE THE HERO', 'СМАХНИТЕ КАРТУ ВЛЕВО ИЛИ ВПРАВО, ЧТОБЫ УБРАТЬ ГЕРОЯ')}
        </p>
      </div>
    </section>
  );
}
