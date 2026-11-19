import { Check, Home, Play, Trophy, X } from 'lucide-react';
import { motion as m } from 'motion/react';
import { characterName } from '../domain/game';
import { useGame } from '../app/Store';
import { CharacterCard, MetallicButton } from '../components/Cinematic';
const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
export default function Summary() {
  const { t, session, navigate, settings, motion } = useGame(),
    duration = session?.duration ?? 3600,
    rows = (session?.records ?? []).map((r) => ({ ...r, time: Math.max(0, duration - r.remaining) })),
    hits = rows.filter((r) => r.outcome === 'correct'),
    avg = hits.length ? Math.round(hits.reduce((a, r) => a + r.time, 0) / hits.length) : 0,
    best = hits.reduce<(typeof hits)[number] | null>((b, r) => (!b || r.time < b.time ? r : b), null),
    total = rows.reduce((a, r) => a + r.time, 0);
  const tiles = [
    [t('GUESSED', 'УГАДАНО'), `${hits.length}`, `${t('of', 'из')} ${rows.length}`],
    [t('AVERAGE TIME', 'СРЕДНЕЕ ВРЕМЯ'), hits.length ? fmt(avg) : '—', t('per guess', 'на героя')],
    [t('FASTEST', 'БЫСТРЕЕ ВСЕГО'), best ? fmt(best.time) : '—', best ? characterName(best.character, settings.language) : '—'],
    [t('TOTAL TIME', 'ВСЕГО ВРЕМЕНИ'), fmt(total), t('in the game', 'в игре')],
  ];
  return (
    <section className="utility-screen summary-screen">
      <Trophy className="summary-trophy" />
      <h1 className="metallic-title">{t('RESULTS', 'ИТОГИ ИГРЫ')}</h1>
      <div className="summary-tiles">
        {tiles.map(([label, value, sub], i) => (
          <m.div key={label} className="summary-tile" initial={motion ? { opacity: 0, y: 24 } : false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{sub}</small>
          </m.div>
        ))}
      </div>
      <div className="recap-gallery">
        {rows.map((r, i) => {
          const ok = r.outcome === 'correct';
          return (
            <m.div
              key={r.round}
              className={`recap-card ${ok ? 'is-hit' : 'is-miss'}`}
              initial={motion ? { opacity: 0, y: 30, rotateX: -20 } : false}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.25 + i * 0.05, type: 'spring', stiffness: 160, damping: 18 }}
            >
              <div className="recap-art">
                <CharacterCard front character={r.character} showName={false} />
                <span className="recap-round">{r.round}</span>
              </div>
              <strong>{characterName(r.character, settings.language)}</strong>
              <div className={`recap-status ${ok ? 'hit' : 'miss'}`}>
                {ok ? <Check size={14} /> : <X size={14} />}
                {ok ? t('GUESSED', 'УГАДАН') : r.outcome === 'skipped' ? t('REMOVED', 'УБРАН') : t('NOT GUESSED', 'НЕ УГАДАН')}
              </div>
              <span className="recap-time">{fmt(r.time)}</span>
            </m.div>
          );
        })}
        {!rows.length && <p className="recap-empty">{t('No rounds played yet.', 'Раундов пока не было.')}</p>}
      </div>
      <div className="summary-actions">
        <MetallicButton onClick={() => navigate('modes')}>
          <Play />
          {t('PLAY AGAIN', 'ИГРАТЬ СНОВА')}
        </MetallicButton>
        <MetallicButton tone="blue" onClick={() => navigate('home')}>
          <Home />
          {t('MAIN MENU', 'ГЛАВНОЕ МЕНЮ')}
        </MetallicButton>
      </div>
    </section>
  );
}
