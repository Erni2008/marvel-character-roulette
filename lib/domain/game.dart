import 'dart:math';

import 'package:material_ui/material_ui.dart';

enum GameMode { party, knowledge, chaos }

enum Difficulty { easy, normal, hard, expert }

enum AppPage { splash, menu, setup, roulette, challenge, result, settings }

class Champion {
  final int id;
  const Champion(this.id);
  String get label => 'CHAMPION_${id.toString().padLeft(3, '0')}';
}

abstract interface class CharacterRepository {
  List<Champion> get champions;
}

class PlaceholderCharacterRepository implements CharacterRepository {
  @override
  final List<Champion> champions = List.unmodifiable(
    List.generate(120, (i) => Champion(i + 1)),
  );
}

/// Selection is independent of the animation and rendering pipeline.
class RouletteSelector {
  final CharacterRepository repository;
  final Random random;
  RouletteSelector(this.repository, {Random? random})
    : random = random ?? Random();
  Champion select({Champion? excluding}) {
    final pool = repository.champions
        .where((c) => c.id != excluding?.id)
        .toList();
    if (pool.isEmpty) return repository.champions.first;
    return pool[random.nextInt(pool.length)];
  }
}

class ChallengeDefinition {
  final String key, en, ru, instructionEn, instructionRu;
  final IconData icon;
  final Color color;
  const ChallengeDefinition(
    this.key,
    this.en,
    this.ru,
    this.instructionEn,
    this.instructionRu,
    this.icon,
    this.color,
  );
  String title(bool ru) => ru ? this.ru : en;
  String instruction(bool ru) => ru ? instructionRu : instructionEn;
}

const challenges = [
  ChallengeDefinition(
    'taboo',
    'TABOO',
    'ТАБУ',
    'Explain the champion without saying the forbidden words.\nCharacter-specific words will arrive with the champion database.',
    'Объясните героя, не используя запрещённые слова.\nСлова появятся вместе с базой героев.',
    Icons.voice_over_off_outlined,
    Color(0xFFFF5269),
  ),
  ChallengeDefinition(
    'mime',
    'MIME',
    'ПАНТОМИМА',
    'No words. No sounds. Use gestures only to bring your champion to life.',
    'Ни слов, ни звуков. Покажите своего героя только жестами.',
    Icons.accessibility_new_rounded,
    Color(0xFF91B6FF),
  ),
  ChallengeDefinition(
    'clues',
    'THREE CLUES',
    'ТРИ ПОДСКАЗКИ',
    'Reveal one clue at a time.\nChampion clues are reserved for the future database.',
    'Открывайте по одной подсказке.\nПодсказки появятся вместе с базой героев.',
    Icons.filter_3_outlined,
    Color(0xFFF6C667),
  ),
  ChallengeDefinition(
    'word',
    'ONE WORD',
    'ОДНО СЛОВО',
    'One champion. Exactly one word. Make it count.',
    'Один герой. Ровно одно слово. Выбирайте внимательно.',
    Icons.short_text_rounded,
    Color(0xFF9EDACD),
  ),
  ChallengeDefinition(
    'reverse',
    'REVERSE GUESS',
    'УГАДАЙ СЕБЯ',
    'Ask yes/no questions to discover your champion. Turn away from the stage before starting.',
    'Задавайте вопросы с ответом «да» или «нет». Перед началом отвернитесь от экрана.',
    Icons.swap_horiz_rounded,
    Color(0xFFB7A3EE),
  ),
  ChallengeDefinition(
    'roleplay',
    'ROLEPLAY',
    'В РОЛИ ГЕРОЯ',
    'Become the champion. Act and speak in character while the others guess.',
    'Станьте героем. Играйте и говорите от его лица, пока остальные угадывают.',
    Icons.theater_comedy_outlined,
    Color(0xFFF3AB7E),
  ),
  ChallengeDefinition(
    'speed',
    'SPEED GUESS',
    'БЛИЦ',
    'Five seconds. One chance. Help your team guess before time runs out.',
    'Пять секунд. Один шанс. Помогите команде угадать до конца отсчёта.',
    Icons.bolt_rounded,
    Color(0xFFFFD774),
  ),
  ChallengeDefinition(
    'chaos',
    'RANDOM CHAOS',
    'СЛУЧАЙНЫЙ ХАОС',
    'A new restriction changes the rules of this round.',
    'Новое ограничение меняет правила этого раунда.',
    Icons.shuffle_rounded,
    Color(0xFFD7A0E8),
  ),
];

class ChallengeEngine {
  final Random random;
  ChallengeEngine({Random? random}) : random = random ?? Random();
  ChallengeDefinition generate(GameMode mode) {
    final pool = switch (mode) {
      GameMode.party => [0, 1, 3, 4, 5, 6],
      GameMode.knowledge => [0, 2, 3, 4, 6],
      GameMode.chaos => List.generate(8, (i) => i),
    };
    return challenges[pool[random.nextInt(pool.length)]];
  }

  int restriction() => random.nextInt(4);
}

class RoundRecord {
  final Champion champion;
  final ChallengeDefinition challenge;
  final bool success;
  final int remaining;
  const RoundRecord(
    this.champion,
    this.challenge,
    this.success,
    this.remaining,
  );
  int get score => success ? 100 + remaining * 5 : 0;
}

class GameSession {
  int round = 1;
  int player = 1;
  final List<RoundRecord> history = [];
  Champion? champion;
  ChallengeDefinition? challenge;
  int chaosRestriction = 0;
  void reset() {
    round = 1;
    player = 1;
    history.clear();
    champion = null;
    challenge = null;
  }

  int get score => history.fold(0, (sum, r) => sum + r.score);
  void next(int players) {
    round++;
    player = (player % players) + 1;
    champion = null;
    challenge = null;
  }
}
