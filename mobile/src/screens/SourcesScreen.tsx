import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

// Every formula or dataset the app actually uses, with a primary source.
// Keep in sync with src/utils/calorieCalculator.ts and the BMI preview in
// src/screens/onboarding/PhysicalInfoScreen.tsx.
const SOURCES: { title: string; usedFor: string; citation: string; url: string }[] = [
    {
        title: 'WHO — Body mass index (BMI) classification',
        usedFor: 'BMI value and category (underweight / healthy / overweight / obese) shown in your profile.',
        citation: 'World Health Organization. A healthy lifestyle — WHO recommendations.',
        url: 'https://www.who.int/europe/news-room/fact-sheets/item/a-healthy-lifestyle---who-recommendations',
    },
    {
        title: 'CDC — About Adult BMI',
        usedFor: 'BMI formula (weight ÷ height²) and its limitations.',
        citation: 'Centers for Disease Control and Prevention. Adult BMI calculator.',
        url: 'https://www.cdc.gov/bmi/adult-calculator/index.html',
    },
    {
        title: 'Mifflin–St Jeor equation (BMR)',
        usedFor: 'Basal metabolic rate, which is multiplied by an activity factor to estimate your daily calorie target.',
        citation: 'Mifflin MD, St Jeor ST, et al. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr. 1990;51(2):241–247.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/2305711/',
    },
    {
        title: 'Dietary Guidelines for Americans, 2020–2025',
        usedFor: 'General calorie and nutrition guidance, including the 1,200 kcal/day minimum floor applied to targets.',
        citation: 'U.S. Department of Agriculture and U.S. Department of Health and Human Services.',
        url: 'https://www.dietaryguidelines.gov/',
    },
    {
        title: 'Institute of Medicine — Dietary Reference Intakes for macronutrients',
        usedFor: 'Acceptable Macronutrient Distribution Ranges behind the 30% protein / 40% carbohydrate / 30% fat split.',
        citation: 'Institute of Medicine. Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids. National Academies Press; 2005.',
        url: 'https://nap.nationalacademies.org/catalog/10490',
    },
    {
        title: 'USDA FoodData Central',
        usedFor: 'Reference nutrition data for foods and ingredients.',
        citation: 'U.S. Department of Agriculture, Agricultural Research Service.',
        url: 'https://fdc.nal.usda.gov/',
    },
];

export default function SourcesScreen() {
    const navigation = useNavigation();
    const { colors, isDark } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Sources & References</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.paragraph, { color: colors.textSecondary, marginBottom: 8 }]}>
                    Nibble's BMI, calorie and macronutrient figures are estimates based on the
                    published formulas and datasets below. Tap any entry to open the source.
                </Text>

                {SOURCES.map((s) => (
                    <TouchableOpacity
                        key={s.url}
                        style={[styles.sourceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => Linking.openURL(s.url)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.sourceHeader}>
                            <Text style={[styles.sourceTitle, { color: colors.text }]}>{s.title}</Text>
                            <Ionicons name="open-outline" size={18} color={colors.primary} />
                        </View>
                        <Text style={[styles.sourceUsedFor, { color: colors.textSecondary }]}>
                            Used for: {s.usedFor}
                        </Text>
                        <Text style={[styles.sourceCitation, { color: colors.textSecondary }]}>{s.citation}</Text>
                        <Text style={[styles.sourceUrl, { color: colors.primary }]} numberOfLines={1}>
                            {s.url}
                        </Text>
                    </TouchableOpacity>
                ))}

                <View style={[styles.disclaimer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="medkit-outline" size={16} color={colors.textSecondary} style={{ marginRight: 8, marginTop: 2 }} />
                    <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
                        This information is for general wellness purposes and is not medical advice.
                        Consult a doctor or registered dietitian before changing your diet, especially if
                        you are pregnant, under 18, or have a medical condition.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    backButton: {
        padding: 4,
    },
    headerSpacer: {
        width: 32,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 24,
    },
    sourceCard: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginTop: 12,
    },
    sourceHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 8,
    },
    sourceTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
    },
    sourceUsedFor: {
        fontSize: 14,
        lineHeight: 20,
        marginTop: 6,
    },
    sourceCitation: {
        fontSize: 13,
        lineHeight: 18,
        marginTop: 6,
        fontStyle: 'italic',
    },
    sourceUrl: {
        fontSize: 13,
        marginTop: 6,
        textDecorationLine: 'underline',
    },
    disclaimer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderRadius: 12,
        borderWidth: 1,
        padding: 14,
        marginTop: 24,
    },
    disclaimerText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 19,
    },
});
