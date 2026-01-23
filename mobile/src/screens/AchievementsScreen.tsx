import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { useAchievementStore } from '../store/useAchievementStore';
import { getAllBadges, getBadgesByCategory } from '../config/badgeData';
import { getBadgeProgress } from '../services/achievementService';
import { Ionicons } from '@expo/vector-icons';

export default function AchievementsScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { earnedBadges, hasBadge } = useAchievementStore();

  const categories = [
    { key: 'streak', title: '🔥 Streak Badges', color: '#EF4444' },
    { key: 'logging', title: '📝 Logging Badges', color: '#3B82F6' },
    { key: 'goal', title: '🎯 Goal Badges', color: '#10B981' },
    { key: 'milestone', title: '🏆 Milestone Badges', color: '#F59E0B' },
  ] as const;

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    backButton: {
      padding: 8,
    },
    statsCard: {
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 16,
      padding: 20,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    statsTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    categorySection: {
      marginTop: 24,
      paddingHorizontal: 20,
    },
    categoryHeader: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    badgesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 8,
    },
    badgeCard: {
      width: '48%',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    badgeCardLocked: {
      opacity: 0.4,
    },
    badgeIcon: {
      fontSize: 48,
      marginBottom: 8,
    },
    badgeName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    badgeDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 16,
    },
    progressBar: {
      width: '100%',
      height: 4,
      backgroundColor: colors.divider,
      borderRadius: 2,
      marginTop: 8,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
    },
    progressText: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 4,
      textAlign: 'center',
    },
  });

  const totalBadges = getAllBadges().length;
  const earnedCount = earnedBadges.length;
  const completionPercentage = Math.round((earnedCount / totalBadges) * 100);

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity
          style={dynamicStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Achievements</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Card */}
        <View style={dynamicStyles.statsCard}>
          <Text style={dynamicStyles.statsTitle}>Your Progress</Text>
          <View style={dynamicStyles.statsRow}>
            <View style={dynamicStyles.statItem}>
              <Text style={dynamicStyles.statValue}>{earnedCount}</Text>
              <Text style={dynamicStyles.statLabel}>Earned</Text>
            </View>
            <View style={dynamicStyles.statItem}>
              <Text style={dynamicStyles.statValue}>{totalBadges}</Text>
              <Text style={dynamicStyles.statLabel}>Total</Text>
            </View>
            <View style={dynamicStyles.statItem}>
              <Text style={dynamicStyles.statValue}>{completionPercentage}%</Text>
              <Text style={dynamicStyles.statLabel}>Complete</Text>
            </View>
          </View>
        </View>

        {/* Badge Categories */}
        {categories.map(category => {
          const categoryBadges = getBadgesByCategory(category.key);
          if (categoryBadges.length === 0) return null;

          return (
            <View key={category.key} style={dynamicStyles.categorySection}>
              <Text style={dynamicStyles.categoryHeader}>{category.title}</Text>
              <View style={dynamicStyles.badgesGrid}>
                {categoryBadges.map(badge => {
                  const earned = hasBadge(badge.id);
                  const progress = !earned ? getBadgeProgress(badge.id) : null;

                  return (
                    <View
                      key={badge.id}
                      style={[
                        dynamicStyles.badgeCard,
                        !earned && dynamicStyles.badgeCardLocked,
                      ]}
                    >
                      <Text style={dynamicStyles.badgeIcon}>{badge.icon}</Text>
                      <Text style={dynamicStyles.badgeName}>{badge.name}</Text>
                      <Text style={dynamicStyles.badgeDescription}>
                        {badge.description}
                      </Text>

                      {/* Progress bar for locked badges */}
                      {!earned && progress && progress.required > 0 && (
                        <>
                          <View style={dynamicStyles.progressBar}>
                            <View
                              style={[
                                dynamicStyles.progressFill,
                                { width: `${progress.percentage}%` },
                              ]}
                            />
                          </View>
                          <Text style={dynamicStyles.progressText}>
                            {progress.current} / {progress.required}
                          </Text>
                        </>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
