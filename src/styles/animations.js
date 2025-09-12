import { Easing } from 'react-native-reanimated';
import Animated, { Extrapolate, interpolate, useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';

export function useFadeIn(delay = 0, dy = 12, duration = 500) {
  const t = useSharedValue(0);
  const style = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ translateY: interpolate(t.value, [0, 1], [dy, 0], Extrapolate.CLAMP) }],
  }));
  // trigger after mount
  setTimeout(() => {
    t.value = withTiming(1, { duration, easing: Easing.bezier(0.25, 0.1, 0.25, 1), delay });
  }, 0);
  return style;
}
