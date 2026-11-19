import { Component, Suspense, useEffect, useRef, useState } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AnimatePresence, MotionConfig, motion as m } from 'motion/react';
import { ChevronLeft, Download, Share2, VideoOff, X } from 'lucide-react';
import { StoreProvider, useGame } from './Store';
import {
  AtmosphericBackground,
  BrandEmblem,
  CinematicPanel,
  MetallicButton,
} from '../components/Cinematic';
import ScreenTransition from '../components/ScreenTransition';
import { usePWA } from '../hooks/usePWA';
import { roundKey } from '../domain/game';
import { setVolume, unlockAudio } from '../fx/sound';
import Home from '../screens/Home';
import SelectMode from '../screens/SelectMode';
import Selection from '../screens/Selection';
import Guess from '../screens/Guess';
import Settings from '../screens/Settings';
import Stats from '../screens/Stats';
import Summary from '../screens/Summary';
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, _info: ErrorInfo) {
    console.error('Application error:', error.message);
  }
  render() {
    return this.state.failed ? (
      <div className="error-screen">
        <BrandEmblem />
        <h1 className="metallic-title">THE SIGNAL WAS LOST</h1>
        <p>Your saved preferences are safe. Reload to recover your session.</p>
        <button className="native-recovery" onClick={() => location.reload()}>
          RELOAD EXPERIENCE
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function Dialog({ pwa }: { pwa: ReturnType<typeof usePWA> }) {
  const { modal, setModal, navigate, resetStatistics, t } = useGame(),
    box = useRef<HTMLDivElement>(null),
    [ratio, setRatio] = useState('3 / 4');
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement as HTMLElement | null,
      overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const nodes = () =>
      box.current?.querySelectorAll<HTMLElement>('button,a,input,select,[tabindex="0"]');
    nodes()?.[0]?.focus();
    function trap(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const controls = nodes();
      if (!controls?.length) return;
      const first = controls[0],
        last = controls[controls.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', trap);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', trap);
      previous?.focus();
    };
  }, [modal]);
  if (!modal) return null;
  const title =
    modal === 'install'
      ? t('TAKE THE GAME WITH YOU', 'ИГРА ВСЕГДА С ВАМИ')
      : modal === 'help'
        ? t('GUESS THE CHARACTER', 'УГАДАЙТЕ ПЕРСОНАЖА')
        : modal === 'leave'
          ? t('LEAVE THIS SESSION?', 'ПОКИНУТЬ ИГРУ?')
          : modal === 'reset'
            ? t('RESET STATISTICS?', 'СБРОСИТЬ СТАТИСТИКУ?')
            : t('CAMERA COMPOSITION', 'КОМПОЗИЦИЯ КАМЕРЫ');
  return (
    <m.div
      className="dialog-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setModal(null);
      }}
    >
      <div
        className="dialog-shell"
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <CinematicPanel>
          <button
            className="dialog-close"
            aria-label={t('Close', 'Закрыть')}
            onClick={() => setModal(null)}
          >
            <X size={20} />
          </button>
          <h2 className="metallic-title" id="dialog-title">
            {title}
          </h2>
          {modal === 'install' && (
            <>
              <p>
                {t(
                  'Open the public HTTPS link in Safari. Tap Share, choose Add to Home Screen, then Add. No account, App Store or paid developer membership is needed.',
                  'Откройте публичную HTTPS-ссылку в Safari. Нажмите «Поделиться» → «На экран Домой» → «Добавить». Аккаунт, App Store и платная подписка разработчика не нужны.',
                )}
              </p>
              <div className="install-diagram">
                <Share2 />
                <span>→</span>
                <Download />
              </div>
              {pwa.install && (
                <MetallicButton onClick={() => void pwa.promptInstall()}>
                  {t('INSTALL APP', 'УСТАНОВИТЬ')}
                </MetallicButton>
              )}
              <p>
                {t(
                  'After the first complete load, the game shell works offline. A new version waits for your approval.',
                  'После первой полной загрузки оболочка работает офлайн. Новая версия устанавливается по вашему решению.',
                )}
              </p>
            </>
          )}
          {modal === 'help' && (
            <>
              <ol>
                <li>
                  {t(
                    'Choose Card Draw or Roulette. Both select an enabled character at random before the animation starts.',
                    'Выберите «Карта» или «Рулетка». Оба способа случайно выбирают доступного персонажа до начала анимации.',
                  )}
                </li>
                <li>
                  {t(
                    'The person guessing must look away. Everyone else and OBS can see the selected character and name.',
                    'Угадывающий должен отвернуться. Остальные участники и OBS видят выбранного персонажа и его имя.',
                  )}
                </li>
                <li>
                  {t(
                    'Tap the circular timer to pause/resume. Correct locks in a success; Skip advances immediately; Next passes or advances a settled round.',
                    'Нажимайте таймер для паузы/продолжения. «Верно» фиксирует успех; «Пропуск» сразу меняет раунд; «Далее» завершает текущий или открывает следующий.',
                  )}
                </li>
              </ol>
              <p>
                {t(
                  'Keyboard: Space — timer, G — Correct, S — Skip, Enter — Next, Esc — Back. Generic placeholder entries contain no character facts.',
                  'Клавиши: пробел — таймер, G — верно, S — пропуск, Enter — далее, Esc — назад. Заглушки не содержат фактов о персонажах.',
                )}
              </p>
            </>
          )}
          {modal === 'leave' && (
            <>
              <p>
                {t(
                  'The clock is paused. Your current session remains recoverable until you start a new one.',
                  'Таймер на паузе. Текущую сессию можно восстановить, пока вы не начнёте новую.',
                )}
              </p>
              <MetallicButton onClick={() => setModal(null)}>
                {t('KEEP PLAYING', 'ПРОДОЛЖИТЬ')}
              </MetallicButton>
              <MetallicButton
                tone="blue"
                onClick={() => {
                  setModal(null);
                  navigate('home');
                }}
              >
                {t('MAIN MENU', 'ГЛАВНОЕ МЕНЮ')}
              </MetallicButton>
            </>
          )}
          {modal === 'reset' && (
            <>
              <p>
                {t(
                  'Clear the statistics saved on this device? Your preferences and current session stay intact.',
                  'Очистить статистику на устройстве? Настройки и текущая сессия останутся.',
                )}
              </p>
              <MetallicButton
                onClick={() => {
                  resetStatistics();
                  setModal(null);
                }}
              >
                {t('RESET STATISTICS', 'СБРОСИТЬ')}
              </MetallicButton>
            </>
          )}
          {modal === 'camera' && (
            <>
              <p>
                {t(
                  'Future camera framing only. No device is opened and no permission is requested.',
                  'Только макет будущей камеры. Устройство не включается, разрешения не запрашиваются.',
                )}
              </p>
              <div className="camera-placeholder" style={{ aspectRatio: ratio }}>
                <VideoOff size={30} />
                <span>{t('NOT CONNECTED', 'НЕ ПОДКЛЮЧЕНО')}</span>
                <div className="camera-safe-frame" />
              </div>
              <label className="settings-field">
                <span>{t('COMPOSITION RATIO', 'ФОРМАТ КОМПОЗИЦИИ')}</span>
                <select value={ratio} onChange={(e) => setRatio(e.target.value)}>
                  <option value="3 / 4">3:4</option>
                  <option value="16 / 9">16:9</option>
                  <option value="1 / 1">1:1</option>
                </select>
              </label>
            </>
          )}
          {modal !== 'leave' && (
            <MetallicButton tone="blue" onClick={() => setModal(null)}>
              {t('BACK TO GAME', 'НАЗАД В ИГРУ')}
            </MetallicButton>
          )}
        </CinematicPanel>
      </div>
    </m.div>
  );
}
function Loading() {
  return (
    <div className="cinematic-loading">
      <BrandEmblem />
      <span>LOADING ARCHIVE…</span>
    </div>
  );
}
function Experience() {
  const g = useGame(),
    { screen, session, settings, t, modal, motion, active, back, navigate, catalogReady } = g,
    pwa = usePWA(),
    main = useRef<HTMLElement>(null);
  useEffect(() => {
    main.current?.focus({ preventScroll: true });
  }, [screen]);
  useEffect(() => unlockAudio(), []);
  useEffect(() => setVolume(settings.master * settings.effects), [settings.master, settings.effects]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        back();
        return;
      }
      if (modal || (e.target as HTMLElement).closest('input,textarea,select,button,a')) return;
      if (e.code === 'Space' && screen === 'guess') {
        e.preventDefault();
        window.dispatchEvent(new Event('roulette:toggle'));
      } else if (e.key.toLowerCase() === 'g' && screen === 'guess') {
        e.preventDefault();
        window.dispatchEvent(new Event('roulette:finish'));
      } else if (e.key.toLowerCase() === 's' && screen === 'guess') {
        e.preventDefault();
        window.dispatchEvent(new Event('roulette:skip'));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (screen === 'home') navigate('modes');
        else if (screen === 'summary') navigate('modes');
        else window.dispatchEvent(new Event('roulette:primary'));
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [back, modal, screen, navigate]);
  const keyed =
    screen === 'draw' || screen === 'guess'
      ? `${screen}:${session ? roundKey(session) : 'empty'}`
      : screen;
  return (
    <MotionConfig reducedMotion={motion ? 'never' : 'always'}>
      <div
        className={`app-shell screen-${screen} ${settings.stream ? 'stream-presentation' : ''} ${active ? '' : 'is-inactive'}`}
        style={
          {
            '--safe-margin': `${settings.safeMargin}%`,
            '--presentation-scale': 1 - settings.safeMargin / 50,
            '--motion-intensity': settings.intensity,
          } as React.CSSProperties
        }
      >
        <AtmosphericBackground city={screen === 'home'} />
        <a className="skip-link" href="#main">
          {t('Skip to game', 'Перейти к игре')}
        </a>
        <main id="main" ref={main} tabIndex={-1}>
          <AnimatePresence mode="wait" initial={false}>
            <ScreenTransition key={keyed}>
              <Suspense fallback={<Loading />}>
                {screen === 'home' ? (
                  <Home />
                ) : screen === 'modes' ? (
                  <SelectMode />
                ) : screen === 'draw' ? (
                  catalogReady ? (
                    <Selection />
                  ) : (
                    <Loading />
                  )
                ) : screen === 'guess' ? (
                  <Guess />
                ) : screen === 'settings' ? (
                  <Settings />
                ) : screen === 'stats' ? (
                  <Stats />
                ) : (
                  <Summary />
                )}
              </Suspense>
            </ScreenTransition>
          </AnimatePresence>
        </main>
        <AnimatePresence>{modal && <Dialog pwa={pwa} />}</AnimatePresence>
        <div className="notifications" aria-live="polite">
          {g.toast && (
            <div className="notice">
              <span>{g.toast}</span>
              <button aria-label={t('Dismiss', 'Закрыть')} onClick={() => g.setToast(null)}>
                <X size={16} />
              </button>
            </div>
          )}
          {pwa.needRefresh && (
            <div className="notice update-notice">
              <span>
                {t(
                  'A new version is ready. Your round will be saved paused.',
                  'Готова новая версия. Раунд сохранится на паузе.',
                )}
              </span>
              <button onClick={() => void pwa.update()} disabled={pwa.updating}>
                {t('UPDATE', 'ОБНОВИТЬ')}
              </button>
              <button aria-label={t('Later', 'Позже')} onClick={() => pwa.setNeedRefresh(false)}>
                <X size={16} />
              </button>
            </div>
          )}
          {pwa.error && (
            <div className="notice error-notice">
              <span>
                {t(pwa.error, 'Не удалось загрузить обновление. Текущая версия доступна.')}
              </span>
              <button onClick={() => void pwa.retry()}>{t('RETRY', 'ПОВТОРИТЬ')}</button>
              <button aria-label={t('Dismiss', 'Закрыть')} onClick={() => pwa.setError(null)}>
                <X size={16} />
              </button>
            </div>
          )}
        </div>
        {pwa.offline && <span className="offline-indicator">{t('OFFLINE', 'ОФЛАЙН')}</span>}
        {!['home', 'modes', 'guess'].includes(screen) && (
          <button className="escape-back" onClick={back} aria-label={t('Back', 'Назад')}>
            <ChevronLeft size={14} />
          </button>
        )}
      </div>
    </MotionConfig>
  );
}
export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <Experience />
      </StoreProvider>
    </ErrorBoundary>
  );
}
