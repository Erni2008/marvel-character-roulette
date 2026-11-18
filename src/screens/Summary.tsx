import { Home, Play, Trophy } from 'lucide-react';
import { useGame } from '../app/Store';
import { CinematicPanel, MetallicButton } from '../components/Cinematic';
export default function Summary() {
  const { t, session, navigate } = useGame(),
    correct = session?.records.filter((r) => r.outcome === 'correct').length ?? 0;
  return (
    <section className="utility-screen summary-screen">
      <Trophy className="summary-trophy" />
      <h1 className="metallic-title">{t('SESSION COMPLETE', 'ИГРА ЗАВЕРШЕНА')}</h1>
      <CinematicPanel tone="red">
        <strong className="summary-score">
          {correct} / {session?.records.length ?? 0}
        </strong>
        <h2 className="metallic-title">{t('CORRECT GUESSES', 'ВЕРНЫХ ОТВЕТОВ')}</h2>
        <p>
          {t(
            'A new character. A new chance. Ready for another round?',
            'Новый герой. Новый шанс. Готовы сыграть ещё?',
          )}
        </p>
      </CinematicPanel>
      <MetallicButton onClick={() => navigate('modes')}>
        <Play />
        {t('PLAY AGAIN', 'ИГРАТЬ СНОВА')}
      </MetallicButton>
      <MetallicButton tone="blue" onClick={() => navigate('home')}>
        <Home />
        {t('MAIN MENU', 'ГЛАВНОЕ МЕНЮ')}
      </MetallicButton>
    </section>
  );
}
