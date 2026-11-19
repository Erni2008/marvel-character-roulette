import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft } from 'lucide-react';
import { motion as m } from 'motion/react';
import type { SelectionMethod } from '../domain/game';
import { useGame } from '../app/Store';
import { CardFan, MetallicButton, RouletteWheel } from '../components/Cinematic';
export default function SelectMode() {
  const { t, navigate, start, motion, catalogReady, characters } = useGame();
  const [armed, setArmed] = useState<SelectionMethod | null>(null);
  const activation = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (activation.current) clearTimeout(activation.current);
    },
    [],
  );
  const choose = (method: SelectionMethod) => {
    if (armed) return;
    setArmed(method);
    activation.current = setTimeout(() => start(method), motion ? 280 : 0);
  };
  return (
    <section className="mode-screen reference-screen" aria-labelledby="mode-title">
      <header className="mode-header">
        <MetallicButton
          tone="silver"
          shape="tile"
          className="back-control"
          aria-label={t('Back to main menu', 'Назад в главное меню')}
          onClick={() => navigate('home')}
        >
          <ChevronLeft />
        </MetallicButton>
        <h1 className="metallic-title" id="mode-title">
          {t('SELECT MODE', 'ВЫБЕРИТЕ РЕЖИМ')}
        </h1>
        <p>{t('Choose how to pick a character', 'Выберите способ жеребьёвки')}</p>
      </header>
      <div className="selection-modes">
        <m.button
          className={`mode-choice mode-card-draw ${armed === 'card' ? 'mode-armed' : ''} ${armed === 'roulette' ? 'mode-muted' : ''}`}
          initial={motion ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          disabled={!catalogReady}
          onClick={() => choose('card')}
          whileTap={motion ? { scale: 0.98 } : undefined}
          aria-label={t(
            'Card Draw — reveal a random character',
            'Карта — открыть случайного персонажа',
          )}
        >
          <div className="mode-art card-mode-art">
            <CardFan />
          </div>
          <div className="mode-copy">
            <span className="mode-index">01</span>
            <h2 className="metallic-title">{t('CARD DRAW', 'КАРТА')}</h2>
            <p>
              {t('Shuffle the deck', 'Перемешайте колоду')}{' '}
              {t('and turn over a card.', 'и откройте карту.')}
            </p>
          </div>
          <span className="mode-enter" aria-hidden="true">
            <ArrowUpRight size={18} />
          </span>
          <span className="mode-panel-flare" />
          <span className="mode-cta" aria-hidden="true">{t('SELECT', 'ВЫБРАТЬ')}</span>
        </m.button>
        <m.button
          className={`mode-choice mode-roulette ${armed === 'roulette' ? 'mode-armed' : ''} ${armed === 'card' ? 'mode-muted' : ''}`}
          initial={motion ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          disabled={!catalogReady}
          onClick={() => choose('roulette')}
          whileTap={motion ? { scale: 0.98 } : undefined}
          aria-label={t(
            'Roulette — spin and select a character',
            'Рулетка — выбрать персонажа вращением',
          )}
        >
          <div className="mode-art roulette-mode-art">
            <RouletteWheel decorative entries={characters.slice(0, 24)} />
          </div>
          <div className="mode-copy">
            <span className="mode-index">02</span>
            <h2 className="metallic-title">{t('ROULETTE', 'РУЛЕТКА')}</h2>
            <p>
              {t('Spin the wheel', 'Запустите колесо')}{' '}
              {t('to pick a character.', 'и дождитесь результата.')}
            </p>
          </div>
          <span className="mode-enter" aria-hidden="true">
            <ArrowUpRight size={18} />
          </span>
          <span className="mode-panel-flare" />
          <span className="mode-cta" aria-hidden="true">{t('SELECT', 'ВЫБРАТЬ')}</span>
        </m.button>
      </div>
      <p className="mode-footnote">
        {t(
          'The guesser looks away. Everyone else sees the answer.',
          'Угадывающий отворачивается. Остальные видят ответ.',
        )}
      </p>
    </section>
  );
}
