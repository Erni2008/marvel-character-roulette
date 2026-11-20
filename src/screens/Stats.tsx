import { ArrowLeft, Flame, Gauge, Layers, Play, RotateCcw, SkipForward, Target, Timer, Trophy } from 'lucide-react';
import { motion as m } from 'motion/react';
import { useGame } from '../app/Store';
import { MetallicButton } from '../components/Cinematic';
const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
export default function Stats() {
  const { t, statistics: s, navigate, setModal, motion, characters, removedCount } = useGame(),
    accuracy = s.rounds ? Math.round((s.correct / s.rounds) * 100) : 0,
    best = s.bestRemaining > 0 ? fmt(Math.max(0, 3600 - s.bestRemaining)) : '—';
  const tiles = [
    [Target, t('ROUNDS PLAYED', 'СЫГРАНО РАУНДОВ'), s.rounds],
    [Gauge, t('ACCURACY', 'ТОЧНОСТЬ'), `${accuracy}%`],
    [Flame, t('BEST STREAK', 'ЛУЧШАЯ СЕРИЯ'), s.bestStreak],
    [Timer, t('FASTEST GUESS', 'БЫСТРЕЕ ВСЕГО'), best],
    [SkipForward, t('SKIPPED', 'ПРОПУСКИ'), s.skipped + s.passed],
    [Layers, t('IN DECK', 'В КОЛОДЕ'), `${characters.length - removedCount}`],
  ] as const;
  return (
    <section className="utility-screen stats-screen">
      <header className="utility-header page-head">
        <MetallicButton tone="silver" shape="tile" className="back-control" aria-label={t('Back', 'Назад')} onClick={() => navigate('home')}>
          <ArrowLeft />
        </MetallicButton>
        <div className="page-title">
          <h1 className="metallic-title">{t('YOUR STATS', 'СТАТИСТИКА')}</h1>
          <p>{t('All games on this device', 'Все игры на этом устройстве')}</p>
        </div>
      </header>
      <div className="hud-box stats-board">
        <div className="stats-hero">
          <div className="stats-ring" style={{ '--p': accuracy } as React.CSSProperties}>
            <Trophy className="stats-trophy" />
          </div>
          <div>
            <strong>{s.correct}</strong>
            <span>{t('CORRECT GUESSES', 'ВЕРНЫХ ОТВЕТОВ')}</span>
          </div>
        </div>
        <div className="stats-grid">
          {tiles.map(([Icon, name, value], i) => (
            <m.div key={name} initial={motion ? { opacity: 0, y: 18 } : false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}>
              <Icon size={20} />
              <span>{name}</span>
              <strong>{value}</strong>
            </m.div>
          ))}
        </div>
      </div>
      <div className="page-actions">
        <MetallicButton onClick={() => navigate('modes')}>
          <Play />
          {t('PLAY', 'ИГРАТЬ')}
        </MetallicButton>
        <button className="chip-link" onClick={() => setModal('reset')}>
          <RotateCcw size={15} />
          {t('Reset statistics', 'Сбросить статистику')}
        </button>
      </div>
    </section>
  );
}
