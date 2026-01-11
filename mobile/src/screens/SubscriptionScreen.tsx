import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/useAuthStore';

export default function SubscriptionScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();
  const { 
    subscriptionStatus, 
    isPremium, 
    customerInfo,
    trialInfo,
    availablePackages,
    checkSubscriptionStatus,
    restorePurchases,
    syncPurchases,
    getSubscriptionInfo,
    openManageSubscription,
    purchasePackage,
    getAvailablePackages,
  } = useSubscriptionStore();
  
  const [loading, setLoading] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);

  useEffect(() => {
    refreshStatus();
    loadPackages();
  }, []);

  const refreshStatus = async () => {
    setLoading(true);
    await checkSubscriptionStatus();
    await syncPurchases();
    setLoading(false);
  };

  const loadPackages = async () => {
    await getAvailablePackages();
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const restored = await restorePurchases();
      if (restored) {
        Alert.alert('Purchases Restored', 'Your premium subscription has been restored!');
      } else {
        Alert.alert('No Purchases Found', 'We couldn\'t find any previous purchases to restore.');
      }
    } catch (error: any) {
      Alert.alert('Restore Failed', error.message || 'Failed to restore purchases.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getExpirationDate = () => {
    if (!customerInfo) return null;
    const entitlement = customerInfo.entitlements.active['premium'];
    if (!entitlement) return null;
    return entitlement.expirationDate;
  };

  const getNextBillingDate = () => {
    if (!customerInfo) return null;
    const entitlement = customerInfo.entitlements.active['premium'];
    if (!entitlement || entitlement.willRenew === false) return null;
    return entitlement.expirationDate;
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription?',
      'Are you sure you want to cancel your subscription? You\'ll continue to have access until the end of your current billing period, but your subscription will not renew.',
      [
        {
          text: 'Keep Subscription',
          style: 'cancel',
        },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await openManageSubscription();
            } catch (error: any) {
              Alert.alert(
                'Manage Subscription',
                error.message || 'Please manage your subscription through your device\'s App Store or Google Play settings.\n\niOS: Settings > [Your Name] > Subscriptions\nAndroid: Play Store > Payments & Subscriptions > Subscriptions',
                [
                  {
                    text: 'Open Settings',
                    onPress: async () => {
                      if (Platform.OS === 'ios') {
                        await Linking.openURL('https://apps.apple.com/account/subscriptions');
                      } else {
                        await Linking.openURL('https://play.google.com/store/account');
                      }
                    },
                  },
                  { text: 'OK', style: 'cancel' },
                ]
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleChangePlan = () => {
    const subscriptionInfo = getSubscriptionInfo();
    const currentPlan = subscriptionInfo.productIdentifier?.toLowerCase();
    
    const monthlyPackage = availablePackages?.find(pkg => 
      pkg.identifier.toLowerCase().includes('monthly')
    );
    const annualPackage = availablePackages?.find(pkg => 
      pkg.identifier.toLowerCase().includes('annual') || 
      pkg.identifier.toLowerCase().includes('yearly')
    );

    const isCurrentlyMonthly = currentPlan?.includes('monthly');
    const isCurrentlyAnnual = currentPlan?.includes('annual') || currentPlan?.includes('yearly');

    Alert.alert(
      'Change Plan',
      isCurrentlyMonthly
        ? 'Switch to Annual plan to save money? Your current subscription will be cancelled and replaced with the new plan.'
        : 'Switch to Monthly plan? Your current subscription will be cancelled and replaced with the new plan.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Change Plan',
          onPress: async () => {
            setChangingPlan(true);
            try {
              const newPackage = isCurrentlyMonthly ? annualPackage : monthlyPackage;
              if (!newPackage) {
                Alert.alert('Error', 'Package not available. Please try again later.');
                return;
              }

              const success = await purchasePackage(newPackage);
              if (success) {
                Alert.alert(
                  'Plan Changed',
                  'Your subscription plan has been successfully changed!',
                  [{ text: 'OK' }]
                );
                await refreshStatus();
              }
            } catch (error: any) {
              if (!error.userCancelled) {
                Alert.alert('Error', error.message || 'Failed to change plan. Please try again.');
              }
            } finally {
              setChangingPlan(false);
            }
          },
        },
      ]
    );
  };

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      await openManageSubscription();
    } catch (error: any) {
      Alert.alert(
        'Manage Subscription',
        error.message || 'Please manage your subscription through your device\'s App Store or Google Play settings.\n\niOS: Settings > [Your Name] > Subscriptions\nAndroid: Play Store > Payments & Subscriptions > Subscriptions',
        [
          {
            text: 'Open Settings',
            onPress: async () => {
              if (Platform.OS === 'ios') {
                await Linking.openURL('https://apps.apple.com/account/subscriptions');
              } else {
                await Linking.openURL('https://play.google.com/store/account');
              }
            },
          },
          { text: 'OK', style: 'cancel' },
        ]
      );
    } finally {
      setLoading(false);
    }
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
    },
    scrollContent: {
      padding: 20,
    },
    statusCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      alignItems: 'center',
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    statusIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    statusTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    statusSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    infoTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    infoRowLast: {
      borderBottomWidth: 0,
    },
    infoLabel: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    infoValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    upgradeButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 16,
    },
    upgradeButtonText: {
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
    refreshButton: {
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    refreshButtonText: {
      color: colors.textSecondary,
      fontSize: 14,
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
    actionButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 12,
    },
    actionButtonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButton: {
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.error + '40',
    },
    cancelButtonText: {
      color: colors.error,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  const expirationDate = getExpirationDate();
  const nextBillingDate = getNextBillingDate();

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
        <Text style={dynamicStyles.title}>Subscription</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={dynamicStyles.scrollContent}>
        {/* Status Card */}
        <View style={dynamicStyles.statusCard}>
          {subscriptionStatus === 'trial' && trialInfo && trialInfo.isActive ? (
            <>
              <Text style={dynamicStyles.statusIcon}>🎁</Text>
              <Text style={dynamicStyles.statusTitle}>Free Trial Active</Text>
              <Text style={dynamicStyles.statusSubtitle}>
                You're enjoying your 3-day free trial!
              </Text>
              <View style={[dynamicStyles.trialBadge, { backgroundColor: colors.success + '20', marginTop: 16 }]}>
                <Text style={[dynamicStyles.trialBadgeText, { color: colors.success }]}>
                  {trialInfo.daysRemaining} day{trialInfo.daysRemaining !== 1 ? 's' : ''} remaining
                </Text>
              </View>
            </>
          ) : isPremium ? (
            <>
              <Text style={dynamicStyles.statusIcon}>💎</Text>
              <Text style={dynamicStyles.statusTitle}>Premium Active</Text>
              <Text style={dynamicStyles.statusSubtitle}>
                You're enjoying all premium features!
              </Text>
            </>
          ) : (
            <>
              <Text style={dynamicStyles.statusIcon}>📱</Text>
              <Text style={dynamicStyles.statusTitle}>Free Plan</Text>
              <Text style={dynamicStyles.statusSubtitle}>
                {trialInfo && !trialInfo.isActive 
                  ? 'Your free trial has ended. Upgrade to continue premium access!'
                  : 'Start your 3-day free trial and unlock unlimited features'}
              </Text>
            </>
          )}
        </View>

        {/* Trial Details */}
        {subscriptionStatus === 'trial' && trialInfo && trialInfo.isActive && (
          <View style={dynamicStyles.infoCard}>
            <Text style={dynamicStyles.infoTitle}>Free Trial</Text>
            
            <View style={dynamicStyles.infoRow}>
              <Text style={dynamicStyles.infoLabel}>Started</Text>
              <Text style={dynamicStyles.infoValue}>
                {formatDate(trialInfo.startDate)}
              </Text>
            </View>
            
            <View style={dynamicStyles.infoRow}>
              <Text style={dynamicStyles.infoLabel}>Ends</Text>
              <Text style={dynamicStyles.infoValue}>
                {formatDate(trialInfo.endDate)}
              </Text>
            </View>
            
            <View style={[dynamicStyles.infoRow, dynamicStyles.infoRowLast]}>
              <Text style={dynamicStyles.infoLabel}>Days Remaining</Text>
              <Text style={[dynamicStyles.infoValue, { color: colors.warning }]}>
                {trialInfo.daysRemaining}
              </Text>
            </View>
          </View>
        )}

        {/* Subscription Details - Show for active subscriptions */}
        {isPremium && subscriptionStatus === 'premium' && customerInfo && (() => {
          const subscriptionInfo = getSubscriptionInfo();
          const planName = subscriptionInfo.productIdentifier?.toLowerCase().includes('monthly')
            ? 'Monthly'
            : subscriptionInfo.productIdentifier?.toLowerCase().includes('annual') ||
              subscriptionInfo.productIdentifier?.toLowerCase().includes('yearly')
            ? 'Annual'
            : 'Premium';

          return (
            <>
              <View style={dynamicStyles.infoCard}>
                <Text style={dynamicStyles.infoTitle}>Current Plan</Text>
                
                <View style={dynamicStyles.infoRow}>
                  <Text style={dynamicStyles.infoLabel}>Plan</Text>
                  <Text style={dynamicStyles.infoValue}>{planName}</Text>
                </View>
                
                {expirationDate && (
                  <View style={dynamicStyles.infoRow}>
                    <Text style={dynamicStyles.infoLabel}>
                      {subscriptionInfo.willRenew ? 'Next Billing' : 'Expires'}
                    </Text>
                    <Text style={dynamicStyles.infoValue}>{formatDate(expirationDate)}</Text>
                  </View>
                )}
                
                <View style={[dynamicStyles.infoRow, dynamicStyles.infoRowLast]}>
                  <Text style={dynamicStyles.infoLabel}>Status</Text>
                  <Text style={[dynamicStyles.infoValue, { color: colors.success }]}>
                    {subscriptionInfo.willRenew ? 'Active • Auto-renewing' : 'Active • Not renewing'}
                  </Text>
                </View>
              </View>

              {/* Change Plan Option */}
              {subscriptionInfo.willRenew && availablePackages && availablePackages.length > 1 && (
                <TouchableOpacity
                  style={[dynamicStyles.actionButton, { marginBottom: 12 }]}
                  onPress={handleChangePlan}
                  disabled={changingPlan}
                >
                  {changingPlan ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text style={dynamicStyles.actionButtonText}>Change Plan</Text>
                  )}
                </TouchableOpacity>
              )}

              {/* Manage Subscription Button */}
              <TouchableOpacity
                style={dynamicStyles.actionButton}
                onPress={handleManageSubscription}
                disabled={loading}
              >
                <Text style={dynamicStyles.actionButtonText}>Manage Subscription</Text>
              </TouchableOpacity>

              {/* Cancel Subscription Button */}
              {subscriptionInfo.willRenew && (
                <TouchableOpacity
                  style={[dynamicStyles.cancelButton, { marginTop: 16 }]}
                  onPress={handleCancelSubscription}
                  disabled={loading}
                >
                  <Text style={dynamicStyles.cancelButtonText}>Cancel Subscription</Text>
                </TouchableOpacity>
              )}
            </>
          );
        })()}

        {/* Trial Status Info - Show during active trial */}
        {subscriptionStatus === 'trial' && trialInfo && trialInfo.isActive && (
          <View style={dynamicStyles.infoCard}>
            <Text style={dynamicStyles.infoTitle}>Trial Status</Text>
            
            <View style={dynamicStyles.infoRow}>
              <Text style={dynamicStyles.infoLabel}>Status</Text>
              <Text style={[dynamicStyles.infoValue, { color: colors.success }]}>
                Free Trial Active
              </Text>
            </View>
            
            {trialInfo.endDate && (
              <View style={dynamicStyles.infoRow}>
                <Text style={dynamicStyles.infoLabel}>Trial Ends</Text>
                <Text style={dynamicStyles.infoValue}>{formatDate(trialInfo.endDate)}</Text>
              </View>
            )}
            
            <View style={[dynamicStyles.infoRow, dynamicStyles.infoRowLast]}>
              <Text style={dynamicStyles.infoLabel}>Access Level</Text>
              <Text style={[dynamicStyles.infoValue, { color: colors.primary }]}>
                Premium Features Active
              </Text>
            </View>
          </View>
        )}

        {/* Free Tier Info - Only show if truly on free tier (not trial or premium) */}
        {!isPremium && subscriptionStatus === 'free' && (
          <View style={dynamicStyles.infoCard}>
            <Text style={dynamicStyles.infoTitle}>Free Tier Limits</Text>
            
            <View style={dynamicStyles.infoRow}>
              <Text style={dynamicStyles.infoLabel}>Photo Scans</Text>
              <Text style={dynamicStyles.infoValue}>5 per day</Text>
            </View>
            
            <View style={dynamicStyles.infoRow}>
              <Text style={dynamicStyles.infoLabel}>History View</Text>
              <Text style={dynamicStyles.infoValue}>7 days</Text>
            </View>
            
            <View style={[dynamicStyles.infoRow, dynamicStyles.infoRowLast]}>
              <Text style={dynamicStyles.infoLabel}>Barcode Scanning</Text>
              <Text style={dynamicStyles.infoValue}>Limited</Text>
            </View>
          </View>
        )}

        {/* Upgrade/Subscribe Buttons */}
        {subscriptionStatus === 'trial' && trialInfo && trialInfo.isActive ? (
          // During active trial, show subscribe button
          <TouchableOpacity
            style={dynamicStyles.upgradeButton}
            onPress={() => navigation.navigate('Paywall' as never)}
          >
            <Text style={dynamicStyles.upgradeButtonText}>Subscribe to Continue Premium</Text>
          </TouchableOpacity>
        ) : !isPremium && subscriptionStatus === 'free' ? (
          // On free tier (no active trial), show start trial button
          <TouchableOpacity
            style={dynamicStyles.upgradeButton}
            onPress={() => navigation.navigate('Paywall' as never)}
          >
            <Text style={dynamicStyles.upgradeButtonText}>
              {trialInfo && !trialInfo.isActive
                ? 'Subscribe to Premium'
                : 'Start Free Trial'}
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Restore Purchases */}
        <TouchableOpacity
          style={dynamicStyles.restoreButton}
          onPress={handleRestore}
          disabled={loading}
        >
          <Text style={dynamicStyles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>

        {/* Refresh Status */}
        <TouchableOpacity
          style={dynamicStyles.refreshButton}
          onPress={refreshStatus}
          disabled={loading}
        >
          <Text style={dynamicStyles.refreshButtonText}>
            {loading ? 'Refreshing...' : 'Refresh Status'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});

