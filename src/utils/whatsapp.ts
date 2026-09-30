import { Linking, Platform } from 'react-native';
import { Product, ProductVariant, FeaturePoint } from '../types/product';
import { WhatsAppShareOptions } from '../types/share';
import { formatSpecificationValue } from './formatters';
import { ENV } from '../config/environment';

export function generateWhatsAppMessage(
  product: Product,
  selectedVariant?: ProductVariant | null,
  options?: WhatsAppShareOptions,
  staffName?: string
): string {
  const currentItem = selectedVariant || product;
  const productName = product.name || 'Product';
  const variantText = selectedVariant ? `Variant: ${selectedVariant.name}` : '';
  const sku = currentItem.sku || product.sku || '';

  const lines: string[] = [];

  lines.push(`Hello,`);
  lines.push(`Thank you for your interest in ${ENV.COMPANY_NAME}.`);
  lines.push(``);
  lines.push(`📌 *${productName}*`);
  if (variantText) {
    lines.push(`🔹 ${variantText}`);
  }
  if (sku) {
    lines.push(`🏷 Product Code: ${sku}`);
  }
  lines.push(``);

  // Overview / Description
  if (options?.includeOverview && (currentItem.description || product.description)) {
    const desc = currentItem.description || product.description || '';
    lines.push(`📝 *Overview:*`);
    lines.push(desc.trim());
    lines.push(``);
  }

  // Key Features
  if (options?.includeFeatures && (currentItem.features?.length || product.features?.length)) {
    const featuresList = currentItem.features?.length ? currentItem.features : product.features || [];
    lines.push(`✅ *Key Features:*`);
    featuresList.slice(0, 6).forEach((feat: string | FeaturePoint) => {
      if (typeof feat === 'string') {
        lines.push(`• ${feat}`);
      } else if (feat && typeof feat === 'object' && feat.title) {
        lines.push(`• ${feat.title}${feat.description ? `: ${feat.description}` : ''}`);
      }
    });
    lines.push(``);
  }

  // Specifications
  if (options?.includeSpecs && (currentItem.specifications || product.specifications)) {
    const specs = currentItem.specifications || product.specifications || {};
    const keys = Object.keys(specs);
    if (keys.length > 0) {
      lines.push(`⚙️ *Technical Specifications:*`);
      keys.slice(0, 8).forEach((k) => {
        const val = formatSpecificationValue(specs[k]);
        lines.push(`• ${k}: ${val}`);
      });
      lines.push(``);
    }
  }

  // Applicable Areas
  if (options?.includeApplications && (currentItem.applicable_areas?.length || product.applicable_areas?.length)) {
    const areas = currentItem.applicable_areas?.length ? currentItem.applicable_areas : product.applicable_areas || [];
    lines.push(`🏢 *Applicable Areas:*`);
    areas.slice(0, 6).forEach((area: string) => {
      lines.push(`• ${area}`);
    });
    lines.push(``);
  }

  // Testing & Certificates
  if (options?.includeTesting && (currentItem.in_house_tests?.length || product.in_house_tests?.length)) {
    lines.push(`🔬 *Tested & Certified Quality Standard*`);
  }
  if (options?.includeCertificates && (currentItem.certifications?.length || product.certifications?.length)) {
    lines.push(`📜 *Certificates Available on Request*`);
  }

  // Product Link
  if (options?.includeProductLink) {
    const productUrl = `${ENV.COMPANY_WEBSITE}/products/${product.id}`;
    lines.push(`🌐 *View Details:* ${productUrl}`);
  }

  lines.push(``);
  lines.push(`Best Regards,`);
  lines.push(`${staffName || 'Sales Representative'} | ${ENV.COMPANY_NAME}`);

  return lines.join('\n');
}

export async function openWhatsAppWithMessage(
  fullPhoneNumber: string,
  message: string
): Promise<boolean> {
  const digits = fullPhoneNumber.replace(/[^\d]/g, '');
  const encodedText = encodeURIComponent(message);

  // Try WhatsApp app deep link first, then wa.me web fallback
  const appUrl = `whatsapp://send?phone=${digits}&text=${encodedText}`;
  const webUrl = `https://wa.me/${digits}?text=${encodedText}`;

  try {
    const canOpen = await Linking.canOpenURL(appUrl);
    if (canOpen) {
      await Linking.openURL(appUrl);
      return true;
    } else {
      await Linking.openURL(webUrl);
      return true;
    }
  } catch (err) {
    try {
      await Linking.openURL(webUrl);
      return true;
    } catch (webErr) {
      console.warn('Failed to open WhatsApp URL:', webErr);
      return false;
    }
  }
}
