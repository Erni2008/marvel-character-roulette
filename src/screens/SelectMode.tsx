import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft } from 'lucide-react';
import { motion as m } from 'motion/react';
import type { SelectionMethod } from '../domain/game';
import { useGame } from '../app/Store';
import { CardFan, IlluminatedFrame, MetallicButton, RouletteWheel } from '../components/Cinematic';
export default function SelectMode() {
  const { t, navigate, start, motion, catalogReady } = useGame();
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
        <p>{t('CHOOSE HOW TO PICK A CHARACTER', 'ВЫБЕРИТЕ СПОСОБ ВЫБОРА ПЕРСОНАЖА')}</p>
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
          <IlluminatedFrame tone="red" />
          <span className="mode-edition" aria-hidden="true">
            01 / COLLECTION
          </span>
          <span className="mode-type">{t('THE REVEAL', 'МОМЕНТ ОТКРЫТИЯ')}</span>
          <div className="mode-art card-mode-art">
            <CardFan />
          </div>
          <div className="mode-copy">
            <h2 className="metallic-title">{t('CARD DRAW', 'КАРТА')}</h2>
            <p>
              {t('Reveal a random character', 'Откройте случайного персонажа')}
              <br />
              {t('with a cinematic card', 'с помощью эффектной карты')}
            </p>
          </div>
          <span className="mode-enter" aria-hidden="true">
            <ArrowUpRight size={15} />
          </span>
          <span className="mode-panel-flare" />
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
          <IlluminatedFrame tone="blue" />
          <span className="mode-edition" aria-hidden="true">
            02 / SELECTION
          </span>
          <span className="mode-type">{t('THE SUSPENSE', 'ИНТРИГА ВРАЩЕНИЯ')}</span>
          <div className="mode-art roulette-mode-art">
            <RouletteWheel decorative count={32} />
          </div>
          <div className="mode-copy">
            <h2 className="metallic-title">{t('ROULETTE', 'РУЛЕТКА')}</h2>
            <p>
              {t('Spin through characters', 'Прокрутите персонажей')}
              <br />
              {t('and land on a random one', 'и доверьте выбор случаю')}
            </p>
          </div>
          <span className="mode-enter" aria-hidden="true">
            <ArrowUpRight size={15} />
          </span>
          <span className="mode-panel-flare" />
        </m.button>
      </div>
      <p className="mode-footnote">
        {t('TWO WAYS TO PLAY. ONE GREAT REVEAL.', 'ДВА СПОСОБА ВЫБОРА. ОДНА БОЛЬШАЯ ИГРА.')}
      </p>
    </section>
  );
}
