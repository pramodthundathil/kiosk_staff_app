export interface SubCategorySimple {
  id: string;
  name: string;
  code: string;
  description?: string;
  image?: string;
  image_url?: string;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  category_id?: string;
  category_name?: string;
  category_code?: string;
  products_count?: number;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  description?: string;
  image?: string;
  image_url?: string;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  subcategories: SubCategorySimple[];
  subcategories_count: number;
  products_count: number;
}

