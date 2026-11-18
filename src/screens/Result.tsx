import { useEffect, useState } from 'react';
import { motion as m } from 'motion/react';
import { Check, RotateCcw, X } from 'lucide-react';
import { useGame } from '../app/Store';
import { getChallenge } from '../domain/game';
import { Button, Eyebrow, Meta } from '../components/UI';
export default function Result() {
  const { session, t, languageIndex, finished, next, retry, navigate, motion, score, stream } =
      useGame(),
    [result] = useState(() => session.history.at(-1)!);
  const primary = finished ? () => navigate('menu') : next;
  useEffect(() => {
    window.addEventListener('roulette:primary', primary);
    return () => window.removeEventListener('roulette:primary', primary);
  }, [primary]);
  return (
    <section className={`result-screen ${result.success ? 'result-success' : 'result-failure'}`}>
      <div className="result-light" />
      <m.div
        className="result-insignia"
        initial={motion ? { scale: 0.65, rotate: -25, opacity: 0 } : false}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      >
        <div />
        {result.success ? <Check size={39} strokeWidth={1.3} /> : <X size={36} strokeWidth={1.3} />}
      </m.div>
      <Eyebrow>
        {finished ? t('SESSION COMPLETE', 'ИГРА ЗАВЕРШЕНА') : t('ROUND COMPLETE', 'РАУНД ЗАВЕРШЁН')}
      </Eyebrow>
      <div className="title-mask">
        <m.h1
          initial={motion ? { y: '100%' } : false}
          animate={{ y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {result.success
            ? t('A moment of legend.', 'Легендарный момент.')
            : t('Every story has a twist.', 'У истории есть повороты.')}
          <span>
            {result.success
              ? t('Beautifully played.', 'Отлично сыграно.')
              : t('Your next chance awaits.', 'Вас ждёт новый шанс.')}
          </span>
        </m.h1>
      </div>
      <p className="result-description">
        {result.success
          ? t(
              'You owned the stage. Take a breath. Do it again.',
              'Вы покорили сцену. Переведите дух. Повторите.',
            )
          : t(
              'The greatest comebacks start with another spin.',
              'Великие возвращения начинаются с нового спина.',
            )}
      </p>
      <div className="result-score">
        <span>{t('ROUND SCORE', 'ОЧКИ РАУНДА')}</span>
        <m.strong
          initial={motion ? { opacity: 0, y: 15 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.8 }}
        >
          +{result.score}
        </m.strong>
        <span>{result.success ? t('SUCCESS', 'УСПЕХ') : t('NOT THIS TIME', 'НЕ В ЭТОТ РАЗ')}</span>
      </div>
      <div className="result-ledger">
        <Meta label={t('CHAMPION', 'ГЕРОЙ')} value={result.champion.identifier} />
        <Meta
          label={t('CHALLENGE', 'ИСПЫТАНИЕ')}
          value={getChallenge(result.challenge).title[languageIndex]}
        />
        <Meta
          label={t('TIME REMAINING', 'ОСТАЛОСЬ ВРЕМЕНИ')}
          value={`${String(result.remaining).padStart(2, '0')}${t('s', 'с')}`}
        />
        <Meta label={t('SESSION TOTAL', 'ИТОГО ЗА СЕССИЮ')} value={score} />
      </div>
      {!stream && (
        <div className="result-actions">
          <Button arrow onClick={primary}>
            {finished
              ? t('BACK TO MAIN MENU', 'В ГЛАВНОЕ МЕНЮ')
              : t('NEXT ROUND', 'СЛЕДУЮЩИЙ РАУНД')}
          </Button>
          <Button variant="secondary" onClick={retry}>
            <RotateCcw size={14} />
            {t('RETRY', 'ПОВТОРИТЬ')}
          </Button>
          {!finished && (
            <button className="text-action" onClick={() => navigate('menu')}>
              {t('Main menu', 'Главное меню')}
            </button>
          )}
        </div>
      )}
      <div className="result-round">
        {t('ROUND', 'РАУНД')} {String(session.round).padStart(2, '0')}
        <span />
        {t('PLAYER', 'ИГРОК')} {String(session.player).padStart(2, '0')}
      </div>
    </section>
  );
}
