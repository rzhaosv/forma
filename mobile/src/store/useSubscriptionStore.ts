import { create } from 'zustand';
import { Platform, Alert } from 'react-native';
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';

// Set your key in .env as EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_...
const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';

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
    if (Platform.OS !== 'ios') {
      set({ isLoading: false });
      return;
    }

    if (!IOS_KEY) {
      console.warn('[RC] EXPO_PUBLIC_REVENUECAT_IOS_KEY is not set');
      set({ isLoading: false });
      return;
    }

    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.WARN : LOG_LEVEL.ERROR);
    Purchases.configure({ apiKey: IOS_KEY });

    // Link to your Firebase/auth user ID so RevenueCat tracks per-user
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
      } else {
        console.warn('[RC] No current offering found. Check RevenueCat dashboard.');
      }
    } catch (e) {
      console.error('[RC] getOfferings failed', e);
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
      set({ customerInfo, isPremium, isPurchasing: false });
      return isPremium;
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
