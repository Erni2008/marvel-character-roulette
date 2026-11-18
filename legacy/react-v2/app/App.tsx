import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AnimatePresence, motion as m, MotionConfig } from 'motion/react';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Download,
  Globe,
  Monitor,
  Plus,
  Settings2,
  Share2,
  VideoOff,
  WifiOff,
  X,
} from 'lucide-react';
import { StoreProvider, useGame, defaults } from './Store';
import { Button, Emblem, IconButton } from '../components/UI';
import { usePWA } from '../hooks/usePWA';
const Menu = lazy(() => import('../screens/Menu')),
  Setup = lazy(() => import('../screens/Setup')),
  Roulette = lazy(() => import('../screens/Roulette')),
  Challenge = lazy(() => import('../screens/Challenge')),
  Result = lazy(() => import('../screens/Result')),
  Settings = lazy(() => import('../screens/Settings'));
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
      <div className="recovery-screen">
        <Emblem />
        <h1>The stage needs a reset.</h1>
        <p>Your saved preferences and session are safe. Reload to recover the application.</p>
        <button className="button button-primary" onClick={() => location.reload()}>
          RELOAD EXPERIENCE
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function Splash({ done }: { done: () => void }) {
  const { motion, t } = useGame();
  useEffect(() => {
    const id = setTimeout(done, motion ? 2100 : 500);
    return () => clearTimeout(id);
  }, [done, motion]);
  return (
    <m.div
      className="splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, clipPath: motion ? 'inset(0 0 100% 0)' : 'none' }}
      transition={{ duration: 0.6, ease: [0.7, 0, 0.2, 1] }}
    >
      <div className="splash-line" />
      <m.div
        initial={motion ? { opacity: 0, scale: 0.8, rotate: -30 } : false}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <Emblem />
      </m.div>
      <h1>CHARACTER ROULETTE</h1>
      <p>THE ULTIMATE GUESSING EXPERIENCE</p>
      <button className="text-action" onClick={done}>
        {t('Skip introduction', 'Пропустить заставку')}
        <ArrowUpRight size={14} />
      </button>
    </m.div>
  );
}
function Dialog({ pwa }: { pwa: ReturnType<typeof usePWA> }) {
  const { modal, setModal, t, navigate, update } = useGame(),
    box = useRef<HTMLDivElement>(null),
    [cameraRatio, setCameraRatio] = useState('3 / 4');
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusables = () =>
      box.current?.querySelectorAll<HTMLElement>('button,[href],select,input,[tabindex="0"]');
    focusables()?.[0]?.focus();
    function trap(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const controls = focusables();
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
      <m.div
        className={`dialog dialog-${modal}`}
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        initial={{ y: 25, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 15, opacity: 0 }}
      >
        <div className="dialog-top">
          <span className="tech-label">CR / {t('THE BRIEFING', 'БРИФИНГ')}</span>
          <IconButton label={t('Close', 'Закрыть')} onClick={() => setModal(null)}>
            <X size={18} />
          </IconButton>
        </div>
        {modal === 'how' && (
          <>
            <h2 id="dialog-title">{t('Make every\nsecond count.', 'Каждая секунда\nна счету.')}</h2>
            <div className="briefing-steps">
              {[
                [
                  t('Set the scene', 'Задайте настроение'),
                  t(
                    'Choose a mode. Gather 1–10 players. Set your time and rounds.',
                    'Выберите режим. Соберите 1–10 игроков. Настройте время и раунды.',
                  ),
                ],
                [
                  t('Let fate decide', 'Доверьтесь судьбе'),
                  t(
                    'Spin the chamber to select a champion ID and one of eight challenges.',
                    'Запустите камеру, чтобы выбрать ID героя и одно из восьми испытаний.',
                  ),
                ],
                [
                  t('Own the moment', 'Покорите сцену'),
                  t(
                    'Start the timer. Explain, act, or guess. Finish for success; skip or timeout records a failure.',
                    'Запустите таймер. Объясняйте, показывайте или угадывайте. «Готово» — успех, пропуск и конец времени — неудача.',
                  ),
                ],
              ].map(([title, body], i) => (
                <div key={title}>
                  <span>0{i + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="panel-note">
              {t(
                'This edition uses placeholder IDs. Images, facts, and camera capture will arrive later.',
                'В этой версии используются ID-заглушки. Изображения, факты и камера появятся позже.',
              )}
            </p>
            <Button arrow onClick={() => setModal(null)}>
              {t('I’M READY', 'Я ГОТОВ')}
            </Button>
          </>
        )}
        {modal === 'install' && (
          <>
            <h2 id="dialog-title">{t('Keep the\nexperience.', 'Игра всегда\nс вами.')}</h2>
            <p>
              {t(
                'Install to your home screen. Open like an app. Play offline after the first complete load.',
                'Добавьте на главный экран. Открывайте как приложение. Играйте офлайн после первой полной загрузки.',
              )}
            </p>
            {pwa.install ? (
              <Button arrow onClick={() => void pwa.promptInstall()}>
                {t('INSTALL APP', 'УСТАНОВИТЬ')}
              </Button>
            ) : (
              <ol className="install-steps">
                <li>
                  <Share2 size={20} />
                  <span>
                    {t(
                      'On iPhone / iPad, open this link in Safari and tap Share.',
                      'На iPhone / iPad откройте ссылку в Safari и нажмите «Поделиться».',
                    )}
                  </span>
                </li>
                <li>
                  <Plus size={20} />
                  <span>
                    {t(
                      'Choose “Add to Home Screen”, then Add.',
                      'Выберите «На экран Домой», затем «Добавить».',
                    )}
                  </span>
                </li>
                <li>
                  <Monitor size={20} />
                  <span>
                    {t(
                      'On desktop, use your browser’s Install app menu when available.',
                      'На компьютере используйте пункт установки в меню браузера, если он доступен.',
                    )}
                  </span>
                </li>
              </ol>
            )}
            <p className="panel-note">
              {t(
                'No account. No App Store. No camera permission.',
                'Без аккаунта. Без App Store. Без доступа к камере.',
              )}
            </p>
            <Button variant="secondary" onClick={() => setModal(null)}>
              {t('CONTINUE PLAYING', 'ПРОДОЛЖИТЬ ИГРУ')}
            </Button>
          </>
        )}
        {modal === 'leave' && (
          <>
            <h2 id="dialog-title">{t('Leave the stage?', 'Покинуть сцену?')}</h2>
            <p>
              {t(
                'Your timer is paused. Returning to the main menu ends this session when a new game starts.',
                'Таймер на паузе. Новая игра из главного меню заменит текущую сессию.',
              )}
            </p>
            <Button onClick={() => setModal(null)}>{t('KEEP PLAYING', 'ПРОДОЛЖИТЬ')}</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setModal(null);
                navigate('menu');
              }}
            >
              {t('MAIN MENU', 'ГЛАВНОЕ МЕНЮ')}
            </Button>
          </>
        )}
        {modal === 'reset' && (
          <>
            <h2 id="dialog-title">{t('A fresh start.', 'С чистого листа.')}</h2>
            <p>
              {t(
                'Restore default preferences? Your current round and score will remain.',
                'Восстановить настройки по умолчанию? Текущий раунд и очки останутся.',
              )}
            </p>
            <Button
              onClick={() => {
                update(defaults);
                setModal(null);
              }}
            >
              {t('RESTORE DEFAULTS', 'ВОССТАНОВИТЬ')}
            </Button>
            <Button variant="secondary" onClick={() => setModal(null)}>
              {t('CANCEL', 'ОТМЕНА')}
            </Button>
          </>
        )}
        {modal === 'camera' && (
          <>
            <h2 id="dialog-title">
              {t('Your future\nspotlight.', 'Ваш будущий\nвыход на сцену.')}
            </h2>
            <p>
              {t(
                'A composition study for a future camera deck. No camera is opened and no permission is requested.',
                'Макет будущего модуля камеры. Камера не включается, разрешения не запрашиваются.',
              )}
            </p>
            <div className="camera-preview" style={{ aspectRatio: cameraRatio }}>
              <VideoOff size={32} strokeWidth={1} />
              <span>{t('CAMERA PREVIEW', 'ПРЕВЬЮ КАМЕРЫ')}</span>
              <small>{t('NOT CONNECTED', 'НЕ ПОДКЛЮЧЕНО')}</small>
              <i />
              <i />
              <i />
              <i />
            </div>
            <label className="field">
              <span className="field-label">{t('COMPOSITION RATIO', 'ФОРМАТ КОМПОЗИЦИИ')}</span>
              <select value={cameraRatio} onChange={(e) => setCameraRatio(e.target.value)}>
                <option value="3 / 4">3:4 · {t('Portrait', 'Вертикально')}</option>
                <option value="16 / 9">16:9 · {t('Landscape', 'Горизонтально')}</option>
                <option value="1 / 1">1:1 · {t('Square', 'Квадрат')}</option>
              </select>
            </label>
            <Button variant="secondary" onClick={() => setModal(null)}>
              {t('BACK TO THE STAGE', 'НАЗАД НА СЦЕНУ')}
            </Button>
          </>
        )}
      </m.div>
    </m.div>
  );
}
function Experience() {
  const game = useGame(),
    {
      screen,
      t,
      stream,
      settings,
      update,
      back,
      navigate,
      openSettings,
      setModal,
      motion,
      active,
      modal,
      toast,
    } = game,
    pwa = usePWA();
  const [intro, setIntro] = useState(() => {
    try {
      return !sessionStorage.getItem('roulette.intro.v2');
    } catch {
      return true;
    }
  });
  const [presentationHint, setPresentationHint] = useState(false);
  const main = useRef<HTMLElement>(null);
  const done = useRef(() => {
    setIntro(false);
    try {
      sessionStorage.setItem('roulette.intro.v2', '1');
    } catch {
      /* unavailable storage is nonfatal */
    }
  }).current;
  useEffect(() => {
    main.current?.focus({ preventScroll: true });
  }, [screen]);
  useEffect(() => {
    const node = main.current;
    if (!stream || !node) return;
    const returnToControls = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        event.preventDefault();
        update({ stream: false });
      }
    };
    node.addEventListener('touchstart', returnToControls, { passive: false });
    return () => node.removeEventListener('touchstart', returnToControls);
  }, [stream, update]);

  useEffect(() => {
    if (!pwa.ready) return;
    const id = setTimeout(() => pwa.setReady(false), 5000);
    return () => clearTimeout(id);
  }, [pwa.ready, pwa.setReady]);
  useEffect(() => {
    if (!stream) return;
    setPresentationHint(true);
    const id = setTimeout(() => setPresentationHint(false), 5500);
    return () => clearTimeout(id);
  }, [stream]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input,select,textarea,button,a') && e.key !== 'Escape') return;
      if (e.key === 'Escape') {
        e.preventDefault();
        back();
      } else if (
        !modal &&
        (e.key === 'Enter' ||
          e.code === 'Space' ||
          e.key.toLowerCase() === 'g' ||
          e.key.toLowerCase() === 's')
      ) {
        if (e.code === 'Space' && screen !== 'challenge') return;
        e.preventDefault();
        if (e.key.toLowerCase() === 'g') window.dispatchEvent(new Event('roulette:finish'));
        else if (e.key.toLowerCase() === 's') window.dispatchEvent(new Event('roulette:skip'));
        else if (screen === 'menu') navigate('setup');
        else if (screen === 'setup') game.start();
        else if (screen === 'settings') back();
        else
          window.dispatchEvent(
            new Event(e.code === 'Space' ? 'roulette:toggle' : 'roulette:primary'),
          );
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [back, modal, screen, navigate, game]);
  return (
    <MotionConfig reducedMotion={motion ? 'never' : 'always'}>
      <div
        className={`app-shell screen-${screen} ${stream ? 'stream-shell' : ''} ${!active ? 'is-inactive' : ''}`}
        style={
          {
            '--safe-margin': `${settings.safeMargin}%`,
            '--motion-intensity': settings.intensity,
          } as React.CSSProperties
        }
      >
        <a className="skip-link" href="#main">
          {t('Skip to game', 'Перейти к игре')}
        </a>
        <div className="environment" aria-hidden="true">
          <div className="environment-light" />
          <div className="environment-slice" />
          <div className="environment-grain" />
          <div className="environment-grid" />
        </div>
        {!stream && (
          <header className="app-header">
            <button
              className="brand"
              onClick={() => (screen === 'menu' ? null : back())}
              aria-label={t(
                screen === 'menu' ? 'Character Roulette home' : 'Back',
                screen === 'menu' ? 'Главная Character Roulette' : 'Назад',
              )}
            >
              <Emblem small />
              <span>
                CHARACTER
                <br />
                <strong>ROULETTE</strong>
              </span>
            </button>
            <div className="header-context">
              {screen === 'menu' ? (
                <>
                  <span>{t('AN EVENING.', 'ОДИН ВЕЧЕР.')}</span>
                  <i />
                  <span>{t('A NEW IDENTITY.', 'НОВАЯ РОЛЬ.')}</span>
                </>
              ) : (
                <>
                  <button className="header-back" onClick={back}>
                    <ArrowLeft size={14} />
                    {t('BACK', 'НАЗАД')}
                  </button>
                  <span>{t('THE EXPERIENCE', 'ВАШЕ ВПЕЧАТЛЕНИЕ')}</span>
                </>
              )}
            </div>
            <div className="header-actions">
              {['roulette', 'challenge', 'result'].includes(screen) && (
                <button
                  className="stream-toggle"
                  aria-label={t('Stream Mode', 'Режим трансляции')}
                  onClick={() => update({ stream: true })}
                >
                  <Monitor size={14} />
                  <span>{t('STREAM MODE', 'ТРАНСЛЯЦИЯ')}</span>
                </button>
              )}
              <button
                className="language-button"
                aria-label={t('Switch language to Russian', 'Переключить язык на английский')}
                onClick={() => update({ language: settings.language === 'en' ? 'ru' : 'en' })}
              >
                <Globe size={13} />
                {settings.language.toUpperCase()}
              </button>
              <IconButton
                label={t('Install app', 'Установить приложение')}
                onClick={() => setModal('install')}
              >
                <Download size={17} />
              </IconButton>
              <IconButton label={t('Settings', 'Настройки')} onClick={openSettings}>
                <Settings2 size={17} />
              </IconButton>
            </div>
          </header>
        )}
        {stream && settings.overlays && (
          <div className="stream-labels">
            <span>CHARACTER ROULETTE</span>
            <span>
              {t('ROUND', 'РАУНД')} {String(game.session.round).padStart(2, '0')}
              <i />
              {t('PLAYER', 'ИГРОК')} {String(game.session.player).padStart(2, '0')}
            </span>
          </div>
        )}
        <main
          id="main"
          ref={main}
          tabIndex={-1}
          onClick={(e) => {
            if (stream && !(e.target as HTMLElement).closest('button,a,input,select'))
              window.dispatchEvent(new Event('roulette:primary'));
          }}
          aria-label={
            stream
              ? t(
                  'Game presentation. Tap to advance; two-finger tap to return to controls.',
                  'Презентация. Касание — действие, касание двумя пальцами — управление.',
                )
              : undefined
          }
        >
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={screen}
              className="screen-transition"
              initial={
                motion ? { opacity: 0, y: 22, scale: 0.985, clipPath: 'inset(0 0 8% 0)' } : false
              }
              animate={{ opacity: 1, y: 0, scale: 1, clipPath: 'inset(0 0 0% 0)' }}
              exit={
                motion
                  ? { opacity: 0, y: -12, scale: 0.99, transition: { duration: 0.18 } }
                  : { opacity: 0, transition: { duration: 0 } }
              }
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <Suspense
                fallback={
                  <div className="screen-loader">
                    <Emblem />
                    <span>{t('SETTING THE STAGE', 'ГОТОВИМ СЦЕНУ')}</span>
                  </div>
                }
              >
                {screen === 'menu' ? (
                  <Menu />
                ) : screen === 'setup' ? (
                  <Setup />
                ) : screen === 'roulette' ? (
                  <Roulette />
                ) : screen === 'challenge' ? (
                  <Challenge />
                ) : screen === 'result' ? (
                  <Result />
                ) : (
                  <Settings />
                )}
              </Suspense>
            </m.div>
          </AnimatePresence>
        </main>
        {!stream && (
          <footer className="app-footer">
            <span>
              <i className="status-dot" />
              {pwa.offline
                ? t('OFFLINE · STILL YOUR STAGE', 'ОФЛАЙН · СЦЕНА ВСЁ ЕЩЁ ВАША')
                : t('THE STAGE IS YOURS', 'СЦЕНА ВАША')}
            </span>
            <button onClick={() => setModal('install')}>
              {t('TAKE IT WITH YOU', 'ВОЗЬМИТЕ ИГРУ С СОБОЙ')}
              <ArrowUpRight size={12} />
            </button>
            <span className="footer-edition">
              {t('A GAME NIGHT, REIMAGINED.', 'НОВЫЙ ВЗГЛЯД НА ИГРОВОЙ ВЕЧЕР.')}
            </span>
          </footer>
        )}
        <AnimatePresence>{intro && <Splash done={done} />}</AnimatePresence>
        <AnimatePresence>{modal && <Dialog pwa={pwa} />}</AnimatePresence>
        {stream && presentationHint && (
          <div className="presentation-hint">
            {t(
              'Tap scene / Enter to advance · Two-finger tap / Esc for controls',
              'Касание / Enter — действие · Два пальца / Esc — управление',
            )}
          </div>
        )}
        <div className="notification-stack" aria-live="polite">
          {toast && (
            <div className="notification">
              <span>{toast}</span>
              <button aria-label={t('Dismiss', 'Закрыть')} onClick={() => game.setToast(null)}>
                <X size={15} />
              </button>
            </div>
          )}
          {!stream && pwa.offline && (
            <div className="connection-note">
              <WifiOff size={13} />
              {t('Offline play', 'Игра офлайн')}
            </div>
          )}
          {!stream && pwa.ready && (
            <div className="notification">
              <Check size={16} />
              <span>
                {t(
                  'Ready for offline play. Your game goes with you.',
                  'Готово к игре офлайн. Игра всегда с вами.',
                )}
              </span>
              <button aria-label={t('Dismiss', 'Закрыть')} onClick={() => pwa.setReady(false)}>
                <X size={15} />
              </button>
            </div>
          )}
          {!stream && pwa.needRefresh && (
            <div className="notification update-notice">
              <span>
                {t(
                  'A new experience is ready. Your session will be kept.',
                  'Новая версия готова. Текущая сессия сохранится.',
                )}
              </span>
              <button disabled={pwa.updating} onClick={() => void pwa.update()}>
                {pwa.updating ? t('UPDATING…', 'ОБНОВЛЕНИЕ…') : t('UPDATE', 'ОБНОВИТЬ')}
              </button>
              <button aria-label={t('Later', 'Позже')} onClick={() => pwa.setNeedRefresh(false)}>
                <X size={15} />
              </button>
            </div>
          )}
          {!stream && pwa.error && (
            <div className="notification error-notice" role="alert">
              <span>
                {t(
                  pwa.error,
                  'Не удалось загрузить обновление. Текущая версия доступна, попробуйте ещё раз при подключении.',
                )}
              </span>
              <button onClick={() => void pwa.retry()}>{t('RETRY', 'ПОВТОРИТЬ')}</button>
              <button aria-label={t('Dismiss', 'Закрыть')} onClick={() => pwa.setError(null)}>
                <X size={15} />
              </button>
            </div>
          )}
        </div>
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
