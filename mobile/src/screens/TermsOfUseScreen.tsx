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

export default function TermsOfUseScreen() {
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
                <Text style={[styles.headerTitle, { color: colors.text }]}>Terms of Use</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
                    Last Updated: December 22, 2025
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Acceptance of Terms</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    By accessing or using the NutriSnap mobile application ("App"), you agree to be bound by these Terms of Use ("Terms"). If you do not agree to these Terms, do not use the App.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Description of Service</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    NutriSnap is an AI-powered nutrition and health tracking application. Features include food recognition, nutrition logging, and health data integration.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Subscriptions and Payments</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    • Payment will be charged to your Apple ID account at the confirmation of purchase.
                    {"\n"}
                    • Subscription automatically renews unless it is cancelled at least 24 hours before the end of the current period.
                    {"\n"}
                    • Your account will be charged for renewal within 24 hours prior to the end of the current period.
                    {"\n"}
                    • You can manage and cancel your subscriptions by going to your account settings on the App Store after purchase.
                    {"\n"}
                    • Any unused portion of a free trial period, if offered, will be forfeited when the user purchases a subscription to that publication, where applicable.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>4. User Content</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    You retain all rights to the photos and data you upload to the App. However, by using the App, you grant us a license to process this data to provide the services.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Medical Disclaimer</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    NutriSnap is NOT a medical device. The information produced by the App is for educational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Standard EULA</Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    In addition to these terms, your use of the App is subject to the Apple Standard Licensed Application End User License Agreement:
                    {"\n"}
                    <TouchableOpacity onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}>
                        <Text style={{ color: colors.primary, fontWeight: '600' }}>
                            View Apple Standard EULA
                        </Text>
                    </TouchableOpacity>
                </Text>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textTertiary }]}>
                        © 2025 NutriSnap. All rights reserved.
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
