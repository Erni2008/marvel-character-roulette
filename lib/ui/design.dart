import 'dart:math' as math;

import 'package:material_ui/material_ui.dart';

const ink = Color(0xFF080A10),
    navy = Color(0xFF111625),
    graphite = Color(0xFF242B3B),
    red = Color(0xFFFF3448),
    gold = Color(0xFFF6C667),
    white = Color(0xFFF4F5FA),
    muted = Color(0xFF939BAE);
TextStyle heading(double size, {Color color = white}) => TextStyle(
  fontFamily: 'RobotoCondensed',
  fontSize: size,
  height: .98,
  fontWeight: FontWeight.w900,
  letterSpacing: -size * .035,
  color: color,
);
TextStyle label({Color color = muted, double size = 11}) => TextStyle(
  fontSize: size,
  fontWeight: FontWeight.w700,
  letterSpacing: 2.3,
  color: color,
);
ThemeData appTheme(bool contrast) => ThemeData(
  useMaterial3: true,
  brightness: Brightness.dark,
  scaffoldBackgroundColor: ink,
  colorScheme: ColorScheme.dark(
    primary: red,
    secondary: gold,
    surface: navy,
    onSurface: white,
    outline: contrast ? white : graphite,
  ),
  fontFamily: 'Arial',
  textTheme: const TextTheme(
    bodyMedium: TextStyle(fontSize: 14, height: 1.55, color: muted),
    bodyLarge: TextStyle(fontSize: 16, height: 1.55, color: white),
  ),
  dividerColor: graphite,
  sliderTheme: const SliderThemeData(
    activeTrackColor: red,
    thumbColor: white,
    inactiveTrackColor: graphite,
  ),
  tooltipTheme: const TooltipThemeData(
    waitDuration: Duration(milliseconds: 500),
  ),
  inputDecorationTheme: const InputDecorationTheme(
    filled: true,
    fillColor: navy,
    border: OutlineInputBorder(
      borderSide: BorderSide(color: graphite),
      borderRadius: BorderRadius.zero,
    ),
  ),
);

class ActionButton extends StatefulWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool primary, compact;
  final IconData? icon;
  const ActionButton(
    this.text, {
    super.key,
    this.onPressed,
    this.primary = false,
    this.compact = false,
    this.icon,
  });
  @override
  State<ActionButton> createState() => _ActionButtonState();
}

class _ActionButtonState extends State<ActionButton> {
  bool hover = false, focus = false, pressed = false;
  @override
  Widget build(BuildContext context) => MouseRegion(
    cursor: widget.onPressed == null
        ? SystemMouseCursors.basic
        : SystemMouseCursors.click,
    onEnter: (_) => setState(() => hover = true),
    onExit: (_) => setState(() {
      hover = false;
      pressed = false;
    }),
    child: AnimatedScale(
      scale: pressed ? .97 : 1,
      duration: const Duration(milliseconds: 100),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        decoration: BoxDecoration(
          color: widget.primary
              ? (hover ? const Color(0xFFFF5363) : red)
              : (hover ? graphite : Colors.transparent),
          border: Border.all(
            color: focus
                ? gold
                : widget.primary
                ? red
                : graphite,
          ),
          boxShadow: widget.primary && hover
              ? [BoxShadow(color: red.withValues(alpha: .22), blurRadius: 24)]
              : [],
        ),
        child: Listener(
          onPointerDown: (_) => setState(() => pressed = true),
          onPointerUp: (_) => setState(() => pressed = false),
          child: TextButton(
            autofocus: widget.primary,
            onFocusChange: (v) => setState(() => focus = v),
            onPressed: widget.onPressed,
            style: TextButton.styleFrom(
              foregroundColor: widget.onPressed == null ? muted : white,
              padding: EdgeInsets.symmetric(
                horizontal: widget.compact ? 18 : 28,
                vertical: widget.compact ? 15 : 23,
              ),
              shape: const RoundedRectangleBorder(),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Flexible(
                  child: Text(
                    widget.text,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: widget.compact ? 11 : 13,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.8,
                    ),
                  ),
                ),
                if (widget.icon != null) ...[
                  const SizedBox(width: 25),
                  Icon(widget.icon, size: 18),
                ],
              ],
            ),
          ),
        ),
      ),
    ),
  );
}

class Panel extends StatelessWidget {
  final Widget child;
  final EdgeInsets padding;
  final Color? accent;
  const Panel({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(24),
    this.accent,
  });
  @override
  Widget build(BuildContext context) => Container(
    padding: padding,
    decoration: BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [navy.withValues(alpha: .94), ink.withValues(alpha: .85)],
      ),
      border: Border(
        top: BorderSide(
          color: accent ?? Theme.of(context).colorScheme.outline,
          width: accent != null ? 2 : 1,
        ),
        bottom: BorderSide(color: Theme.of(context).colorScheme.outline),
        left: BorderSide(color: Theme.of(context).colorScheme.outline),
        right: BorderSide(color: Theme.of(context).colorScheme.outline),
      ),
    ),
    child: child,
  );
}

class Eyebrow extends StatelessWidget {
  final String text;
  final Color color;
  const Eyebrow(this.text, {super.key, this.color = gold});
  @override
  Widget build(BuildContext context) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Container(width: 20, height: 2, color: color),
      const SizedBox(width: 10),
      Flexible(
        child: Text(text, style: label(color: color)),
      ),
    ],
  );
}

class SectionTitle extends StatelessWidget {
  final String index, title, description;
  const SectionTitle(this.index, this.title, this.description, {super.key});
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 24),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(index, style: label(color: gold, size: 12)),
        const SizedBox(width: 18),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: heading(20)),
              const SizedBox(height: 6),
              Text(description),
            ],
          ),
        ),
      ],
    ),
  );
}

class AmbientBackground extends StatefulWidget {
  final Widget child;
  final bool animate;
  final double intensity;
  const AmbientBackground({
    super.key,
    required this.child,
    required this.animate,
    this.intensity = .65,
  });
  @override
  State<AmbientBackground> createState() => _AmbientBackgroundState();
}

class _AmbientBackgroundState extends State<AmbientBackground>
    with SingleTickerProviderStateMixin {
  late final AnimationController controller = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 24),
  );
  @override
  void initState() {
    super.initState();
    if (widget.animate) controller.repeat();
  }

  @override
  void didUpdateWidget(AmbientBackground old) {
    super.didUpdateWidget(old);
    if (widget.animate && !controller.isAnimating) {
      controller.repeat();
    } else if (!widget.animate) {
      controller.stop();
    }
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Stack(
    children: [
      Positioned.fill(
        child: RepaintBoundary(
          child: CustomPaint(
            painter: AmbientPainter(controller, widget.intensity),
          ),
        ),
      ),
      widget.child,
    ],
  );
}

class AmbientPainter extends CustomPainter {
  final Animation<double> time;
  final double intensity;
  AmbientPainter(this.time, this.intensity) : super(repaint: time);
  @override
  void paint(Canvas c, Size s) {
    c.drawColor(ink, BlendMode.src);
    final p = Offset(
      s.width * (.78 + .04 * math.sin(time.value * math.pi * 2)),
      s.height * .35,
    );
    c.drawRect(
      Offset.zero & s,
      Paint()
        ..shader = RadialGradient(
          colors: [
            const Color(0xFF6C1E2C).withValues(alpha: .18 + intensity * .12),
            Colors.transparent,
          ],
        ).createShader(Rect.fromCircle(center: p, radius: s.width * .65)),
    );
    final blue = Offset(s.width * .15, s.height * .8);
    c.drawCircle(
      blue,
      s.width * .6,
      Paint()
        ..shader = RadialGradient(
          colors: [
            const Color(0xFF273B60).withValues(alpha: .22),
            Colors.transparent,
          ],
        ).createShader(Rect.fromCircle(center: blue, radius: s.width * .6)),
    );
    final line = Paint()
      ..color = white.withValues(alpha: .035)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    for (int i = 0; i < 6; i++) {
      final x = s.width * .42 + i * 180;
      c.drawLine(
        Offset(x, -100),
        Offset(x - s.height * .43, s.height + 100),
        line,
      );
    }
    c.drawPath(
      Path()
        ..moveTo(s.width * .64, 0)
        ..lineTo(s.width * .9, 0)
        ..lineTo(s.width * .5, s.height)
        ..lineTo(s.width * .24, s.height)
        ..close(),
      Paint()..color = white.withValues(alpha: .013),
    );
    for (double y = 0; y < s.height; y += 5) {
      c.drawLine(
        Offset(0, y),
        Offset(s.width, y),
        Paint()..color = Colors.black.withValues(alpha: .05),
      );
    }
  }

  @override
  bool shouldRepaint(AmbientPainter old) => old.intensity != intensity;
}

/// Programmatic silhouette and vertical stage. No character assets are used.
class ChampionStage extends StatefulWidget {
  final String? champion;
  final bool animate, selected, spinning, compact, camera;
  final Color accent;
  final bool ru;
  const ChampionStage({
    super.key,
    this.champion,
    this.animate = true,
    this.selected = false,
    this.spinning = false,
    this.compact = false,
    this.camera = false,
    this.accent = red,
    this.ru = false,
  });
  @override
  State<ChampionStage> createState() => _ChampionStageState();
}

class _ChampionStageState extends State<ChampionStage>
    with SingleTickerProviderStateMixin {
  late final AnimationController motion = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 12),
  );
  Offset pointer = Offset.zero;
  @override
  void initState() {
    super.initState();
    if (widget.animate) motion.repeat();
  }

  @override
  void didUpdateWidget(ChampionStage old) {
    super.didUpdateWidget(old);
    if (widget.animate && !motion.isAnimating) {
      motion.repeat();
    } else if (!widget.animate) {
      motion.stop();
    }
  }

  @override
  void dispose() {
    motion.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => LayoutBuilder(
    builder: (context, c) => MouseRegion(
      onHover: (e) {
        if (widget.animate && !widget.spinning) {
          setState(
            () => pointer = Offset(
              (e.localPosition.dx / c.maxWidth - .5) * 5,
              (e.localPosition.dy / c.maxHeight - .5) * 3,
            ),
          );
        }
      },
      onExit: (_) => setState(() => pointer = Offset.zero),
      child: Stack(
        children: [
          Positioned.fill(
            child: RepaintBoundary(
              child: AnimatedBuilder(
                animation: motion,
                builder: (context, _) => Transform.translate(
                  offset: pointer,
                  child: CustomPaint(
                    painter: StagePainter(
                      motion.value,
                      widget.accent,
                      widget.selected,
                      widget.spinning,
                    ),
                  ),
                ),
              ),
            ),
          ),
          if (!widget.compact)
            Positioned(
              left: 20,
              top: 18,
              child: Text(
                widget.camera
                    ? (widget.ru
                          ? 'КОМПОЗИЦИЯ / ПРЕВЬЮ'
                          : 'COMPOSITION / PREVIEW')
                    : (widget.ru
                          ? 'АРХИВ / ${widget.champion == null ? 'НЕДОСТУПЕН' : 'ЗАГЛУШКА'}'
                          : 'ARCHIVE / ${widget.champion == null ? 'OFFLINE' : 'PLACEHOLDER'}'),
                style: label(size: 9),
              ),
            ),
          Positioned(
            bottom: widget.compact ? 12 : 28,
            left: 10,
            right: 10,
            child: Column(
              children: [
                Text(
                  widget.champion ??
                      (widget.ru ? 'БАЗА ГЕРОЕВ' : 'CHAMPION DATABASE'),
                  textAlign: TextAlign.center,
                  style: label(
                    color: widget.selected ? gold : white,
                    size: widget.compact ? 10 : 14,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  widget.camera
                      ? (widget.ru
                            ? 'КАМЕРА · НЕ ПОДКЛЮЧЕНА'
                            : 'CAMERA PREVIEW · NOT CONNECTED')
                      : widget.champion == null
                      ? (widget.ru ? 'СКОРО' : 'COMING SOON')
                      : (widget.ru
                            ? '${widget.selected ? 'ВЫБРАН' : 'ОЖИДАНИЕ ВЫБОРА'} / БЕЗ ИЗОБРАЖЕНИЯ'
                            : '${widget.selected ? 'SELECTED' : 'AWAITING SELECTION'} / NO CHARACTER ASSET'),
                  textAlign: TextAlign.center,
                  style: label(size: 8),
                ),
              ],
            ),
          ),
          if (!widget.compact)
            Positioned(
              right: 18,
              top: 18,
              child: Icon(
                widget.camera ? Icons.videocam_off_outlined : Icons.crop_free,
                size: 18,
                color: muted,
              ),
            ),
        ],
      ),
    ),
  );
}

class StagePainter extends CustomPainter {
  final double t;
  final Color accent;
  final bool selected, spinning;
  StagePainter(this.t, this.accent, this.selected, this.spinning);
  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width, h = size.height;
    final c = Offset(w / 2, h * .46);
    final unit = math.min(w / 1.4, h / 1.75);
    final a = selected ? gold : accent;
    canvas.drawRect(
      Offset.zero & size,
      Paint()
        ..shader = RadialGradient(
          colors: [
            a.withValues(alpha: .12),
            navy.withValues(alpha: .25),
            Colors.transparent,
          ],
        ).createShader(Rect.fromCircle(center: c, radius: h * .6)),
    );
    final frame = Paint()
      ..style = PaintingStyle.stroke
      ..color = graphite
      ..strokeWidth = 1;
    final frameWidth = math.min(w * .76, h * .68);
    final r = Rect.fromLTWH((w - frameWidth) / 2, 8, frameWidth, h - 16);
    canvas.drawRect(r, frame);
    for (final x in [r.left, r.right]) {
      for (final y in [r.top, r.bottom]) {
        final dx = x == r.left ? 1.0 : -1.0, dy = y == r.top ? 1.0 : -1.0;
        canvas.drawPath(
          Path()
            ..moveTo(x, y + 24 * dy)
            ..lineTo(x, y)
            ..lineTo(x + 24 * dx, y),
          Paint()
            ..color = a.withValues(alpha: .8)
            ..style = PaintingStyle.stroke
            ..strokeWidth = 2,
        );
      }
    }
    canvas.save();
    canvas.translate(c.dx, c.dy);
    canvas.rotate((t * 2 * math.pi) * .12);
    for (int i = 0; i < 2; i++) {
      final radius = unit * (.59 + i * .09);
      final path = Path();
      for (int j = 0; j < 6; j++) {
        final p = Offset(
          math.cos(j * math.pi / 3) * radius,
          math.sin(j * math.pi / 3) * radius,
        );
        if (j == 0) {
          path.moveTo(p.dx, p.dy);
        } else {
          path.lineTo(p.dx, p.dy);
        }
      }
      path.close();
      canvas.drawPath(
        path,
        Paint()
          ..color = a.withValues(alpha: i == 0 ? .14 : .06)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1,
      );
    }
    canvas.restore();
    canvas.drawOval(
      Rect.fromCenter(
        center: Offset(w / 2, h * .83),
        width: unit * .92,
        height: unit * .12,
      ),
      Paint()
        ..shader =
            RadialGradient(
              colors: [a.withValues(alpha: .24), Colors.transparent],
            ).createShader(
              Rect.fromCenter(
                center: Offset(w / 2, h * .83),
                width: unit,
                height: unit * .2,
              ),
            ),
    );
    canvas.save();
    canvas.translate(w / 2, h * .16);
    canvas.scale(unit / 250);
    final body = Path()
      ..moveTo(-22, 49)
      ..lineTo(-48, 57)
      ..lineTo(-68, 88)
      ..lineTo(-81, 151)
      ..lineTo(-68, 160)
      ..lineTo(-51, 112)
      ..lineTo(-43, 98)
      ..lineTo(-36, 154)
      ..lineTo(-41, 198)
      ..lineTo(-32, 267)
      ..lineTo(-42, 294)
      ..lineTo(-13, 294)
      ..lineTo(-6, 225)
      ..lineTo(0, 185)
      ..lineTo(6, 225)
      ..lineTo(13, 294)
      ..lineTo(42, 294)
      ..lineTo(32, 267)
      ..lineTo(41, 198)
      ..lineTo(36, 154)
      ..lineTo(43, 98)
      ..lineTo(51, 112)
      ..lineTo(68, 160)
      ..lineTo(81, 151)
      ..lineTo(68, 88)
      ..lineTo(48, 57)
      ..lineTo(22, 49)
      ..lineTo(16, 38)
      ..lineTo(-16, 38)
      ..close();
    final shader = LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [
        const Color(0xFF394254),
        const Color(0xFF151B29),
        const Color(0xFF252C3B),
      ],
    ).createShader(const Rect.fromLTWH(-80, 0, 160, 300));
    canvas.drawPath(body, Paint()..shader = shader);
    canvas.drawPath(
      body,
      Paint()
        ..color = a.withValues(alpha: .28)
        ..style = PaintingStyle.stroke
        ..strokeWidth = .8,
    );
    canvas.drawOval(
      const Rect.fromLTWH(-23, -9, 46, 56),
      Paint()..shader = shader,
    );
    canvas.drawOval(
      const Rect.fromLTWH(-23, -9, 46, 56),
      Paint()
        ..color = white.withValues(alpha: .18)
        ..style = PaintingStyle.stroke
        ..strokeWidth = .8,
    );
    canvas.drawPath(
      Path()
        ..moveTo(-35, 78)
        ..lineTo(0, 98)
        ..lineTo(35, 78)
        ..moveTo(0, 98)
        ..lineTo(0, 155),
      Paint()
        ..color = white.withValues(alpha: .08)
        ..style = PaintingStyle.stroke,
    );
    canvas.restore();
    final sweep = (t * 3 % 1) * h;
    canvas.drawRect(
      Rect.fromLTWH(r.left, sweep, r.width, 1.2),
      Paint()..color = a.withValues(alpha: spinning ? .55 : .18),
    );
    for (int i = 0; i < 12; i++) {
      double y = h * .2 + i * h * .045;
      canvas.drawLine(
        Offset(r.left, y),
        Offset(r.left + (i % 3 == 0 ? 10 : 4), y),
        Paint()..color = muted.withValues(alpha: .3),
      );
    }
  }

  @override
  bool shouldRepaint(StagePainter old) =>
      old.t != t ||
      old.accent != accent ||
      old.selected != selected ||
      old.spinning != spinning;
}
