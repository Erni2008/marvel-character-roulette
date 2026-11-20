import { ArrowLeft } from 'lucide-react';
import { motion as m } from 'motion/react';
import { useState } from 'react';
import { useGame } from '../app/Store';
import { builtInCharacters, characterName } from '../domain/game';
import type { Character } from '../domain/game';
import { CharacterCard, MetallicButton } from '../components/Cinematic';
const ru = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'герой' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'героя' : 'героев');
/** All hero cards on one screen; tap a card to see it big. */
export default function Gallery() {
  const { t, navigate, motion, settings, characters } = useGame();
  const all = (characters.length ? characters : builtInCharacters).map((c) => builtInCharacters.find((b) => b.id === c.id) ?? c);
  const withArt = all.filter((c) => c.imagePath),
    [open, setOpen] = useState<Character | null>(null);
  return (
    <section className="utility-screen gallery-screen">
      <header className="utility-header page-head">
        <MetallicButton tone="silver" shape="tile" className="back-control" aria-label={t('Back', 'Назад')} onClick={() => navigate('home')}>
          <ArrowLeft />
        </MetallicButton>
        <div className="page-title">
          <h1 className="metallic-title">{t('HERO GALLERY', 'ГАЛЕРЕЯ ГЕРОЕВ')}</h1>
          <p>{t('Tap a card to see it up close', 'Нажмите на карту, чтобы рассмотреть')}</p>
        </div>
        <span className="gallery-count"><b>{withArt.length}</b>{t('heroes', ru(withArt.length))}</span>
      </header>
      <div className="gallery-grid">
        {withArt.map((c, i) => (
          <m.button
            key={c.id}
            className="gallery-item"
            onClick={() => setOpen(c)}
            initial={motion ? { opacity: 0, y: 40, rotateY: -30 } : false}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ delay: 0.05 + i * 0.05, type: 'spring', stiffness: 150, damping: 18 }}
            whileHover={motion ? { y: -10, scale: 1.03 } : undefined}
            aria-label={characterName(c, settings.language)}
          >
            <CharacterCard front character={c} />
          </m.button>
        ))}
      </div>
      {open && (
        <m.div className="gallery-zoom" onClick={() => setOpen(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <m.div className="gallery-zoom-card" initial={motion ? { scale: 0.6, rotateY: -90 } : false} animate={{ scale: 1, rotateY: 0 }} transition={{ type: 'spring', stiffness: 140, damping: 16 }}>
            <CharacterCard front character={open} />
          </m.div>
        </m.div>
      )}
    </section>
  );
}
