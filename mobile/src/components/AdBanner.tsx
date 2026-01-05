// AdBanner Component
// Displays banner ads for all users (no premium/free distinction)

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { AD_UNIT_IDS, AdPlacement, recordAdImpression } from '../services/adService';

// Dynamic import for the ads module - wrapped to prevent crash
let BannerAd: any = null;
let BannerAdSize: any = null;
let adsModuleLoaded = false;

// Defer loading to prevent startup crash
const loadAdsModule = () => {
    if (adsModuleLoaded) return;
    try {
        const adsModule = require('react-native-google-mobile-ads');
        BannerAd = adsModule.BannerAd;
        BannerAdSize = adsModule.BannerAdSize;
        adsModuleLoaded = true;
        console.log('✅ Google Mobile Ads module loaded');
    } catch (error) {
        console.warn('⚠️ Google Mobile Ads module not available:', error);
        adsModuleLoaded = true; // Mark as attempted
    }
};

interface AdBannerProps {
    placement: AdPlacement;
    size?: 'banner' | 'largeBanner' | 'mediumRectangle';
}

export default function AdBanner({ placement, size = 'banner' }: AdBannerProps) {
    const { colors, isDark } = useTheme();
    const [adLoaded, setAdLoaded] = useState(false);
    const [adError, setAdError] = useState(false);
    const [moduleReady, setModuleReady] = useState(false);

    // Load ads module on mount (deferred to prevent startup crash)
    useEffect(() => {
        // Small delay to ensure app is fully initialized
        const timer = setTimeout(() => {
            loadAdsModule();
            setModuleReady(true);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // If ads module isn't available or not ready, show placeholder in dev only
    if (!moduleReady || !BannerAd || !BannerAdSize) {
        if (__DEV__) {
            return (
                <View style={[styles.placeholder, { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0' }]}>
                    <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                        📢 Ad Space
                    </Text>
                </View>
            );
        }
        return null;
    }

    const getBannerSize = () => {
        switch (size) {
            case 'largeBanner':
                return BannerAdSize.LARGE_BANNER;
            case 'mediumRectangle':
                return BannerAdSize.MEDIUM_RECTANGLE;
            default:
                return BannerAdSize.BANNER;
        }
    };

    const handleAdLoaded = () => {
        setAdLoaded(true);
        setAdError(false);
        recordAdImpression(placement);
    };

    const handleAdError = (error: any) => {
        console.warn(`Ad error at ${placement}:`, error);
        setAdError(true);
        setAdLoaded(false);
    };

    // Always use production ad unit IDs (no test mode)
    const adUnitId = AD_UNIT_IDS.banner;

    return (
        <View style={[
            styles.container,
            { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' },
            adError && styles.hidden
        ]}>
            {!adError && (
                <BannerAd
                    unitId={adUnitId}
                    size={getBannerSize()}
                    requestOptions={{
                        requestNonPersonalizedAdsOnly: true,
                    }}
                    onAdLoaded={handleAdLoaded}
                    onAdFailedToLoad={handleAdError}
                />
            )}
            {!adLoaded && !adError && (
                <View style={[styles.loading, { backgroundColor: isDark ? '#2a2a2a' : '#e0e0e0' }]}>
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                        Loading...
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        minHeight: 60,
    },
    placeholder: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        borderStyle: 'dashed',
    },
    placeholderText: {
        fontSize: 12,
        fontWeight: '500',
    },
    loading: {
        height: 50,
        width: 320,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
    },
    loadingText: {
        fontSize: 12,
    },
    hidden: {
        height: 0,
        overflow: 'hidden',
    },
});
