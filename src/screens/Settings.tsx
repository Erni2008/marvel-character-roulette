import { useRef } from 'react';
import type { CSSProperties } from 'react';
import { ArrowLeft, Download, Maximize, Upload } from 'lucide-react';
import { useGame } from '../app/Store';
import { CinematicPanel, MetallicButton } from '../components/Cinematic';
import type { Settings as SettingsType } from '../domain/settings';
export default function Settings() {
  const { settings: s, update, t, back, setModal, importSettings, setToast, restorePool, removedCount } = useGame(),
    input = useRef<HTMLInputElement>(null);
  const range = (
    label: string,
    k: 'scale' | 'intensity' | 'master' | 'music' | 'effects' | 'safeMargin',
    min = 0,
    max = 1,
    step = 0.01,
  ) => (
    <label className="settings-range" key={k}>
      <span>
        {label}
        <output>{k === 'safeMargin' ? `${s[k]}%` : `${Math.round(s[k] * 100)}%`}</output>
      </span>
      <input
        type="range"
        style={{ '--range-progress': `${((s[k] - min) / (max - min)) * 100}%` } as CSSProperties}
        min={min}
        max={max}
        step={step}
        value={s[k]}
        onChange={(e) => update({ [k]: Number(e.target.value) })}
      />
    </label>
  );
  const toggle = (label: string, k: 'reducedMotion' | 'highContrast' | 'largerText' | 'stream') => (
    <label className="settings-toggle" key={k}>
      <span>{label}</span>
      <input type="checkbox" checked={s[k]} onChange={(e) => update({ [k]: e.target.checked })} />
      <i />
    </label>
  );
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen)
        await document.documentElement.requestFullscreen();
      else setModal('install');
    } catch {
      setToast(
        t(
          'Use the installed app for fullscreen on this device.',
          'Для полного экрана установите приложение.',
        ),
      );
    }
  }
  function exportPrefs() {
    const url = URL.createObjectURL(
        new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' }),
      ),
      a = document.createElement('a');
    a.href = url;
    a.download = 'character-roulette-settings.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="utility-screen settings-screen">
      <header className="utility-header">
        <MetallicButton
          tone="silver"
          shape="tile"
          className="back-control"
          aria-label={t('Back', 'Назад')}
          onClick={back}
        >
          <ArrowLeft />
        </MetallicButton>
        <h1 className="metallic-title">{t('SETTINGS', 'НАСТРОЙКИ')}</h1>
      </header>
      <div className="settings-columns">
        <CinematicPanel>
          <h2 className="metallic-title">{t('GAMEPLAY', 'ИГРА')}</h2>
          <div className="settings-field">
            <span>{t('HERO DECK', 'КОЛОДА ГЕРОЕВ')}</span>
            <MetallicButton tone="blue" onClick={restorePool} disabled={!removedCount}>
              {removedCount ? t(`RETURN ${removedCount} REMOVED HEROES`, `ВЕРНУТЬ УБРАННЫХ (${removedCount})`) : t('ALL HEROES ARE IN THE DECK', 'ВСЕ ГЕРОИ В КОЛОДЕ')}
            </MetallicButton>
          </div>
          <label className="settings-field">
            <span>{t('DEFAULT SELECTION', 'СПОСОБ ВЫБОРА')}</span>
            <select
              value={s.method}
              onChange={(e) => update({ method: e.target.value as SettingsType['method'] })}
            >
              <option value="card">{t('Card Draw', 'Карта')}</option>
              <option value="roulette">{t('Roulette', 'Рулетка')}</option>
            </select>
          </label>
          <label className="settings-field">
            <span>{t('LANGUAGE', 'ЯЗЫК')}</span>
            <select
              value={s.language}
              onChange={(e) => update({ language: e.target.value as 'en' | 'ru' })}
            >
              <option value="en">English</option>
              <option value="ru">Русский</option>
            </select>
          </label>
        </CinematicPanel>
        <CinematicPanel>
          <h2 className="metallic-title">{t('DISPLAY & ACCESSIBILITY', 'ЭКРАН И ДОСТУПНОСТЬ')}</h2>
          {toggle(t('Reduced motion', 'Уменьшение движения'), 'reducedMotion')}
          {toggle(t('High contrast', 'Высокая контрастность'), 'highContrast')}
          {toggle(t('Larger text', 'Крупный текст'), 'largerText')}
          <label className="settings-field">
            <span>{t('GRAPHICS QUALITY', 'КАЧЕСТВО ГРАФИКИ')}</span>
            <select
              value={s.quality}
              onChange={(e) => update({ quality: e.target.value as SettingsType['quality'] })}
            >
              <option value="auto">{t('Adaptive', 'Адаптивное')}</option>
              <option value="high">{t('High', 'Высокое')}</option>
              <option value="low">{t('Battery-friendly', 'Экономия заряда')}</option>
            </select>
          </label>
          {range(t('Interface scale', 'Масштаб текста'), 'scale', 0.85, 1.2)}
          {range(t('Animation intensity', 'Интенсивность анимации'), 'intensity')}
          <MetallicButton tone="blue" onClick={fullscreen}>
            <Maximize />
            {t('FULLSCREEN', 'ПОЛНЫЙ ЭКРАН')}
          </MetallicButton>
        </CinematicPanel>
        <CinematicPanel>
          <h2 className="metallic-title">{t('PRESENTATION', 'ПРЕЗЕНТАЦИЯ')}</h2>
          {toggle(t('Stream presentation', 'Режим трансляции'), 'stream')}
          {range(t('Stream-safe margins', 'Безопасные поля'), 'safeMargin', 0, 8, 1)}
          <p>
            {t(
              'The guesser looks away. Everyone else and OBS see the same character and its name.',
              'Угадывающий не смотрит на экран. Остальные участники и OBS видят персонажа и его имя.',
            )}
          </p>
          <button className="quiet-link" onClick={() => setModal('camera')}>
            {t('Camera composition preview', 'Макет композиции камеры')}
          </button>
          <button className="quiet-link" onClick={() => setModal('help')}>
            {t('How to play & controls', 'Правила и управление')}
          </button>
          <button className="quiet-link" onClick={() => setModal('install')}>
            {t('Install on iPhone / iPad', 'Установка на iPhone / iPad')}
          </button>
        </CinematicPanel>
        <CinematicPanel>
          <h2 className="metallic-title">{t('AUDIO PREFERENCES', 'НАСТРОЙКИ ЗВУКА')}</h2>
          <p>
            {t(
              'Sound effects: wheel ticks, card shuffle, reveal sting and timer beeps. Music is reserved for a future update.',
              'Звуковые эффекты: щелчки колеса, тасование карт, эффект раскрытия и сигналы таймера. Музыка — в будущем обновлении.',
            )}
          </p>
          {range(t('Master volume', 'Общая громкость'), 'master')}
          {range(t('Music', 'Музыка'), 'music')}
          {range(t('Sound effects', 'Эффекты'), 'effects')}
        </CinematicPanel>
      </div>
      <div className="preference-actions">
        <MetallicButton tone="blue" onClick={exportPrefs}>
          <Download />
          {t('EXPORT', 'ЭКСПОРТ')}
        </MetallicButton>
        <MetallicButton tone="blue" onClick={() => input.current?.click()}>
          <Upload />
          {t('IMPORT', 'ИМПОРТ')}
        </MetallicButton>
        <input
          className="visually-hidden"
          ref={input}
          type="file"
          accept="application/json,.json"
          aria-label={t('Import preferences file', 'Импорт настроек')}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              try {
                if (file.size > 100000) throw Error();
                importSettings(JSON.parse(await file.text()));
              } catch {
                setToast(
                  t(
                    'Invalid preferences file. Nothing changed.',
                    'Некорректный файл. Настройки не изменены.',
                  ),
                );
              }
              e.target.value = '';
            }
          }}
        />
      </div>
      <MetallicButton onClick={back}>{t('DONE', 'ГОТОВО')}</MetallicButton>
    </section>
  );
}
