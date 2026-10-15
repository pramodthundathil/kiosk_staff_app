import { Linking, Platform, Alert, NativeModules } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Product, ProductVariant, FeaturePoint, MediaAsset } from '../types/product';
import { WhatsAppShareOptions } from '../types/share';
import { formatSpecificationValue } from './formatters';
import { ENV, getAbsoluteMediaUrl } from '../config/environment';

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

  // Product Images Notice (Photos are shared directly as image files, not raw links)
  if (options?.includeImages) {
    const mainImg = (currentItem.image_url || product.image_url || '').trim();
    if (mainImg) {
      lines.push(`📸 *Product Photos:* High-resolution product photos attached`);
      lines.push(``);
    }
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

/**
 * Share a specific media asset or image directly to WhatsApp contacts
 */
export async function shareMediaAssetToWhatsApp(
  mediaUrl: string,
  title?: string,
  productName?: string,
  assetType: string = 'IMAGE'
): Promise<boolean> {
  const cleanUrl = (mediaUrl || '').trim();
  if (!cleanUrl) return false;

  const typeLabel =
    assetType === 'THREE_D'
      ? 'Interactive 3D Model'
      : assetType === 'VIDEO'
      ? 'Product Video'
      : assetType === 'PDF_BROCHURE' || assetType === 'TECH_SHEET'
      ? 'Technical Document'
      : 'Product Photo';

  const lines: string[] = [];
  lines.push(`Hello,`);
  if (productName) {
    lines.push(`Sharing ${typeLabel.toLowerCase()} for *${productName}*:`);
  } else {
    lines.push(`Sharing *${title || typeLabel}*:`);
  }
  if (title && productName && title !== productName) {
    lines.push(`📌 ${title}`);
  }
  lines.push(``);
  lines.push(`🔗 ${cleanUrl}`);
  lines.push(``);
  lines.push(`Best Regards,`);
  lines.push(`${ENV.COMPANY_NAME}`);

  return await openWhatsAppDirect(lines.join('\n'));
}

export const DEFAULT_WHATSAPP_SHARE_OPTIONS: WhatsAppShareOptions = {
  includeOverview: true,
  includeFeatures: true,
  includeSpecs: true,
  includeApplications: true,
  includeCertificates: true,
  includeTesting: true,
  includeImages: true,
  includeProductLink: true,
};

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

/**
 * Open WhatsApp directly with prefilled message without requiring a specific phone number.
 * WhatsApp will open its contact/chat picker ("Send to...") allowing the user
 * to select any existing contact, recent chat, or group.
 */
export async function openWhatsAppDirect(message: string): Promise<boolean> {
  const encodedText = encodeURIComponent(message);
  const appUrl = `whatsapp://send?text=${encodedText}`;
  const webUrl = `https://api.whatsapp.com/send?text=${encodedText}`;

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
      console.warn('Failed to open WhatsApp direct URL:', webErr);
      return false;
    }
  }
}

/**
 * Downloads a remote image and shares the actual image file directly.
 * Invokes the device share system where WhatsApp (and WhatsApp contacts)
 * will attach and send the actual photo file directly.
 */
export async function shareImageFileDirectly(
  imageUrl: string,
  dialogTitle: string = 'Share Image'
): Promise<boolean> {
  const cleanUrl = (imageUrl || '').trim();
  if (!cleanUrl) return false;

  const absoluteUrl = getAbsoluteMediaUrl(cleanUrl);
  if (!absoluteUrl) return false;

  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Notice', 'Photo sharing is not supported on this device.');
      return false;
    }

    let fileToShare = absoluteUrl;

    if (absoluteUrl.startsWith('http://') || absoluteUrl.startsWith('https://')) {
      let ext = 'jpg';
      const cleanPath = absoluteUrl.split('?')[0].toLowerCase();
      if (cleanPath.endsWith('.png')) ext = 'png';
      else if (cleanPath.endsWith('.webp')) ext = 'webp';
      else if (cleanPath.endsWith('.jpeg')) ext = 'jpeg';
      else if (cleanPath.endsWith('.gif')) ext = 'gif';

      const filename = `product_photo_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
      const localUri = `${FileSystem.cacheDirectory}${filename}`;

      const downloadRes = await FileSystem.downloadAsync(absoluteUrl, localUri);
      if (!downloadRes || !downloadRes.uri) {
        console.warn('FileSystem.downloadAsync failed for:', absoluteUrl);
        return false;
      }
      fileToShare = downloadRes.uri;
    }

    let mimeType = 'image/jpeg';
    const checkPath = fileToShare.split('?')[0].toLowerCase();
    if (checkPath.endsWith('.png')) mimeType = 'image/png';
    else if (checkPath.endsWith('.webp')) mimeType = 'image/webp';
    else if (checkPath.endsWith('.gif')) mimeType = 'image/gif';

    await Sharing.shareAsync(fileToShare, {
      mimeType,
      dialogTitle,
      UTI: mimeType === 'image/png' ? 'public.png' : 'public.jpeg',
    });

    return true;
  } catch (err) {
    console.warn('Failed to share image file directly:', err);
    return false;
  }
}

/**
 * Returns all valid absolute photo URLs for a product and its selected variant.
 */
export function getAllProductImageUrls(
  product: Product,
  selectedVariant?: ProductVariant | null,
  customAssets?: MediaAsset[]
): string[] {
  const currentItem = selectedVariant || product;
  const imageUrls: string[] = [];

  const mainImg = (
    currentItem.image_url ||
    currentItem.image ||
    product.image_url ||
    product.image ||
    ''
  ).trim();
  if (mainImg) {
    const abs = getAbsoluteMediaUrl(mainImg);
    if (abs && !imageUrls.includes(abs)) {
      imageUrls.push(abs);
    }
  }

  const allMedia = [
    ...(customAssets || []),
    ...(product.media_assets || []),
    ...(selectedVariant?.media_assets || []),
  ];

  allMedia.forEach((m) => {
    const u = (
      m.file_url ||
      m.file ||
      (m as any).url ||
      (m as any).image ||
      m.external_url ||
      ''
    ).trim();
    if (!u) return;

    const lowerUrl = u.toLowerCase();
    const typeUpper = (m.asset_type || (m as any).type || '').toUpperCase();

    // Skip non-image assets
    if (
      typeUpper === 'PDF_BROCHURE' ||
      typeUpper === 'TECH_SHEET' ||
      typeUpper === 'VIDEO' ||
      typeUpper === 'THREE_D' ||
      lowerUrl.endsWith('.pdf') ||
      lowerUrl.endsWith('.mp4') ||
      lowerUrl.endsWith('.mov') ||
      lowerUrl.endsWith('.glb') ||
      lowerUrl.endsWith('.gltf')
    ) {
      return;
    }

    const abs = getAbsoluteMediaUrl(u);
    if (abs && !imageUrls.includes(abs)) {
      imageUrls.push(abs);
    }
  });

  return imageUrls;
}

/**
 * Shares multiple product photos one by one directly as image files.
 */
export async function shareAllImagesSequentially(
  imageUrls: string[],
  productName: string
): Promise<void> {
  if (!imageUrls || imageUrls.length === 0) return;

  for (let i = 0; i < imageUrls.length; i++) {
    const isLast = i === imageUrls.length - 1;
    await shareImageFileDirectly(
      imageUrls[i],
      `${productName} (Photo ${i + 1} of ${imageUrls.length})`
    );

    if (!isLast) {
      const continueNext = await new Promise<boolean>((resolve) => {
        Alert.alert(
          'Photo Shared',
          `Photo ${i + 1} of ${imageUrls.length} sent to share.\nReady to share Photo ${i + 2}?`,
          [
            { text: 'Done', style: 'cancel', onPress: () => resolve(false) },
            { text: `Share Photo ${i + 2}`, onPress: () => resolve(true) },
          ]
        );
      });
      if (!continueNext) break;
    }
  }
}

/**
 * Shares multiple product photos directly as image files in ONE action.
 * Downloads all photos locally first, then invokes multi-file sharing
 * (react-native-share if available, or Expo Sharing sequentially).
 */
export async function shareMultipleImageFiles(
  imageUrls: string[],
  productName: string,
  onProgress?: (step: 'downloading' | 'sharing', current: number, total: number) => void
): Promise<boolean> {
  const cleanUrls = imageUrls.map((u) => (u || '').trim()).filter(Boolean);
  if (cleanUrls.length === 0) return false;

  if (cleanUrls.length === 1) {
    return await shareImageFileDirectly(cleanUrls[0], productName);
  }

  try {
    const total = cleanUrls.length;
    let completedDownloads = 0;

    const downloadPromises = cleanUrls.map(async (url, idx) => {
      try {
        const absUrl = getAbsoluteMediaUrl(url);
        let ext = 'jpg';
        const cleanPath = (absUrl || url).split('?')[0].toLowerCase();
        if (cleanPath.endsWith('.png')) ext = 'png';
        else if (cleanPath.endsWith('.webp')) ext = 'webp';
        else if (cleanPath.endsWith('.jpeg')) ext = 'jpeg';

        const filename = `multi_photo_${Date.now()}_${idx}_${Math.floor(Math.random() * 1000)}.${ext}`;
        const localUri = `${FileSystem.cacheDirectory}${filename}`;

        const res = await FileSystem.downloadAsync(absUrl || url, localUri);
        completedDownloads++;
        if (onProgress) {
          onProgress('downloading', completedDownloads, total);
        }
        return res?.uri || null;
      } catch (err) {
        console.warn('Failed downloading photo:', url, err);
        return null;
      }
    });

    const results = await Promise.all(downloadPromises);
    const localUris = results.filter((uri): uri is string => Boolean(uri));

    if (localUris.length === 0) {
      Alert.alert('Notice', 'Unable to load photos for sharing. Please check network connection.');
      return false;
    }

    if (onProgress) {
      onProgress('sharing', localUris.length, localUris.length);
    }

    // 1. Try native multi-file share (react-native-share) if module is linked
    const hasRNShare = Boolean(NativeModules.RNShare || NativeModules.RNShareModule);
    if (hasRNShare) {
      try {
        const Share = require('react-native-share').default;
        try {
          await Share.shareSingle({
            social: Share.Social.WHATSAPP,
            urls: localUris,
            title: productName,
            message: `*${productName}*`,
          });
          return true;
        } catch (singleErr) {
          await Share.open({
            urls: localUris,
            title: `Share ${localUris.length} photos - ${productName}`,
            type: 'image/*',
            failOnCancel: false,
          });
          return true;
        }
      } catch (rnErr) {
        console.warn('Native RNShare failed, falling back to Expo Sharing:', rnErr);
      }
    }

    // 2. Fallback for Expo Go (where RNShare native module is not linked)
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Notice', 'Photo sharing is not supported on this device.');
      return false;
    }

    for (let i = 0; i < localUris.length; i++) {
      const uri = localUris[i];
      let mimeType = 'image/jpeg';
      const checkPath = uri.split('?')[0].toLowerCase();
      if (checkPath.endsWith('.png')) mimeType = 'image/png';
      else if (checkPath.endsWith('.webp')) mimeType = 'image/webp';

      await Sharing.shareAsync(uri, {
        mimeType,
        dialogTitle: `Share Photo ${i + 1} of ${localUris.length} - ${productName}`,
        UTI: mimeType === 'image/png' ? 'public.png' : 'public.jpeg',
      });
    }

    return true;
  } catch (err: any) {
    console.warn('shareMultipleImageFiles error:', err);
    Alert.alert('Error', 'Failed to share product photos.');
    return false;
  }
}

/**
 * Shares all product photos directly as image files in ONE click.
 * Downloads all photos and triggers multi-file native share so WhatsApp
 * receives all images at once. Never sends raw URLs or text links.
 */
export async function shareAllProductImagesToWhatsApp(
  product: Product,
  selectedVariant?: ProductVariant | null,
  staffName?: string
): Promise<boolean> {
  const imageUrls = getAllProductImageUrls(product, selectedVariant);

  if (imageUrls.length === 0) {
    Alert.alert('Notice', 'No photos available for this product.');
    return false;
  }

  return await shareMultipleImageFiles(imageUrls, product.name);
}

