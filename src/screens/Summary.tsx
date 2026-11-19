import { Check, ChevronsRight, Home, Play, Trash2, Trophy } from 'lucide-react';
import { motion as m } from 'motion/react';
import { characterName } from '../domain/game';
import { useGame } from '../app/Store';
import { MetallicButton } from '../components/Cinematic';
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
      <div className="round-recap">
        {rows.map((r) => (
          <div key={r.round} className={`recap-${r.outcome}`}>
            <span>{r.round}</span>
            <strong>{characterName(r.character, settings.language)}</strong>
            <small>{r.outcome === 'correct' ? fmt(r.time) : r.outcome === 'skipped' ? t('skipped', 'пропуск') : t('passed', 'дальше')}</small>
            {r.outcome === 'correct' ? <Check size={16} /> : r.outcome === 'skipped' ? <Trash2 size={16} /> : <ChevronsRight size={16} />}
          </div>
        ))}
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
