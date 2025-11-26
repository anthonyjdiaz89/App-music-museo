import { FadeInDown } from "react-native-reanimated";

export const fadeSpring = (delay: number, damping: number) => {
  const animation = FadeInDown.delay(delay);
  animation.springify();
  animation.damping(damping);
  return animation;
};
