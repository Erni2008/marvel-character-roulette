import 'dart:async';
import 'dart:math' as math;

import 'package:material_ui/material_ui.dart';

import '../../app/controller.dart';
import '../../domain/game.dart';
import '../../services/desktop.dart';
import '../design.dart';

class SplashScreen extends StatefulWidget {
  final AppController app;
  const SplashScreen({super.key, required this.app});
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1900),
  )..forward();
  Timer? timer;
  @override
  void initState() {
    super.initState();
    timer = Timer(const Duration(milliseconds: 2100), () {
      if (mounted) widget.app.go(AppPage.menu);
    });
  }

  @override
  void dispose() {
    timer?.cancel();
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Stack(
    children: [
      Center(
        child: AnimatedBuilder(
          animation: controller,
          builder: (context, _) => Opacity(
            opacity: widget.app.motion
                ? Curves.easeOut.transform((controller.value * 2).clamp(0, 1))
                : 1,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Transform.rotate(
                  angle: widget.app.motion
                      ? (1 - controller.value) * math.pi / 2
                      : 0,
                  child: CustomPaint(
                    size: const Size(120, 120),
                    painter: _EmblemPainter(controller.value),
                  ),
                ),
                const SizedBox(height: 36),
                Text(
                  'CHARACTER ROULETTE',
                  style: heading(
                    MediaQuery.sizeOf(context).width < 600 ? 25 : 42,
                  ),
                ),
                const SizedBox(height: 18),
                Text('THE ULTIMATE GUESSING GAME', style: label(size: 10)),
              ],
            ),
          ),
        ),
      ),
      Positioned(
        bottom: 40,
        right: 40,
        child: ActionButton(
          widget.app.settings.t('SKIP INTRO', 'ПРОПУСТИТЬ'),
          compact: true,
          onPressed: () => widget.app.go(AppPage.menu),
          icon: Icons.arrow_forward,
        ),
      ),
    ],
  );
}

class _EmblemPainter extends CustomPainter {
  final double progress;
  _EmblemPainter(this.progress);
  @override
  void paint(Canvas c, Size s) {
    final p = Paint()
      ..color = red
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;
    final path = Path()
      ..moveTo(60, 5)
      ..lineTo(115, 35)
      ..lineTo(115, 85)
      ..lineTo(60, 115)
      ..lineTo(5, 85)
      ..lineTo(5, 35)
      ..close();
    c.drawPath(path, p);
    c.drawPath(
      Path()
        ..moveTo(36, 81)
        ..lineTo(60, 32)
        ..lineTo(84, 81)
        ..moveTo(45, 68)
        ..lineTo(75, 68),
      Paint()
        ..color = gold
        ..style = PaintingStyle.stroke
        ..strokeWidth = 4,
    );
    c.drawLine(
      Offset(0, progress * 120),
      Offset(120, progress * 120),
      Paint()..color = white.withValues(alpha: .3),
    );
  }

  @override
  bool shouldRepaint(_EmblemPainter old) => old.progress != progress;
}

class MenuScreen extends StatelessWidget {
  final AppController app;
  const MenuScreen({super.key, required this.app});
  void how(BuildContext context) {
    final s = app.settings;
    showDialog<void>(
      context: context,
      builder: (c) => Dialog(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 620),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(36),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Eyebrow(s.t('THE BRIEFING', 'ПРАВИЛА ИГРЫ')),
                const SizedBox(height: 20),
                Text(
                  s.t('Make every\nsecond count.', 'Каждая секунда\nна счету.'),
                  style: heading(36),
                ),
                const SizedBox(height: 30),
                SectionTitle(
                  '01',
                  s.t('BUILD YOUR SESSION', 'СОЗДАЙТЕ ИГРУ'),
                  s.t(
                    'Pick a mode, gather 1–10 players and set your round length.',
                    'Выберите режим, соберите 1–10 игроков и настройте раунды.',
                  ),
                ),
                SectionTitle(
                  '02',
                  s.t('SPIN THE ROULETTE', 'ЗАПУСТИТЕ РУЛЕТКУ'),
                  s.t(
                    'Let the roulette select your placeholder champion. A challenge follows.',
                    'Рулетка выберет героя-заглушку и назначит испытание.',
                  ),
                ),
                SectionTitle(
                  '03',
                  s.t('BEAT THE CLOCK', 'УСПЕЙТЕ ДО СИГНАЛА'),
                  s.t(
                    'Start the timer. Mark a successful guess with Finish, or Skip to record a failure.',
                    'Запустите таймер. Нажмите «Готово» при успехе или «Пропустить» при неудаче.',
                  ),
                ),
                Text(
                  s.t(
                    'Phase one uses champion IDs. Character facts, images and camera are not connected yet.',
                    'В первой версии используются ID героев. Факты, изображения и камера пока не подключены.',
                  ),
                ),
                const SizedBox(height: 24),
                ActionButton(
                  s.t('GOT IT', 'ПОНЯТНО'),
                  primary: true,
                  onPressed: () => Navigator.pop(c),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final s = app.settings;
    return LayoutBuilder(
      builder: (context, c) {
        final wide = c.maxWidth >= 900;
        final title = Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Eyebrow(
              s.t(
                'ONE SPIN. ENDLESS POSSIBILITIES.',
                'ОДИН СПИН. ТЫСЯЧИ ВОЗМОЖНОСТЕЙ.',
              ),
            ),
            const SizedBox(height: 30),
            FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.centerLeft,
              child: Text(
                'CHARACTER\nROULETTE',
                style: heading(wide ? 80 : 58),
              ),
            ),
            const SizedBox(height: 26),
            Container(width: 54, height: 3, color: red),
            const SizedBox(height: 25),
            Text(
              s.t(
                'Every hero has a secret.\nCan you guess it?',
                'У каждого героя есть секрет.\nСможете его разгадать?',
              ),
              style: const TextStyle(color: muted, fontSize: 18, height: 1.6),
            ),
            const SizedBox(height: 36),
            ActionButton(
              s.t('START GAME', 'НАЧАТЬ ИГРУ'),
              primary: true,
              icon: Icons.arrow_forward,
              onPressed: () => app.go(AppPage.setup),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                ActionButton(
                  s.t('HOW TO PLAY', 'КАК ИГРАТЬ'),
                  compact: true,
                  onPressed: () => how(context),
                ),
                ActionButton(
                  s.t('SETTINGS', 'НАСТРОЙКИ'),
                  compact: true,
                  onPressed: () {
                    app.settingsReturn = AppPage.menu;
                    app.go(AppPage.settings);
                  },
                ),
                ActionButton(
                  s.t('EXIT', 'ВЫХОД'),
                  compact: true,
                  onPressed: () => showDialog<void>(
                    context: context,
                    builder: (c) => AlertDialog(
                      title: Text(
                        s.t('Exit Character Roulette?', 'Закрыть игру?'),
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(c),
                          child: Text(s.t('CANCEL', 'ОТМЕНА')),
                        ),
                        TextButton(
                          onPressed: DesktopService.close,
                          child: Text(s.t('EXIT', 'ВЫХОД')),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
            Text(
              s.t(
                'ASSEMBLE YOUR FRIENDS. OWN THE MOMENT.',
                'СОБЕРИТЕ ДРУЗЕЙ. ЭТО ВАШ МОМЕНТ.',
              ),
              style: label(size: 8),
            ),
          ],
        );
        final stage = Column(
          children: [
            Expanded(
              child: ChampionStage(ru: app.settings.ru, animate: app.motion),
            ),
            const SizedBox(height: 18),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('01', style: label(color: gold)),
                Container(
                  width: 55,
                  height: 1,
                  margin: const EdgeInsets.symmetric(horizontal: 14),
                  color: gold,
                ),
                Text('02     03', style: label()),
              ],
            ),
          ],
        );
        return SingleChildScrollView(
          padding: EdgeInsets.fromLTRB(wide ? 72 : 24, 16, wide ? 64 : 24, 24),
          child: wide
              ? SizedBox(
                  height: math.max(630, c.maxHeight - 40),
                  child: Row(
                    children: [
                      Expanded(flex: 11, child: title),
                      const SizedBox(width: 40),
                      Expanded(flex: 10, child: stage),
                    ],
                  ),
                )
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    title,
                    const SizedBox(height: 40),
                    SizedBox(height: 480, child: stage),
                  ],
                ),
        );
      },
    );
  }
}
