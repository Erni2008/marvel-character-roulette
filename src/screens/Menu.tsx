import { motion as m } from 'motion/react';
import { ArrowUpRight, Users, BookOpen, Shuffle, CameraOff } from 'lucide-react';
import { useGame } from '../app/Store';
import Stage from '../components/Stage';
import { Button, Eyebrow } from '../components/UI';
import type { Mode } from '../domain/game';
export default function Menu() {
  const { t, navigate, openSettings, setModal, settings, update, motion } = useGame();
  const modes: { id: Mode; title: string; icon: typeof Users; caption: string }[] = [
    {
      id: 'party',
      title: t('Party', 'Вечеринка'),
      icon: Users,
      caption: t('BETTER TOGETHER', 'ЛУЧШЕ ВМЕСТЕ'),
    },
    {
      id: 'knowledge',
      title: t('Knowledge', 'Знатоки'),
      icon: BookOpen,
      caption: t('KNOW YOUR LEGENDS', 'ЗНАЙТЕ СВОИХ ГЕРОЕВ'),
    },
    {
      id: 'chaos',
      title: t('Chaos', 'Хаос'),
      icon: Shuffle,
      caption: t('EMBRACE THE UNKNOWN', 'НАВСТРЕЧУ НЕИЗВЕСТНОМУ'),
    },
  ];
  return (
    <section className="menu-screen" aria-labelledby="menu-title">
      <div className="menu-copy">
        <Eyebrow tone="red">
          {t('THE ULTIMATE GUESSING EXPERIENCE', 'ИГРА, В КОТОРОЙ РЕШАЕТ ВООБРАЖЕНИЕ')}
        </Eyebrow>
        <h1 id="menu-title">
          <span className="title-mask">
            <m.span
              initial={motion ? { y: '105%' } : false}
              animate={{ y: 0 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            >
              CHARACTER
            </m.span>
          </span>
          <span className="title-mask">
            <m.span
              className="outline-title"
              initial={motion ? { y: '105%' } : false}
              animate={{ y: 0 }}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              ROULETTE<span className="title-period">.</span>
            </m.span>
          </span>
        </h1>
        <p className="menu-description">
          {t('Every hero has a secret.', 'У каждого героя есть секрет.')}
          <br />
          <span>{t('Make a scene. Take a guess.', 'Покажите. Объясните. Угадайте.')}</span>
        </p>
        <div className="menu-actions">
          <Button arrow onClick={() => navigate('setup')}>
            {t('START GAME', 'НАЧАТЬ ИГРУ')}
          </Button>
          <div className="menu-secondary">
            <button onClick={() => setModal('how')}>
              {t('How to play', 'Как играть')}
              <ArrowUpRight size={13} />
            </button>
            <span />
            <button onClick={openSettings}>
              {t('Settings', 'Настройки')}
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
        <div className="menu-index">
          <span>01—120</span>
          <div />
          {t('ONE SPIN. YOUR STORY.', 'ОДИН СПИН. ВАША ИСТОРИЯ.')}
        </div>
      </div>
      <div className="menu-stage">
        <div className="stage-topline">
          <span>{t('THE SELECTION CHAMBER', 'КАМЕРА ВЫБОРА')}</span>
          <span>CR / 001</span>
        </div>
        <Stage />
        <div className="stage-under">
          <span>{t('A LEGEND IS WAITING', 'ЛЕГЕНДА УЖЕ ЖДЁТ')}</span>
          <span>{t('CHAMPION DATABASE · COMING SOON', 'БАЗА ГЕРОЕВ · СКОРО')}</span>
        </div>
        <button className="camera-cue" onClick={() => setModal('camera')}>
          <CameraOff size={14} />
          <span>{t('CAMERA DECK', 'МОДУЛЬ КАМЕРЫ')}</span>
          <span className="camera-state">{t('NOT CONNECTED', 'НЕ ПОДКЛЮЧЕН')}</span>
        </button>
      </div>
      <div className="mode-dock">
        <div className="dock-label">
          <span>{t('CHOOSE YOUR ENERGY', 'ВЫБЕРИТЕ НАСТРОЕНИЕ')}</span>
          <button onClick={() => navigate('setup')}>
            {t('GAME MODES', 'РЕЖИМЫ ИГРЫ')}
            <ArrowUpRight size={13} />
          </button>
        </div>
        <div className="dock-options">
          {modes.map(({ id, title, icon: Icon, caption }, i) => (
            <button
              className={`dock-mode ${settings.mode === id ? 'is-selected' : ''}`}
              key={id}
              aria-pressed={settings.mode === id}
              onClick={() => update({ mode: id })}
            >
              <span className="mode-number">0{i + 1}</span>
              <Icon size={20} strokeWidth={1.4} />
              <span>
                <strong>{title}</strong>
                <small>{caption}</small>
              </span>
              <div className="mode-signal" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
