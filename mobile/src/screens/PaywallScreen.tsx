import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { useTheme } from '../hooks/useTheme';
import { PurchasesPackage } from 'react-native-purchases';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PaywallScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const {
    availablePackages,
    purchasePackage,
    restorePurchases,
    getAvailablePackages,
    checkSubscriptionStatus,
    subscriptionStatus,
    trialInfo,
  } = useSubscriptionStore();

  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);

  // Debug state to show on screen
  const [debugInfo, setDebugInfo] = useState<string>('Loading...');
  const [hasLoaded, setHasLoaded] = useState(false);

  // Fetch data only once on mount
  useEffect(() => {
    if (!hasLoaded) {
      setHasLoaded(true);
      refreshStatus();
    }
  }, [hasLoaded]);

  // Update debug info when data changes (no fetch)
  useEffect(() => {
    const info = {
      packages: availablePackages?.length || 0,
      status: subscriptionStatus,
      hasKey: !!process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
      keyStart: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY?.substring(0, 10) || 'none',
    };

    console.log('🔍 PaywallScreen Debug:', JSON.stringify(info));
    setDebugInfo(JSON.stringify(info, null, 2));
  }, [availablePackages, subscriptionStatus]);

  const refreshStatus = async () => {
    setLoading(true);
    try {
      await checkSubscriptionStatus();
      await getAvailablePackages();
    } finally {
      setLoading(false);
    }
  };

  const loadPackages = async () => {
    setLoading(true);
    await getAvailablePackages();
    setLoading(false);
  };

  const handlePurchase = async (pkg: PurchasesPackage) => {
    setLoading(true);
    try {
      const success = await purchasePackage(pkg);
      if (success) {
        // Refresh subscription status after purchase
        await checkSubscriptionStatus();

        Alert.alert(
          'Welcome to Premium! 🎉',
          'You now have access to all premium features.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert('Purchase Failed', error.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const restored = await restorePurchases();
      if (restored) {
        Alert.alert('Purchases Restored', 'Your premium subscription has been restored!');
        navigation.goBack();
      } else {
        Alert.alert('No Purchases Found', 'We couldn\'t find any previous purchases to restore.');
      }
    } catch (error: any) {
      Alert.alert('Restore Failed', error.message || 'Failed to restore purchases.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (pkg: PurchasesPackage) => {
    return pkg.product.priceString;
  };

  const getPackageName = (pkg: PurchasesPackage) => {
    const identifier = pkg.identifier.toLowerCase();
    if (identifier.includes('monthly')) return 'Monthly';
    if (identifier.includes('annual') || identifier.includes('yearly')) return 'Annual';
    return 'Premium';
  };

  const getSavings = (monthlyPkg: PurchasesPackage | null, annualPkg: PurchasesPackage | null) => {
    if (!monthlyPkg || !annualPkg) return null;

    const monthlyPrice = monthlyPkg.product.price;
    const annualPrice = annualPkg.product.price;
    const monthlyEquivalent = annualPrice / 12;
    const savings = ((monthlyPrice - monthlyEquivalent) / monthlyPrice) * 100;

    return Math.round(savings);
  };

  const monthlyPackage = availablePackages?.find(pkg =>
    pkg.identifier.toLowerCase().includes('monthly') ||
    pkg.packageType === 1 // Monthly package type enum
  );
  const annualPackage = availablePackages?.find(pkg =>
    pkg.identifier.toLowerCase().includes('annual') ||
    pkg.identifier.toLowerCase().includes('yearly') ||
    pkg.packageType === 5 // Annual package type enum
  );
  const savings = getSavings(monthlyPackage || null, annualPackage || null);

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
      padding: 4,
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
    scrollContent: {
      paddingBottom: 40,
    },
    heroSection: {
      alignItems: 'center',
      paddingTop: 32,
      paddingBottom: 32,
      paddingHorizontal: 20,
      marginBottom: 8,
    },
    heroGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 300,
      opacity: isDark ? 0.1 : 0.05,
    },
    heroIcon: {
      fontSize: 90,
      marginBottom: 20,
    },
    heroTitle: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 12,
      letterSpacing: -0.5,
    },
    heroSubtitle: {
      fontSize: 17,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      maxWidth: SCREEN_WIDTH - 80,
    },
    trialBadge: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      alignSelf: 'center',
      marginTop: 16,
    },
    trialBadgeText: {
      fontSize: 14,
      fontWeight: '700',
    },
    featuresSection: {
      paddingHorizontal: 20,
      marginBottom: 32,
    },
    featuresTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    featureGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    featureItem: {
      width: (SCREEN_WIDTH - 60) / 2,
      backgroundColor: colors.surface,
      padding: 18,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    featureIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    featureText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '600',
      textAlign: 'center',
    },
    packagesSection: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    packagesTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    packageCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: colors.border,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    packageCardSelected: {
      borderColor: colors.primary,
      backgroundColor: isDark ? colors.primary + '15' : colors.primary + '08',
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
    },
    packageHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    packageName: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      flex: 1,
    },
    packagePriceContainer: {
      alignItems: 'flex-end',
    },
    packagePrice: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: -1,
    },
    packagePeriod: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    savingsBadge: {
      backgroundColor: colors.success,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      alignSelf: 'flex-start',
      marginTop: 12,
      marginBottom: 8,
    },
    savingsText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '700',
    },
    trialBadgeInline: {
      backgroundColor: isDark ? colors.primary + '30' : colors.primary + '15',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      alignSelf: 'flex-start',
      marginTop: 8,
      marginBottom: 8,
    },
    trialBadgeInlineText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '700',
    },
    popularBadge: {
      position: 'absolute',
      top: -12,
      right: 20,
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    popularBadgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    purchaseButton: {
      paddingVertical: 18,
      borderRadius: 14,
      alignItems: 'center',
      marginTop: 12,
      overflow: 'hidden',
    },
    purchaseButtonGradient: {
      width: '100%',
      alignItems: 'center',
      paddingVertical: 18,
    },
    purchaseButtonDisabled: {
      backgroundColor: colors.surfaceSecondary,
      opacity: 0.5,
    },
    purchaseButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    restoreButton: {
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    restoreButtonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 24,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 12,
      color: colors.textTertiary,
      textAlign: 'center',
      lineHeight: 18,
      marginBottom: 8,
    },
    footerLink: {
      color: colors.primary,
      textDecorationLine: 'underline',
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    loadingText: {
      color: '#FFFFFF',
      marginTop: 16,
      fontSize: 16,
      fontWeight: '600',
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
          <Text style={dynamicStyles.backText}>← Close</Text>
        </TouchableOpacity>
        <Text style={dynamicStyles.title}>Upgrade to Premium</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={dynamicStyles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* DEBUG PANEL - Remove after debugging */}
        {__DEV__ && (
          <View style={{
            backgroundColor: '#1a1a2e',
            padding: 12,
            margin: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#e94560'
          }}>
            <Text style={{ color: '#e94560', fontWeight: 'bold', marginBottom: 8 }}>
              🔍 DEBUG INFO (visible on device)
            </Text>
            <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'monospace' }}>
              {debugInfo}
            </Text>
            <Text style={{ color: '#888', fontSize: 11, marginTop: 8 }}>
              Packages: {availablePackages?.length || 0} | Status: {subscriptionStatus}
            </Text>
          </View>
        )}

        {/* Hero Section */}
        <View style={dynamicStyles.heroSection}>
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={dynamicStyles.heroGradient}
          />
          <Text style={dynamicStyles.heroIcon}>💎</Text>
          <Text style={dynamicStyles.heroTitle}>Unlock Premium</Text>
          {subscriptionStatus === 'trial' && trialInfo && trialInfo.isActive ? (
            <>
              <Text style={dynamicStyles.heroSubtitle}>
                You're enjoying your free trial! 🎉
              </Text>
              <View style={[dynamicStyles.trialBadge, { backgroundColor: colors.success + '20' }]}>
                <Text style={[dynamicStyles.trialBadgeText, { color: colors.success }]}>
                  {trialInfo.daysRemaining} day{trialInfo.daysRemaining !== 1 ? 's' : ''} left in trial
                </Text>
              </View>
              <Text style={[dynamicStyles.heroSubtitle, { marginTop: 16, fontSize: 15 }]}>
                Subscribe now to continue premium access after your trial ends
              </Text>
            </>
          ) : (
            <Text style={dynamicStyles.heroSubtitle}>
              Start your 3-day free trial and get unlimited access to all premium features
            </Text>
          )}
        </View>

        {/* Features Grid */}
        <View style={dynamicStyles.featuresSection}>
          <Text style={dynamicStyles.featuresTitle}>Everything You Need</Text>
          <View style={dynamicStyles.featureGrid}>
            <View style={dynamicStyles.featureItem}>
              <Text style={dynamicStyles.featureIcon}>📸</Text>
              <Text style={dynamicStyles.featureText}>Unlimited Photo Scans</Text>
            </View>
            <View style={dynamicStyles.featureItem}>
              <Text style={dynamicStyles.featureIcon}>📊</Text>
              <Text style={dynamicStyles.featureText}>Barcode Scanning</Text>
            </View>
            <View style={dynamicStyles.featureItem}>
              <Text style={dynamicStyles.featureIcon}>📈</Text>
              <Text style={dynamicStyles.featureText}>Advanced Analytics</Text>
            </View>
            <View style={dynamicStyles.featureItem}>
              <Text style={dynamicStyles.featureIcon}>🍳</Text>
              <Text style={dynamicStyles.featureText}>Recipe Builder</Text>
            </View>
            <View style={dynamicStyles.featureItem}>
              <Text style={dynamicStyles.featureIcon}>📤</Text>
              <Text style={dynamicStyles.featureText}>Export Data</Text>
            </View>
            <View style={dynamicStyles.featureItem}>
              <Text style={dynamicStyles.featureIcon}>✨</Text>
              <Text style={dynamicStyles.featureText}>Ad-Free</Text>
            </View>
          </View>
        </View>

        {/* Packages */}
        <View style={dynamicStyles.packagesSection}>
          <Text style={dynamicStyles.packagesTitle}>Choose Your Plan</Text>
          {loading && !availablePackages ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <>
              {annualPackage && (
                <View style={{ position: 'relative' }}>
                  <View style={dynamicStyles.popularBadge}>
                    <Text style={dynamicStyles.popularBadgeText}>BEST VALUE</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      dynamicStyles.packageCard,
                      selectedPackage?.identifier === annualPackage.identifier && dynamicStyles.packageCardSelected,
                    ]}
                    onPress={() => setSelectedPackage(annualPackage)}
                    activeOpacity={0.8}
                  >
                    <View style={dynamicStyles.packageHeader}>
                      <Text style={dynamicStyles.packageName}>Annual</Text>
                      <View style={dynamicStyles.packagePriceContainer}>
                        <Text style={dynamicStyles.packagePrice}>{formatPrice(annualPackage)}</Text>
                        <Text style={dynamicStyles.packagePeriod}>per year</Text>
                      </View>
                    </View>
                    {savings && (
                      <View style={dynamicStyles.savingsBadge}>
                        <Text style={dynamicStyles.savingsText}>Save {savings}%</Text>
                      </View>
                    )}
                    {subscriptionStatus !== 'trial' && (
                      <View style={dynamicStyles.trialBadgeInline}>
                        <Text style={dynamicStyles.trialBadgeInlineText}>
                          3-day free trial
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={[
                        dynamicStyles.purchaseButton,
                        loading && dynamicStyles.purchaseButtonDisabled,
                      ]}
                      onPress={() => handlePurchase(annualPackage)}
                      disabled={loading}
                      activeOpacity={0.9}
                    >
                      <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={dynamicStyles.purchaseButtonGradient}
                      >
                        <Text style={dynamicStyles.purchaseButtonText}>
                          {loading ? 'Processing...' : subscriptionStatus === 'trial' ? 'Subscribe Annual' : 'Start Free Trial'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </View>
              )}

              {monthlyPackage && (
                <TouchableOpacity
                  style={[
                    dynamicStyles.packageCard,
                    selectedPackage?.identifier === monthlyPackage.identifier && dynamicStyles.packageCardSelected,
                  ]}
                  onPress={() => setSelectedPackage(monthlyPackage)}
                  activeOpacity={0.8}
                >
                  <View style={dynamicStyles.packageHeader}>
                    <Text style={dynamicStyles.packageName}>Monthly</Text>
                    <View style={dynamicStyles.packagePriceContainer}>
                      <Text style={dynamicStyles.packagePrice}>{formatPrice(monthlyPackage)}</Text>
                      <Text style={dynamicStyles.packagePeriod}>per month</Text>
                    </View>
                  </View>
                  {subscriptionStatus !== 'trial' && (
                    <View style={dynamicStyles.trialBadgeInline}>
                      <Text style={dynamicStyles.trialBadgeInlineText}>
                        3-day free trial
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={[
                      dynamicStyles.purchaseButton,
                      loading && dynamicStyles.purchaseButtonDisabled,
                    ]}
                    onPress={() => handlePurchase(monthlyPackage)}
                    disabled={loading}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={[colors.primary, colors.primaryDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={dynamicStyles.purchaseButtonGradient}
                    >
                      <Text style={dynamicStyles.purchaseButtonText}>
                        {loading ? 'Processing...' : subscriptionStatus === 'trial' ? 'Subscribe Monthly' : 'Start Free Trial'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </TouchableOpacity>
              )}

              {(!monthlyPackage && !annualPackage) && (
                <View style={dynamicStyles.packageCard}>
                  <Text style={{ fontSize: 32, textAlign: 'center', marginBottom: 16 }}>⚙️</Text>
                  <Text style={[dynamicStyles.packageName, { textAlign: 'center', marginBottom: 8 }]}>
                    No Packages Available
                  </Text>
                  <Text style={[dynamicStyles.packagePeriod, { textAlign: 'center', marginBottom: 16 }]}>
                    RevenueCat offerings need to be configured
                  </Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: colors.primary,
                      paddingVertical: 12,
                      paddingHorizontal: 24,
                      borderRadius: 8,
                      marginBottom: 12,
                    }}
                    onPress={loadPackages}
                    disabled={loading}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                      {loading ? 'Checking...' : 'Retry'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={[dynamicStyles.packagePeriod, { textAlign: 'center', fontSize: 12, paddingHorizontal: 16 }]}>
                    See REVENUECAT_OFFERINGS_SETUP.md for instructions
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Restore Purchases */}
        <TouchableOpacity
          style={dynamicStyles.restoreButton}
          onPress={handleRestore}
          disabled={loading}
        >
          <Text style={dynamicStyles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={dynamicStyles.footer}>
          <Text style={dynamicStyles.footerText}>
            Subscriptions auto-renew unless cancelled. Cancel anytime in Settings.
          </Text>
          <Text style={dynamicStyles.footerText}>
            By subscribing, you agree to our{' '}
            <Text
              style={dynamicStyles.footerLink}
              onPress={() => navigation.navigate('TermsOfUse' as never)}
            >
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text
              style={dynamicStyles.footerLink}
              onPress={() => navigation.navigate('PrivacyPolicy' as never)}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
      </ScrollView>

      {loading && (
        <View style={dynamicStyles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={dynamicStyles.loadingText}>Processing...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});

