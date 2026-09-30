export interface WhatsAppShareOptions {
  includeOverview: boolean;
  includeFeatures: boolean;
  includeSpecs: boolean;
  includeApplications: boolean;
  includeCertificates: boolean;
  includeTesting: boolean;
  includeImages: boolean;
  includeProductLink: boolean;
}

export interface SharedProductLog {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  variantId?: string;
  variantName?: string;
  customerName?: string;
  customerPhone: string;
  maskedPhone: string;
  countryCode: string;
  staffUsername: string;
  timestamp: string;
  sharedVia: 'whatsapp' | 'native_share';
  optionsShared: string[];
}

export interface CustomerSharePayload {
  product_id: string;
  variant_id?: string;
  customer_name?: string;
  customer_phone: string;
  shared_via: string;
  options: string[];
}

