import { ArrowLeft, Check, Trophy } from 'lucide-react';
import { useGame } from '../app/Store';
import { CinematicPanel, MetallicButton } from '../components/Cinematic';
export default function Stats() {
  const { t, statistics: s, navigate, setModal } = useGame(),
    accuracy = s.rounds ? Math.round((s.correct / s.rounds) * 100) : 0;
  return (
    <section className="utility-screen stats-screen">
      <header className="utility-header">
        <MetallicButton
          tone="silver"
          shape="tile"
          className="back-control"
          aria-label={t('Back', 'Назад')}
          onClick={() => navigate('home')}
        >
          <ArrowLeft />
        </MetallicButton>
        <h1 className="metallic-title">{t('YOUR STATS', 'СТАТИСТИКА')}</h1>
      </header>
      <CinematicPanel>
        <Trophy className="stats-trophy" />
        <div className="stats-hero">
          <strong>{s.correct}</strong>
          <span>{t('CORRECT GUESSES', 'ВЕРНЫХ ОТВЕТОВ')}</span>
        </div>
        <div className="stats-grid">
          {[
            [t('ROUNDS PLAYED', 'СЫГРАНО РАУНДОВ'), s.rounds],
            [t('ACCURACY', 'ТОЧНОСТЬ'), `${accuracy}%`],
            [t('BEST STREAK', 'ЛУЧШАЯ СЕРИЯ'), s.bestStreak],
            [t('BEST TIME LEFT', 'ЛУЧШЕЕ ВРЕМЯ'), `${s.bestRemaining}s`],
            [t('SKIPPED / PASSED', 'ПРОПУСКИ'), s.skipped + s.passed],
            [t('TIMEOUTS', 'ВРЕМЯ ВЫШЛО'), s.timeouts],
          ].map(([name, value]) => (
            <div key={name}>
              <span>{name}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        <p>
          {t(
            'Statistics stay on this device. Every completed round is counted once.',
            'Статистика хранится на устройстве. Каждый раунд учитывается один раз.',
          )}
        </p>
      </CinematicPanel>
      <MetallicButton onClick={() => navigate('modes')}>
        <Check />
        {t('PLAY AGAIN', 'ИГРАТЬ')}
      </MetallicButton>
      <button className="quiet-link" onClick={() => setModal('reset')}>
        {t('Reset statistics', 'Сбросить статистику')}
      </button>
    </section>
  );
}
