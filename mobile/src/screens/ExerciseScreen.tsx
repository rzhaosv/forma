// Exercise Tracking Screen
// Log workouts and view exercise history

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  FlatList,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { useExerciseStore } from '../store/useExerciseStore';
import { Ionicons } from '@expo/vector-icons';
import {
  Exercise,
  COMMON_EXERCISES,
  ExerciseCategory,
  IntensityLevel,
  WorkoutExercise,
  calculateCaloriesBurned,
  getExercisesByCategory,
} from '../types/exercise.types';

const CATEGORIES: { key: ExerciseCategory; label: string; icon: string }[] = [
  { key: 'cardio', label: 'Cardio', icon: 'bicycle' },
  { key: 'strength', label: 'Strength', icon: 'barbell' },
  { key: 'flexibility', label: 'Flexibility', icon: 'body' },
  { key: 'sports', label: 'Sports', icon: 'football' },
  { key: 'other', label: 'Other', icon: 'flame' },
];

const INTENSITIES: { key: IntensityLevel; label: string; color: string }[] = [
  { key: 'low', label: 'Low', color: '#4CAF50' },
  { key: 'moderate', label: 'Moderate', color: '#FF9800' },
  { key: 'high', label: 'High', color: '#F44336' },
  { key: 'very_high', label: 'Very High', color: '#9C27B0' },
];

export default function ExerciseScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const {
    workouts,
    dailySummary,
    activeWorkout,
    weeklyGoal,
    startWorkout,
    addExerciseToWorkout,
    endWorkout,
    cancelWorkout,
    deleteWorkout,
    getWeeklySummary,
    updateDailySummary,
    steps,
    stepGoal,
    syncSteps,
  } = useExerciseStore();

  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory>('cardio');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [duration, setDuration] = useState('30');
  const [intensity, setIntensity] = useState<IntensityLevel>('moderate');
  const [showQuickLog, setShowQuickLog] = useState(false);

  useEffect(() => {
    updateDailySummary();
    if (Platform.OS === 'ios') {
      syncSteps();
    }
  }, []);

  const weeklySummary = getWeeklySummary();
  const weeklyProgress = Math.min((weeklySummary.totalMinutes / weeklyGoal) * 100, 100);

  const handleQuickLog = () => {
    if (!selectedExercise) {
      Alert.alert('Select Exercise', 'Please select an exercise first.');
      return;
    }

    const durationNum = parseInt(duration) || 30;
    const caloriesBurned = calculateCaloriesBurned(selectedExercise, durationNum, 70, intensity);

    const workoutExercise: WorkoutExercise = {
      id: `exercise-${Date.now()}`,
      exercise: selectedExercise,
      sets: [],
      duration: durationNum,
      caloriesBurned,
      intensity,
    };

    // Create a quick workout
    const quickWorkout = {
      id: `workout-${Date.now()}`,
      name: selectedExercise.name,
      exercises: [workoutExercise],
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      totalDuration: durationNum,
      totalCaloriesBurned: caloriesBurned,
      timestamp: new Date().toISOString(),
    };

    useExerciseStore.getState().logWorkout(quickWorkout);

    Alert.alert(
      'Exercise Logged!',
      `${selectedExercise.name}\n${durationNum} minutes • ${caloriesBurned} cal burned`,
      [{ text: 'OK' }]
    );

    setShowQuickLog(false);
    setSelectedExercise(null);
    setDuration('30');
  };

  const handleDeleteWorkout = (workoutId: string) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteWorkout(workoutId),
        },
      ]
    );
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

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
      flex: 1,
    },
    section: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    summaryCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    summaryItem: {
      alignItems: 'center',
      flex: 1,
    },
    summaryValue: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    summaryLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    progressContainer: {
      marginTop: 8,
    },
    progressLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    logButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 16,
    },
    logButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    workoutCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    workoutHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    workoutName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    workoutTime: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    workoutStats: {
      flexDirection: 'row',
      marginTop: 8,
    },
    workoutStat: {
      marginRight: 16,
    },
    workoutStatValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    workoutStatLabel: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    deleteButton: {
      padding: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    categoryTabs: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    categoryTab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 8,
      marginHorizontal: 2,
    },
    categoryTabActive: {
      backgroundColor: colors.primary + '20',
    },
    categoryTabText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    categoryTabTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    exerciseOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.surface,
      borderRadius: 10,
      marginBottom: 8,
    },
    exerciseOptionSelected: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    exerciseIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    exerciseName: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    exerciseCal: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    inputRow: {
      marginTop: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    durationInput: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      padding: 12,
      fontSize: 18,
      color: colors.text,
      width: 80,
      textAlign: 'center',
    },
    inputSuffix: {
      fontSize: 16,
      color: colors.textSecondary,
      marginLeft: 8,
    },
    intensityOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    intensityOption: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      marginBottom: 8,
      backgroundColor: colors.surface,
    },
    intensityOptionSelected: {
      backgroundColor: colors.primary,
    },
    intensityText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    intensityTextSelected: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    modalButtons: {
      flexDirection: 'row',
      marginTop: 24,
    },
    cancelButton: {
      flex: 1,
      padding: 16,
      alignItems: 'center',
      marginRight: 8,
      borderRadius: 12,
      backgroundColor: colors.surface,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    saveButton: {
      flex: 1,
      padding: 16,
      alignItems: 'center',
      marginLeft: 8,
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    emptyState: {
      alignItems: 'center',
      padding: 40,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    historyDayCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 12,
      overflow: 'hidden',
    },
    historyDayHeader: {
      backgroundColor: colors.primary + '10',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    historyDate: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    historyDaySummary: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    historyWorkoutItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    historyWorkoutInfo: {
      flex: 1,
    },
    historyWorkoutName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    historyWorkoutDetails: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    caloriePreview: {
      backgroundColor: colors.primary + '10',
      padding: 12,
      borderRadius: 10,
      marginTop: 16,
      alignItems: 'center',
    },
    caloriePreviewText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
    },
  });

  const renderWorkout = ({ item }: { item: typeof workouts[0] }) => {
    const time = new Date(item.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <View style={dynamicStyles.workoutCard}>
        <View style={dynamicStyles.workoutHeader}>
          <View>
            <Text style={dynamicStyles.workoutName}>{item.name}</Text>
            <Text style={dynamicStyles.workoutTime}>{time}</Text>
          </View>
          <TouchableOpacity
            style={dynamicStyles.deleteButton}
            onPress={() => handleDeleteWorkout(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
        <View style={dynamicStyles.workoutStats}>
          <View style={dynamicStyles.workoutStat}>
            <Text style={dynamicStyles.workoutStatValue}>{formatDuration(item.totalDuration)}</Text>
            <Text style={dynamicStyles.workoutStatLabel}>Duration</Text>
          </View>
          <View style={dynamicStyles.workoutStat}>
            <Text style={dynamicStyles.workoutStatValue}>{item.totalCaloriesBurned}</Text>
            <Text style={dynamicStyles.workoutStatLabel}>Calories</Text>
          </View>
          <View style={dynamicStyles.workoutStat}>
            <Text style={dynamicStyles.workoutStatValue}>{item.exercises.length}</Text>
            <Text style={dynamicStyles.workoutStatLabel}>Exercises</Text>
          </View>
        </View>
      </View>
    );
  };

  const filteredExercises = getExercisesByCategory(selectedCategory);

  const previewCalories = selectedExercise
    ? calculateCaloriesBurned(selectedExercise, parseInt(duration) || 30, 70, intensity)
    : 0;

  // Step Counter Circle Constants
  const circleSize = 140;
  const strokeWidth = 12;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const stepProgress = Math.min(steps / stepGoal, 1);
  const strokeDashoffset = circumference - stepProgress * circumference;

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
        <Text style={dynamicStyles.title}>Exercise</Text>
      </View>

      <ScrollView>
        {/* Step Counter Section */}
        <View style={dynamicStyles.section}>
          <View style={[dynamicStyles.summaryCard, { alignItems: 'center', paddingVertical: 30 }]}>
            <View style={{ width: circleSize, height: circleSize, justifyContent: 'center', alignItems: 'center' }}>
              <Svg width={circleSize} height={circleSize} style={{ position: 'absolute' }}>
                {/* Background Circle */}
                <Circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius}
                  stroke={isDark ? '#333' : '#F0F0F0'}
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                {/* Progress Circle */}
                <Circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius}
                  stroke={colors.primary}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  rotation="-90"
                  origin={`${circleSize / 2}, ${circleSize / 2}`}
                />
              </Svg>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 32, fontWeight: '800', color: colors.text }}>
                  {steps.toLocaleString()}
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary, fontWeight: '500' }}>
                  Steps today
                </Text>
              </View>
            </View>

            <View style={{ marginTop: 20, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: colors.text, fontWeight: '600' }}>
                Goal: {stepGoal.toLocaleString()} steps
              </Text>
              <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '700', marginTop: 4 }}>
                {Math.round(stepProgress * 100)}% Complete
              </Text>
            </View>

            {Platform.OS === 'ios' && (
              <TouchableOpacity
                onPress={syncSteps}
                style={{ marginTop: 16, padding: 8 }}
              >
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>
                  ↻ Sync with Apple Health
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Summary Section */}
        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.summaryCard}>
            <View style={dynamicStyles.summaryRow}>
              <View style={dynamicStyles.summaryItem}>
                <Text style={dynamicStyles.summaryValue}>
                  {dailySummary?.totalCaloriesBurned || 0}
                </Text>
                <Text style={dynamicStyles.summaryLabel}>Cal Burned Today</Text>
              </View>
              <View style={dynamicStyles.summaryItem}>
                <Text style={dynamicStyles.summaryValue}>
                  {formatDuration(dailySummary?.totalDuration || 0)}
                </Text>
                <Text style={dynamicStyles.summaryLabel}>Active Today</Text>
              </View>
              <View style={dynamicStyles.summaryItem}>
                <Text style={dynamicStyles.summaryValue}>
                  {weeklySummary.workoutCount}
                </Text>
                <Text style={dynamicStyles.summaryLabel}>This Week</Text>
              </View>
            </View>

            <View style={dynamicStyles.progressContainer}>
              <Text style={dynamicStyles.progressLabel}>
                Weekly Goal: {weeklySummary.totalMinutes}/{weeklyGoal} min ({Math.round(weeklyProgress)}%)
              </Text>
              <View style={dynamicStyles.progressBar}>
                <View
                  style={[
                    dynamicStyles.progressFill,
                    { width: `${weeklyProgress}%` }
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Quick Log Button */}
          <TouchableOpacity
            style={dynamicStyles.logButton}
            onPress={() => setShowQuickLog(true)}
          >
            <Text style={dynamicStyles.logButtonText}>+ Log Exercise</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Workouts */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Today's Activity</Text>

          {dailySummary && dailySummary.workouts.length > 0 ? (
            <FlatList
              data={dailySummary.workouts}
              renderItem={renderWorkout}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={dynamicStyles.emptyState}>
              <Ionicons name="bicycle-outline" size={64} color={colors.textTertiary} style={{ marginBottom: 16 }} />
              <Text style={dynamicStyles.emptyText}>
                No exercises logged today.{'\n'}Tap "Log Exercise" to get started!
              </Text>
            </View>
          )}
        </View>

        {/* Recent Workouts History */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Workout History</Text>

          {workouts.length > 0 ? (
            <>
              {(() => {
                // Group workouts by date
                const groupedWorkouts: { [date: string]: typeof workouts } = {};
                const today = new Date().toDateString();

                workouts.forEach(workout => {
                  const workoutDate = new Date(workout.timestamp).toDateString();
                  // Skip today's workouts (already shown above)
                  if (workoutDate === today) return;

                  if (!groupedWorkouts[workoutDate]) {
                    groupedWorkouts[workoutDate] = [];
                  }
                  groupedWorkouts[workoutDate].push(workout);
                });

                const sortedDates = Object.keys(groupedWorkouts).sort(
                  (a, b) => new Date(b).getTime() - new Date(a).getTime()
                );

                if (sortedDates.length === 0) {
                  return (
                    <View style={dynamicStyles.emptyState}>
                      <Text style={dynamicStyles.emptyText}>
                        No previous workouts found.
                      </Text>
                    </View>
                  );
                }

                return sortedDates.slice(0, 7).map(dateStr => {
                  const date = new Date(dateStr);
                  const isYesterday = date.toDateString() === new Date(Date.now() - 86400000).toDateString();
                  const dateLabel = isYesterday
                    ? 'Yesterday'
                    : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                  const dayWorkouts = groupedWorkouts[dateStr];
                  const dayCalories = dayWorkouts.reduce((sum, w) => sum + w.totalCaloriesBurned, 0);
                  const dayDuration = dayWorkouts.reduce((sum, w) => sum + w.totalDuration, 0);

                  return (
                    <View key={dateStr} style={dynamicStyles.historyDayCard}>
                      <View style={dynamicStyles.historyDayHeader}>
                        <Text style={dynamicStyles.historyDate}>{dateLabel}</Text>
                        <Text style={dynamicStyles.historyDaySummary}>
                          {dayWorkouts.length} workout{dayWorkouts.length !== 1 ? 's' : ''} • {dayCalories} cal • {formatDuration(dayDuration)}
                        </Text>
                      </View>
                      {dayWorkouts.map(workout => (
                        <View key={workout.id} style={dynamicStyles.historyWorkoutItem}>
                          <View style={dynamicStyles.historyWorkoutInfo}>
                            <Text style={dynamicStyles.historyWorkoutName}>{workout.name}</Text>
                            <Text style={dynamicStyles.historyWorkoutDetails}>
                              {workout.exercises.map(e => e.exercise.icon).join(' ')} {formatDuration(workout.totalDuration)} • {workout.totalCaloriesBurned} cal
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => handleDeleteWorkout(workout.id)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Ionicons name="trash-outline" size={16} color={colors.textTertiary} style={{ opacity: 0.5 }} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  );
                });
              })()}
            </>
          ) : (
            <View style={dynamicStyles.emptyState}>
              <Text style={dynamicStyles.emptyText}>
                Start logging workouts to build your history!
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Quick Log Modal */}
      <Modal
        visible={showQuickLog}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQuickLog(false)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <Text style={dynamicStyles.modalTitle}>Log Exercise</Text>

            {/* Category Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={dynamicStyles.categoryTabs}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      dynamicStyles.categoryTab,
                      selectedCategory === cat.key && dynamicStyles.categoryTabActive,
                    ]}
                    onPress={() => setSelectedCategory(cat.key)}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={20}
                      color={selectedCategory === cat.key ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[
                      dynamicStyles.categoryTabText,
                      selectedCategory === cat.key && dynamicStyles.categoryTabTextActive,
                    ]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Exercise Options */}
            <ScrollView style={{ maxHeight: 200 }}>
              {filteredExercises.map((exercise) => (
                <TouchableOpacity
                  key={exercise.id}
                  style={[
                    dynamicStyles.exerciseOption,
                    selectedExercise?.id === exercise.id && dynamicStyles.exerciseOptionSelected,
                  ]}
                  onPress={() => setSelectedExercise(exercise)}
                >
                  <Text style={dynamicStyles.exerciseIcon}>{exercise.icon}</Text>
                  <Text style={dynamicStyles.exerciseName}>{exercise.name}</Text>
                  <Text style={dynamicStyles.exerciseCal}>
                    ~{Math.round(exercise.caloriesPerMinute * 30)} cal/30min
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Duration Input */}
            <View style={dynamicStyles.inputRow}>
              <Text style={dynamicStyles.inputLabel}>Duration</Text>
              <View style={dynamicStyles.durationInput}>
                <TextInput
                  style={dynamicStyles.input}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="number-pad"
                  placeholder="30"
                  placeholderTextColor={colors.textSecondary}
                />
                <Text style={dynamicStyles.inputSuffix}>minutes</Text>
              </View>
            </View>

            {/* Intensity */}
            <View style={dynamicStyles.inputRow}>
              <Text style={dynamicStyles.inputLabel}>Intensity</Text>
              <View style={dynamicStyles.intensityOptions}>
                {INTENSITIES.map((int) => (
                  <TouchableOpacity
                    key={int.key}
                    style={[
                      dynamicStyles.intensityOption,
                      intensity === int.key && dynamicStyles.intensityOptionSelected,
                    ]}
                    onPress={() => setIntensity(int.key)}
                  >
                    <Text style={[
                      dynamicStyles.intensityText,
                      intensity === int.key && dynamicStyles.intensityTextSelected,
                    ]}>
                      {int.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Calorie Preview */}
            {selectedExercise && (
              <View style={dynamicStyles.caloriePreview}>
                <Text style={dynamicStyles.caloriePreviewText}>
                  🔥 Estimated: {previewCalories} calories burned
                </Text>
              </View>
            )}

            {/* Buttons */}
            <View style={dynamicStyles.modalButtons}>
              <TouchableOpacity
                style={dynamicStyles.cancelButton}
                onPress={() => {
                  setShowQuickLog(false);
                  setSelectedExercise(null);
                }}
              >
                <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={dynamicStyles.saveButton}
                onPress={handleQuickLog}
              >
                <Text style={dynamicStyles.saveButtonText}>Log Exercise</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

