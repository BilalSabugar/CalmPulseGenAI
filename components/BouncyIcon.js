import { StyleSheet, TouchableOpacity } from 'react-native';
import { ICONSIZE } from './constants';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';

const BouncyIcon = ({ source, onPress }) => {
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
            activeOpacity={0.8}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Animated.Image source={source} style={[styles.icon, animatedStyle]} />
        </TouchableOpacity>
    );
};


const styles = StyleSheet.create({
    icon: {
        marginRight: 15,
        height: ICONSIZE,
        width: ICONSIZE,
        resizeMode: 'contain',
    }
});

export default BouncyIcon;