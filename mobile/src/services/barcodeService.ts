// Barcode Scanner Service
// Scans product barcodes and looks up nutrition data

export interface BarcodeProduct {
  found: boolean;
  barcode: string;
  name?: string;
  brand?: string;
  image_url?: string;
  serving_size?: string;
  calories_per_100g?: number;
  protein_per_100g?: number;
  carbs_per_100g?: number;
  fat_per_100g?: number;
  error?: string;
}

/**
 * Look up product by barcode using Open Food Facts API
 * @param barcode - Scanned barcode number
 * @returns Product information with nutrition data
 */
export async function lookupBarcode(barcode: string): Promise<BarcodeProduct> {
  try {
    console.log('🔍 Looking up barcode:', barcode);

    // Try Open Food Facts API (free, 2M+ products)
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
    );
    const data = await response.json();

    if (data.status === 1) {
      const product = data.product;
      
      return {
        found: true,
        barcode,
        name: product.product_name || 'Unknown Product',
        brand: product.brands || '',
        image_url: product.image_url || product.image_front_url,
        serving_size: product.serving_size || '100g',
        calories_per_100g: product.nutriments?.['energy-kcal_100g'] || 0,
        protein_per_100g: product.nutriments?.proteins_100g || 0,
        carbs_per_100g: product.nutriments?.carbohydrates_100g || 0,
        fat_per_100g: product.nutriments?.fat_100g || 0,
      };
    }

    // Product not found
    return {
      found: false,
      barcode,
      error: 'Product not found in database',
    };
  } catch (error: any) {
    console.error('Barcode lookup error:', error);
    return {
      found: false,
      barcode,
      error: error.message || 'Failed to lookup barcode',
    };
  }
}

/**
 * Calculate nutrition for a specific serving
 * @param product - Product from lookupBarcode
 * @param servingSizeG - Serving size in grams
 * @returns Calculated nutrition values
 */
export function calculateNutrition(product: BarcodeProduct, servingSizeG: number) {
  const ratio = servingSizeG / 100;
  
  return {
    calories: Math.round((product.calories_per_100g || 0) * ratio),
    protein_g: Math.round((product.protein_per_100g || 0) * ratio * 10) / 10,
    carbs_g: Math.round((product.carbs_per_100g || 0) * ratio * 10) / 10,
    fat_g: Math.round((product.fat_per_100g || 0) * ratio * 10) / 10,
  };
}

/**
 * Validate barcode format
 */
export function isValidBarcode(barcode: string): boolean {
  // UPC-A: 12 digits
  // EAN-13: 13 digits
  // EAN-8: 8 digits
  const validLengths = [8, 12, 13];
  return validLengths.includes(barcode.length) && /^\d+$/.test(barcode);
}

