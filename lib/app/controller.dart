import 'package:flutter/foundation.dart';

import '../core/settings.dart';
import '../domain/game.dart';

class AppController extends ChangeNotifier {
  final AppSettings settings;
  final GameSession session = GameSession();
  Stopwatch Function() createClock = Stopwatch.new;
  VoidCallback? pauseChallenge;
  final RouletteSelector roulette = RouletteSelector(
    PlaceholderCharacterRepository(),
  );
  final ChallengeEngine engine = ChallengeEngine();
  AppPage page = AppPage.splash, settingsReturn = AppPage.menu;
  bool active = true;
  AppController(this.settings);
  void go(AppPage target) {
    page = target;
    notifyListeners();
  }

  void startSession() {
    session.reset();
    go(AppPage.roulette);
  }

  void select(Champion champion) {
    session.champion = champion;
    session.challenge = engine.generate(settings.mode);
    session.chaosRestriction = engine.restriction();
    notifyListeners();
  }

  void complete(bool success, int remaining) {
    session.history.add(
      RoundRecord(session.champion!, session.challenge!, success, remaining),
    );
    go(AppPage.result);
  }

  void next() {
    session.next(settings.players);
    go(AppPage.roulette);
  }

  void retry() {
    if (session.history.isNotEmpty) session.history.removeLast();
    go(AppPage.challenge);
  }

  bool get finished => settings.rounds != 0 && session.round >= settings.rounds;
  bool get motion =>
      !settings.reducedMotion && settings.intensity > 0 && active;
  void setActive(bool value) {
    active = value;
    notifyListeners();
  }
}
