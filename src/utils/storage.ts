import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthTokens, StaffUser } from '../types/auth';
import { SharedProductLog } from '../types/share';
import { Product } from '../types/product';
import { Category } from '../types/category';

const KEYS = {
  AUTH_TOKENS: '@staff_app_auth_tokens',
  STAFF_USER: '@staff_app_user',
  SHARED_HISTORY: '@staff_app_shared_history',
  RECENT_PRODUCTS: '@staff_app_recent_products',
  CACHED_CATEGORIES: '@staff_app_cached_categories',
  CACHED_PRODUCTS: '@staff_app_cached_products',
};

// Auth Token Storage
export async function saveAuthTokens(tokens: AuthTokens): Promise<void> {
  await AsyncStorage.setItem(KEYS.AUTH_TOKENS, JSON.stringify(tokens));
}

export async function getAuthTokens(): Promise<AuthTokens | null> {
  const data = await AsyncStorage.getItem(KEYS.AUTH_TOKENS);
  return data ? JSON.parse(data) : null;
}

export async function clearAuthTokens(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.AUTH_TOKENS);
  await AsyncStorage.removeItem(KEYS.STAFF_USER);
}

// Staff User Storage
export async function saveStaffUser(user: StaffUser): Promise<void> {
  await AsyncStorage.setItem(KEYS.STAFF_USER, JSON.stringify(user));
}

export async function getStaffUser(): Promise<StaffUser | null> {
  const data = await AsyncStorage.getItem(KEYS.STAFF_USER);
  return data ? JSON.parse(data) : null;
}

// Shared Products History Storage
export async function getSharedHistory(): Promise<SharedProductLog[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SHARED_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export async function saveSharedHistoryItem(item: SharedProductLog): Promise<SharedProductLog[]> {
  try {
    const history = await getSharedHistory();
    const updated = [item, ...history.filter((h) => h.id !== item.id)].slice(0, 50); // Keep max 50 recent items
    await AsyncStorage.setItem(KEYS.SHARED_HISTORY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}

// Recently Viewed Products Storage
export async function getRecentlyViewedProducts(): Promise<Product[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.RECENT_PRODUCTS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export async function addRecentlyViewedProduct(product: Product): Promise<void> {
  try {
    const list = await getRecentlyViewedProducts();
    const filtered = list.filter((p) => p.id !== product.id);
    const updated = [product, ...filtered].slice(0, 20); // Keep max 20
    await AsyncStorage.setItem(KEYS.RECENT_PRODUCTS, JSON.stringify(updated));
  } catch (e) {
    // Ignore cache error
  }
}

// Category Cache
export async function getCachedCategories(): Promise<Category[] | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.CACHED_CATEGORIES);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

export async function setCachedCategories(categories: Category[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.CACHED_CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    // Ignore cache error
  }
}
