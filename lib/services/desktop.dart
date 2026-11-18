import 'dart:io';

import 'package:material_ui/material_ui.dart';
import 'package:window_manager/window_manager.dart';

import '../core/settings.dart';

class DesktopService {
  static bool get supported =>
      Platform.isMacOS || Platform.isWindows || Platform.isLinux;
  static Future<void> initialize({AppSettings? settings}) async {
    if (!supported) return;
    await windowManager.ensureInitialized();
    final parts = settings?.resolution.split(' × ');
    final preferred =
        settings != null &&
            settings.preferences.containsKey('settings.v1') &&
            parts != null
        ? Size(double.parse(parts[0]), double.parse(parts[1]))
        : const Size(1440, 900);
    await windowManager.waitUntilReadyToShow(
      WindowOptions(
        size: preferred,
        minimumSize: const Size(800, 600),
        center: true,
        title: 'Marvel Character Roulette',
        backgroundColor: Color(0xFF080A10),
      ),
      () async {
        await windowManager.show();
        await windowManager.focus();
      },
    );
  }

  static Future<void> apply(AppSettings s) async {
    if (!supported) return;
    await windowManager.setFullScreen(false);
    await windowManager.setTitleBarStyle(TitleBarStyle.normal);
    if (s.windowMode == 'fullscreen') {
      await windowManager.setFullScreen(true);
    } else if (s.windowMode == 'borderless') {
      if (Platform.isWindows) {
        await windowManager.setAsFrameless();
      } else {
        await windowManager.setTitleBarStyle(TitleBarStyle.hidden);
      }
      await windowManager.setFullScreen(true);
    } else {
      final parts = s.resolution.split(' × ');
      await windowManager.setSize(
        Size(double.parse(parts[0]), double.parse(parts[1])),
      );
      await windowManager.center();
    }
  }

  static Future<void> close() async {
    if (supported) await windowManager.close();
  }
}
