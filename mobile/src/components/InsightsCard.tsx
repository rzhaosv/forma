// AI Insights Card Component
// Displays personalized nutrition tips and insights

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { Insight, generateInsights, getMotivationalQuote } from '../services/insightsService';
import { useMealStore } from '../store/useMealStore';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface InsightsCardProps {
  onPress?: () => void;
}

export default function InsightsCard({ onPress }: InsightsCardProps) {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();
  const { meals, dailyGoals } = useMealStore();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Generate insights when meals change
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = (meals || []).filter(m => m.timestamp?.split('T')[0] === today);
    
    let generatedInsights = generateInsights(todayMeals, dailyGoals);
    
    // Add a motivational quote if we have few insights
    if (generatedInsights.length < 2) {
      generatedInsights.push(getMotivationalQuote());
    }
    
    setInsights(generatedInsights);
    setCurrentIndex(0);
  }, [meals, dailyGoals]);
  
  // Auto-rotate insights every 8 seconds
  useEffect(() => {
    if (insights.length <= 1) return;
    
    const interval = setInterval(() => {
      // Fade out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentIndex(prev => (prev + 1) % insights.length);
        slideAnim.setValue(20);
        
        // Fade in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 8000);
    
    return () => clearInterval(interval);
  }, [insights, fadeAnim, slideAnim]);
  
  const currentInsight = insights[currentIndex];
  
  if (!currentInsight) {
    return null;
  }
  
  const getTypeColor = (type: Insight['type']) => {
    switch (type) {
      case 'success': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'tip': return colors.primary;
      case 'motivation': return '#8B5CF6';
      default: return colors.primary;
    }
  };
  
  const typeColor = getTypeColor(currentInsight.type);
  
  const dynamicStyles = StyleSheet.create({
    container: {
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 16,
      backgroundColor: colors.surface,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    accentBar: {
      height: 4,
      backgroundColor: typeColor,
    },
    content: {
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    icon: {
      fontSize: 24,
      marginRight: 10,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    badge: {
      backgroundColor: typeColor + '20',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: typeColor,
      textTransform: 'uppercase',
    },
    message: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    dots: {
      flexDirection: 'row',
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.border,
    },
    dotActive: {
      backgroundColor: typeColor,
      width: 18,
    },
    aiLabel: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    aiIcon: {
      fontSize: 12,
      marginRight: 4,
    },
    aiText: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    actionButton: {
      backgroundColor: typeColor + '20',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: typeColor,
      marginRight: 6,
    },
  });

  const handleActionPress = () => {
    if (currentInsight.action) {
      navigation.navigate(
        currentInsight.action.navigateTo as never,
        currentInsight.action.params as never
      );
    }
  };
  
  return (
    <TouchableOpacity 
      style={dynamicStyles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={dynamicStyles.accentBar} />
      <Animated.View 
        style={[
          dynamicStyles.content,
          { 
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.icon}>{currentInsight.icon}</Text>
          <Text style={dynamicStyles.title}>{currentInsight.title}</Text>
          <View style={dynamicStyles.badge}>
            <Text style={dynamicStyles.badgeText}>
              {currentInsight.type === 'motivation' ? 'tip' : currentInsight.type}
            </Text>
          </View>
        </View>
        <Text style={dynamicStyles.message}>{currentInsight.message}</Text>

        {/* Action Button */}
        {currentInsight.actionable && currentInsight.action && (
          <TouchableOpacity
            style={dynamicStyles.actionButton}
            onPress={handleActionPress}
            activeOpacity={0.7}
          >
            <Text style={dynamicStyles.actionButtonText}>
              {currentInsight.action.label}
            </Text>
            <Ionicons name="arrow-forward" size={16} color={typeColor} />
          </TouchableOpacity>
        )}

        {insights.length > 1 && (
          <View style={dynamicStyles.footer}>
            <View style={dynamicStyles.aiLabel}>
              <Text style={dynamicStyles.aiIcon}>✨</Text>
              <Text style={dynamicStyles.aiText}>AI Insight</Text>
            </View>
            <View style={dynamicStyles.dots}>
              {insights.map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    dynamicStyles.dot,
                    index === currentIndex && dynamicStyles.dotActive,
                  ]} 
                />
              ))}
            </View>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

