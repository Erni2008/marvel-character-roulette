import { useEffect, useRef } from 'react';
import { motion as m } from 'motion/react';
import { characterName, wheelIndexAtPointer } from '../domain/game';
import { asset, identity } from '../domain/identity';
import { FastForward } from 'lucide-react';
import { useGame } from '../app/Store';
import { Burst, CharacterCard, RouletteWheel } from '../components/Cinematic';
import { useSelectionSequence } from '../hooks/useSelectionSequence';
import { sfx } from '../fx/sound';
import type { CSSProperties } from 'react';
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
  const progressBar = useRef<HTMLDivElement>(null),
    pointer = useRef<HTMLDivElement>(null);
  useEffect(
    () =>
      seq.progress.on('change', (value) =>
        progressBar.current?.setAttribute('aria-valuenow', String(Math.round(value * 100))),
      ),
    [seq.progress],
  );
  // Ratchet: tick + pointer flick each time a segment boundary passes the pointer.
  useEffect(() => {
    if (!isWheel) return;
    let last = -1,
      lastSound = 0,
      lastV = 0,
      lastT = performance.now(),
      stopped = false;
    return seq.rotation.on('change', (v) => {
      const now = performance.now(),
        vel = Math.abs(v - lastV) / Math.max(1, now - lastT); // deg per ms
      lastV = v;
      lastT = now;
      const i = wheelIndexAtPointer(v, seq.wheelEntries.length);
      if (i === last) {
        if (!stopped && vel < 0.002 && now - lastSound > 300 && seq.progress.get() > 0.8) {
          stopped = true;
          sfx.thunk();
        }
        return;
      }
      last = i;
      // at top speed pegs blur together: thin them out like a real wheel's flapper
      if (now - lastSound > (vel > 1 ? 55 : 28)) {
        lastSound = now;
        sfx.tick(Math.min(1, vel / 1.2));
      }
      const p = pointer.current?.querySelector<HTMLElement>('.wheel-pointer');
      if (p) {
        p.classList.remove('flick');
        void p.offsetWidth;
        p.classList.add('flick');
      }
    });
  }, [isWheel, seq.rotation, seq.wheelEntries.length, seq.progress]);
  const stopShuffle = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (seq.stage === 1) {
      if (isWheel) sfx.whoosh();
      else stopShuffle.current = sfx.riffle();
    }
    if (seq.stage >= 2 && stopShuffle.current) {
      stopShuffle.current();
      stopShuffle.current = null;
      if (!isWheel) sfx.slide();
    }
    if (seq.stage === 2 && isWheel) sfx.thunk();
    if (seq.stage === 3) sfx.reveal();
  }, [seq.stage, isWheel]);
  useEffect(() => () => stopShuffle.current?.(), []);
  useEffect(() => {
    if (seq.frontVisible && !isWheel) sfx.flip();
  }, [seq.frontVisible, isWheel]);
  useEffect(() => {
    const primary = () => (seq.ready ? enterGuess() : seq.skip());
    window.addEventListener('roulette:primary', primary);
    return () => window.removeEventListener('roulette:primary', primary);
  }, [seq.ready, seq.skip, enterGuess]);
  const winner = identity(seq.character);
  const revealed = seq.stage >= 3 || seq.ready;
  return (
    <section
      className={`drawing-screen reference-screen ${isWheel ? 'drawing-wheel' : 'drawing-card'} ${seq.ready ? 'selection-ready' : ''} stage-${seq.stage}`}
      style={{ '--win': revealed ? winner.glow : '#f3c56b', '--win-a': winner.a } as CSSProperties}
      aria-label={t(isWheel ? 'Roulette selection' : 'Drawing character', isWheel ? 'Выбор рулеткой' : 'Розыгрыш карты')}
    >
      <header className="selection-chapter">
        <span>
          {t('ROUND', 'РАУНД')} {snapshot.round}
        </span>
        <i />
        <span>{t(isWheel ? 'ROULETTE' : 'CARD DRAW', isWheel ? 'РУЛЕТКА' : 'КАРТА')}</span>
      </header>
      <div className="draw-scene">
        <div className="stage-spot" aria-hidden="true" />
        <div className="stage-beam" aria-hidden="true" />
        <div className="stage-pedestal" aria-hidden="true"><i /><i /><i /></div>
        {!isWheel && (
          <div className="stage-orbits" aria-hidden="true">
            <i />
            <i />
          </div>
        )}
        {revealed && motion && <div className="reveal-flash" aria-hidden="true" />}
        <img className={`reveal-rays ${revealed ? 'on' : ''}`} src={asset('art/rays.webp')} alt="" aria-hidden="true" />
        {isWheel ? (
          <>
            <m.div className="selection-wheel-wrap" ref={pointer} style={{ opacity: seq.wheelOpacity }}>
              <RouletteWheel rotation={seq.rotation} entries={seq.wheelEntries} selectedIndex={seq.selectedIndex} />
            </m.div>
            <m.div
              className="wheel-reveal-card"
              initial={{ opacity: 0, scale: 0.4, rotateY: -180, y: 40 }}
              animate={revealed ? { opacity: 1, scale: 1, rotateY: 0, y: 0 } : { opacity: 0, scale: 0.4, rotateY: -180, y: 40 }}
              transition={motion ? { type: 'spring', stiffness: 120, damping: 15 } : { duration: 0 }}
            >
              <CharacterCard front character={seq.character} />
            </m.div>
          </>
        ) : (
          <div className="card-perspective shuffle-deck" data-testid="shuffle-deck">
            {seq.deck.map((card) => (
              <m.div
                className={`physical-card ${card.index === 0 ? 'selected-deck-card' : ''}`}
                key={card.index}
                data-card-index={card.index}
                style={{ x: card.x, y: card.y, rotateZ: card.rotate, rotateY: card.yaw, scale: card.scale, opacity: card.opacity, zIndex: card.layer }}
              >
                {card.index === 0 ? (
                  <div className={`card-face ${seq.frontVisible ? 'face-front' : 'face-back'}`} data-facing={seq.frontVisible ? 'front' : 'back'}>
                    <CharacterCard front={seq.frontVisible} character={seq.frontVisible ? seq.character : null} />
                  </div>
                ) : (
                  <CharacterCard />
                )}
              </m.div>
            ))}
          </div>
        )}
        {revealed && motion && <Burst color={winner.glow} />}
      </div>
      <div className="drawing-status">
        <h1 className="metallic-title" aria-live="polite">
          {seq.ready || revealed
            ? seq.character
              ? characterName(seq.character, settings.language)
              : t('CHARACTER SELECTED', 'ПЕРСОНАЖ ВЫБРАН')
            : t(isWheel ? 'SPINNING…' : 'DRAWING CHARACTER…', isWheel ? 'КРУТИМ РУЛЕТКУ…' : 'ВЫБИРАЕМ ПЕРСОНАЖА…')}
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
          <div className="progress-segments" />
        </div>
        <button className="sequence-skip" onClick={seq.ready ? enterGuess : seq.skip}>
          {seq.ready ? (
            t('CONTINUE', 'ПРОДОЛЖИТЬ')
          ) : (
            <>
              <FastForward size={14} />
              {t('SKIP ANIMATION', 'ПРОПУСТИТЬ')}
            </>
          )}
        </button>
      </div>
      <span className="selection-result-id" data-testid="selection-result" data-wheel-index={seq.selectedIndex}>
        {seq.ready && seq.character ? characterName(seq.character, settings.language) : ''}
      </span>
    </section>
  );
}
