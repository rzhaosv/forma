# Forma Component Library

**Reusable React Native components with specifications**

---

## Button Components

### Primary Button

```typescript
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export const PrimaryButton = ({ 
  title, 
  onPress, 
  disabled = false, 
  loading = false,
  fullWidth = true 
}: ButtonProps) => (
  <TouchableOpacity
    style={[
      styles.button,
      styles.primaryButton,
      fullWidth && styles.fullWidth,
      (disabled || loading) && styles.buttonDisabled,
    ]}
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.8}
  >
    {loading ? (
      <ActivityIndicator color="#FFFFFF" />
    ) : (
      <Text style={styles.primaryButtonText}>{title}</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#6366F1',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fullWidth: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
```

### Secondary Button

```typescript
export const SecondaryButton = ({ title, onPress, disabled, loading }: ButtonProps) => (
  <TouchableOpacity
    style={[
      styles.button,
      styles.secondaryButton,
      (disabled || loading) && styles.buttonDisabled,
    ]}
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.8}
  >
    {loading ? (
      <ActivityIndicator color="#111827" />
    ) : (
      <Text style={styles.secondaryButtonText}>{title}</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    shadowOpacity: 0.05,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});
```

---

## Input Components

### Text Input

```typescript
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}

export const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType = 'default',
}: InputProps) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[
        styles.input,
        error && styles.inputError,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#6B7280"
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111827',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});
```

---

## Card Components

### Base Card

```typescript
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
}

export const Card = ({ children, style, noPadding }: CardProps) => (
  <View style={[styles.card, !noPadding && styles.cardPadding, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardPadding: {
    padding: 16,
  },
});
```

### Meal Card

```typescript
interface MealCardProps {
  emoji: string;
  mealType: string;
  time: string;
  foods: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  onPress: () => void;
}

export const MealCard = ({
  emoji,
  mealType,
  time,
  foods,
  calories,
  protein,
  carbs,
  fat,
  onPress,
}: MealCardProps) => (
  <TouchableOpacity style={styles.mealCard} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.mealHeader}>
      <View style={styles.mealTitleRow}>
        <Text style={styles.mealEmoji}>{emoji}</Text>
        <Text style={styles.mealType}>{mealType}</Text>
      </View>
      <Text style={styles.mealTime}>{time}</Text>
    </View>
    
    <Text style={styles.mealFoods}>{foods}</Text>
    
    <Text style={styles.mealNutrition}>
      {calories} calories · P: {protein}g · C: {carbs}g · F: {fat}g
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  mealType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  mealTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  mealFoods: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  mealNutrition: {
    fontSize: 12,
    color: '#6B7280',
  },
});
```

---

## Progress Components

### Progress Ring

```typescript
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface ProgressRingProps {
  progress: number; // 0-1
  size: number;
  strokeWidth: number;
  color: string;
  backgroundColor?: string;
  children?: React.ReactNode;
}

export const ProgressRing = ({
  progress,
  size,
  strokeWidth,
  color,
  backgroundColor = '#F3F4F6',
  children,
}: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.childrenContainer}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  childrenContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Usage example:
<ProgressRing
  progress={0.75}
  size={160}
  strokeWidth={12}
  color="#6366F1"
>
  <Text style={{ fontSize: 24, fontWeight: 'bold' }}>1,650</Text>
  <Text style={{ fontSize: 14, color: '#6B7280' }}>calories</Text>
</ProgressRing>
```

### Progress Bar

```typescript
interface ProgressBarProps {
  progress: number; // 0-1
  color: string;
  height?: number;
  backgroundColor?: string;
}

export const ProgressBar = ({
  progress,
  color,
  height = 8,
  backgroundColor = '#F3F4F6',
}: ProgressBarProps) => (
  <View style={[styles.barTrack, { height, backgroundColor, borderRadius: height / 2 }]}>
    <View
      style={[
        styles.barFill,
        {
          width: `${Math.min(progress * 100, 100)}%`,
          height,
          backgroundColor: color,
          borderRadius: height / 2,
        },
      ]}
    />
  </View>
);

const styles = StyleSheet.create({
  barTrack: {
    width: '100%',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
});
```

---

## Badge Component

```typescript
interface BadgeProps {
  text: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
}

export const Badge = ({ text, variant = 'info' }: BadgeProps) => {
  const backgroundColor = {
    info: '#EFF6FF',
    success: '#DCFCE7',
    warning: '#FEF3C7',
    error: '#FEE2E2',
  }[variant];

  const textColor = {
    info: '#1E40AF',
    success: '#166534',
    warning: '#92400E',
    error: '#991B1B',
  }[variant];

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
```

---

## Empty State Component

```typescript
interface EmptyStateProps {
  icon: string; // emoji or icon name
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: EmptyStateProps) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyDescription}>{description}</Text>
    
    {actionLabel && onAction && (
      <PrimaryButton title={actionLabel} onPress={onAction} fullWidth={false} />
    )}
    
    {secondaryLabel && onSecondary && (
      <TouchableOpacity onPress={onSecondary} style={styles.secondaryAction}>
        <Text style={styles.secondaryActionText}>{secondaryLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  secondaryAction: {
    marginTop: 12,
    paddingVertical: 8,
  },
  secondaryActionText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '500',
  },
});
```

---

## Loading Component

```typescript
interface LoadingProps {
  message?: string;
}

export const Loading = ({ message = 'Loading...' }: LoadingProps) => (
  <View style={styles.loading}>
    <ActivityIndicator size="large" color="#6366F1" />
    {message && <Text style={styles.loadingText}>{message}</Text>}
  </View>
);

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
});
```

---

## Modal Bottom Sheet

```typescript
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const BottomSheet = ({ visible, onClose, title, children }: BottomSheetProps) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <TouchableOpacity
      style={styles.overlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <View style={styles.sheet}>
        <View style={styles.handle} />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <View style={{ width: 32 }} />
        </View>
        
        <View style={styles.content}>
          {children}
        </View>
      </View>
    </TouchableOpacity>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  closeButton: {
    fontSize: 24,
    color: '#6B7280',
    width: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    padding: 16,
  },
});
```

---

## Usage Guide

### Importing Components

```typescript
// In your screen file
import { 
  PrimaryButton, 
  SecondaryButton,
  Input,
  Card,
  MealCard,
  ProgressRing,
  Badge,
  EmptyState,
  Loading,
  BottomSheet,
} from '../components';
```

### Example Screen with Components

```typescript
export const HomeScreen = () => {
  const [loading, setLoading] = useState(false);
  const meals = useMeals(); // Your data hook

  if (loading) {
    return <Loading message="Loading meals..." />;
  }

  if (meals.length === 0) {
    return (
      <EmptyState
        icon="🍽️"
        title="No meals logged yet"
        description="Start by taking a photo of your meal or add foods manually"
        actionLabel="Take Photo"
        onAction={() => navigation.navigate('Camera')}
        secondaryLabel="or Browse Foods"
        onSecondary={() => navigation.navigate('FoodSearch')}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card>
        <ProgressRing progress={0.75} size={160} strokeWidth={12} color="#6366F1">
          <Text style={styles.calories}>1,650</Text>
          <Text style={styles.label}>calories</Text>
        </ProgressRing>
      </Card>

      {meals.map((meal) => (
        <MealCard
          key={meal.id}
          emoji={meal.emoji}
          mealType={meal.type}
          time={meal.time}
          foods={meal.foods}
          calories={meal.calories}
          protein={meal.protein}
          carbs={meal.carbs}
          fat={meal.fat}
          onPress={() => navigation.navigate('MealDetail', { id: meal.id })}
        />
      ))}

      <PrimaryButton
        title="Add Meal"
        onPress={() => navigation.navigate('AddMeal')}
      />
    </ScrollView>
  );
};
```

---

## Testing Checklist

### For Each Component

- [ ] Renders correctly with all props
- [ ] Handles missing optional props
- [ ] Shows correct states (default, hover, pressed, disabled)
- [ ] Accessible with screen readers
- [ ] Works on iOS and Android
- [ ] Looks good on small screens (iPhone SE)
- [ ] Looks good on large screens (tablets)
- [ ] Animations smooth (60fps)
- [ ] Touch targets minimum 48×48px

---

**Version:** 1.0.0  
**Last Updated:** November 12, 2025  
**Status:** Ready for implementation

