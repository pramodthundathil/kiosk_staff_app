import { Product } from './product';
import { Category, SubCategorySimple } from './category';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  CategoryDetail: { category: Category };
  SubCategoryProducts: { subCategory: SubCategorySimple; categoryName?: string };
  ProductDetail: { productId: string; product?: Product; variantId?: string };
  Search: { initialQuery?: string };
  SharedHistory: undefined;
  Profile: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  CategoriesTab: undefined;
  SearchTab: undefined;
  SharedTab: undefined;
  ProfileTab: undefined;
};
