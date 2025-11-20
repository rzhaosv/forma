import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { useTheme } from '../hooks/useTheme';
import { PurchasesPackage } from 'react-native-purchases';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  showFeatures?: boolean;
}

export default function PaywallModal({
  visible,
  onClose,
  title = 'Unlock Premium',
  message,
  showFeatures = true,
}: PaywallModalProps) {
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

  useEffect(() => {
    if (visible) {
      refreshStatus();
    }
  }, [visible]);

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
        
        Alert.alert('Welcome to Premium! 🎉', 'You now have access to all premium features.', [
          {
            text: 'OK',
            onPress: () => {
              onClose();
            },
          },
        ]);
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
        onClose();
      } else {
        Alert.alert('No Purchases Found', "We couldn't find any previous purchases to restore.");
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

  const getSavings = (monthlyPkg: PurchasesPackage | null, annualPkg: PurchasesPackage | null) => {
    if (!monthlyPkg || !annualPkg) return null;

    const monthlyPrice = monthlyPkg.product.price;
    const annualPrice = annualPkg.product.price;
    const monthlyEquivalent = annualPrice / 12;
    const savings = ((monthlyPrice - monthlyEquivalent) / monthlyPrice) * 100;

    return Math.round(savings);
  };

  const monthlyPackage = availablePackages?.find((pkg) => pkg.identifier.toLowerCase().includes('monthly'));
  const annualPackage = availablePackages?.find(
    (pkg) => pkg.identifier.toLowerCase().includes('annual') || pkg.identifier.toLowerCase().includes('yearly')
  );
  const savings = getSavings(monthlyPackage || null, annualPackage || null);

  const dynamicStyles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContainer: {
      width: '100%',
      maxWidth: 500,
      maxHeight: '90%',
      backgroundColor: colors.surface,
      borderRadius: 24,
      overflow: 'hidden',
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      flex: 1,
    },
    closeButton: {
      padding: 4,
      marginLeft: 16,
    },
    closeButtonText: {
      fontSize: 24,
      color: colors.textSecondary,
      fontWeight: '300',
    },
    scrollContent: {
      padding: 20,
    },
    heroSection: {
      alignItems: 'center',
      paddingVertical: 24,
      marginBottom: 8,
    },
    heroIcon: {
      fontSize: 70,
      marginBottom: 16,
    },
    heroTitle: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    heroSubtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      maxWidth: SCREEN_WIDTH - 80,
    },
    trialBadge: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 16,
      alignSelf: 'center',
      marginTop: 12,
    },
    trialBadgeText: {
      fontSize: 13,
      fontWeight: '700',
    },
    featuresSection: {
      marginBottom: 24,
    },
    featuresTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    featureGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    featureItem: {
      width: (SCREEN_WIDTH - 100) / 2,
      backgroundColor: colors.surfaceSecondary,
      padding: 14,
      borderRadius: 12,
      marginBottom: 10,
      alignItems: 'center',
    },
    featureIcon: {
      fontSize: 28,
      marginBottom: 6,
    },
    featureText: {
      fontSize: 13,
      color: colors.text,
      fontWeight: '600',
      textAlign: 'center',
    },
    packagesSection: {
      marginBottom: 20,
    },
    packageCard: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 16,
      padding: 20,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: colors.border,
    },
    packageCardSelected: {
      borderColor: colors.primary,
      backgroundColor: isDark ? colors.primary + '15' : colors.primary + '08',
    },
    packageHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 10,
    },
    packageName: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      flex: 1,
    },
    packagePriceContainer: {
      alignItems: 'flex-end',
    },
    packagePrice: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.primary,
    },
    packagePeriod: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    savingsBadge: {
      backgroundColor: colors.success,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      alignSelf: 'flex-start',
      marginTop: 10,
      marginBottom: 6,
    },
    savingsText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    trialBadgeInline: {
      backgroundColor: isDark ? colors.primary + '30' : colors.primary + '15',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      alignSelf: 'flex-start',
      marginTop: 6,
      marginBottom: 6,
    },
    trialBadgeInlineText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '700',
    },
    popularBadge: {
      position: 'absolute',
      top: -10,
      right: 16,
      backgroundColor: colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 10,
    },
    popularBadgeText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '700',
    },
    purchaseButton: {
      borderRadius: 12,
      marginTop: 10,
      overflow: 'hidden',
    },
    purchaseButtonGradient: {
      width: '100%',
      alignItems: 'center',
      paddingVertical: 16,
    },
    purchaseButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    restoreButton: {
      paddingVertical: 14,
      alignItems: 'center',
    },
    restoreButtonText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: '600',
    },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 20,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 11,
      color: colors.textTertiary,
      textAlign: 'center',
      lineHeight: 16,
      marginBottom: 6,
    },
    footerLink: {
      color: colors.primary,
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
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={dynamicStyles.modalOverlay}>
        <View style={dynamicStyles.modalContainer}>
          {/* Header */}
          <View style={dynamicStyles.header}>
            <Text style={dynamicStyles.headerTitle}>{title}</Text>
            <TouchableOpacity style={dynamicStyles.closeButton} onPress={onClose}>
              <Text style={dynamicStyles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ maxHeight: Platform.OS === 'ios' ? 600 : 650 }}
            contentContainerStyle={dynamicStyles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero Section */}
            <View style={dynamicStyles.heroSection}>
              <Text style={dynamicStyles.heroIcon}>💎</Text>
              {message && (
                <Text style={dynamicStyles.heroSubtitle}>{message}</Text>
              )}
              {subscriptionStatus === 'trial' && trialInfo && trialInfo.isActive ? (
                <>
                  <Text style={dynamicStyles.heroSubtitle}>
                    You're enjoying your free trial! 🎉
                  </Text>
                  <View style={[dynamicStyles.trialBadge, { backgroundColor: colors.success + '20' }]}>
                    <Text style={[dynamicStyles.trialBadgeText, { color: colors.success }]}>
                      {trialInfo.daysRemaining} day{trialInfo.daysRemaining !== 1 ? 's' : ''} left
                    </Text>
                  </View>
                </>
              ) : (
                !message && (
                  <Text style={dynamicStyles.heroSubtitle}>
                    Start your 3-day free trial and unlock all premium features
                  </Text>
                )
              )}
            </View>

            {/* Features Grid */}
            {showFeatures && (
              <View style={dynamicStyles.featuresSection}>
                <Text style={dynamicStyles.featuresTitle}>Premium Features</Text>
                <View style={dynamicStyles.featureGrid}>
                  <View style={dynamicStyles.featureItem}>
                    <Text style={dynamicStyles.featureIcon}>📸</Text>
                    <Text style={dynamicStyles.featureText}>Unlimited Scans</Text>
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
                    <Text style={dynamicStyles.featureIcon}>✨</Text>
                    <Text style={dynamicStyles.featureText}>Ad-Free</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Packages */}
            <View style={dynamicStyles.packagesSection}>
              {loading && !availablePackages ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
              ) : (
                <>
                  {annualPackage && (
                    <View style={{ position: 'relative' }}>
                      <View style={dynamicStyles.popularBadge}>
                        <Text style={dynamicStyles.popularBadgeText}>BEST</Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          dynamicStyles.packageCard,
                          selectedPackage?.identifier === annualPackage.identifier &&
                            dynamicStyles.packageCardSelected,
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
                            <Text style={dynamicStyles.trialBadgeInlineText}>3-day free trial</Text>
                          </View>
                        )}
                        <TouchableOpacity
                          style={dynamicStyles.purchaseButton}
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
                              {loading
                                ? 'Processing...'
                                : subscriptionStatus === 'trial'
                                ? 'Subscribe Annual'
                                : 'Start Free Trial'}
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
                        selectedPackage?.identifier === monthlyPackage.identifier &&
                          dynamicStyles.packageCardSelected,
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
                          <Text style={dynamicStyles.trialBadgeInlineText}>3-day free trial</Text>
                        </View>
                      )}
                      <TouchableOpacity
                        style={dynamicStyles.purchaseButton}
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
                            {loading
                              ? 'Processing...'
                              : subscriptionStatus === 'trial'
                              ? 'Subscribe Monthly'
                              : 'Start Free Trial'}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            {/* Restore Purchases */}
            <TouchableOpacity style={dynamicStyles.restoreButton} onPress={handleRestore} disabled={loading}>
              <Text style={dynamicStyles.restoreButtonText}>Restore Purchases</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Footer */}
          <View style={dynamicStyles.footer}>
            <Text style={dynamicStyles.footerText}>
              Subscriptions auto-renew unless cancelled. Cancel anytime in Settings.
            </Text>
          </View>

          {loading && (
            <View style={dynamicStyles.loadingOverlay}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

