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

                <Text style={[styles.paragraph, { color: colors.textSecondary, marginBottom: 24 }]}>
                    Forma respects your privacy. This Privacy Policy explains how we collect, use, and protect your information.
                </Text>


                <Text style={[styles.sectionTitle, { color: colors.text }]}>Information We Collect</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    Forma may collect the following information:
                    {"\n\n"}
                    • Photos of food that you choose to upload for nutrition analysis
                    {"\n"}
                    • Nutrition data generated from your food photos
                    {"\n"}
                    • Usage data such as app interactions and feature usage
                    {"\n"}
                    • Optional health data if you choose to connect Apple Health or Google Fit
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>How We Use Your Information</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    We use your information to:
                    {"\n\n"}
                    • Analyze food photos and estimate nutritional values
                    {"\n"}
                    • Provide personalized insights and recommendations
                    {"\n"}
                    • Improve app performance and features
                    {"\n"}
                    • Sync data with connected health platforms when enabled
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Sharing</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    We do not sell your personal data.
                    {"\n"}
                    We may share limited data with trusted service providers strictly to operate the app (for example, cloud storage or analytics).
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Storage and Security</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    Your data is stored securely using industry-standard protections. We take reasonable measures to prevent unauthorized access.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Choices</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    You can:
                    {"\n\n"}
                    • Choose whether to upload food photos
                    {"\n"}
                    • Disconnect Apple Health or Google Fit at any time
                    {"\n"}
                    • Request deletion of your data by contacting us
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Us</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    If you have questions or requests related to privacy, contact us at:
                    {"\n"}
                    <Text
                        style={{ color: colors.primary, fontWeight: '600' }}
                        onPress={() => Linking.openURL('mailto:support@forma.app')}
                    >
                        support@forma.app
                    </Text>
                </Text>

                <TouchableOpacity
                    style={[styles.linkButton, { backgroundColor: isDark ? '#333' : '#F3F4F6' }]}
                    onPress={() => Linking.openURL('https://tryforma.app/privacy.html')}
                >
                    <Text style={[styles.linkButtonText, { color: colors.primary }]}>View Full Privacy Policy</Text>
                </TouchableOpacity>

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
    linkButton: {
        marginTop: 32,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    linkButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
