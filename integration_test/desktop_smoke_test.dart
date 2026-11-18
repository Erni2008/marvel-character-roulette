import 'dart:io';
import 'dart:ui' as ui;

import 'package:material_ui/material_ui.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:marvel_character_roulette/app/application.dart';
import 'package:marvel_character_roulette/core/settings.dart';
import 'package:marvel_character_roulette/domain/game.dart';
import 'package:marvel_character_roulette/services/desktop.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  testWidgets(
    'Native macOS game flow, persisted settings and presentation rendering',
    (tester) async {
      final prefs = await SharedPreferences.getInstance();
      final original = prefs.getString('settings.v1');
      final s = AppSettings(prefs);
      s.language = 'en';
      s.reducedMotion = true;
      s.stream = false;
      s.overlays = true;
      s.scale = 1;
      s.largerText = false;
      final key = GlobalKey();
      await DesktopService.initialize();
      await tester.pumpWidget(
        RepaintBoundary(
          key: key,
          child: RouletteApp(settings: s),
        ),
      );
      await tester.pumpAndSettle(const Duration(milliseconds: 100));
      await tester.pump(const Duration(milliseconds: 2300));
      await tester.pumpAndSettle();
      Future<void> capture(String name) async {
        await tester.pump();
        final boundary =
            key.currentContext!.findRenderObject() as RenderRepaintBoundary;
        final image = await boundary.toImage(pixelRatio: 1);
        final data = await image.toByteData(format: ui.ImageByteFormat.png);
        final file = File('${Directory.systemTemp.path}/roulette-$name.png');
        await file.writeAsBytes(data!.buffer.asUint8List());
        image.dispose();
        // The native sandbox's temporary directory is intentionally used for QA artifacts.
        debugPrint('VISUAL_QA: ${file.path}');
      }

      try {
        expect(find.text('START GAME'), findsOneWidget);
        await capture('menu');
        await tester.tap(find.text('START GAME'));
        await tester.pumpAndSettle();
        await capture('setup');
        await tester.ensureVisible(find.text('CONTINUE'));
        await tester.tap(find.text('CONTINUE'));
        await tester.pumpAndSettle();
        await tester.ensureVisible(find.text('SPIN'));
        await s.update(() => s.reducedMotion = false);
        await tester.tap(find.text('SPIN'));
        await tester.pump(const Duration(milliseconds: 4500));
        await s.update(() => s.reducedMotion = true);
        await tester.pumpAndSettle();
        expect(find.text('CHAMPION SELECTED'), findsOneWidget);
        await capture('roulette');
        await tester.tap(find.text('START CHALLENGE'));
        await tester.pumpAndSettle();
        await tester.ensureVisible(find.text('START'));
        await tester.tap(find.text('START'));
        await tester.pump(const Duration(milliseconds: 1200));
        await tester.tap(find.text('PAUSE'));
        await tester.pumpAndSettle();
        expect(find.text('PAUSED'), findsOneWidget);
        await capture('challenge');
        await tester.tap(find.text('RESUME'));
        await tester.pump();
        await tester.tap(find.text('FINISH'));
        await tester.pumpAndSettle();
        expect(find.text('SUCCESS'), findsOneWidget);
        await capture('result');
        final app = tester.widget<GameShell>(find.byType(GameShell)).app;
        await s.update(() {
          s.language = 'ru';
          s.stream = true;
          s.overlays = false;
        });
        final reloaded = AppSettings(await SharedPreferences.getInstance());
        expect(reloaded.ru, true);
        expect(reloaded.stream, true);
        app.next();
        await tester.pumpAndSettle();
        await capture('stream-ru');
        app.select(const Champion(78));
        app.go(AppPage.challenge);
        await tester.pumpAndSettle();
        await capture('stream-challenge-ru');
        app.settingsReturn = AppPage.menu;
        app.go(AppPage.settings);
        await tester.pumpAndSettle();
        await capture('settings-ru');
        expect(tester.takeException(), isNull);
      } finally {
        if (original == null) {
          await prefs.remove('settings.v1');
        } else {
          await prefs.setString('settings.v1', original);
        }
      }
    },
  );
}
