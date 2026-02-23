import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

interface BlueprintProgressProps {
  progress: number; // 0 to 1
}

const ACCENT = '#00E676';
const TRACK = 'rgba(255,255,255,0.08)';

export default function BlueprintProgress({ progress }: BlueprintProgressProps) {
  const barAnim = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.spring(barAnim, {
      toValue: progress,
      tension: 40,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [progress, barAnim]);

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const percent = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Your Nutrition Blueprint:{' '}
        <Text style={styles.percent}>{percent}% Ready</Text>
      </Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: barWidth }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  label: {
    fontSize: 12,
    color: '#A0A0B0',
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  percent: {
    color: ACCENT,
    fontWeight: '700',
  },
  track: {
    height: 4,
    backgroundColor: TRACK,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 2,
  },
});
