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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { useTheme } from '../hooks/useTheme';
import { PurchasesPackage } from 'react-native-purchases';

export default function PaywallScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { 
    availablePackages, 
    purchasePackage, 
    restorePurchases,
    getAvailablePackages,
    subscriptionStatus,
    trialInfo,
  } = useSubscriptionStore();
  
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);

  useEffect(() => {
    loadPackages();
  }, []);

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
    pkg.identifier.toLowerCase().includes('monthly')
  );
  const annualPackage = availablePackages?.find(pkg => 
    pkg.identifier.toLowerCase().includes('annual') || 
    pkg.identifier.toLowerCase().includes('yearly')
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
      padding: 20,
    },
    heroSection: {
      alignItems: 'center',
      marginBottom: 32,
    },
    heroIcon: {
      fontSize: 80,
      marginBottom: 16,
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    heroSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    featuresSection: {
      marginBottom: 32,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
    },
    featureIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    featureText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    packagesSection: {
      marginBottom: 24,
    },
    packageCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: colors.border,
    },
    packageCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    packageHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    packageName: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    packagePrice: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
    },
    packagePeriod: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    savingsBadge: {
      backgroundColor: colors.success,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
      marginTop: 8,
    },
    savingsText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    purchaseButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    purchaseButtonDisabled: {
      backgroundColor: colors.surfaceSecondary,
      opacity: 0.5,
    },
    purchaseButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
    },
    restoreButton: {
      paddingVertical: 12,
      alignItems: 'center',
    },
    restoreButtonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    trialBadge: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      alignSelf: 'center',
    },
    trialBadgeText: {
      fontSize: 14,
      fontWeight: '700',
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
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

      <ScrollView style={styles.scrollView} contentContainerStyle={dynamicStyles.scrollContent}>
        {/* Hero Section */}
        <View style={dynamicStyles.heroSection}>
          <Text style={dynamicStyles.heroIcon}>💎</Text>
          <Text style={dynamicStyles.heroTitle}>Unlock All Features</Text>
          {subscriptionStatus === 'trial' && trialInfo && trialInfo.isActive ? (
            <>
              <Text style={dynamicStyles.heroSubtitle}>
                You're enjoying your free trial! 🎉
              </Text>
              <View style={[dynamicStyles.trialBadge, { backgroundColor: colors.success + '20', marginTop: 16 }]}>
                <Text style={[dynamicStyles.trialBadgeText, { color: colors.success }]}>
                  {trialInfo.daysRemaining} day{trialInfo.daysRemaining !== 1 ? 's' : ''} left in trial
                </Text>
              </View>
              <Text style={[dynamicStyles.heroSubtitle, { marginTop: 16, fontSize: 14 }]}>
                Subscribe now to continue premium access after your trial ends
              </Text>
            </>
          ) : (
            <Text style={dynamicStyles.heroSubtitle}>
              Start your 3-day free trial and get unlimited access to all premium features
            </Text>
          )}
        </View>

        {/* Features List */}
        <View style={dynamicStyles.featuresSection}>
          <View style={dynamicStyles.featureItem}>
            <Text style={dynamicStyles.featureIcon}>📸</Text>
            <Text style={dynamicStyles.featureText}>Unlimited Photo Scans</Text>
          </View>
          <View style={dynamicStyles.featureItem}>
            <Text style={dynamicStyles.featureIcon}>📊</Text>
            <Text style={dynamicStyles.featureText}>Unlimited Barcode Scanning</Text>
          </View>
          <View style={dynamicStyles.featureItem}>
            <Text style={dynamicStyles.featureIcon}>📈</Text>
            <Text style={dynamicStyles.featureText}>Advanced Analytics (30+ day history)</Text>
          </View>
          <View style={dynamicStyles.featureItem}>
            <Text style={dynamicStyles.featureIcon}>🍳</Text>
            <Text style={dynamicStyles.featureText}>Recipe Builder</Text>
          </View>
          <View style={dynamicStyles.featureItem}>
            <Text style={dynamicStyles.featureIcon}>📤</Text>
            <Text style={dynamicStyles.featureText}>Export Data (CSV/PDF)</Text>
          </View>
          <View style={dynamicStyles.featureItem}>
            <Text style={dynamicStyles.featureIcon}>✨</Text>
            <Text style={dynamicStyles.featureText}>Ad-Free Experience</Text>
          </View>
          <View style={dynamicStyles.featureItem}>
            <Text style={dynamicStyles.featureIcon}>🎯</Text>
            <Text style={dynamicStyles.featureText}>Priority Support</Text>
          </View>
        </View>

        {/* Packages */}
        <View style={dynamicStyles.packagesSection}>
          {loading && !availablePackages ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              {annualPackage && (
                <TouchableOpacity
                  style={[
                    dynamicStyles.packageCard,
                    selectedPackage?.identifier === annualPackage.identifier && dynamicStyles.packageCardSelected,
                  ]}
                  onPress={() => setSelectedPackage(annualPackage)}
                >
                  <View style={dynamicStyles.packageHeader}>
                    <Text style={dynamicStyles.packageName}>Annual</Text>
                    <Text style={dynamicStyles.packagePrice}>{formatPrice(annualPackage)}</Text>
                  </View>
                  <Text style={dynamicStyles.packagePeriod}>per year</Text>
                  {savings && (
                    <View style={dynamicStyles.savingsBadge}>
                      <Text style={dynamicStyles.savingsText}>Save {savings}%</Text>
                    </View>
                  )}
                  {subscriptionStatus !== 'trial' && (
                    <View style={[dynamicStyles.savingsBadge, { backgroundColor: colors.primary + '20', marginTop: 8 }]}>
                      <Text style={[dynamicStyles.savingsText, { color: colors.primary }]}>
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
                  >
                    <Text style={dynamicStyles.purchaseButtonText}>
                      {loading ? 'Processing...' : subscriptionStatus === 'trial' ? 'Subscribe Annual' : 'Start Free Trial'}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              )}

              {monthlyPackage && (
                <TouchableOpacity
                  style={[
                    dynamicStyles.packageCard,
                    selectedPackage?.identifier === monthlyPackage.identifier && dynamicStyles.packageCardSelected,
                  ]}
                  onPress={() => setSelectedPackage(monthlyPackage)}
                >
                  <View style={dynamicStyles.packageHeader}>
                    <Text style={dynamicStyles.packageName}>Monthly</Text>
                    <Text style={dynamicStyles.packagePrice}>{formatPrice(monthlyPackage)}</Text>
                  </View>
                  <Text style={dynamicStyles.packagePeriod}>per month</Text>
                  {subscriptionStatus !== 'trial' && (
                    <View style={[dynamicStyles.savingsBadge, { backgroundColor: colors.primary + '20', marginTop: 8 }]}>
                      <Text style={[dynamicStyles.savingsText, { color: colors.primary }]}>
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
                  >
                    <Text style={dynamicStyles.purchaseButtonText}>
                      {loading ? 'Processing...' : subscriptionStatus === 'trial' ? 'Subscribe Monthly' : 'Start Free Trial'}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              )}

              {(!monthlyPackage && !annualPackage) && (
                <View style={dynamicStyles.packageCard}>
                  <Text style={[dynamicStyles.packageName, { textAlign: 'center', marginBottom: 16 }]}>
                    No packages available
                  </Text>
                  <Text style={[dynamicStyles.packagePeriod, { textAlign: 'center' }]}>
                    Please configure your RevenueCat offerings
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

        <View style={{ height: 40 }} />
      </ScrollView>

      {loading && (
        <View style={dynamicStyles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
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

