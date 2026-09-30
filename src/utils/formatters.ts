import { SpecificationItem } from '../types/product';

export function formatPrice(price?: number | string | null): string {
  if (price === undefined || price === null || price === '' || price === 0 || price === '0.00') {
    return 'Price on Request';
  }
  const numeric = typeof price === 'number' ? price : parseFloat(price);
  if (isNaN(numeric) || numeric === 0) return 'Price on Request';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(numeric);
}

export function formatSpecificationValue(specValue: any): string {
  if (specValue === null || specValue === undefined) return 'N/A';
  if (typeof specValue === 'string' || typeof specValue === 'number' || typeof specValue === 'boolean') {
    return String(specValue);
  }
  if (typeof specValue === 'object') {
    const item = specValue as SpecificationItem;
    if (item.value !== undefined) {
      return item.unit ? `${item.value} ${item.unit}` : String(item.value);
    }
    return JSON.stringify(specValue);
  }
  return String(specValue);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}
