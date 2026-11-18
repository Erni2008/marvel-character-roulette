import 'package:flutter/animation.dart';

/// A short acceleration ramp joins a cubic coast without a velocity discontinuity.
/// This curve controls presentation only; the winner is chosen before the spin.
class RouletteCurve extends Curve {
  const RouletteCurve();
  @override
  double transformInternal(double t) {
    const ramp = .12;
    const distance = .17;
    if (t < ramp) {
      final p = t / ramp;
      return distance * p * p;
    }
    return distance +
        (1 - distance) * Curves.easeOutCubic.transform((t - ramp) / (1 - ramp));
  }
}
