import { useEffect, useRef } from 'react';
import { motion as m } from 'motion/react';
import { FastForward } from 'lucide-react';
import { useGame } from '../app/Store';
import { CharacterCard, RouletteWheel } from '../components/Cinematic';
import { useSelectionSequence } from '../hooks/useSelectionSequence';
export default function Selection() {
  const { session, characters, prepare, reveal, enterGuess, motion, t } = useGame(),
    snapshot = useRef(session!).current,
    entries = useRef(characters.filter((c) => c.enabled)).current;
  const seq = useSelectionSequence({
      method: snapshot.method,
      entries,
      prepare,
      reveal,
      continueToGuess: enterGuess,
      motion,
      restored: snapshot.phase === 'revealed',
    }),
    isWheel = snapshot.method === 'roulette';
  const progressBar = useRef<HTMLDivElement>(null);
  useEffect(
    () =>
      seq.progress.on('change', (value) =>
        progressBar.current?.setAttribute('aria-valuenow', String(Math.round(value * 100))),
      ),
    [seq.progress],
  );
  useEffect(() => {
    const primary = () => (seq.ready ? enterGuess() : seq.skip());
    window.addEventListener('roulette:primary', primary);
    return () => window.removeEventListener('roulette:primary', primary);
  }, [seq.ready, seq.skip, enterGuess]);
  return (
    <section
      className={`drawing-screen reference-screen ${isWheel ? 'drawing-wheel' : 'drawing-card'} ${seq.ready ? 'selection-ready' : ''} stage-${seq.stage}`}
      aria-label={t(
        isWheel ? 'Roulette selection' : 'Drawing character',
        isWheel ? 'Выбор рулеткой' : 'Розыгрыш карты',
      )}
    >
      <div className="draw-scene">
        <div className="blue-volumetric-light" />
        <div className="energy-structure">
          <i />
          <i />
          <i />
        </div>
        {isWheel ? (
          <>
            <m.div className="selection-wheel-wrap" style={{ opacity: seq.wheelOpacity }}>
              <RouletteWheel
                rotation={seq.rotation}
                count={seq.wheelEntries.length}
                selectedIndex={seq.selectedIndex}
              />
            </m.div>
            <m.div
              className="wheel-reveal-card"
              initial={{ opacity: 0, scale: 0.65, rotateY: -25 }}
              animate={
                seq.stage >= 3
                  ? { opacity: 1, scale: 1, rotateY: 0 }
                  : { opacity: 0, scale: 0.65, rotateY: -25 }
              }
              transition={{ duration: motion ? 0.65 : 0 }}
            >
              <CharacterCard front character={seq.character} />
            </m.div>
          </>
        ) : (
          <>
            <div className="card-perspective">
              <m.div className="shuffle-ghosts" style={{ opacity: seq.ghostOpacity }}>
                {seq.ghosts.map((g) => (
                  <m.div
                    className="shuffle-card"
                    key={g.n}
                    style={{ x: g.x, y: g.y, z: g.z, rotateZ: g.rotate, rotateY: g.n * 15 }}
                  >
                    <CharacterCard />
                  </m.div>
                ))}
              </m.div>
              <m.div
                className="draw-card-3d"
                style={{
                  x: seq.cardX,
                  y: seq.cardY,
                  rotateY: seq.cardRotateY,
                  rotateZ: seq.cardRotateZ,
                  scale: seq.cardScale,
                  opacity: seq.cardOpacity,
                }}
              >
                <div className="card-face face-back">
                  <CharacterCard />
                </div>
                <div className="card-face face-front">
                  <CharacterCard front character={seq.character} />
                </div>
              </m.div>
            </div>
            <div className="energy-trails">
              <i />
              <i />
              <i />
            </div>
          </>
        )}
        <div className="draw-platform-light" />
      </div>
      <div className="drawing-status">
        <h1 className="metallic-title" aria-live="polite">
          {seq.ready
            ? t('CHARACTER SELECTED', 'ПЕРСОНАЖ ВЫБРАН')
            : t(
                isWheel ? 'SPINNING ROULETTE…' : 'DRAWING CHARACTER…',
                isWheel ? 'РУЛЕТКА ВРАЩАЕТСЯ…' : 'ВЫБИРАЕМ ПЕРСОНАЖА…',
              )}
        </h1>
        <div
          ref={progressBar}
          className="illuminated-progress"
          role="progressbar"
          aria-label={t('Selection progress', 'Ход выбора')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={seq.ready ? 100 : undefined}
        >
          <m.div className="progress-fill" style={{ scaleX: seq.progress }} />
          <div className="progress-slashes" />
        </div>
        <button className="sequence-skip" onClick={seq.ready ? enterGuess : seq.skip}>
          {seq.ready ? (
            t('CONTINUE', 'ПРОДОЛЖИТЬ')
          ) : (
            <>
              <FastForward size={12} />
              {t('SKIP ANIMATION', 'ПРОПУСТИТЬ АНИМАЦИЮ')}
            </>
          )}
        </button>
      </div>
      <span
        className="selection-result-id"
        data-testid="selection-result"
        data-wheel-index={seq.selectedIndex}
      >
        {seq.ready ? seq.character?.name : ''}
      </span>
    </section>
  );
}
