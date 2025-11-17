import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { colors, isDark, toggleMode, mode } = useTheme();

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      marginRight: 16,
    },
    backText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    section: {
      marginTop: 24,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    settingLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      flex: 1,
    },
    settingDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
    },
    settingContent: {
      flex: 1,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity
          style={dynamicStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={dynamicStyles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={dynamicStyles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Appearance Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Appearance</Text>
          
          <View style={dynamicStyles.settingRow}>
            <View style={dynamicStyles.settingContent}>
              <Text style={dynamicStyles.settingLabel}>Dark Mode</Text>
              <Text style={dynamicStyles.settingDescription}>
                Switch to dark theme for better viewing in low light
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleMode}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Theme Mode Info */}
        <View style={dynamicStyles.section}>
          <View style={[dynamicStyles.settingRow, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={dynamicStyles.settingContent}>
              <Text style={dynamicStyles.settingLabel}>Current Theme</Text>
              <Text style={dynamicStyles.settingDescription}>
                {mode === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});

