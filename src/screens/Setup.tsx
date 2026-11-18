import { BookOpen, Check, Shuffle, Users } from 'lucide-react';
import { motion as m } from 'motion/react';
import { useGame } from '../app/Store';
import { Button, Field, ScreenHeading } from '../components/UI';
import type { Difficulty, Mode } from '../domain/game';
export default function Setup() {
  const { settings: s, update, t, start, motion } = useGame();
  const modes: {
    id: Mode;
    name: string;
    tag: string;
    body: string;
    icon: typeof Users;
    color: string;
  }[] = [
    {
      id: 'party',
      name: t('Party', 'Вечеринка'),
      tag: t('THE SOCIAL EXPERIENCE', 'ДЛЯ ВАШЕЙ КОМПАНИИ'),
      body: t(
        'Explain, act, and guess. Turn your game night into a performance.',
        'Объясняйте, показывайте, угадывайте. Превратите вечер в настоящее шоу.',
      ),
      icon: Users,
      color: '#D9AC60',
    },
    {
      id: 'knowledge',
      name: t('Knowledge', 'Знатоки'),
      tag: t('THE CHAMPION MINDSET', 'ПРОВЕРКА ЗНАНИЙ'),
      body: t(
        'Clues, quick thinking, and legendary knowledge. Put yours to the test.',
        'Подсказки, быстрая мысль и знание легенд. Испытайте себя.',
      ),
      icon: BookOpen,
      color: '#8DB5D8',
    },
    {
      id: 'chaos',
      name: t('Chaos', 'Хаос'),
      tag: t('THE UNEXPECTED RULES', 'НЕПРЕДСКАЗУЕМЫЕ ПРАВИЛА'),
      body: t(
        'Random champions. Unexpected restrictions. Embrace the beautiful chaos.',
        'Случайные герои. Неожиданные ограничения. Доверьтесь хаосу.',
      ),
      icon: Shuffle,
      color: '#E83246',
    },
  ];
  return (
    <section className="setup-screen page-width">
      <ScreenHeading
        eyebrow={t('01 / SET THE SCENE', '01 / ЗАДАЙТЕ НАСТРОЕНИЕ')}
        title={t('Your game. Your rules.', 'Ваша игра. Ваши правила.')}
        description={t(
          'Pick your energy. Gather your people. Let the night unfold.',
          'Выберите настроение. Соберите друзей. Начните свою историю.',
        )}
      />
      <div className="mode-selector" role="group" aria-label={t('Game mode', 'Режим игры')}>
        {modes.map(({ id, name, tag, body, icon: Icon, color }, i) => (
          <m.button
            key={id}
            className={`mode-tile ${s.mode === id ? 'is-selected' : ''}`}
            aria-pressed={s.mode === id}
            onClick={() => update({ mode: id })}
            style={{ '--mode-color': color } as React.CSSProperties}
            whileTap={motion ? { scale: 0.985 } : undefined}
          >
            <div className="mode-tile-top">
              <span>0{i + 1}</span>
              <Icon size={25} strokeWidth={1.2} />
              {s.mode === id ? <Check size={17} /> : <i />}
            </div>
            <span className="mode-watermark" aria-hidden="true">
              0{i + 1}
            </span>
            <small>{tag}</small>
            <h2>
              {name}
              <span> /</span>
            </h2>
            <p>{body}</p>
            <div className="mode-bottom-line" />
            {s.mode === id && (
              <m.div
                className="selected-marker"
                layoutId="mode-marker"
                transition={{ duration: motion ? 0.35 : 0 }}
              />
            )}
          </m.button>
        ))}
      </div>
      <div className="session-config">
        <div className="config-heading">
          <span>02</span>
          <h2>{t('Build your session', 'Настройте сессию')}</h2>
          <span>{t('SAVED AUTOMATICALLY', 'СОХРАНЯЕТСЯ АВТОМАТИЧЕСКИ')}</span>
        </div>
        <div className="config-grid">
          <Field label={t('PLAYERS', 'ИГРОКИ')}>
            <div className="stepper">
              <button
                aria-label={t('Fewer players', 'Меньше игроков')}
                disabled={s.players <= 1}
                onClick={() => update({ players: s.players - 1 })}
              >
                −
              </button>
              <output aria-live="polite">
                {String(s.players).padStart(2, '0')}
                <small>{t('PLAYERS', 'ИГРОКОВ')}</small>
              </output>
              <button
                aria-label={t('More players', 'Больше игроков')}
                disabled={s.players >= 10}
                onClick={() => update({ players: s.players + 1 })}
              >
                +
              </button>
            </div>
          </Field>
          <Field label={t('ROUND DURATION', 'ДЛИТЕЛЬНОСТЬ РАУНДА')}>
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
          <Field label={t('NUMBER OF ROUNDS', 'КОЛИЧЕСТВО РАУНДОВ')}>
            <select value={s.rounds} onChange={(e) => update({ rounds: Number(e.target.value) })}>
              {[5, 10, 15, 20, 0].map((v) => (
                <option value={v} key={v}>
                  {v || t('Unlimited', 'Без ограничений')}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('DIFFICULTY', 'СЛОЖНОСТЬ')}>
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
          <Field label={t('LANGUAGE', 'ЯЗЫК')}>
            <select
              value={s.language}
              onChange={(e) => update({ language: e.target.value as 'en' | 'ru' })}
            >
              <option value="en">English</option>
              <option value="ru">Русский</option>
            </select>
          </Field>
          <Field label={t('PRESENTATION', 'ПРЕЗЕНТАЦИЯ')}>
            <select
              value={String(s.stream)}
              onChange={(e) => update({ stream: e.target.value === 'true' })}
            >
              <option value="false">{t('Control Mode', 'Режим управления')}</option>
              <option value="true">{t('Stream Mode', 'Режим трансляции')}</option>
            </select>
          </Field>
        </div>
      </div>
      <div className="setup-footer">
        <p>
          <span className="status-dot" />
          {t('THE STAGE IS SET', 'СЦЕНА ГОТОВА')}
          <small>
            {s.players} {t('players', 'игроков')} / {s.rounds || '∞'} {t('rounds', 'раундов')} /{' '}
            {s.duration}s
          </small>
        </p>
        <Button arrow onClick={start}>
          {t('ENTER THE CHAMBER', 'ВОЙТИ В КАМЕРУ')}
        </Button>
      </div>
    </section>
  );
}
