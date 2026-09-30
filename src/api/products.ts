import { apiClient } from './client';
import { Product, ProductFilterParams, MediaAsset, ProductVariant } from '../types/product';
import { getAbsoluteMediaUrl } from '../config/environment';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
  PRODUCTS_LIST: '@staff_app_cache_products_list',
  PRODUCT_DETAIL_PREFIX: '@staff_app_cache_prod_detail_',
};

function normalizeMediaAsset(asset: any): MediaAsset {
  return {
    ...asset,
    id: String(asset.id || Math.random()),
    title: asset.title || 'Media Asset',
    asset_type: asset.asset_type || 'IMAGE',
    file_url: getAbsoluteMediaUrl(asset.file_url || asset.file),
    external_url: asset.external_url || '',
    description: asset.description || '',
  };
}

function ensureArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string' && val.trim()) {
    const s = val.trim();
    if (s.includes('\n')) return s.split('\n').map((x) => x.trim()).filter(Boolean);
    if (s.includes(';')) return s.split(';').map((x) => x.trim()).filter(Boolean);
    return [s];
  }
  if (typeof val === 'object') return [val];
  return [];
}

function normalizeVariant(v: any): ProductVariant {
  return {
    ...v,
    id: String(v.id || Math.random()),
    name: v.name || 'Variant',
    sku: v.sku || '',
    price: v.price || 0,
    stock: v.stock || 0,
    image_url: getAbsoluteMediaUrl(v.image_url || v.image),
    description: v.description || '',
    specifications: v.specifications || {},
    features: ensureArray(v.features),
    certifications: ensureArray(v.certifications),
    in_house_tests: ensureArray(v.in_house_tests),
    applicable_areas: ensureArray(v.applicable_areas),
    media_assets: (v.media_assets || []).map(normalizeMediaAsset),
  };
}

function normalizeProduct(p: any): Product {
  const catObj = p.category || p.sub_category?.category || null;
  const subCatObj = p.sub_category || null;
  const catId = p.category_id || catObj?.id || '';
  const subCatId = p.sub_category_id || subCatObj?.id || '';

  return {
    ...p,
    id: String(p.id || Math.random()),
    name: p.name || 'Product',
    sku: p.sku || '',
    category: catObj ? { ...catObj, id: String(catObj.id || catId) } : undefined,
    category_id: String(catId),
    sub_category: subCatObj ? { ...subCatObj, id: String(subCatObj.id || subCatId) } : undefined,
    sub_category_id: String(subCatId),
    description: p.description || '',
    price: p.price || 0,
    stock: p.stock || 0,
    specifications: p.specifications || {},
    features: ensureArray(p.features),
    certifications: ensureArray(p.certifications),
    in_house_tests: ensureArray(p.in_house_tests),
    applicable_areas: ensureArray(p.applicable_areas),
    image_url: getAbsoluteMediaUrl(p.image_url || p.image),
    media_assets: (p.media_assets || []).map(normalizeMediaAsset),
    variants: (p.variants || p.sub_products || []).map(normalizeVariant),
  };
}

export async function fetchProducts(filters?: ProductFilterParams): Promise<Product[]> {
  try {
    const params: Record<string, string> = {};
    if (filters?.category_id && filters.category_id !== 'all') {
      params.category_id = filters.category_id;
    }
    if (filters?.sub_category_id && filters.sub_category_id !== 'all') {
      params.sub_category_id = filters.sub_category_id;
    }

    const response = await apiClient.get('/api/products/', { params });
    const rawList = Array.isArray(response.data) ? response.data : response.data.results || response.data.products || [];

    let products = rawList.map(normalizeProduct);

    // Cache products locally
    if (products.length > 0 && !filters?.search) {
      AsyncStorage.setItem(CACHE_KEYS.PRODUCTS_LIST, JSON.stringify(products)).catch(() => {});
    }

    // Client-side search filtering if query exists
    if (filters?.search && filters.search.trim()) {
      const query = filters.search.toLowerCase().trim();
      products = products.filter((prod: Product) => {
        const matchName = prod.name?.toLowerCase().includes(query);
        const matchSku = prod.sku?.toLowerCase().includes(query);
        const matchDesc = prod.description?.toLowerCase().includes(query);
        const matchCat = prod.category?.name?.toLowerCase().includes(query);
        const matchSubCat = prod.sub_category?.name?.toLowerCase().includes(query);
        const matchVariant = prod.variants?.some(
          (v: ProductVariant) => v.name?.toLowerCase().includes(query) || v.sku?.toLowerCase().includes(query)
        );
        return matchName || matchSku || matchDesc || matchCat || matchSubCat || matchVariant;
      });
    }

    return products;
  } catch (err) {
    console.warn('Network error fetching products, attempting offline cache:', err);
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEYS.PRODUCTS_LIST);
      if (cachedData) {
        let products: Product[] = JSON.parse(cachedData);
        if (filters?.category_id && filters.category_id !== 'all') {
          products = products.filter(
            (p) => p.category_id === filters.category_id || p.category?.id === filters.category_id
          );
        }
        if (filters?.sub_category_id && filters.sub_category_id !== 'all') {
          products = products.filter(
            (p) => p.sub_category_id === filters.sub_category_id || p.sub_category?.id === filters.sub_category_id
          );
        }
        return products;
      }
    } catch (cacheErr) {}
    return [];
  }
}

export async function fetchProductDetail(productId: string): Promise<Product> {
  const cacheKey = `${CACHE_KEYS.PRODUCT_DETAIL_PREFIX}${productId}`;
  try {
    const response = await apiClient.get(`/api/products/${productId}/`);
    const product = normalizeProduct(response.data);
    AsyncStorage.setItem(cacheKey, JSON.stringify(product)).catch(() => {});
    return product;
  } catch (err) {
    console.warn(`Network error fetching detail for ${productId}, attempting cache:`, err);
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    throw err;
  }
}
