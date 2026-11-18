import 'dart:math' as math;
import 'dart:ui';

import 'package:material_ui/material_ui.dart';

import '../../app/controller.dart';
import '../../domain/game.dart';
import '../design.dart';
import '../motion.dart';

class RouletteScreen extends StatefulWidget {
  final AppController app;
  const RouletteScreen({super.key, required this.app});
  @override
  State<RouletteScreen> createState() => _RouletteScreenState();
}

class _RouletteScreenState extends State<RouletteScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController controller =
      AnimationController(
          vsync: this,
          duration: const Duration(milliseconds: 4200),
        )
        ..addListener(tick)
        ..addStatusListener(status);
  Champion current = const Champion(1);
  Champion? winner;
  int slot = -1;
  bool spinning = false, selected = false;
  void spin() {
    if (spinning || selected) return;
    winner = widget.app.roulette.select(excluding: widget.app.session.champion);
    setState(() => spinning = true);
    controller.duration = Duration(
      milliseconds: widget.app.settings.reducedMotion ? 800 : 4200,
    );
    controller.forward(from: 0);
  }

  void tick() {
    final n = (const RouletteCurve().transform(controller.value) * 42).floor();
    if (n != slot) {
      slot = n;
      setState(() => current = Champion((n * 17 + winner!.id) % 120 + 1));
    }
  }

  void status(AnimationStatus status) {
    if (status == AnimationStatus.completed) {
      widget.app.select(winner!);
      setState(() {
        current = winner!;
        spinning = false;
        selected = true;
      });
    }
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final app = widget.app, s = app.settings;
    return LayoutBuilder(
      builder: (context, c) {
        final wide = c.maxWidth > 1050;
        final stageHeight = math.max(300.0, math.min(620.0, c.maxHeight - 200));
        final center = Column(
          children: [
            Eyebrow(
              s.t(
                selected ? 'CHAMPION SELECTED' : 'CHAMPION SELECTION',
                selected ? 'ГЕРОЙ ВЫБРАН' : 'ВЫБОР ГЕРОЯ',
              ),
              color: selected ? gold : red,
            ),
            const SizedBox(height: 12),
            Text(
              s.t(
                selected
                    ? 'Your champion awaits.'
                    : spinning
                    ? 'Let fate decide.'
                    : 'Who will it be?',
                selected
                    ? 'Ваш герой ждёт.'
                    : spinning
                    ? 'Пусть решит судьба.'
                    : 'Кто выпадет вам?',
              ),
              style: heading(wide ? 38 : 30),
            ),
            const SizedBox(height: 18),
            SizedBox(
              height: stageHeight,
              child: AnimatedBuilder(
                animation: controller,
                builder: (context, _) {
                  final motion = app.motion;
                  final shake = motion && controller.value > .9 && spinning
                      ? math.sin(controller.value * 450) * 2
                      : 0.0;
                  return Transform.translate(
                    offset: Offset(shake, 0),
                    child: Stack(
                      children: [
                        Positioned.fill(
                          child: Transform.scale(
                            scale: motion
                                ? (selected
                                      ? 1.015
                                      : 1 +
                                            math.sin(
                                                  controller.value * math.pi,
                                                ) *
                                                .015)
                                : 1,
                            child: ImageFiltered(
                              imageFilter: ImageFilter.blur(
                                sigmaX: motion && spinning
                                    ? (1 - controller.value) * 1.2
                                    : 0,
                                sigmaY: 0,
                              ),
                              child: ChampionStage(
                                ru: app.settings.ru,
                                champion: current.label,
                                animate: app.motion,
                                selected: selected,
                                spinning: spinning,
                              ),
                            ),
                          ),
                        ),
                        if (spinning || selected)
                          Positioned(
                            left: 30,
                            right: 30,
                            top: 24,
                            child: Center(
                              child: AnimatedSwitcher(
                                duration: Duration(
                                  milliseconds: motion ? 75 : 0,
                                ),
                                transitionBuilder: (child, a) => FadeTransition(
                                  opacity: a,
                                  child: SlideTransition(
                                    position: Tween(
                                      begin: const Offset(0, .3),
                                      end: Offset.zero,
                                    ).animate(a),
                                    child: child,
                                  ),
                                ),
                                child: Container(
                                  key: ValueKey(current.id),
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 18,
                                    vertical: 10,
                                  ),
                                  decoration: BoxDecoration(
                                    color: ink.withValues(alpha: .9),
                                    border: Border.all(
                                      color: selected
                                          ? gold
                                          : red.withValues(alpha: .6),
                                    ),
                                  ),
                                  child: Text(
                                    current.label,
                                    style: label(
                                      color: selected ? gold : white,
                                      size: 11,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        if (motion && spinning && controller.value > .96)
                          Positioned.fill(
                            child: IgnorePointer(
                              child: ColoredBox(
                                color: gold.withValues(
                                  alpha: (1 - controller.value) * 3,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 20),
            ActionButton(
              s.t(
                selected
                    ? 'START CHALLENGE'
                    : spinning
                    ? 'SELECTING…'
                    : 'SPIN',
                selected
                    ? 'НАЧАТЬ ИСПЫТАНИЕ'
                    : spinning
                    ? 'ВЫБИРАЕМ…'
                    : 'КРУТИТЬ',
              ),
              primary: true,
              icon: selected ? Icons.arrow_forward : Icons.refresh,
              onPressed: spinning
                  ? null
                  : selected
                  ? () => app.go(AppPage.challenge)
                  : spin,
            ),
            const SizedBox(height: 13),
            Text(
              s.t(
                selected
                    ? 'THE NEXT MOVE IS YOURS'
                    : '120 POSSIBILITIES / ONE CHAMPION',
                selected
                    ? 'СЛЕДУЮЩИЙ ХОД ЗА ВАМИ'
                    : '120 ВАРИАНТОВ / ОДИН ГЕРОЙ',
              ),
              style: label(size: 8),
            ),
          ],
        );
        return SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(30, 12, 30, 24),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              if (wide && !s.stream)
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(right: 35),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('01 /', style: heading(54, color: graphite)),
                        const SizedBox(height: 22),
                        Text(
                          s.t(
                            'A moment\nof possibility.',
                            'Момент\nвозможностей.',
                          ),
                          style: heading(34),
                        ),
                        const SizedBox(height: 18),
                        Text(
                          s.t(
                            'Every spin starts a new story. Let the roulette choose your next role.',
                            'Каждый спин — новая история. Доверьте рулетке свою следующую роль.',
                          ),
                        ),
                        const SizedBox(height: 30),
                        Text(
                          s.t(
                            'MODE / ${s.mode.name.toUpperCase()}',
                            'РЕЖИМ / ${['ВЕЧЕРИНКА', 'ЗНАТОКИ', 'ХАОС'][s.mode.index]}',
                          ),
                          style: label(size: 9),
                        ),
                      ],
                    ),
                  ),
                ),
              Expanded(flex: wide ? 2 : 1, child: center),
              if (wide && !s.stream)
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(left: 35),
                    child: Panel(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.layers_outlined, color: gold),
                          const SizedBox(height: 20),
                          Text(
                            s.t('THE STAGE', 'СЦЕНА'),
                            style: label(color: white),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            s.t(
                              'Full-body composition is ready for the next chapter.',
                              'Полноразмерная композиция готова к следующему этапу.',
                            ),
                          ),
                          const SizedBox(height: 26),
                          AspectRatio(
                            aspectRatio: .8,
                            child: ChampionStage(
                              ru: app.settings.ru,
                              animate: false,
                              camera: true,
                              compact: true,
                            ),
                          ),
                          const SizedBox(height: 15),
                          Text(
                            s.t(
                              'CAMERA INTEGRATION / LATER',
                              'ИНТЕГРАЦИЯ КАМЕРЫ / ПОЗЖЕ',
                            ),
                            style: label(size: 8),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}
