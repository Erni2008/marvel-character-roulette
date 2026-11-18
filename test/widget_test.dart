import 'dart:math';

import 'package:material_ui/material_ui.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:marvel_character_roulette/app/application.dart';
import 'package:marvel_character_roulette/app/controller.dart';
import 'package:marvel_character_roulette/core/settings.dart';
import 'package:marvel_character_roulette/domain/game.dart';
import 'package:marvel_character_roulette/ui/design.dart';

Future<AppSettings> settings() async {
  SharedPreferences.setMockInitialValues({});
  final s = AppSettings(await SharedPreferences.getInstance());
  s.reducedMotion = true;
  return s;
}

void main() {
  test(
    'Selection excludes the previous champion and stays in the repository',
    () {
      final selector = RouletteSelector(
        PlaceholderCharacterRepository(),
        random: Random(42),
      );
      Champion previous = const Champion(1);
      for (int i = 0; i < 500; i++) {
        final next = selector.select(excluding: previous);
        expect(next.id, inInclusiveRange(1, 120));
        expect(next.id, isNot(previous.id));
        previous = next;
      }
    },
  );
  test('All eight challenges can be generated in chaos mode', () {
    final engine = ChallengeEngine(random: Random(8));
    final keys = List.generate(
      500,
      (_) => engine.generate(GameMode.chaos).key,
    ).toSet();
    expect(keys.length, 8);
  });
  test(
    'Settings round-trip and invalid saved data falls back safely',
    () async {
      final s = await settings();
      await s.update(() {
        s.players = 8;
        s.language = 'ru';
        s.stream = true;
        s.duration = 90;
        s.mode = GameMode.chaos;
      });
      final loaded = AppSettings(await SharedPreferences.getInstance());
      expect(loaded.players, 8);
      expect(loaded.ru, true);
      expect(loaded.stream, true);
      expect(loaded.duration, 90);
      expect(loaded.mode, GameMode.chaos);
      SharedPreferences.setMockInitialValues({'settings.v1': 'broken'});
      final corrupted = AppSettings(await SharedPreferences.getInstance());
      expect(corrupted.players, 4);
      expect(corrupted.persistenceError, isNotNull);
    },
  );
  testWidgets(
    'Complete desktop flow: setup, spin, pause, success, retry and timeout',
    (tester) async {
      tester.view.physicalSize = const Size(1440, 1000);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      final s = await settings();
      s.duration = 15;
      await tester.pumpWidget(RouletteApp(settings: s));
      await tester.pump(const Duration(milliseconds: 2200));
      await tester.pump();
      await tester.tap(find.text('START GAME'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 400));
      await tester.ensureVisible(find.text('CONTINUE'));
      await tester.tap(find.text('CONTINUE'));
      await tester.pump();
      await tester.ensureVisible(find.text('SPIN'));
      await tester.tap(find.text('SPIN'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 900));
      await tester.pump();
      expect(find.text('CHAMPION SELECTED'), findsOneWidget);
      await tester.ensureVisible(find.text('START CHALLENGE'));
      await tester.tap(find.text('START CHALLENGE'));
      await tester.pump();
      await tester.ensureVisible(find.text('START'));
      await tester.tap(find.text('START'));
      await tester.pump(const Duration(seconds: 1));
      await tester.tap(find.text('PAUSE'));
      await tester.pump();
      expect(find.text('PAUSED'), findsOneWidget);
      await tester.tap(find.text('RESUME'));
      await tester.pump();
      await tester.tap(find.text('FINISH'));
      await tester.pump();
      expect(find.text('ROUND COMPLETE'), findsOneWidget);
      expect(find.text('SUCCESS'), findsOneWidget);
      final fakeClock = TestStopwatch();
      tester.widget<GameShell>(find.byType(GameShell)).app.createClock = () =>
          fakeClock;
      await tester.ensureVisible(find.text('RETRY'));
      await tester.tap(find.text('RETRY'));
      await tester.pump();
      await tester.ensureVisible(find.text('START'));
      await tester.tap(find.text('START'));
      fakeClock.seconds = 95;
      await tester.pump(const Duration(milliseconds: 200));
      await tester.pump();
      expect(find.text('FAILED'), findsOneWidget);
      expect(tester.takeException(), isNull);
      await tester.pumpWidget(const SizedBox.shrink());
    },
  );
  testWidgets('Keyboard activates the focused primary and secondary controls', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1440, 1000);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    final s = await settings();
    await tester.pumpWidget(RouletteApp(settings: s));
    await tester.pump(const Duration(milliseconds: 2300));
    await tester.pump();
    await tester.pump();
    Focus.of(tester.element(find.text('SETTINGS'))).requestFocus();
    await tester.pump();
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pump();
    await tester.pump();
    expect(find.text('MAKE IT YOURS'), findsOneWidget);
    await tester.sendKeyEvent(LogicalKeyboardKey.escape);
    await tester.pump();
    await tester.pump();
    expect(find.text('START GAME'), findsOneWidget);
    Focus.of(tester.element(find.text('START GAME'))).requestFocus();
    await tester.pump();
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pump();
    await tester.pump();
    expect(find.text('Choose your arena.'), findsOneWidget);
    Focus.of(tester.element(find.text('CONTINUE'))).requestFocus();
    await tester.pump();
    await tester.sendKeyEvent(LogicalKeyboardKey.space);
    await tester.pump();
    await tester.pump();
    expect(find.text('SPIN'), findsOneWidget);
    await tester.pumpWidget(const SizedBox.shrink());
  });
  testWidgets(
    'Every screen and challenge lays out in English and Russian at desktop and mobile sizes',
    (tester) async {
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetDevicePixelRatio);
      addTearDown(tester.view.resetPhysicalSize);
      final s = await settings();
      final app = AppController(s);
      app.select(const Champion(23));
      for (final size in [
        const Size(1440, 900),
        const Size(800, 600),
        const Size(390, 844),
        const Size(2560, 1440),
      ]) {
        tester.view.physicalSize = size;
        for (final ru in [false, true]) {
          s.language = ru ? 'ru' : 'en';
          for (final presentation in [0, 1, 2]) {
            s.stream = presentation > 0;
            s.overlays = presentation != 2;
            s.highContrast = presentation == 2;
            s.scale = presentation == 2 ? 1.2 : 1;
            s.largerText = presentation == 2;
            Widget host() => MaterialApp(
              theme: appTheme(s.highContrast),
              builder: (context, child) => MediaQuery(
                data: MediaQuery.of(context).copyWith(
                  textScaler: TextScaler.linear(
                    s.scale * (s.largerText ? 1.15 : 1),
                  ),
                ),
                child: child!,
              ),
              home: GameShell(key: UniqueKey(), app: app),
            );
            for (final page in [
              AppPage.menu,
              AppPage.setup,
              AppPage.roulette,
              AppPage.settings,
              AppPage.result,
            ]) {
              app.page = page;
              if (page == AppPage.result) {
                app.session.history.clear();
                app.session.history.add(
                  RoundRecord(const Champion(23), challenges.first, true, 12),
                );
              }
              await tester.pumpWidget(host());
              await tester.pump();
              expect(
                tester.takeException(),
                isNull,
                reason: '$page / $size / ru=$ru / presentation=$presentation',
              );
            }
            for (final challenge in challenges) {
              app.session.challenge = challenge;
              app.page = AppPage.challenge;
              await tester.pumpWidget(host());
              await tester.pump();
              expect(
                tester.takeException(),
                isNull,
                reason:
                    '${challenge.key} / $size / ru=$ru / presentation=$presentation',
              );
            }
          }
        }
      }
      await tester.pumpWidget(const SizedBox.shrink());
      app.dispose();
    },
  );
}

class TestStopwatch implements Stopwatch {
  int seconds = 0;
  bool running = false;
  @override
  Duration get elapsed => Duration(seconds: seconds);
  @override
  bool get isRunning => running;
  @override
  void start() => running = true;
  @override
  void stop() => running = false;
  @override
  void reset() => seconds = 0;
  @override
  int get elapsedMilliseconds => seconds * 1000;
  @override
  int get elapsedMicroseconds => seconds * 1000000;
  @override
  int get elapsedTicks => elapsedMicroseconds;
  @override
  int get frequency => 1000000;
}
