import { useRef, useState } from 'react';
import {
  Accessibility,
  AudioLines,
  Download,
  Globe,
  Maximize,
  Monitor,
  SlidersHorizontal,
  Upload,
  Video,
} from 'lucide-react';
import { useGame } from '../app/Store';
import { Button, Field, Range, ScreenHeading, Toggle } from '../components/UI';
import type { Difficulty, Mode } from '../domain/game';
const sectionIcons = [Monitor, AudioLines, SlidersHorizontal, Globe, Accessibility, Video];
export default function Settings() {
  const { settings: s, update, importSettings, t, back, setModal, setToast } = useGame(),
    input = useRef<HTMLInputElement>(null),
    [section, setSection] = useState('display');
  const sections = [
    ['display', t('Display', 'Экран')],
    ['audio', t('Audio', 'Звук')],
    ['gameplay', t('Gameplay', 'Игра')],
    ['language', t('Language', 'Язык')],
    ['accessibility', t('Accessibility', 'Доступность')],
    ['streaming', t('Streaming', 'Трансляция')],
  ];
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen)
        await document.documentElement.requestFullscreen();
      else {
        setModal('install');
      }
    } catch {
      setToast(
        t(
          'Fullscreen is unavailable here. Install the app for an edge-to-edge experience.',
          'Полный экран недоступен. Установите приложение для режима без рамок.',
        ),
      );
    }
  }
  function exportFile() {
    const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' }),
      url = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = url;
    a.download = 'character-roulette-settings.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="settings-screen page-width">
      <ScreenHeading
        eyebrow={t('YOUR PERSONAL CONTROL ROOM', 'ВАША КОМНАТА УПРАВЛЕНИЯ')}
        title={t('Fine-tune the experience.', 'Настройте впечатления.')}
        description={t(
          'A stage that feels like yours. Everything saves as you go.',
          'Сцена, на которой всё по-вашему. Настройки сохраняются сразу.',
        )}
      />
      <div className="settings-layout">
        <nav className="settings-nav" aria-label={t('Settings sections', 'Разделы настроек')}>
          {sections.map(([id, name], i) => {
            const Icon = sectionIcons[i];
            return (
              <a
                href={`#setting-${id}`}
                className={section === id ? 'is-active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  setSection(id);
                  document
                    .getElementById(`setting-${id}`)
                    ?.scrollIntoView({
                      behavior: matchMedia('(prefers-reduced-motion:reduce)').matches
                        ? 'instant'
                        : 'smooth',
                      block: 'start',
                    });
                }}
                key={id}
              >
                <span>0{i + 1}</span>
                <Icon size={16} />
                {name}
              </a>
            );
          })}
          <div className="settings-nav-bottom">
            <span className="status-dot" />
            {t('LOCAL PREFERENCES', 'ЛОКАЛЬНЫЕ НАСТРОЙКИ')}
          </div>
        </nav>
        <div className="settings-panels">
          <section id="setting-display" className="settings-panel">
            <div className="panel-heading">
              <span>01</span>
              <h2>{t('Display', 'Экран')}</h2>
              <Monitor size={20} />
            </div>
            <Field
              label={t('CAPTURE REFERENCE', 'ФОРМАТ ЗАХВАТА')}
              hint={t(
                'A layout reference for OBS. Browser window size is controlled by your device.',
                'Ориентир для OBS. Размер окна браузера задаёт устройство.',
              )}
            >
              <select value={s.resolution} onChange={(e) => update({ resolution: e.target.value })}>
                {['1280 × 720', '1920 × 1080', '2560 × 1440'].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>
            <Button variant="secondary" onClick={fullscreen}>
              <Maximize size={15} />
              {t('TOGGLE FULLSCREEN', 'ПОЛНЫЙ ЭКРАН')}
            </Button>
            <Range
              label={t('Interface scale', 'Масштаб интерфейса')}
              value={s.scale}
              min={0.85}
              max={1.2}
              onChange={(v) => update({ scale: v })}
            />
            <Range
              label={t('Motion intensity', 'Интенсивность анимации')}
              value={s.intensity}
              onChange={(v) => update({ intensity: v })}
            />
            <Field label={t('GRAPHICS QUALITY', 'КАЧЕСТВО ГРАФИКИ')}>
              <select
                value={s.quality}
                onChange={(e) => update({ quality: e.target.value as typeof s.quality })}
              >
                <option value="auto">
                  {t('Adaptive · recommended', 'Адаптивное · рекомендуется')}
                </option>
                <option value="high">{t('High', 'Высокое')}</option>
                <option value="low">{t('Battery-friendly', 'Экономия заряда')}</option>
              </select>
            </Field>
          </section>
          <section id="setting-audio" className="settings-panel">
            <div className="panel-heading">
              <span>02</span>
              <h2>{t('Audio', 'Звук')}</h2>
              <AudioLines size={20} />
            </div>
            <p className="panel-note">
              {t(
                'Your levels are saved. Audio playback will join the experience in a future release.',
                'Уровни сохраняются. Звук появится в следующем этапе разработки.',
              )}
            </p>
            <Range
              label={t('Master volume', 'Общая громкость')}
              value={s.master}
              onChange={(v) => update({ master: v })}
            />
            <Range
              label={t('Music', 'Музыка')}
              value={s.music}
              onChange={(v) => update({ music: v })}
            />
            <Range
              label={t('Sound effects', 'Звуковые эффекты')}
              value={s.effects}
              onChange={(v) => update({ effects: v })}
            />
          </section>
          <section id="setting-gameplay" className="settings-panel">
            <div className="panel-heading">
              <span>03</span>
              <h2>{t('Gameplay', 'Игра')}</h2>
              <SlidersHorizontal size={20} />
            </div>
            <Field label={t('DEFAULT DURATION', 'ДЛИТЕЛЬНОСТЬ')}>
              <select
                value={s.duration}
                onChange={(e) => update({ duration: Number(e.target.value) })}
              >
                {[15, 30, 45, 60, 90].map((v) => (
                  <option key={v} value={v}>
                    {v} {t('seconds', 'секунд')}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label={t('DEFAULT DIFFICULTY', 'СЛОЖНОСТЬ')}
              hint={t(
                'Saved for future champion content selection.',
                'Сохраняется для будущего выбора контента героев.',
              )}
            >
              <select
                value={s.difficulty}
                onChange={(e) => update({ difficulty: e.target.value as Difficulty })}
              >
                {(['easy', 'normal', 'hard', 'expert'] as const).map((v, i) => (
                  <option key={v} value={v}>
                    {t(
                      ['Easy', 'Normal', 'Hard', 'Expert'][i],
                      ['Легко', 'Обычно', 'Сложно', 'Эксперт'][i],
                    )}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('DEFAULT MODE', 'РЕЖИМ ПО УМОЛЧАНИЮ')}>
              <select value={s.mode} onChange={(e) => update({ mode: e.target.value as Mode })}>
                <option value="party">{t('Party', 'Вечеринка')}</option>
                <option value="knowledge">{t('Knowledge', 'Знатоки')}</option>
                <option value="chaos">{t('Chaos', 'Хаос')}</option>
              </select>
            </Field>
          </section>
          <section id="setting-language" className="settings-panel">
            <div className="panel-heading">
              <span>04</span>
              <h2>{t('Language', 'Язык')}</h2>
              <Globe size={20} />
            </div>
            <div className="language-choices">
              <button onClick={() => update({ language: 'en' })} aria-pressed={s.language === 'en'}>
                <strong>EN</strong>
                <span>English</span>
              </button>
              <button onClick={() => update({ language: 'ru' })} aria-pressed={s.language === 'ru'}>
                <strong>RU</strong>
                <span>Русский</span>
              </button>
            </div>
          </section>
          <section id="setting-accessibility" className="settings-panel">
            <div className="panel-heading">
              <span>05</span>
              <h2>{t('Accessibility', 'Доступность')}</h2>
              <Accessibility size={20} />
            </div>
            <Toggle
              label={t('Reduced motion', 'Уменьшение движения')}
              description={t(
                'A quieter stage. Your device preference is also respected.',
                'Спокойная сцена. Системная настройка тоже учитывается.',
              )}
              checked={s.reducedMotion}
              onChange={(v) => update({ reducedMotion: v })}
            />
            <Toggle
              label={t('High contrast', 'Высокая контрастность')}
              description={t(
                'Clearer edges and brighter secondary text.',
                'Чёткие границы и более яркий вторичный текст.',
              )}
              checked={s.highContrast}
              onChange={(v) => update({ highContrast: v })}
            />
            <Toggle
              label={t('Larger text', 'Крупный текст')}
              description={t(
                'A little more room for every word.',
                'Больше места для каждого слова.',
              )}
              checked={s.largerText}
              onChange={(v) => update({ largerText: v })}
            />
          </section>
          <section id="setting-streaming" className="settings-panel">
            <div className="panel-heading">
              <span>06</span>
              <h2>{t('Streaming', 'Трансляция')}</h2>
              <Video size={20} />
            </div>
            <Toggle
              label={t('Stream Mode', 'Режим трансляции')}
              description={t(
                'A clean viewer presentation in this window. No second-window sync is implied.',
                'Чистая презентация в этом окне. Без синхронизации второго окна.',
              )}
              checked={s.stream}
              onChange={(v) => update({ stream: v })}
            />
            <Toggle
              label={t('Presentation labels', 'Подписи презентации')}
              description={t(
                'Show round and player information. Administrative controls stay hidden.',
                'Показывать раунд и игрока. Кнопки управления скрыты.',
              )}
              checked={s.overlays}
              onChange={(v) => update({ overlays: v })}
            />
            <Range
              label={t('Safe margins', 'Безопасные поля')}
              value={s.safeMargin}
              min={0}
              max={8}
              step={1}
              suffix={`${s.safeMargin}%`}
              onChange={(v) => update({ safeMargin: v })}
            />
            <button className="camera-setting" onClick={() => setModal('camera')}>
              <Video size={20} />
              <span>
                <strong>{t('Camera composition', 'Композиция камеры')}</strong>
                <small>
                  {t('Prepared for a future live preview', 'Готово к будущему видеопотоку')}
                </small>
              </span>
              <span>↗</span>
            </button>
            <p className="panel-note">
              {t(
                'Host keys: Enter · select/continue, Space · timer, G · success, S · skip, Esc · control mode. Touch: tap the scene to advance; two-finger tap to return to controls.',
                'Клавиши: Enter · выбор/далее, пробел · таймер, G · успех, S · пропуск, Esc · управление. На сенсорном экране: касание сцены — действие, касание двумя пальцами — управление.',
              )}
            </p>
          </section>
          <div className="settings-file-actions">
            <Button variant="secondary" onClick={exportFile}>
              <Download size={15} />
              {t('EXPORT', 'ЭКСПОРТ')}
            </Button>
            <Button variant="secondary" onClick={() => input.current?.click()}>
              <Upload size={15} />
              {t('IMPORT', 'ИМПОРТ')}
            </Button>
            <button className="text-action" onClick={() => setModal('reset')}>
              {t('Restore defaults', 'Сбросить настройки')}
            </button>
            <input
              ref={input}
              className="visually-hidden"
              type="file"
              accept="application/json,.json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    if (file.size > 100000) throw Error();
                    importSettings(JSON.parse(await file.text()));
                  } catch {
                    setToast(
                      t(
                        'This settings file is not valid. Nothing was changed.',
                        'Некорректный файл настроек. Ничего не изменено.',
                      ),
                    );
                  }
                  e.target.value = '';
                }
              }}
            />
          </div>
          <Button arrow onClick={back}>
            {t('BACK TO EXPERIENCE', 'ВЕРНУТЬСЯ В ИГРУ')}
          </Button>
        </div>
      </div>
    </section>
  );
}
