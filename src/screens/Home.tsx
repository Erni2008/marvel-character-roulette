import { BarChart3, Gamepad2, Images, Layers, Play, Settings, Volume2, VolumeX } from 'lucide-react';
import { motion as m } from 'motion/react';
import { useGame } from '../app/Store';
import { MetallicButton } from '../components/Cinematic';
import { asset } from '../domain/identity';
const ease = [0.16, 1, 0.3, 1] as const;
export default function Home() {
  const { t, navigate, openSettings, motion, characters, settings, update } = useGame();
  const inDeck = characters.filter((c) => c.enabled).length,
    muted = settings.master === 0;
  const rise = (d: number, y = 30) =>
    motion ? { initial: { opacity: 0, y }, animate: { opacity: 1, y: 0 }, transition: { duration: 1, delay: d, ease } } : {};
  return (
    <section className="home-screen title-screen" aria-labelledby="home-title">
      <div className="ts-letterbox" aria-hidden="true" />
      <div className="ts-logo">
        <img className="ts-rays" src={asset('art/rays.webp')} alt="" aria-hidden="true" />
        <i className="ts-streak" aria-hidden="true" />
        <m.div className="ts-kicker" {...rise(0.1, 12)}>
          <i />
          <span>{t('THE STREAM GAME', 'ИГРА ДЛЯ СТРИМА')}</span>
          <i />
        </m.div>
        <h1 id="home-title" className="metallic-title">
          <m.span className="title-line l1" {...rise(0.2)} data-text={t('CHARACTER', 'РУЛЕТКА')}>
            {t('CHARACTER', 'РУЛЕТКА')}
          </m.span>
          <m.span className="title-line l2" {...rise(0.32)} data-text={t('ROULETTE', 'ГЕРОЕВ')}>
            {t('ROULETTE', 'ГЕРОЕВ')}
          </m.span>
        </h1>
        <m.div className="ts-tagline" {...rise(0.45, 10)}>
          <i />
          <span>{t('GUESS THE CHARACTER', 'УГАДАЙ ПЕРСОНАЖА')}</span>
          <i />
        </m.div>
      </div>
      <m.div className="home-actions" {...rise(0.6)}>
        <MetallicButton className="play-button" onClick={() => navigate('modes')}>
          <Play className="solid-icon" />
          <span>{t('PLAY', 'ИГРАТЬ')}</span>
        </MetallicButton>
      </m.div>
      <m.footer className="ts-hud" {...rise(0.75, 20)}>
        <div className="ts-chip">
          <Layers size={16} />
          <span>
            {t('HEROES IN DECK', 'ГЕРОЕВ В КОЛОДЕ')} <b>{inDeck}</b>
          </span>
        </div>
        <nav className="home-navigation" aria-label={t('Main menu', 'Главное меню')}>
          <button onClick={() => navigate('modes')}>
            <Gamepad2 size={18} />
            <span>{t('MODES', 'РЕЖИМЫ')}</span>
          </button>
          <button onClick={() => navigate('gallery')}>
            <Images size={18} />
            <span>{t('HEROES', 'ГЕРОИ')}</span>
          </button>
          <button onClick={() => navigate('stats')}>
            <BarChart3 size={18} />
            <span>{t('STATS', 'СТАТИСТИКА')}</span>
          </button>
          <button onClick={openSettings}>
            <Settings size={18} />
            <span>{t('SETTINGS', 'НАСТРОЙКИ')}</span>
          </button>
        </nav>
        <button className="ts-sound" onClick={() => update({ master: muted ? 0.8 : 0 })} aria-label={muted ? t('Sound on', 'Включить звук') : t('Mute', 'Выключить звук')}>
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          <span>{muted ? t('SOUND OFF', 'ЗВУК ВЫКЛ') : t('SOUND ON', 'ЗВУК ВКЛ')}</span>
        </button>
      </m.footer>
    </section>
  );
}
