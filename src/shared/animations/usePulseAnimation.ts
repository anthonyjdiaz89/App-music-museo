import { useEffect } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";

export function usePulseAnimation(
  scale: number = 1.05,
  duration: number = 1800,
  active: boolean = true
) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (active) {
      pulse.value = withRepeat(
        withTiming(scale, { duration, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(1, { duration: 200 });
    }

    return () => {
      cancelAnimation(pulse);
      pulse.value = 1;
    };
  }, [pulse, scale, duration, active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    shadowRadius: 8 + (pulse.value - 1) * 30,
    shadowOpacity: 0.2 + (pulse.value - 1) * 1.5,
  }));

  return animatedStyle;
}
