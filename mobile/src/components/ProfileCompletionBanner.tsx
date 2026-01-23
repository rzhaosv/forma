import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface ProfileCompletionBannerProps {
  onPress: () => void;
  onDismiss?: () => void;
  message?: string;
  dismissable?: boolean;
}

export default function ProfileCompletionBanner({
  onPress,
  onDismiss,
  message = 'Complete your profile for personalized goals!',
  dismissable = true,
}: ProfileCompletionBannerProps) {
  const { colors, isDark } = useTheme();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Slide in from top
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 40,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [slideAnim, pulseAnim]);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (onDismiss) {
        onDismiss();
      }
    });
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    banner: {
      backgroundColor: colors.primary + '20',
      borderWidth: 2,
      borderColor: colors.primary + '40',
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    content: {
      flex: 1,
      marginRight: 8,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    message: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    ctaButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      marginLeft: 8,
    },
    ctaText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    dismissButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
  });

  return (
    <Animated.View
      style={[
        dynamicStyles.container,
        {
          transform: [{ translateY: slideAnim }, { scale: pulseAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={dynamicStyles.banner}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={dynamicStyles.iconContainer}>
          <Ionicons name="person-add" size={24} color="#FFFFFF" />
        </View>

        <View style={dynamicStyles.content}>
          <Text style={dynamicStyles.title}>Complete Your Profile</Text>
          <Text style={dynamicStyles.message}>{message}</Text>
        </View>

        <TouchableOpacity style={dynamicStyles.ctaButton} onPress={onPress}>
          <Text style={dynamicStyles.ctaText}>Go</Text>
        </TouchableOpacity>

        {dismissable && onDismiss && (
          <TouchableOpacity
            style={dynamicStyles.dismissButton}
            onPress={handleDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}
