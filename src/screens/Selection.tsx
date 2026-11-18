import { useEffect, useRef } from 'react';
import { motion as m } from 'motion/react';
import { characterName } from '../domain/game';
import { FastForward } from 'lucide-react';
import { useGame } from '../app/Store';
import { CharacterCard, RouletteWheel } from '../components/Cinematic';
import { useSelectionSequence } from '../hooks/useSelectionSequence';
export default function Selection() {
  const { session, characters, prepare, reveal, enterGuess, motion, t, settings } = useGame(),
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
      <header className="selection-chapter">
        <span>
          {t('ROUND', 'РАУНД')} {String(snapshot.round).padStart(2, '0')}
        </span>
        <i />
        <span>{t(isWheel ? 'ROULETTE' : 'CARD DRAW', isWheel ? 'РУЛЕТКА' : 'РОЗЫГРЫШ КАРТЫ')}</span>
      </header>
      <div className="draw-scene">
        <div className="stage-reticle" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
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
            <div className="card-perspective shuffle-deck" data-testid="shuffle-deck">
              {seq.deck.map((card) => (
                <m.div
                  className={`physical-card ${card.index === 0 ? 'selected-deck-card' : ''}`}
                  key={card.index}
                  data-card-index={card.index}
                  style={{
                    x: card.x,
                    y: card.y,
                    rotateZ: card.rotate,
                    rotateY: card.yaw,
                    scale: card.scale,
                    opacity: card.opacity,
                    zIndex: card.layer,
                  }}
                >
                  {card.index === 0 ? (
                    <div
                      className={`card-face ${seq.frontVisible ? 'face-front' : 'face-back'}`}
                      data-facing={seq.frontVisible ? 'front' : 'back'}
                    >
                      <CharacterCard
                        front={seq.frontVisible}
                        character={seq.frontVisible ? seq.character : null}
                      />
                    </div>
                  ) : (
                    <CharacterCard />
                  )}
                </m.div>
              ))}
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
        <div className="selection-phase" aria-hidden="true">
          {[
            t('ACTIVATE', 'ЗАПУСК'),
            t('SHUFFLE', 'ВЫБОР'),
            t('LOCK', 'ФИКСАЦИЯ'),
            t('REVEAL', 'ОТКРЫТИЕ'),
          ].map((label, i) => (
            <span key={i} className={seq.stage >= i ? 'phase-active' : ''}>
              <b>{String(i + 1).padStart(2, '0')}</b>
              {label}
            </span>
          ))}
        </div>
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
        {seq.ready && seq.character ? characterName(seq.character, settings.language) : ''}
      </span>
    </section>
  );
}
