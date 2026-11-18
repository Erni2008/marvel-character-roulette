import 'package:material_ui/material_ui.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core/settings.dart';
import 'services/desktop.dart';
import 'app/application.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final settings = AppSettings(await SharedPreferences.getInstance());
  await DesktopService.initialize(settings: settings);
  runApp(RouletteApp(settings: settings));
  if (settings.windowMode != 'windowed') await DesktopService.apply(settings);
}
