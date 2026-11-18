import { ChevronLeft } from 'lucide-react';
import { motion as m } from 'motion/react';
import { useGame } from '../app/Store';
import { CardFan, IlluminatedFrame, MetallicButton, RouletteWheel } from '../components/Cinematic';
export default function SelectMode() {
  const { t, navigate, start, motion, catalogReady } = useGame();
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
          className="mode-choice mode-card-draw"
          disabled={!catalogReady}
          onClick={() => start('card')}
          whileTap={motion ? { scale: 0.98 } : undefined}
          aria-label={t(
            'Card Draw — reveal a random character',
            'Карта — открыть случайного персонажа',
          )}
        >
          <IlluminatedFrame tone="red" />
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
          <span className="mode-panel-flare" />
        </m.button>
        <m.button
          className="mode-choice mode-roulette"
          disabled={!catalogReady}
          onClick={() => start('roulette')}
          whileTap={motion ? { scale: 0.98 } : undefined}
          aria-label={t(
            'Roulette — spin and select a character',
            'Рулетка — выбрать персонажа вращением',
          )}
        >
          <IlluminatedFrame tone="blue" />
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
          <span className="mode-panel-flare" />
        </m.button>
      </div>
    </section>
  );
}
