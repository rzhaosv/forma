// Food Scan Cache Layer
// Provides instant results for previously scanned foods
// 7-day expiration to balance freshness vs performance

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodRecognitionResult } from '../services/foodRecognitionService';
import * as Crypto from 'expo-crypto';

const CACHE_PREFIX = '@food_scan_cache:';
const CACHE_EXPIRY_DAYS = 7;

interface CacheEntry {
  result: FoodRecognitionResult;
  timestamp: number;
  imageHash?: string;
}

/**
 * Generate a hash from image data for cache lookup
 * Uses first 100KB of base64 data for speed
 */
export async function generateImageHash(base64Data: string): Promise<string> {
  try {
    // Use first 100KB for hash (faster than hashing entire image)
    const sample = base64Data.substring(0, 100000);
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      sample
    );
    return hash;
  } catch (error) {
    console.error('Hash generation failed:', error);
    return Date.now().toString(); // Fallback to timestamp
  }
}

/**
 * Check if cached result exists and is not expired
 */
export async function getCachedResult(imageHash: string): Promise<FoodRecognitionResult | null> {
  try {
    const cacheKey = CACHE_PREFIX + imageHash;
    const cached = await AsyncStorage.getItem(cacheKey);

    if (!cached) {
      return null;
    }

    const entry: CacheEntry = JSON.parse(cached);

    // Check if cache is expired (7 days)
    const age = Date.now() - entry.timestamp;
    const maxAge = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    if (age > maxAge) {
      // Expired - remove from cache
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }

    console.log('✅ Cache HIT - returning instant result');
    return entry.result;
  } catch (error) {
    console.error('Cache read failed:', error);
    return null;
  }
}

/**
 * Save scan result to cache
 */
export async function cacheResult(imageHash: string, result: FoodRecognitionResult): Promise<void> {
  try {
    const entry: CacheEntry = {
      result,
      timestamp: Date.now(),
      imageHash,
    };

    const cacheKey = CACHE_PREFIX + imageHash;
    await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));

    console.log('💾 Scan result cached');
  } catch (error) {
    console.error('Cache write failed:', error);
    // Non-fatal - continue without caching
  }
}

/**
 * Clear all cached scan results
 */
export async function clearScanCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
    console.log(`🗑️ Cleared ${cacheKeys.length} cached scans`);
  } catch (error) {
    console.error('Cache clear failed:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  count: number;
  oldestEntry: number;
  newestEntry: number;
}> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));

    if (cacheKeys.length === 0) {
      return { count: 0, oldestEntry: 0, newestEntry: 0 };
    }

    const entries = await AsyncStorage.multiGet(cacheKeys);
    const timestamps = entries
      .map(([_, value]) => value ? JSON.parse(value).timestamp : 0)
      .filter(t => t > 0);

    return {
      count: cacheKeys.length,
      oldestEntry: Math.min(...timestamps),
      newestEntry: Math.max(...timestamps),
    };
  } catch (error) {
    console.error('Cache stats failed:', error);
    return { count: 0, oldestEntry: 0, newestEntry: 0 };
  }
}
