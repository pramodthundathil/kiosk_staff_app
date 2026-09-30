/**
 * Environment configuration for Excel Earthing Staff Application.
 */
export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://excel.byteboot.in',
  API_TIMEOUT: 15000,
  APP_NAME: 'Excel Earthing Staff Catalogue',
  COMPANY_NAME: 'Excel Earthing',
  COMPANY_WEBSITE: 'https://excelearting.com',
  DEFAULT_COUNTRY_CODE: '+91',
};

export function getAbsoluteMediaUrl(relativeUrl?: string | null): string {
  if (!relativeUrl) return '';
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://') || relativeUrl.startsWith('data:')) {
    return relativeUrl;
  }
  const baseUrl = ENV.API_BASE_URL.replace(/\/+$/, '');
  const cleanPath = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
  return `${baseUrl}${cleanPath}`;
}
