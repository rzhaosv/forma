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
    checkSubscriptionStatus,
    restorePurchases,
  } = useSubscriptionStore();
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshStatus();
  }, []);

  const refreshStatus = async () => {
    setLoading(true);
    await checkSubscriptionStatus();
    setLoading(false);
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

        {/* Subscription Details */}
        {isPremium && customerInfo && subscriptionStatus === 'premium' && (
          <View style={dynamicStyles.infoCard}>
            <Text style={dynamicStyles.infoTitle}>Current Plan</Text>
            
            {expirationDate && (
              <View style={dynamicStyles.infoRow}>
                <Text style={dynamicStyles.infoLabel}>Expires</Text>
                <Text style={dynamicStyles.infoValue}>{formatDate(expirationDate)}</Text>
              </View>
            )}
            
            {nextBillingDate && (
              <View style={dynamicStyles.infoRow}>
                <Text style={dynamicStyles.infoLabel}>Next Billing</Text>
                <Text style={dynamicStyles.infoValue}>{formatDate(nextBillingDate)}</Text>
              </View>
            )}
            
            <View style={[dynamicStyles.infoRow, dynamicStyles.infoRowLast]}>
              <Text style={dynamicStyles.infoLabel}>Status</Text>
              <Text style={[dynamicStyles.infoValue, { color: colors.success }]}>
                Active
              </Text>
            </View>
          </View>
        )}

        {/* Free Tier Info */}
        {!isPremium && (
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

        {/* Upgrade Button */}
        {!isPremium && (
          <TouchableOpacity
            style={dynamicStyles.upgradeButton}
            onPress={() => navigation.navigate('Paywall' as never)}
          >
            <Text style={dynamicStyles.upgradeButtonText}>
              {subscriptionStatus === 'trial' && trialInfo && !trialInfo.isActive
                ? 'Subscribe to Premium'
                : 'Start Free Trial'}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Subscribe Button (during trial) */}
        {subscriptionStatus === 'trial' && trialInfo && trialInfo.isActive && (
          <TouchableOpacity
            style={dynamicStyles.upgradeButton}
            onPress={() => navigation.navigate('Paywall' as never)}
          >
            <Text style={dynamicStyles.upgradeButtonText}>Subscribe Now</Text>
          </TouchableOpacity>
        )}

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

