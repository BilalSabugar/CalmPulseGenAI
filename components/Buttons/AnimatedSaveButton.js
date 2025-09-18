import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  Animated,
  ActivityIndicator,
  Easing,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const BUTTON_HEIGHT = 50;
const BUTTON_WIDTH_INITIAL = 120;
const BUTTON_WIDTH_LOADING = 50;

const PALETTE = {
  primary: '#000000',
  onPrimary: '#FFFFFF',
  success: '#28a745',
  error: '#dc3545',
};

const AnimatedSaveButton = ({ onPress, setJournalOpen }) => {
  const [status, setStatus] = useState('idle');
  const widthAnim = useRef(new Animated.Value(BUTTON_WIDTH_INITIAL)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;
  const contentOpacityAnim = useRef(new Animated.Value(1)).current;
  const resultOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'loading') {
      Animated.parallel([
        Animated.timing(widthAnim, { toValue: BUTTON_WIDTH_LOADING, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: false }),
        Animated.timing(contentOpacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    } else if (status === 'success' || status === 'error') {
      const isSuccess = status === 'success';
      Animated.sequence([
        Animated.timing(colorAnim, { toValue: isSuccess ? 1 : -1, duration: 200, useNativeDriver: false }),
        Animated.timing(widthAnim, { toValue: BUTTON_WIDTH_INITIAL, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: false }),
        Animated.timing(resultOpacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      setTimeout(resetButton, 2000);
    }
  }, [status]);

  /**
   * This is the corrected press handler. It's simple and reliable.
   * It awaits the result of the onPress prop and sets the status accordingly.
   */
  const handlePress = () => { // It no longer needs to be async here
    if (status === 'loading') {
      // We can return a resolved promise if the action is ignored
      return Promise.resolve();
    }

    // Return a new Promise that we control
    return new Promise(async (resolve, reject) => {
      setStatus('loading');
      try {
        // 1. Wait for the save operation to complete
        await onPress();

        // 2. Wait for the success animation delay
        setTimeout(() => {
          setStatus('success');
          // 3. NOW resolve the promise, allowing .then() to run
          resolve();
        }, 1500);

      } catch (error) {
        // Handle the error case similarly
        setTimeout(() => {
          setStatus('error');
          // 3. Resolve the promise here as well, so the UI can proceed
          resolve();
        }, 1500);
      }
    });
  };

  const resetButton = () => {
    Animated.parallel([
      Animated.timing(resultOpacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(colorAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
      Animated.timing(contentOpacityAnim, { toValue: 1, duration: 200, delay: 100, useNativeDriver: true }),
    ]).start(() => setStatus('idle'));
  };

  const backgroundColor = colorAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [PALETTE.error, PALETTE.primary, PALETTE.success],
  });

  const renderContent = () => {
    if (status === 'loading') {
      return <ActivityIndicator color={PALETTE.onPrimary} />;
    }
    if (status === 'idle') {
      return (
        <Animated.Text style={[styles.text, { opacity: contentOpacityAnim }]}>
          Save
        </Animated.Text>
      );
    }
    return (
      <Animated.View style={[styles.resultContainer, { opacity: resultOpacityAnim }]}>
        {status === 'success' ? (
          <>
            <Icon name="check" size={20} color={PALETTE.onPrimary} />
            <Text style={styles.text}>Saved</Text>
          </>
        ) : (
          <Text style={styles.text}>Try Again</Text>
        )}
      </Animated.View>
    );
  };

  return (
    <Pressable onPress={() => handlePress().then(() => setTimeout(() => setJournalOpen(false), 1250))} disabled={status === 'loading'}>
      <Animated.View style={[styles.button, { width: widthAnim, backgroundColor: backgroundColor }]}>
        {renderContent()}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 64, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  text: { color: PALETTE.onPrimary, fontSize: 16, fontWeight: '600' },
  resultContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});

export default AnimatedSaveButton;