// BounceOnHover.js
import React from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';

const BounceOnHover = ({ children, onPress, style, touchableStyle, disabled, key, }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleMouseEnter = () => {
    scale.value = withSpring(1.1, { stiffness: 120, damping: 10 });
  };

  const handleMouseLeave = () => {
    scale.value = withSpring(1, { stiffness: 120, damping: 10 });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseEnter}
      onTouchEnd={handleMouseLeave}
      activeOpacity={0.8}
      style={touchableStyle}
      disabled={disabled}
      key={key}
    >
      <Animated.View style={[animatedStyle, { ...style }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default BounceOnHover;
