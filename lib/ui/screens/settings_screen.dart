import 'package:material_ui/material_ui.dart';

import '../../app/controller.dart';
import '../../domain/game.dart';
import '../../services/desktop.dart';
import '../design.dart';

class SettingsScreen extends StatelessWidget {
  final AppController app;
  const SettingsScreen({super.key, required this.app});
  @override
  Widget build(BuildContext context) {
    final s = app.settings;
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(40, 20, 40, 40),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1100),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Eyebrow(s.t('MAKE IT YOURS', 'ВАША ИГРА — ВАШИ ПРАВИЛА')),
              const SizedBox(height: 16),
              Text(s.t('Settings.', 'Настройки.'), style: heading(50)),
              const SizedBox(height: 14),
              Text(
                s.t(
                  'Fine-tune your stage. Settings save automatically.',
                  'Настройте свою сцену. Изменения сохраняются автоматически.',
                ),
              ),
              const SizedBox(height: 32),
              _section('01', s.t('DISPLAY', 'ЭКРАН'), [
                _drop(
                  s.t('Window mode', 'Режим окна'),
                  s.windowMode,
                  ['windowed', 'fullscreen', 'borderless'],
                  (v) => s.t(
                    {
                      'windowed': 'Windowed',
                      'fullscreen': 'Fullscreen',
                      'borderless': 'Borderless fullscreen',
                    }[v]!,
                    {
                      'windowed': 'В окне',
                      'fullscreen': 'Полный экран',
                      'borderless': 'Без рамки',
                    }[v]!,
                  ),
                  (v) async {
                    await s.update(() => s.windowMode = v);
                    try {
                      await DesktopService.apply(s);
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              s.t(
                                'Display mode could not be applied.',
                                'Не удалось изменить режим экрана.',
                              ),
                            ),
                          ),
                        );
                      }
                    }
                  },
                ),
                _drop(
                  s.t('Resolution preference', 'Предпочитаемое разрешение'),
                  s.resolution,
                  ['1280 × 720', '1920 × 1080', '2560 × 1440'],
                  (v) => v,
                  (v) => s.update(() => s.resolution = v),
                ),
                Align(
                  alignment: Alignment.centerRight,
                  child: ActionButton(
                    s.t('APPLY WINDOW SIZE', 'ПРИМЕНИТЬ РАЗМЕР'),
                    compact: true,
                    onPressed: () => DesktopService.apply(s),
                  ),
                ),
                _slider(
                  s.t('UI scale', 'Масштаб интерфейса'),
                  s.scale,
                  .85,
                  1.2,
                  (v) => s.update(() => s.scale = v),
                  suffix: '${(s.scale * 100).round()}%',
                ),
                _slider(
                  s.t('Animation intensity', 'Интенсивность анимации'),
                  s.intensity,
                  0,
                  1,
                  (v) => s.update(() => s.intensity = v),
                ),
              ]),
              _section('02', s.t('AUDIO', 'ЗВУК'), [
                Text(
                  s.t(
                    'Levels are saved for future audio integration. No audio plays in this version.',
                    'Уровни сохраняются для будущего звука. В этой версии звук не воспроизводится.',
                  ),
                ),
                _slider(
                  s.t('Master volume', 'Общая громкость'),
                  s.master,
                  0,
                  1,
                  (v) => s.update(() => s.master = v),
                ),
                _slider(
                  s.t('Music volume', 'Громкость музыки'),
                  s.music,
                  0,
                  1,
                  (v) => s.update(() => s.music = v),
                ),
                _slider(
                  s.t('Sound effects', 'Звуковые эффекты'),
                  s.effects,
                  0,
                  1,
                  (v) => s.update(() => s.effects = v),
                ),
              ]),
              _section('03', s.t('GAMEPLAY', 'ИГРА'), [
                _drop<int>(
                  s.t('Default challenge duration', 'Длительность испытания'),
                  s.duration,
                  [15, 30, 45, 60, 90],
                  (v) => '$v ${s.t('seconds', 'секунд')}',
                  (v) => s.update(() => s.duration = v),
                ),
                _drop<Difficulty>(
                  s.t('Default difficulty', 'Сложность'),
                  s.difficulty,
                  Difficulty.values,
                  (v) => s.t(
                    ['Easy', 'Normal', 'Hard', 'Expert'][v.index],
                    ['Легко', 'Обычно', 'Сложно', 'Эксперт'][v.index],
                  ),
                  (v) => s.update(() => s.difficulty = v),
                ),
                _drop<GameMode>(
                  s.t('Default game mode', 'Режим игры'),
                  s.mode,
                  GameMode.values,
                  (v) => s.t(
                    ['Party', 'Knowledge', 'Chaos'][v.index],
                    ['Вечеринка', 'Знатоки', 'Хаос'][v.index],
                  ),
                  (v) => s.update(() => s.mode = v),
                ),
              ]),
              _section('04', s.t('LANGUAGE', 'ЯЗЫК'), [
                _drop<String>(
                  s.t('Interface language', 'Язык интерфейса'),
                  s.language,
                  ['en', 'ru'],
                  (v) => v == 'en' ? 'English' : 'Русский',
                  (v) => s.update(() => s.language = v),
                ),
              ]),
              _section('05', s.t('ACCESSIBILITY', 'ДОСТУПНОСТЬ'), [
                _toggle(
                  s.t('Reduced motion', 'Уменьшение движения'),
                  s.t(
                    'Minimize background motion, transitions and roulette effects.',
                    'Уменьшить движение фона, переходы и эффекты рулетки.',
                  ),
                  s.reducedMotion,
                  (v) => s.update(() => s.reducedMotion = v),
                ),
                _toggle(
                  s.t('High contrast', 'Высокая контрастность'),
                  s.t(
                    'Stronger borders and clearer interface separation.',
                    'Чёткие границы и более заметные элементы интерфейса.',
                  ),
                  s.highContrast,
                  (v) => s.update(() => s.highContrast = v),
                ),
                _toggle(
                  s.t('Larger text', 'Крупный текст'),
                  s.t(
                    'Increase type size throughout the application.',
                    'Увеличить размер текста во всём приложении.',
                  ),
                  s.largerText,
                  (v) => s.update(() => s.largerText = v),
                ),
              ]),
              _section('06', s.t('STREAMING', 'ТРАНСЛЯЦИЯ'), [
                _toggle(
                  s.t('Stream Mode', 'Режим трансляции'),
                  s.t(
                    'A clean presentation stage for OBS capture.',
                    'Чистая сцена для захвата в OBS.',
                  ),
                  s.stream,
                  (v) => s.update(() => s.stream = v),
                ),
                _toggle(
                  s.t(
                    'Show interface overlays',
                    'Показывать элементы интерфейса',
                  ),
                  s.t(
                    'Show navigation and host controls on the presentation.',
                    'Показывать навигацию и кнопки ведущего на трансляции.',
                  ),
                  s.overlays,
                  (v) => s.update(() => s.overlays = v),
                ),
                _slider(
                  s.t('Presentation-safe margins', 'Безопасные поля'),
                  s.safeMargin,
                  0,
                  8,
                  (v) => s.update(() => s.safeMargin = v),
                  suffix: '${s.safeMargin.round()}%',
                ),
                Text(
                  s.t(
                    '16:9 reference: 1920 × 1080 / 2560 × 1440. Camera permissions are never requested.',
                    'Формат 16:9: 1920 × 1080 / 2560 × 1440. Доступ к камере не запрашивается.',
                  ),
                ),
              ]),
              ActionButton(
                s.t('DONE', 'ГОТОВО'),
                primary: true,
                onPressed: () => app.go(app.settingsReturn),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _section(String n, String name, List<Widget> children) => Padding(
    padding: const EdgeInsets.only(bottom: 24),
    child: Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(n, style: label(color: gold)),
              const SizedBox(width: 15),
              Expanded(child: Text(name, style: heading(22))),
            ],
          ),
          const SizedBox(height: 20),
          ...children,
        ],
      ),
    ),
  );
  Widget _drop<T>(
    String title,
    T value,
    List<T> values,
    String Function(T) text,
    void Function(T) change,
  ) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 10),
    child: LayoutBuilder(
      builder: (context, c) {
        final dropdown = DropdownButtonFormField<T>(
          key: ValueKey('$title$value'),
          initialValue: value,
          isExpanded: true,
          items: values
              .map((v) => DropdownMenuItem(value: v, child: Text(text(v))))
              .toList(),
          onChanged: (v) {
            if (v != null) change(v);
          },
        );
        return c.maxWidth > 650
            ? Row(
                children: [
                  Expanded(
                    child: Text(title, style: const TextStyle(color: white)),
                  ),
                  SizedBox(width: 310, child: dropdown),
                ],
              )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [Text(title), const SizedBox(height: 10), dropdown],
              );
      },
    ),
  );
  Widget _slider(
    String title,
    double value,
    double min,
    double max,
    ValueChanged<double> change, {
    String? suffix,
  }) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 12),
    child: Column(
      children: [
        Row(
          children: [
            Expanded(
              child: Text(title, style: const TextStyle(color: white)),
            ),
            Text(
              suffix ?? '${(value * 100).round()}%',
              style: label(color: gold, size: 10),
            ),
          ],
        ),
        Slider(value: value, min: min, max: max, onChanged: change),
      ],
    ),
  );
  Widget _toggle(
    String title,
    String subtitle,
    bool value,
    ValueChanged<bool> change,
  ) => SwitchListTile(
    contentPadding: const EdgeInsets.symmetric(vertical: 8),
    title: Text(title),
    subtitle: Text(
      subtitle,
      style: const TextStyle(color: muted, fontSize: 12),
    ),
    value: value,
    onChanged: change,
  );
}
