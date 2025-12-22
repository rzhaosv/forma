import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyPolicyScreen() {
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
                <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
                    Last Updated: December 22, 2025
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Information We Collect</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    Forma ("we," "us," or "our") collects information to provide better services to all our users. This includes:
                    {"\n\n"}
                    • Health Data: If you grant permission, we access Apple HealthKit or Google Fit data to provide personalized insights.
                    {"\n"}
                    • Food & Nutrition: Images and descriptions of food you analyze using our AI.
                    {"\n"}
                    • Usage Data: Information about how you use the app and interact with features.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>2. How We Use Information</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    We use the information we collect to:
                    {"\n\n"}
                    • Provide, maintain, and improve our services.
                    {"\n"}
                    • Analyze food photos and provide nutritional feedback.
                    {"\n"}
                    • Personalize your health and fitness dashboard.
                    {"\n"}
                    • Send you technical notices, updates, and support messages.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Data Sharing and Disclosure</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    We do not sell your personal data. We may share information with:
                    {"\n\n"}
                    • Service Providers: OpenAI for vision analysis and RevenueCat for subscription management.
                    {"\n"}
                    • Legal Requirements: If required by law or to protect our rights.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Your Choices</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    You can manage your data by:
                    {"\n\n"}
                    • Revoking camera or health permissions in system settings.
                    {"\n"}
                    • Deleting your account and all associated data in the Settings menu.
                    {"\n"}
                    • Contacting us at support@example.com for data requests.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Security</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access.
                </Text>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textTertiary }]}>
                        © 2025 Forma. All rights reserved.
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
    lastUpdated: {
        fontSize: 14,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 24,
        marginBottom: 12,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 24,
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
    },
});
