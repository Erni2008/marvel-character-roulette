import { BarChart3, Gamepad2, Play, Settings } from 'lucide-react';
import { motion as m } from 'motion/react';
import { useGame } from '../app/Store';
import { BrandEmblem, MetallicButton } from '../components/Cinematic';
const ease = [0.16, 1, 0.3, 1] as const;
export default function Home() {
  const { t, navigate, openSettings, motion } = useGame();
  const rise = (d: number) =>
    motion ? { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay: d, ease } } : {};
  return (
    <section className="home-screen reference-screen" aria-labelledby="home-title">
      <div className="home-heading">
        <m.div className="home-emblem" {...(motion ? { initial: { scale: 0.4, opacity: 0, rotate: -90 }, animate: { scale: 1, opacity: 1, rotate: 0 }, transition: { duration: 1.1, ease } } : {})}>
          <BrandEmblem />
        </m.div>
        <m.span className="optional-brand" {...rise(0.15)}>
          {t('THE STREAM GAME', 'ИГРА ДЛЯ СТРИМА')}
        </m.span>
        <h1 id="home-title" className="metallic-title">
          <m.span className="title-line l1" {...rise(0.25)} data-text={t('CHARACTER', 'РУЛЕТКА')}>
            {t('CHARACTER', 'РУЛЕТКА')}
          </m.span>
          <m.span className="title-line l2" {...rise(0.35)} data-text={t('ROULETTE', 'ГЕРОЕВ')}>
            {t('ROULETTE', 'ГЕРОЕВ')}
          </m.span>
        </h1>
        <m.div className="title-rule" {...rise(0.4)} />
        <m.p {...rise(0.45)}>{t('GUESS THE CHARACTER', 'УГАДАЙ ПЕРСОНАЖА')}</m.p>
      </div>
      <m.div className="home-actions" {...rise(0.55)}>
        <MetallicButton className="play-button" onClick={() => navigate('modes')}>
          <Play className="solid-icon" />
          <span>{t('PLAY', 'ИГРАТЬ')}</span>
        </MetallicButton>
      </m.div>
      <m.nav className="home-navigation" aria-label={t('Main menu', 'Главное меню')} {...rise(0.65)}>
        <MetallicButton tone="silver" shape="tile" onClick={() => navigate('modes')}>
          <Gamepad2 />
          <span>{t('MODES', 'РЕЖИМЫ')}</span>
        </MetallicButton>
        <MetallicButton tone="silver" shape="tile" onClick={() => navigate('stats')}>
          <BarChart3 />
          <span>{t('STATS', 'СТАТИСТИКА')}</span>
        </MetallicButton>
        <MetallicButton tone="silver" shape="tile" onClick={openSettings}>
          <Settings />
          <span>{t('SETTINGS', 'НАСТРОЙКИ')}</span>
        </MetallicButton>
      </m.nav>
    </section>
  );
}
