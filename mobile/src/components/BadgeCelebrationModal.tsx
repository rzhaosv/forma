import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { badges } from '../config/badgeData';
import ConfettiCelebration from './ConfettiCelebration';

interface BadgeCelebrationModalProps {
  visible: boolean;
  badgeId: string;
  onClose: () => void;
}

export default function BadgeCelebrationModal({
  visible,
  badgeId,
  onClose,
}: BadgeCelebrationModalProps) {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const badge = badges[badgeId];

  useEffect(() => {
    if (visible && badge) {
      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible, badge]);

  if (!badge) return null;

  const dynamicStyles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    container: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 32,
      alignItems: 'center',
      width: '90%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 10,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    icon: {
      fontSize: 80,
      marginBottom: 16,
    },
    badgeName: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 12,
    },
    description: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 24,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 12,
      width: '100%',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <ConfettiCelebration active={visible} />
      <Animated.View style={[dynamicStyles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            dynamicStyles.container,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={dynamicStyles.title}>🎉 Achievement Unlocked!</Text>
          <Text style={dynamicStyles.icon}>{badge.icon}</Text>
          <Text style={dynamicStyles.badgeName}>{badge.name}</Text>
          <Text style={dynamicStyles.description}>{badge.description}</Text>
          <TouchableOpacity
            style={dynamicStyles.button}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={dynamicStyles.buttonText}>Awesome!</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
