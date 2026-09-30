import { Category, SubCategorySimple } from './category';

export type MediaAssetType = 'IMAGE' | 'VIDEO' | 'PDF_BROCHURE' | 'TECH_SHEET' | 'THREE_D';

export interface MediaAsset {
  id: string;
  title: string;
  asset_type: MediaAssetType;
  asset_type_display?: string;
  file?: string;
  file_url?: string;
  external_url?: string;
  file_size_mb?: number;
  description?: string;
  created_at?: string;
}

export interface SpecificationItem {
  key: string;
  value: string;
  unit?: string;
}

export type SpecificationsMap = Record<string, string | number | boolean | SpecificationItem>;

export interface FeaturePoint {
  title: string;
  description?: string;
  bullets?: string[];
}

export interface TestPoint {
  test_name: string;
  standard?: string;
  method?: string;
  result?: string;
  date?: string;
  document_url?: string;
  sub_points?: string[];
}

export interface CertificationPoint {
  title: string;
  number?: string;
  authority?: string;
  issue_date?: string;
  expiry_date?: string;
  preview_url?: string;
  document_url?: string;
  tests?: TestPoint[];
}

export interface ProductVariant {
  id: string;
  parent_id?: string;
  name: string;
  sku: string;
  price: number | string;
  stock: number;
  image?: string;
  image_url?: string;
  description?: string;
  specifications?: SpecificationsMap;
  features?: (string | FeaturePoint)[];
  certifications?: (string | CertificationPoint)[];
  in_house_tests?: (string | TestPoint)[];
  applicable_areas?: string[];
  category_id?: string;
  category_name?: string;
  sub_category_id?: string;
  sub_category_name?: string;
  media_assets?: MediaAsset[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category?: Category;
  category_id?: string;
  sub_category?: SubCategorySimple;
  sub_category_id?: string;
  parent_id?: string;
  variants?: ProductVariant[];
  sub_products?: ProductVariant[];
  description?: string;
  price?: number | string;
  stock?: number;
  specifications?: SpecificationsMap;
  features?: (string | FeaturePoint)[];
  certifications?: (string | CertificationPoint)[];
  in_house_tests?: (string | TestPoint)[];
  applicable_areas?: string[];
  image?: string;
  image_url?: string;
  media_assets?: MediaAsset[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductFilterParams {
  category_id?: string;
  sub_category_id?: string;
  search?: string;
  kiosk_id?: string;
  device_id?: string;
}
