export interface CountryCode {
  code: string;
  country: string;
  flag: string;
  digitLength: number;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: '+91', country: 'India', flag: '🇮🇳', digitLength: 10 },
  { code: '+971', country: 'UAE', flag: '🇦🇪', digitLength: 9 },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', digitLength: 9 },
  { code: '+968', country: 'Oman', flag: '🇴🇲', digitLength: 8 },
  { code: '+974', country: 'Qatar', flag: '🇶🇦', digitLength: 8 },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼', digitLength: 8 },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭', digitLength: 8 },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰', digitLength: 10 },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩', digitLength: 10 },
  { code: '+1', country: 'USA / Canada', flag: '🇺🇸', digitLength: 10 },
  { code: '+44', country: 'UK', flag: '🇬🇧', digitLength: 10 },
  { code: '+61', country: 'Australia', flag: '🇦🇺', digitLength: 9 },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', digitLength: 8 },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾', digitLength: 9 },
  { code: '+20', country: 'Egypt', flag: '🇪🇬', digitLength: 10 },
  { code: '+254', country: 'Kenya', flag: '🇰🇪', digitLength: 9 },
  { code: '+27', country: 'South Africa', flag: '🇿🇦', digitLength: 9 },
  { code: '+49', country: 'Germany', flag: '🇩🇪', digitLength: 10 },
  { code: '+33', country: 'France', flag: '🇫🇷', digitLength: 9 },
  { code: '+81', country: 'Japan', flag: '🇯🇵', digitLength: 10 },
];

export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

export function validatePhoneNumber(countryCode: string, rawPhone: string): { isValid: boolean; errorMessage?: string; fullNumber?: string } {
  const digits = sanitizePhoneNumber(rawPhone);
  
  if (!digits) {
    return { isValid: false, errorMessage: 'Phone number is required.' };
  }

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode);
  const expectedLen = selectedCountry ? selectedCountry.digitLength : 10;

  if (digits.length < 7 || digits.length > 15) {
    return { isValid: false, errorMessage: 'Invalid phone number length (must be 7-15 digits).' };
  }

  const cleanCountryCode = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
  const fullNumber = `${cleanCountryCode}${digits}`;

  return {
    isValid: true,
    fullNumber,
  };
}

export function maskPhoneNumber(fullPhone: string): string {
  if (!fullPhone) return '';
  const digitsOnly = fullPhone.replace(/[^\d+]/g, '');
  if (digitsOnly.length <= 6) return digitsOnly;
  
  const prefix = digitsOnly.slice(0, 3);
  const suffix = digitsOnly.slice(-4);
  const maskedMiddle = '*'.repeat(Math.max(2, digitsOnly.length - 7));
  
  return `${prefix} ${maskedMiddle} ${suffix}`;
}
