import 'package:material_ui/material_ui.dart';

import '../../app/controller.dart';
import '../../domain/game.dart';
import '../design.dart';

class ResultScreen extends StatelessWidget {
  final AppController app;
  const ResultScreen({super.key, required this.app});
  @override
  Widget build(BuildContext context) {
    final s = app.settings, r = app.session.history.last;
    final accent = r.success ? gold : const Color(0xFFBD6670);
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(32, 35, 32, 40),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1000),
          child: TweenAnimationBuilder<double>(
            tween: Tween(begin: app.motion ? 0 : 1, end: 1),
            duration: const Duration(milliseconds: 850),
            curve: Curves.easeOutCubic,
            builder: (context, v, child) => Opacity(
              opacity: v,
              child: Transform.translate(
                offset: Offset(0, 25 * (1 - v)),
                child: child,
              ),
            ),
            child: Column(
              children: [
                Container(
                  width: 90,
                  height: 90,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: accent.withValues(alpha: .5)),
                    gradient: RadialGradient(
                      colors: [
                        accent.withValues(alpha: .13),
                        Colors.transparent,
                      ],
                    ),
                  ),
                  child: Icon(
                    r.success ? Icons.check_rounded : Icons.close_rounded,
                    color: accent,
                    size: 40,
                  ),
                ),
                const SizedBox(height: 28),
                Eyebrow(
                  s.t(
                    app.finished ? 'SESSION COMPLETE' : 'ROUND COMPLETE',
                    app.finished ? 'ИГРА ЗАВЕРШЕНА' : 'РАУНД ЗАВЕРШЁН',
                  ),
                  color: accent,
                ),
                const SizedBox(height: 20),
                FittedBox(
                  child: Text(
                    s.t(
                      r.success
                          ? 'A legendary performance.'
                          : 'The story continues.',
                      r.success ? 'Легендарная игра.' : 'История продолжается.',
                    ),
                    style: heading(48),
                  ),
                ),
                const SizedBox(height: 15),
                Text(
                  s.t(
                    r.success
                        ? 'Well played. Take a breath. The next champion is waiting.'
                        : 'Every great champion gets another chance.',
                    r.success
                        ? 'Отлично сыграно. Переведите дух. Следующий герой уже ждёт.'
                        : 'У каждого великого героя есть ещё один шанс.',
                  ),
                ),
                const SizedBox(height: 36),
                Panel(
                  accent: accent,
                  child: LayoutBuilder(
                    builder: (context, c) => Wrap(
                      spacing: 30,
                      runSpacing: 25,
                      children: [
                        _stat(s.t('CHAMPION', 'ГЕРОЙ'), r.champion.label),
                        _stat(
                          s.t('CHALLENGE', 'ИСПЫТАНИЕ'),
                          r.challenge.title(s.ru),
                        ),
                        _stat(
                          s.t('TIME LEFT', 'ОСТАЛОСЬ'),
                          '${r.remaining.toString().padLeft(2, '0')}s',
                        ),
                        _stat(
                          s.t('OUTCOME', 'РЕЗУЛЬТАТ'),
                          s.t(
                            r.success ? 'SUCCESS' : 'FAILED',
                            r.success ? 'УСПЕХ' : 'НЕУДАЧА',
                          ),
                          color: accent,
                        ),
                        _stat(
                          s.t('ROUND SCORE', 'ОЧКИ РАУНДА'),
                          '+${r.score}',
                          color: accent,
                        ),
                        _stat(
                          s.t('SESSION SCORE', 'ОЧКИ СЕССИИ'),
                          '${app.session.score}',
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                Wrap(
                  alignment: WrapAlignment.center,
                  spacing: 14,
                  runSpacing: 14,
                  children: [
                    if (!app.finished)
                      ActionButton(
                        s.t('NEXT ROUND', 'СЛЕДУЮЩИЙ РАУНД'),
                        primary: true,
                        icon: Icons.arrow_forward,
                        onPressed: app.next,
                      ),
                    ActionButton(
                      s.t('RETRY', 'ПОВТОРИТЬ'),
                      onPressed: app.retry,
                    ),
                    ActionButton(
                      s.t('MAIN MENU', 'ГЛАВНОЕ МЕНЮ'),
                      onPressed: () => app.go(AppPage.menu),
                    ),
                  ],
                ),
                const SizedBox(height: 35),
                Text(
                  s.t(
                    'ROUND ${app.session.round}  /  PLAYER ${app.session.player}',
                    'РАУНД ${app.session.round}  /  ИГРОК ${app.session.player}',
                  ),
                  style: label(size: 9),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _stat(String name, String value, {Color color = white}) => SizedBox(
    width: 250,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(name, style: label(size: 9)),
        const SizedBox(height: 10),
        Text(
          value,
          style: TextStyle(
            fontSize: 19,
            fontWeight: FontWeight.w700,
            color: color,
          ),
        ),
      ],
    ),
  );
}
