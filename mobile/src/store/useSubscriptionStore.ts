import { create } from 'zustand';
import { Platform, Alert } from 'react-native';
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
    if (!RC_API_KEY) {
      console.warn(`[RC] No RevenueCat API key for ${Platform.OS}. Set EXPO_PUBLIC_REVENUECAT_${Platform.OS === 'ios' ? 'IOS' : 'ANDROID'}_KEY in .env`);
      set({ isLoading: false });
      return;
    }

    // Configure RC exactly once — subsequent calls only log in the user
    if (!_rcConfigured) {
      Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
      Purchases.configure({ apiKey: RC_API_KEY });
      _rcConfigured = true;
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
        console.warn(
          '[RC] Still no current offering after retry.\n' +
          'Fix in RevenueCat dashboard:\n' +
          '  1. Products → import from App Store Connect\n' +
          '  2. Offerings → create an offering, add packages\n' +
          '  3. Set that offering as "Current"'
        );
      }
    } catch (e) {
      console.error('[RC] getOfferings retry failed:', e);
    }
  },

  checkStatus: async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      const isPremium = !!info.entitlements.active['premium'];
      set({ customerInfo: info, isPremium, isLoading: false });
    } catch (e) {
      console.error('[RC] getCustomerInfo failed', e);
      set({ isLoading: false });
    }
  },

  purchase: async (pkg: PurchasesPackage) => {
    set({ isPurchasing: true });
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isPremium = !!customerInfo.entitlements.active['premium'];
      set({ customerInfo, isPremium: isPremium || true, isPurchasing: false });
      // Purchase succeeded — treat as premium even if entitlement isn't immediately active
      return true;
    } catch (e: any) {
      set({ isPurchasing: false });
      if (e.userCancelled) return false;
      Alert.alert('Purchase failed', e.message ?? 'Something went wrong. Please try again.');
      return false;
    }
  },

  restore: async () => {
    set({ isPurchasing: true });
    try {
      const info = await Purchases.restorePurchases();
      const isPremium = !!info.entitlements.active['premium'];
      set({ customerInfo: info, isPremium, isPurchasing: false });
      return isPremium;
    } catch (e: any) {
      set({ isPurchasing: false });
      Alert.alert('Restore failed', e.message ?? 'Could not restore purchases.');
      return false;
    }
  },
}));
