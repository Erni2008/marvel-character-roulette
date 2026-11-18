import 'package:material_ui/material_ui.dart';

import '../../app/controller.dart';
import '../../domain/game.dart';
import '../design.dart';

class SetupScreen extends StatelessWidget {
  final AppController app;
  const SetupScreen({super.key, required this.app});
  @override
  Widget build(BuildContext context) {
    final s = app.settings;
    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(40, 20, 40, 36),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1280),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Eyebrow(s.t('SESSION CONFIGURATION', 'ПАРАМЕТРЫ СЕССИИ')),
                    const SizedBox(height: 16),
                    Text(
                      s.t('Choose your arena.', 'Выберите свой режим.'),
                      style: heading(48),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      s.t(
                        'Set the rules. Bring the energy. We’ll handle the unexpected.',
                        'Задайте правила. Соберите команду. Остальное решит случай.',
                      ),
                    ),
                    const SizedBox(height: 34),
                    LayoutBuilder(
                      builder: (context, c) => Wrap(
                        spacing: 16,
                        runSpacing: 16,
                        children: List.generate(3, (i) {
                          final selected = s.mode.index == i;
                          final colors = [gold, const Color(0xFF91B6FF), red];
                          final titles = [
                            s.t('PARTY MODE', 'ВЕЧЕРИНКА'),
                            s.t('KNOWLEDGE MODE', 'ЗНАТОКИ'),
                            s.t('CHAOS MODE', 'ХАОС'),
                          ];
                          final descriptions = [
                            s.t(
                              'Explain, act, and guess your favorite champions.',
                              'Объясняйте, показывайте и угадывайте любимых героев.',
                            ),
                            s.t(
                              'Test your knowledge of legendary champions.',
                              'Проверьте свои знания о легендарных героях.',
                            ),
                            s.t(
                              'Random champions. Random rules. Total chaos.',
                              'Случайные герои. Случайные правила. Полный хаос.',
                            ),
                          ];
                          return SizedBox(
                            width: c.maxWidth >= 900
                                ? (c.maxWidth - 32) / 3
                                : c.maxWidth,
                            child: Semantics(
                              selected: selected,
                              child: InkWell(
                                onTap: () =>
                                    s.update(() => s.mode = GameMode.values[i]),
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 180),
                                  padding: const EdgeInsets.all(25),
                                  decoration: BoxDecoration(
                                    color: selected
                                        ? colors[i].withValues(alpha: .08)
                                        : navy.withValues(alpha: .6),
                                    border: Border.all(
                                      color: selected ? colors[i] : graphite,
                                    ),
                                  ),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Icon(
                                            [
                                              Icons.people_outline,
                                              Icons.auto_stories_outlined,
                                              Icons.shuffle,
                                            ][i],
                                            color: colors[i],
                                            size: 32,
                                          ),
                                          const Spacer(),
                                          Text(
                                            '0${i + 1}',
                                            style: label(color: colors[i]),
                                          ),
                                          const SizedBox(width: 12),
                                          Icon(
                                            selected
                                                ? Icons.radio_button_checked
                                                : Icons.radio_button_unchecked,
                                            color: selected ? colors[i] : muted,
                                            size: 18,
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 30),
                                      Text(titles[i], style: heading(23)),
                                      const SizedBox(height: 12),
                                      Text(
                                        descriptions[i],
                                        style: const TextStyle(height: 1.6),
                                      ),
                                      const SizedBox(height: 12),
                                      Text(
                                        [
                                          s.t(
                                            'SOCIAL / PERFORMANCE',
                                            'ОБЩЕНИЕ / АКТЁРСТВО',
                                          ),
                                          s.t(
                                            'TRIVIA / DISCOVERY',
                                            'ЗНАНИЯ / ОТКРЫТИЯ',
                                          ),
                                          s.t(
                                            'UNPREDICTABLE / UNFILTERED',
                                            'НЕПРЕДСКАЗУЕМО / БЕЗ ГРАНИЦ',
                                          ),
                                        ][i],
                                        style: label(size: 8, color: colors[i]),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          );
                        }),
                      ),
                    ),
                    const SizedBox(height: 32),
                    Panel(
                      child: LayoutBuilder(
                        builder: (context, c) => Wrap(
                          spacing: 28,
                          runSpacing: 28,
                          children: [
                            _field(
                              c,
                              s.t('PLAYERS', 'ИГРОКИ'),
                              DropdownButtonFormField<int>(
                                isExpanded: true,
                                initialValue: s.players,
                                items: List.generate(
                                  10,
                                  (i) => DropdownMenuItem(
                                    value: i + 1,
                                    child: Text(
                                      '${i + 1} ${s.t('players', 'игроков')}',
                                    ),
                                  ),
                                ),
                                onChanged: (v) =>
                                    s.update(() => s.players = v!),
                              ),
                            ),
                            _field(
                              c,
                              s.t('ROUND DURATION', 'ДЛИТЕЛЬНОСТЬ'),
                              _dropdown<int>(
                                s.duration,
                                [15, 30, 45, 60, 90],
                                (v) => '$v ${s.t('seconds', 'секунд')}',
                                (v) => s.update(() => s.duration = v),
                              ),
                            ),
                            _field(
                              c,
                              s.t('ROUNDS', 'РАУНДЫ'),
                              _dropdown<int>(
                                s.rounds,
                                [5, 10, 15, 20, 0],
                                (v) => v == 0
                                    ? s.t('Unlimited', 'Без ограничений')
                                    : '$v',
                                (v) => s.update(() => s.rounds = v),
                              ),
                            ),
                            _field(
                              c,
                              s.t('DIFFICULTY', 'СЛОЖНОСТЬ'),
                              _dropdown<Difficulty>(
                                s.difficulty,
                                Difficulty.values,
                                (v) => s.t(
                                  ['Easy', 'Normal', 'Hard', 'Expert'][v.index],
                                  [
                                    'Легко',
                                    'Обычно',
                                    'Сложно',
                                    'Эксперт',
                                  ][v.index],
                                ),
                                (v) => s.update(() => s.difficulty = v),
                              ),
                            ),
                            _field(
                              c,
                              s.t('LANGUAGE', 'ЯЗЫК'),
                              _dropdown<String>(
                                s.language,
                                ['en', 'ru'],
                                (v) => v == 'en' ? 'English' : 'Русский',
                                (v) => s.update(() => s.language = v),
                              ),
                            ),
                            _field(
                              c,
                              s.t('DISPLAY MODE', 'РЕЖИМ ЭКРАНА'),
                              _dropdown<bool>(
                                s.stream,
                                [false, true],
                                (v) => v
                                    ? s.t('Stream Mode', 'Режим трансляции')
                                    : s.t('Standard Mode', 'Обычный режим'),
                                (v) => s.update(() => s.stream = v),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
          decoration: const BoxDecoration(
            color: ink,
            border: Border(top: BorderSide(color: graphite)),
          ),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 1280),
              child: Wrap(
                alignment: WrapAlignment.spaceBetween,
                crossAxisAlignment: WrapCrossAlignment.center,
                spacing: 30,
                runSpacing: 16,
                children: [
                  Text(
                    s.t(
                      'YOUR SESSION  /  ${s.players} PLAYERS  /  ${s.duration}s ROUNDS',
                      'ВАША ИГРА  /  ${s.players} ИГРОКОВ  /  ${s.duration} СЕК.',
                    ),
                    style: label(size: 10),
                  ),
                  ActionButton(
                    s.t('CONTINUE', 'ПРОДОЛЖИТЬ'),
                    primary: true,
                    icon: Icons.arrow_forward,
                    onPressed: app.startSession,
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _field(BoxConstraints c, String title, Widget child) => SizedBox(
    width: c.maxWidth >= 800
        ? (c.maxWidth - 56) / 3
        : c.maxWidth >= 480
        ? (c.maxWidth - 28) / 2
        : c.maxWidth,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: label(size: 10)),
        const SizedBox(height: 12),
        child,
      ],
    ),
  );
  Widget _dropdown<T>(
    T value,
    List<T> items,
    String Function(T) text,
    void Function(T) change,
  ) => DropdownButtonFormField<T>(
    key: ValueKey('$value'),
    initialValue: value,
    isExpanded: true,
    items: items
        .map((v) => DropdownMenuItem(value: v, child: Text(text(v))))
        .toList(),
    onChanged: (v) {
      if (v != null) change(v);
    },
  );
}
