// Export Data Screen
// Allows users to export their data in various formats

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import {
  ExportFormat,
  ExportDataType,
  generateExportFile,
  getExportSummary,
} from '../services/exportService';
import { Ionicons } from '@expo/vector-icons';

export default function ExportDataScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();

  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [selectedDataType, setSelectedDataType] = useState<ExportDataType>('all');
  const [exporting, setExporting] = useState(false);
  const [summary, setSummary] = useState({
    mealsCount: 0,
    foodItemsCount: 0,
    weightEntriesCount: 0,
    recipesCount: 0,
  });

  useEffect(() => {
    // Load export summary
    const exportSummary = getExportSummary();
    setSummary(exportSummary);
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const success = await generateExportFile({
        format: selectedFormat,
        dataType: selectedDataType,
      });

      if (success) {
        Alert.alert(
          'Export Successful',
          'Your data has been exported and is ready to share.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Export Failed',
        error.message || 'Failed to export data. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setExporting(false);
    }
  };

  const formatOptions: { value: ExportFormat; label: string; iconName: string; description: string }[] = [
    { value: 'csv', label: 'CSV', iconName: 'bar-chart', description: 'Compatible with Excel, Google Sheets' },
    { value: 'json', label: 'JSON', iconName: 'settings', description: 'For developers and data analysis' },
  ];

  const dataTypeOptions: { value: ExportDataType; label: string; iconName: string; count: number }[] = [
    { value: 'all', label: 'All Data', iconName: 'cube', count: summary.mealsCount + summary.weightEntriesCount + summary.recipesCount },
    { value: 'meals', label: 'Meals & Nutrition', iconName: 'restaurant', count: summary.foodItemsCount },
    { value: 'progress', label: 'Weight Progress', iconName: 'scale', count: summary.weightEntriesCount },
    { value: 'recipes', label: 'Custom Recipes', iconName: 'book', count: summary.recipesCount },
  ];

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
    optionCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: colors.border,
    },
    optionCardSelected: {
      borderColor: colors.primary,
      backgroundColor: isDark ? colors.primary + '20' : colors.primary + '10',
    },
    optionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    optionContent: {
      flex: 1,
    },
    optionLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    optionDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    optionCount: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    checkmark: {
      fontSize: 20,
      color: colors.primary,
    },
    summaryCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 12,
    },
    summaryTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    summaryLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    summaryValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    exportButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 18,
      alignItems: 'center',
      marginHorizontal: 20,
      marginTop: 24,
      marginBottom: 40,
    },
    exportButtonDisabled: {
      opacity: 0.6,
    },
    exportButtonText: {
      fontSize: 18,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    infoCard: {
      backgroundColor: isDark ? '#1a2744' : '#EEF2FF',
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: isDark ? '#93C5FD' : '#4F46E5',
      lineHeight: 20,
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
        <Text style={dynamicStyles.title}>Export Data</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.infoCard}>
            <Ionicons name="cloud-upload" size={20} color={isDark ? '#93C5FD' : '#4F46E5'} style={{ marginRight: 12 }} />
            <Text style={dynamicStyles.infoText}>
              Export your nutrition data, weight progress, and custom recipes.
              Use your data in spreadsheets, other apps, or keep it as a backup.
            </Text>
          </View>
        </View>

        {/* Data Summary */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Your Data</Text>
          <View style={dynamicStyles.summaryCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="bar-chart" size={20} color={colors.text} style={{ marginRight: 8 }} />
              <Text style={dynamicStyles.summaryTitle}>Export Summary</Text>
            </View>
            <View style={dynamicStyles.summaryRow}>
              <Text style={dynamicStyles.summaryLabel}>Logged Meals</Text>
              <Text style={dynamicStyles.summaryValue}>{summary.mealsCount}</Text>
            </View>
            <View style={dynamicStyles.summaryRow}>
              <Text style={dynamicStyles.summaryLabel}>Food Items</Text>
              <Text style={dynamicStyles.summaryValue}>{summary.foodItemsCount}</Text>
            </View>
            <View style={dynamicStyles.summaryRow}>
              <Text style={dynamicStyles.summaryLabel}>Weight Entries</Text>
              <Text style={dynamicStyles.summaryValue}>{summary.weightEntriesCount}</Text>
            </View>
            <View style={[dynamicStyles.summaryRow, { borderBottomWidth: 0 }]}>
              <Text style={dynamicStyles.summaryLabel}>Custom Recipes</Text>
              <Text style={dynamicStyles.summaryValue}>{summary.recipesCount}</Text>
            </View>
          </View>
        </View>

        {/* Format Selection */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Export Format</Text>
          {formatOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                dynamicStyles.optionCard,
                selectedFormat === option.value && dynamicStyles.optionCardSelected,
              ]}
              onPress={() => setSelectedFormat(option.value)}
            >
              <View style={dynamicStyles.optionHeader}>
                <Ionicons name={option.iconName as any} size={24} color={colors.text} style={{ marginRight: 12 }} />
                <View style={dynamicStyles.optionContent}>
                  <Text style={dynamicStyles.optionLabel}>{option.label}</Text>
                  <Text style={dynamicStyles.optionDescription}>{option.description}</Text>
                </View>
                {selectedFormat === option.value && (
                  <Text style={dynamicStyles.checkmark}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Data Type Selection */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>What to Export</Text>
          {dataTypeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                dynamicStyles.optionCard,
                selectedDataType === option.value && dynamicStyles.optionCardSelected,
              ]}
              onPress={() => setSelectedDataType(option.value)}
            >
              <View style={dynamicStyles.optionHeader}>
                <Ionicons name={option.iconName as any} size={24} color={colors.text} style={{ marginRight: 12 }} />
                <View style={dynamicStyles.optionContent}>
                  <Text style={dynamicStyles.optionLabel}>{option.label}</Text>
                  <Text style={dynamicStyles.optionCount}>{option.count} items</Text>
                </View>
                {selectedDataType === option.value && (
                  <Text style={dynamicStyles.checkmark}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Export Button */}
        <TouchableOpacity
          style={[
            dynamicStyles.exportButton,
            exporting && dynamicStyles.exportButtonDisabled,
          ]}
          onPress={handleExport}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={dynamicStyles.exportButtonText}>
              Export {selectedDataType === 'all' ? 'All Data' : dataTypeOptions.find(o => o.value === selectedDataType)?.label}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});
