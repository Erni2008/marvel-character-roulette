import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../domain/game.dart';

class AppSettings extends ChangeNotifier {
  final SharedPreferences preferences;
  AppSettings(this.preferences) {
    _read();
  }
  int players = 4, duration = 45, rounds = 10;
  GameMode mode = GameMode.party;
  Difficulty difficulty = Difficulty.normal;
  String language = 'en', windowMode = 'windowed', resolution = '1920 × 1080';
  double scale = 1,
      intensity = 0.65,
      master = .8,
      music = .5,
      effects = .8,
      safeMargin = 3;
  bool reducedMotion = false,
      highContrast = false,
      largerText = false,
      stream = false,
      overlays = true;
  String? persistenceError;
  bool get ru => language == 'ru';
  String t(String en, String ru) => this.ru ? ru : en;
  void _read() {
    try {
      final raw = preferences.getString('settings.v1');
      if (raw == null) return;
      final m = jsonDecode(raw) as Map<String, dynamic>;
      int bounded(String k, int d, int min, int max) =>
          ((m[k] as num?)?.toInt() ?? d).clamp(min, max);
      double number(String k, double d, double min, double max) =>
          ((m[k] as num?)?.toDouble() ?? d).clamp(min, max);
      players = bounded('players', 4, 1, 10);
      duration = [15, 30, 45, 60, 90].contains(m['duration'])
          ? m['duration'] as int
          : 45;
      rounds = [0, 5, 10, 15, 20].contains(m['rounds'])
          ? m['rounds'] as int
          : 10;
      mode = GameMode.values[bounded('mode', 0, 0, 2)];
      difficulty = Difficulty.values[bounded('difficulty', 1, 0, 3)];
      language = m['language'] == 'ru' ? 'ru' : 'en';
      windowMode =
          ['windowed', 'fullscreen', 'borderless'].contains(m['windowMode'])
          ? m['windowMode'] as String
          : 'windowed';
      resolution =
          ['1280 × 720', '1920 × 1080', '2560 × 1440'].contains(m['resolution'])
          ? m['resolution'] as String
          : '1920 × 1080';
      scale = number('scale', 1, .85, 1.2);
      intensity = number('intensity', .65, 0, 1);
      master = number('master', .8, 0, 1);
      music = number('music', .5, 0, 1);
      effects = number('effects', .8, 0, 1);
      safeMargin = number('safeMargin', 3, 0, 8);
      reducedMotion = m['reducedMotion'] == true;
      highContrast = m['highContrast'] == true;
      largerText = m['largerText'] == true;
      stream = m['stream'] == true;
      overlays = m['overlays'] != false;
    } catch (_) {
      persistenceError = 'Saved settings could not be read. Defaults restored.';
    }
  }

  Future<void> update(VoidCallback change) async {
    change();
    notifyListeners();
    final data = jsonEncode({
      'players': players,
      'duration': duration,
      'rounds': rounds,
      'mode': mode.index,
      'difficulty': difficulty.index,
      'language': language,
      'windowMode': windowMode,
      'resolution': resolution,
      'scale': scale,
      'intensity': intensity,
      'master': master,
      'music': music,
      'effects': effects,
      'safeMargin': safeMargin,
      'reducedMotion': reducedMotion,
      'highContrast': highContrast,
      'largerText': largerText,
      'stream': stream,
      'overlays': overlays,
    });
    try {
      final ok = await preferences.setString('settings.v1', data);
      if (!ok) throw StateError('write failed');
      persistenceError = null;
    } catch (_) {
      persistenceError = 'Settings could not be saved.';
      notifyListeners();
    }
  }
}
