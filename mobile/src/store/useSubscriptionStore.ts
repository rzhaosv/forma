import { create } from 'zustand';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trackCustomEvent } from '../utils/analytics';
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';

// Set your keys in .env:
//   EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_...
//   EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_...
const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';
const RC_API_KEY = Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;

// RC must only be configured once per app session — track at module level
let _rcConfigured = false;

// Last-known premium status, persisted so a returning subscriber routes
// straight to the app at cold launch instead of seeing a paywall flash while
// RevenueCat loads. RevenueCat remains the source of truth: every real status
// check overwrites this cache.
const PREMIUM_CACHE_KEY = '@macra_is_premium_cache';

const cachePremium = (isPremium: boolean) => {
  AsyncStorage.setItem(PREMIUM_CACHE_KEY, isPremium ? 'true' : 'false').catch(() => {});
};

interface SubscriptionStore {
  isPremium: boolean;
  isLoading: boolean;
  isPurchasing: boolean;
  offering: PurchasesOffering | null;
  customerInfo: CustomerInfo | null;

  initialize: (userId?: string) => Promise<void>;
  loadOffering: () => Promise<void>;
  checkStatus: () => Promise<void>;
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  isPremium: false,
  isLoading: true,
  isPurchasing: false,
  offering: null,
  customerInfo: null,

  initialize: async (userId?: string) => {
    // Hydrate last-known premium status first so routing doesn't have to wait
    // on (or wrongly default during) the network status check below.
    try {
      const cached = await AsyncStorage.getItem(PREMIUM_CACHE_KEY);
      if (cached === 'true' && !get().isPremium) {
        set({ isPremium: true });
      }
    } catch {
      // cache unavailable — fall through to the live check
    }

    if (!RC_API_KEY) {
      console.warn(`[RC] No RevenueCat API key for ${Platform.OS}. Set EXPO_PUBLIC_REVENUECAT_${Platform.OS === 'ios' ? 'IOS' : 'ANDROID'}_KEY in .env`);
      set({ isLoading: false });
      return;
    }

    // Configure RC exactly once — subsequent calls only log in the user
    if (!_rcConfigured) {
      try {
        Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
        Purchases.configure({ apiKey: RC_API_KEY });
        _rcConfigured = true;
      } catch (e) {
        console.warn('[RC] configure failed:', e);
        set({ isLoading: false });
        return;
      }
    }

    // Link to Firebase user ID so RC tracks purchases per user
    if (userId) {
      try {
        await Purchases.logIn(userId);
      } catch (e) {
        console.warn('[RC] logIn failed', e);
      }
    }

    await get().checkStatus();
    await get().loadOffering();
  },

  loadOffering: async () => {
    if (!_rcConfigured) {
      console.warn('[RC] SDK not configured — skipping loadOffering');
      return;
    }
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        set({ offering: offerings.current });
        return;
      }
      console.warn('[RC] No current offering on first fetch — retrying in 3s...');
    } catch (e) {
      console.error('[RC] getOfferings failed:', e);
    }

    // Retry once after a short delay (network timing, cold start)
    await new Promise(r => setTimeout(r, 3000));
    try {
      const retried = await Purchases.getOfferings();
      if (retried.current) {
        set({ offering: retried.current });
      } else {
        trackCustomEvent('paywall_offering_missing', { stage: 'retry' }).catch(() => {});
        console.warn(
          '[RC] Still no current offering after retry.\n' +
          'Fix in RevenueCat dashboard:\n' +
          '  1. Products → import from App Store Connect\n' +
          '  2. Offerings → create an offering, add packages\n' +
          '  3. Set that offering as "Current"'
        );
      }
    } catch (e: any) {
      console.error('[RC] getOfferings retry failed:', e);
      trackCustomEvent('paywall_offering_error', { message: String(e?.message ?? e).slice(0, 90) }).catch(() => {});
    }
  },

  checkStatus: async () => {
    if (!_rcConfigured) {
      console.warn('[RC] SDK not configured — skipping checkStatus');
      set({ isLoading: false });
      return;
    }
    try {
      const info = await Purchases.getCustomerInfo();
      const isPremium = !!info.entitlements.active['premium'];
      set({ customerInfo: info, isPremium, isLoading: false });
      cachePremium(isPremium);
    } catch (e) {
      console.error('[RC] getCustomerInfo failed', e);
      // Keep the hydrated cache value — RC being unreachable (offline launch)
      // must not bounce a paying subscriber back to the paywall.
      set({ isLoading: false });
    }
  },

  purchase: async (pkg: PurchasesPackage) => {
    if (!_rcConfigured) {
      Alert.alert('Store Unavailable', 'The subscription service is not available right now. Please restart the app and try again.');
      return false;
    }
    set({ isPurchasing: true });
    trackCustomEvent('purchase_start', { product: pkg.product.identifier }).catch(() => {});
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isPremium = !!customerInfo.entitlements.active['premium'];
      trackCustomEvent('purchase_success', { product: pkg.product.identifier, price: pkg.product.price }).catch(() => {});
      set({ customerInfo, isPremium: isPremium || true, isPurchasing: false });
      // Purchase succeeded — treat as premium even if entitlement isn't immediately active
      cachePremium(true);
      return true;
    } catch (e: any) {
      set({ isPurchasing: false });
      if (e.userCancelled) {
        trackCustomEvent('purchase_cancelled', { product: pkg.product.identifier }).catch(() => {});
        return false;
      }
      trackCustomEvent('purchase_error', { product: pkg.product.identifier, code: String(e?.code ?? ''), message: String(e?.message ?? '').slice(0, 90) }).catch(() => {});
      Alert.alert('Purchase failed', e.message ?? 'Something went wrong. Please try again.');
      return false;
    }
  },

  restore: async () => {
    if (!_rcConfigured) {
      Alert.alert('Store Unavailable', 'The subscription service is not available right now. Please restart the app and try again.');
      return false;
    }
    set({ isPurchasing: true });
    try {
      const info = await Purchases.restorePurchases();
      const isPremium = !!info.entitlements.active['premium'];
      set({ customerInfo: info, isPremium, isPurchasing: false });
      cachePremium(isPremium);
      return isPremium;
    } catch (e: any) {
      set({ isPurchasing: false });
      Alert.alert('Restore failed', e.message ?? 'Could not restore purchases.');
      return false;
    }
  },
}));
