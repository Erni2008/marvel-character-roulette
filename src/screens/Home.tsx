import { BarChart3, Gamepad2, Play, Settings } from 'lucide-react';
import { useGame } from '../app/Store';
import { MetallicButton } from '../components/Cinematic';
export default function Home() {
  const { t, navigate, openSettings } = useGame();
  return (
    <section className="home-screen reference-screen" aria-labelledby="home-title">
      <div className="home-heading">
        <span className="optional-brand">ORIGINAL</span>
        <h1 id="home-title" className="metallic-title">
          <span>CHARACTER</span>
          <span>ROULETTE</span>
        </h1>
        <div className="title-rule" />
        <p>{t('GUESS THE CHARACTER', 'УГАДАЙТЕ ПЕРСОНАЖА')}</p>
      </div>
      <div className="home-actions">
        <MetallicButton className="play-button" onClick={() => navigate('modes')}>
          <Play className="solid-icon" />
          <span className="metallic-title">{t('PLAY', 'ИГРАТЬ')}</span>
        </MetallicButton>
      </div>
      <nav className="home-navigation" aria-label={t('Main menu', 'Главное меню')}>
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
      </nav>
    </section>
  );
}
