import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  ReduceMotion,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface AnimatedPressableProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  enableHaptics?: boolean;
  children: React.ReactNode;
}

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  style,
  scaleTo = 0.97,
  enableHaptics = true,
  onPress,
  children,
  ...rest
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const handlePressIn = (e: any) => {
    scale.set(withSpring(scaleTo, { duration: 120, dampingRatio: 1, reduceMotion: ReduceMotion.System }));
    if (enableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    rest.onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    scale.set(withSpring(1, { duration: 150, dampingRatio: 0.8, reduceMotion: ReduceMotion.System }));
    rest.onPressOut?.(e);
  };

  return (
    <AnimatedPressableBase
      {...rest}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      pressRetentionOffset={{ top: 12, bottom: 12, left: 12, right: 12 }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressableBase>
  );
};
