import { apiClient } from './client';
import { Category, SubCategorySimple } from '../types/category';
import { getAbsoluteMediaUrl } from '../config/environment';
import { getCachedCategories, setCachedCategories } from '../utils/storage';

export async function fetchCategories(): Promise<Category[]> {
  try {
    let response;
    try {
      response = await apiClient.get('/api/categories/');
    } catch (primaryErr) {
      // Fallback endpoint in case main URL differs
      response = await apiClient.get('/api/products/categories/');
    }

    const data = response.data;
    const rawList = Array.isArray(data)
      ? data
      : data.results || data.categories || data.data || [];

    const categories: Category[] = rawList.map((cat: any) => ({
      id: String(cat.id || cat.code || Math.random()),
      name: String(cat.name || 'Category'),
      code: String(cat.code || ''),
      description: cat.description || '',
      image: cat.image || '',
      image_url: getAbsoluteMediaUrl(cat.image_url || cat.image),
      display_order: cat.display_order ?? 0,
      is_active: cat.is_active ?? true,
      created_at: cat.created_at || '',
      subcategories_count: cat.subcategories_count || (cat.subcategories || []).length,
      products_count: cat.products_count || 0,
      subcategories: (cat.subcategories || []).map((sub: any) => ({
        id: String(sub.id || sub.code || Math.random()),
        name: String(sub.name || 'Subcategory'),
        code: String(sub.code || ''),
        description: sub.description || '',
        image: sub.image || '',
        image_url: getAbsoluteMediaUrl(sub.image_url || sub.image),
        display_order: sub.display_order ?? 0,
        is_active: sub.is_active ?? true,
        created_at: sub.created_at || '',
        category_id: String(sub.category_id || cat.id || ''),
        category_name: String(sub.category_name || cat.name || ''),
        category_code: String(sub.category_code || cat.code || ''),
        products_count: sub.products_count || 0,
      })),
    }));

    if (categories.length > 0) {
      await setCachedCategories(categories);
    }
    return categories;
  } catch (err) {
    console.warn('Network error fetching categories, attempting offline cache:', err);
    const cached = await getCachedCategories();
    return cached || [];
  }
}

export async function fetchSubCategories(categoryId?: string): Promise<SubCategorySimple[]> {
  try {
    const params: Record<string, string> = {};
    if (categoryId) {
      params.category_id = categoryId;
    }
    const response = await apiClient.get('/api/products/subcategories/', { params });
    const data = response.data;
    const rawList = Array.isArray(data) ? data : data.results || data.subcategories || [];

    return rawList.map((sub: any) => ({
      id: String(sub.id || sub.code),
      name: String(sub.name || 'Subcategory'),
      code: String(sub.code || ''),
      description: sub.description || '',
      image: sub.image || '',
      image_url: getAbsoluteMediaUrl(sub.image_url || sub.image),
      display_order: sub.display_order ?? 0,
      is_active: sub.is_active ?? true,
      created_at: sub.created_at || '',
      category_id: String(sub.category_id || categoryId || ''),
      category_name: sub.category_name || '',
      category_code: sub.category_code || '',
      products_count: sub.products_count || 0,
    }));

  } catch (err) {
    console.warn('Error fetching subcategories:', err);
    return [];
  }
}
