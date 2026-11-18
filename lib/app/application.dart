import 'package:material_ui/material_ui.dart';
import 'package:flutter/services.dart';

import '../core/settings.dart';
import '../domain/game.dart';
import '../ui/design.dart';
import '../ui/screens/menu.dart';
import '../ui/screens/setup.dart';
import '../ui/screens/roulette.dart';
import '../ui/screens/challenge.dart';
import '../ui/screens/result.dart';
import '../ui/screens/settings_screen.dart';
import 'controller.dart';

class RouletteApp extends StatefulWidget {
  final AppSettings settings;
  const RouletteApp({super.key, required this.settings});
  @override
  State<RouletteApp> createState() => _RouletteAppState();
}

class _RouletteAppState extends State<RouletteApp> with WidgetsBindingObserver {
  late final AppController app = AppController(widget.settings);
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) =>
      app.setActive(state == AppLifecycleState.resumed);
  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    app.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => ListenableBuilder(
    listenable: Listenable.merge([app, widget.settings]),
    builder: (context, _) => MaterialApp(
      title: 'Marvel Character Roulette',
      debugShowCheckedModeBanner: false,
      theme: appTheme(widget.settings.highContrast),
      locale: Locale(widget.settings.language),
      localizationsDelegates: GlobalMaterialLocalizations.delegates,
      supportedLocales: const [Locale('en'), Locale('ru')],
      builder: (context, child) => MediaQuery(
        data: MediaQuery.of(context).copyWith(
          textScaler: TextScaler.linear(
            widget.settings.scale * (widget.settings.largerText ? 1.15 : 1),
          ),
        ),
        child: child!,
      ),
      home: GameShell(app: app),
    ),
  );
}

class BackIntent extends Intent {
  const BackIntent();
}

class GameShell extends StatelessWidget {
  final AppController app;
  const GameShell({super.key, required this.app});
  void back(BuildContext context) {
    if (Navigator.of(context).canPop()) {
      Navigator.of(context).pop();
      return;
    }
    switch (app.page) {
      case AppPage.splash:
        app.go(AppPage.menu);
      case AppPage.menu:
        break;
      case AppPage.setup:
        app.go(AppPage.menu);
      case AppPage.settings:
        app.go(app.settingsReturn);
      default:
        app.pauseChallenge?.call();
        showDialog<void>(
          context: context,
          builder: (c) => AlertDialog(
            title: Text(
              app.settings.t('Leave this session?', 'Выйти из игры?'),
            ),
            content: Text(
              app.settings.t(
                'Your current session will end.',
                'Текущая игра завершится.',
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(c),
                child: Text(app.settings.t('KEEP PLAYING', 'ПРОДОЛЖИТЬ')),
              ),
              TextButton(
                onPressed: () {
                  Navigator.pop(c);
                  app.go(AppPage.menu);
                },
                child: Text(app.settings.t('MAIN MENU', 'ГЛАВНОЕ МЕНЮ')),
              ),
            ],
          ),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = app.settings;
    final playing = [
      AppPage.roulette,
      AppPage.challenge,
      AppPage.result,
    ].contains(app.page);
    final clean = s.stream && playing;
    return Shortcuts(
      shortcuts: const {
        SingleActivator(LogicalKeyboardKey.escape): BackIntent(),
      },
      child: Actions(
        actions: {
          BackIntent: CallbackAction<BackIntent>(
            onInvoke: (_) {
              back(context);
              return null;
            },
          ),
        },
        child: Focus(
          autofocus: true,
          child: Scaffold(
            body: AmbientBackground(
              animate: app.motion,
              intensity: s.intensity,
              child: SafeArea(
                child: Padding(
                  padding: EdgeInsets.all(
                    clean
                        ? MediaQuery.sizeOf(context).width * s.safeMargin / 100
                        : 0,
                  ),
                  child: Column(
                    children: [
                      if (app.page != AppPage.splash && (!clean || s.overlays))
                        Padding(
                          padding: EdgeInsets.symmetric(
                            horizontal: MediaQuery.sizeOf(context).width < 700
                                ? 20
                                : 40,
                            vertical: 20,
                          ),
                          child: Row(
                            children: [
                              if (app.page != AppPage.menu)
                                IconButton(
                                  tooltip: s.t('Back · Esc', 'Назад · Esc'),
                                  onPressed: () => back(context),
                                  icon: const Icon(Icons.arrow_back, size: 19),
                                ),
                              const Icon(
                                Icons.change_history_rounded,
                                color: red,
                                size: 25,
                              ),
                              const SizedBox(width: 10),
                              Text(
                                'CR /',
                                style: label(color: white, size: 15),
                              ),
                              if (MediaQuery.sizeOf(context).width > 1100) ...[
                                const SizedBox(width: 12),
                                Text(
                                  'CHARACTER ROULETTE',
                                  style: label(size: 10),
                                ),
                              ],
                              const Spacer(),
                              if (playing)
                                Flexible(
                                  child: FittedBox(
                                    fit: BoxFit.scaleDown,
                                    child: Text(
                                      s.t(
                                        'ROUND ${app.session.round.toString().padLeft(2, '0')}  /  PLAYER ${app.session.player}',
                                        'РАУНД ${app.session.round}  /  ИГРОК ${app.session.player}',
                                      ),
                                      style: label(size: 9),
                                    ),
                                  ),
                                ),
                              if (!playing &&
                                  MediaQuery.sizeOf(context).width > 1000)
                                Text(
                                  'MCOC  /  ${s.t('PARTY EXPERIENCE', 'ИГРА ДЛЯ КОМПАНИИ')}',
                                  style: label(size: 9),
                                ),
                            ],
                          ),
                        ),
                      Expanded(
                        child: AnimatedSwitcher(
                          duration: Duration(
                            milliseconds: app.motion ? 350 : 0,
                          ),
                          switchInCurve: Curves.easeOutCubic,
                          transitionBuilder: (child, a) => FadeTransition(
                            opacity: a,
                            child: SlideTransition(
                              position: Tween(
                                begin: const Offset(0, .025),
                                end: Offset.zero,
                              ).animate(a),
                              child: child,
                            ),
                          ),
                          child: KeyedSubtree(
                            key: ValueKey(app.page),
                            child: FocusScope(
                              child: switch (app.page) {
                                AppPage.splash => SplashScreen(app: app),
                                AppPage.menu => MenuScreen(app: app),
                                AppPage.setup => SetupScreen(app: app),
                                AppPage.roulette => RouletteScreen(app: app),
                                AppPage.challenge => ChallengeScreen(app: app),
                                AppPage.result => ResultScreen(app: app),
                                AppPage.settings => SettingsScreen(app: app),
                              },
                            ),
                          ),
                        ),
                      ),
                      if (s.persistenceError != null)
                        Text(
                          s.persistenceError!,
                          style: const TextStyle(color: gold),
                        ),
                      if (app.page != AppPage.splash && !clean)
                        Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 40,
                            vertical: 15,
                          ),
                          child: Row(
                            children: [
                              Container(width: 5, height: 5, color: gold),
                              const SizedBox(width: 9),
                              Expanded(
                                child: Text(
                                  s.t(
                                    'PHASE 01 / THE STAGE IS YOURS',
                                    'ЭТАП 01 / СЦЕНА ВАША',
                                  ),
                                  style: label(size: 8),
                                ),
                              ),
                              Text(
                                s.t(
                                  MediaQuery.sizeOf(context).width > 600
                                      ? 'DESKTOP EXPERIENCE  •  V1.0'
                                      : 'V1.0',
                                  MediaQuery.sizeOf(context).width > 600
                                      ? 'НАСТОЛЬНАЯ ВЕРСИЯ  •  V1.0'
                                      : 'V1.0',
                                ),
                                style: label(size: 8),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
