import 'dart:async';
import 'dart:math' as math;

import 'package:material_ui/material_ui.dart';

import '../../app/controller.dart';
import '../design.dart';

class ChallengeScreen extends StatefulWidget {
  final AppController app;
  const ChallengeScreen({super.key, required this.app});
  @override
  State<ChallengeScreen> createState() => _ChallengeScreenState();
}

class _ChallengeScreenState extends State<ChallengeScreen>
    with WidgetsBindingObserver {
  late int remaining, total;
  late final Stopwatch clock = widget.app.createClock();
  Timer? timer;
  bool started = false, paused = false, done = false;
  int clues = 0;
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    widget.app.pauseChallenge = pauseForNavigation;
    total = widget.app.session.challenge!.key == 'speed'
        ? 5
        : widget.app.settings.duration;
    remaining = total;
  }

  void toggle() {
    if (done) return;
    if (!started) {
      started = true;
    }
    if (clock.isRunning) {
      clock.stop();
      timer?.cancel();
      setState(() => paused = true);
    } else {
      clock.start();
      paused = false;
      timer?.cancel();
      timer = Timer.periodic(const Duration(milliseconds: 100), (_) {
        final next = math.max(0, total - clock.elapsed.inSeconds);
        if (next != remaining && mounted) setState(() => remaining = next);
        if (next == 0) finish(false);
      });
      setState(() {});
    }
  }

  void pauseForNavigation() {
    if (clock.isRunning) toggle();
  }

  void finish(bool success) {
    if (done) return;
    done = true;
    clock.stop();
    timer?.cancel();
    widget.app.complete(success, remaining);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state != AppLifecycleState.resumed && clock.isRunning) toggle();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    if (widget.app.pauseChallenge == pauseForNavigation) {
      widget.app.pauseChallenge = null;
    }
    timer?.cancel();
    clock.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final app = widget.app,
        s = app.settings,
        challenge = app.session.challenge!;
    final color = remaining <= 5 && started ? red : challenge.color;
    final restrictions = [
      s.t('Speak only in questions.', 'Говорите только вопросами.'),
      s.t('Keep both hands behind your back.', 'Держите обе руки за спиной.'),
      s.t('Use a dramatic whisper.', 'Говорите драматичным шёпотом.'),
      s.t('Explain without using any names.', 'Объясняйте без имён.'),
    ];
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(40, 20, 40, 30),
      child: LayoutBuilder(
        builder: (context, c) {
          final wide = c.maxWidth > 950;
          final content = Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Eyebrow(
                s.t('YOUR CHALLENGE', 'ВАШЕ ИСПЫТАНИЕ'),
                color: challenge.color,
              ),
              const SizedBox(height: 28),
              TweenAnimationBuilder<double>(
                tween: Tween(begin: app.motion ? 0 : 1, end: 1),
                duration: const Duration(milliseconds: 600),
                builder: (context, v, child) => Opacity(
                  opacity: v,
                  child: Transform.translate(
                    offset: Offset(0, (1 - v) * 15),
                    child: child,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(challenge.icon, size: 50, color: challenge.color),
                    const SizedBox(height: 20),
                    FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Text(challenge.title(s.ru), style: heading(54)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              Container(width: 46, height: 2, color: challenge.color),
              const SizedBox(height: 24),
              Text(
                challenge.instruction(s.ru),
                style: const TextStyle(fontSize: 18, height: 1.7, color: white),
              ),
              const SizedBox(height: 26),
              if (challenge.key == 'chaos')
                Panel(
                  accent: challenge.color,
                  child: Text(
                    restrictions[app.session.chaosRestriction],
                    style: const TextStyle(color: white, fontSize: 18),
                  ),
                ),
              if (challenge.key == 'clues')
                Panel(
                  accent: challenge.color,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        s.t(
                          'CLUES REVEALED / $clues OF 3',
                          'ОТКРЫТО ПОДСКАЗОК / $clues ИЗ 3',
                        ),
                        style: label(color: gold),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        s.t(
                          'Character-specific clues are not available in this phase.',
                          'Подсказки о героях недоступны в этой версии.',
                        ),
                      ),
                      const SizedBox(height: 14),
                      ActionButton(
                        s.t('REVEAL NEXT SLOT', 'ОТКРЫТЬ СЛОТ'),
                        compact: true,
                        onPressed: clues >= 3
                            ? null
                            : () => setState(() => clues++),
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 28),
              Text(app.session.champion!.label, style: label(color: muted)),
              const SizedBox(height: 26),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  ActionButton(
                    s.t(
                      !started
                          ? 'START'
                          : paused
                          ? 'RESUME'
                          : 'PAUSE',
                      !started
                          ? 'НАЧАТЬ'
                          : paused
                          ? 'ПРОДОЛЖИТЬ'
                          : 'ПАУЗА',
                    ),
                    primary: true,
                    icon: clock.isRunning ? Icons.pause : Icons.play_arrow,
                    onPressed: toggle,
                  ),
                  if (!s.stream || s.overlays) ...[
                    ActionButton(
                      s.t('SKIP', 'ПРОПУСТИТЬ'),
                      onPressed: () => finish(false),
                    ),
                    ActionButton(
                      s.t('FINISH', 'ГОТОВО'),
                      icon: Icons.check,
                      onPressed: started ? () => finish(true) : null,
                    ),
                  ],
                ],
              ),
              if (s.stream && !s.overlays)
                Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: PopupMenuButton<String>(
                    tooltip: s.t('Host controls', 'Управление ведущего'),
                    onSelected: (v) => finish(v == 'finish'),
                    itemBuilder: (_) => [
                      PopupMenuItem(
                        value: 'finish',
                        enabled: started,
                        child: Text(
                          s.t('Finish successfully', 'Завершить успешно'),
                        ),
                      ),
                      PopupMenuItem(
                        value: 'skip',
                        child: Text(s.t('Skip round', 'Пропустить раунд')),
                      ),
                    ],
                    child: Text(
                      s.t('HOST CONTROLS  ···', 'УПРАВЛЕНИЕ ВЕДУЩЕГО  ···'),
                      style: label(size: 9),
                    ),
                  ),
                ),
            ],
          );
          final countdown = Column(
            children: [
              SizedBox(
                width: 270,
                height: 270,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    SizedBox.expand(
                      child: TweenAnimationBuilder<double>(
                        tween: Tween(end: remaining / total),
                        duration: Duration(milliseconds: app.motion ? 350 : 0),
                        builder: (context, value, _) =>
                            CircularProgressIndicator(
                              value: value,
                              strokeWidth: 3,
                              color: color,
                              backgroundColor: graphite,
                            ),
                      ),
                    ),
                    Container(
                      width: 240,
                      height: 240,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: RadialGradient(
                          colors: [
                            color.withValues(alpha: .08),
                            Colors.transparent,
                          ],
                        ),
                      ),
                    ),
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          remaining.toString().padLeft(2, '0'),
                          style: heading(100, color: color),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          s.t(
                            paused
                                ? 'PAUSED'
                                : !started
                                ? 'READY WHEN YOU ARE'
                                : 'SECONDS REMAINING',
                            paused
                                ? 'ПАУЗА'
                                : !started
                                ? 'ГОТОВЫ К СТАРТУ'
                                : 'СЕКУНД ОСТАЛОСЬ',
                          ),
                          style: label(size: 8),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 30),
              if (!s.stream || !wide)
                SizedBox(
                  height: 310,
                  width: 230,
                  child: ChampionStage(
                    ru: app.settings.ru,
                    champion: app.session.champion!.label,
                    animate: app.motion,
                    compact: true,
                    accent: challenge.color,
                  ),
                ),
            ],
          );
          if (wide && s.stream) {
            return Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(flex: 4, child: content),
                const SizedBox(width: 24),
                Expanded(
                  flex: 5,
                  child: SizedBox(
                    height: 570,
                    child: ChampionStage(
                      ru: s.ru,
                      champion: app.session.champion!.label,
                      animate: app.motion,
                      selected: true,
                      accent: challenge.color,
                    ),
                  ),
                ),
                const SizedBox(width: 24),
                Expanded(
                  flex: 3,
                  child: FittedBox(fit: BoxFit.scaleDown, child: countdown),
                ),
              ],
            );
          }
          return wide
              ? Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(flex: 6, child: content),
                    const SizedBox(width: 70),
                    Expanded(flex: 4, child: countdown),
                  ],
                )
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    content,
                    const SizedBox(height: 40),
                    Center(child: countdown),
                  ],
                );
        },
      ),
    );
  }
}
