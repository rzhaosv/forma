// Confetti Celebration Component
// Displays confetti animation for celebrations and achievements

import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConfettiPiece {
  x: Animated.Value;
  y: Animated.Value;
  rotate: Animated.Value;
  color: string;
  size: number;
}

interface ConfettiCelebrationProps {
  active: boolean;
  onComplete?: () => void;
}

export default function ConfettiCelebration({ active, onComplete }: ConfettiCelebrationProps) {
  const confettiPieces = useRef<ConfettiPiece[]>([]);

  useEffect(() => {
    if (active && confettiPieces.current.length === 0) {
      // Create confetti pieces
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
      const pieces: ConfettiPiece[] = [];

      for (let i = 0; i < 50; i++) {
        pieces.push({
          x: new Animated.Value(Math.random() * SCREEN_WIDTH),
          y: new Animated.Value(-50),
          rotate: new Animated.Value(0),
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 10 + 5,
        });
      }

      confettiPieces.current = pieces;

      // Animate confetti
      const animations = pieces.map((piece, index) => {
        const duration = 2000 + Math.random() * 1000;
        const delay = index * 30;
        const xOffset = (Math.random() - 0.5) * 200;

        return Animated.parallel([
          Animated.timing(piece.y, {
            toValue: SCREEN_HEIGHT + 100,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(piece.x, {
            toValue: piece.x._value + xOffset,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(piece.rotate, {
            toValue: 360 * (3 + Math.random() * 2),
            duration,
            delay,
            useNativeDriver: true,
          }),
        ]);
      });

      Animated.parallel(animations).start(() => {
        confettiPieces.current = [];
        if (onComplete) onComplete();
      });
    }
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {confettiPieces.current.map((piece, index) => (
        <Animated.View
          key={index}
          style={[
            styles.confetti,
            {
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              transform: [
                { translateX: piece.x },
                { translateY: piece.y },
                {
                  rotate: piece.rotate.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  confetti: {
    position: 'absolute',
    borderRadius: 2,
  },
});
