import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share as NativeShare,
  Alert,
} from 'react-native';
import { Product, ProductVariant } from '../../types/product';
import { WhatsAppShareOptions } from '../../types/share';
import { colors, radii, shadows } from '../../theme';
import {
  X,
  Send,
  CheckSquare,
  Square,
  PhoneCall,
  Globe,
  Share2,
  ShieldCheck,
  User,
} from 'lucide-react-native';

import { Button } from '../Common/Button';
import { Input } from '../Common/Input';
import {
  COUNTRY_CODES,
  validatePhoneNumber,
  maskPhoneNumber,
  sanitizePhoneNumber,
} from '../../utils/phoneValidator';
import { generateWhatsAppMessage, openWhatsAppWithMessage } from '../../utils/whatsapp';
import { saveSharedHistoryItem } from '../../utils/storage';
import { logProductShareToBackend } from '../../api/shares';
import { useAuth } from '../../context/AuthContext';

interface WhatsAppShareModalProps {
  visible: boolean;
  product: Product | null;
  selectedVariant?: ProductVariant | null;
  onClose: () => void;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  visible,
  product,
  selectedVariant,
  onClose,
}) => {
  const { user } = useAuth();
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [isSending, setIsSending] = useState(false);


  const [options, setOptions] = useState<WhatsAppShareOptions>({
    includeOverview: true,
    includeFeatures: true,
    includeSpecs: true,
    includeApplications: true,
    includeCertificates: true,
    includeTesting: true,
    includeImages: true,
    includeProductLink: true,
  });

  const [messagePreview, setMessagePreview] = useState('');

  // Update preview whenever product, variant, options change
  useEffect(() => {
    if (product) {
      const msg = generateWhatsAppMessage(product, selectedVariant, options, user?.username);
      setMessagePreview(msg);
    }
  }, [product, selectedVariant, options, user]);

  if (!visible || !product) return null;

  const currentItem = selectedVariant || product;

  const toggleOption = (key: keyof WhatsAppShareOptions) => {
    setOptions((prev: WhatsAppShareOptions) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSendWhatsApp = async () => {
    const validation = validatePhoneNumber(countryCode, phoneNumber);
    if (!validation.isValid || !validation.fullNumber) {
      setPhoneError(validation.errorMessage || 'Invalid phone number');
      return;
    }

    setPhoneError(null);
    setIsSending(true);

    try {
      const fullPhone = validation.fullNumber;
      const masked = maskPhoneNumber(fullPhone);

      // Save to local staff history
      await saveSharedHistoryItem({
        id: `${Date.now()}`,
        productId: product.id,
        productName: product.name,
        productSku: currentItem.sku || product.sku,
        variantId: selectedVariant?.id,
        variantName: selectedVariant?.name,
        customerName: customerName.trim() || undefined,
        customerPhone: fullPhone,
        maskedPhone: masked,
        countryCode,
        staffUsername: user?.username || 'Staff',
        timestamp: new Date().toISOString(),
        sharedVia: 'whatsapp',
        optionsShared: Object.keys(options).filter((k) => options[k as keyof WhatsAppShareOptions]),
      });

      // Post to backend API
      logProductShareToBackend({
        product_id: product.id,
        variant_id: selectedVariant?.id,
        customer_name: customerName.trim() || undefined,
        customer_phone: fullPhone,
        shared_via: 'whatsapp',
        options: Object.keys(options).filter((k) => options[k as keyof WhatsAppShareOptions]),
      }).catch(() => {});


      // Launch WhatsApp
      const success = await openWhatsAppWithMessage(fullPhone, messagePreview);
      setIsSending(false);
      if (success) {
        onClose();
      } else {
        Alert.alert('Notice', 'Could not open WhatsApp app directly. Opening native share menu...');
        await NativeShare.share({ message: messagePreview });
        onClose();
      }
    } catch (err: any) {
      setIsSending(false);
      Alert.alert('Error', 'Failed to share details. Please try again.');
    }
  };

  const handleNativeShare = async () => {
    try {
      await NativeShare.share({
        title: product.name,
        message: messagePreview,
      });
      onClose();
    } catch (e) {}
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleBox}>
              <Send size={20} color={colors.whatsAppGreen} />
              <Text style={styles.headerTitle}>Share Product with Customer</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {/* Product Selected Card */}
            <View style={styles.productBanner}>
              <Text style={styles.bannerSku}>{currentItem.sku}</Text>
              <Text style={styles.bannerName}>{product.name}</Text>
              {selectedVariant && (
                <Text style={styles.bannerVariant}>Selected Variant: {selectedVariant.name}</Text>
              )}
            </View>

            {/* Customer Name (Optional) Input */}
            <Text style={styles.sectionLabel}>Customer Name (Optional)</Text>
            <Input
              placeholder="e.g. Rahul Sharma"
              value={customerName}
              onChangeText={setCustomerName}
              leftIcon={<User size={16} color={colors.textMuted} />}
              style={{ marginBottom: 8 }}
            />

            {/* Customer WhatsApp Phone Number Input */}
            <Text style={styles.sectionLabel}>Customer WhatsApp Number *</Text>

            <View style={styles.phoneInputRow}>
              {/* Country Code Picker Button */}
              <TouchableOpacity
                style={styles.countryBtn}
                onPress={() => setShowCountrySelector(!showCountrySelector)}
              >
                <Globe size={16} color={colors.accentBlue} />
                <Text style={styles.countryText}>{countryCode}</Text>
              </TouchableOpacity>

              {/* Number Input */}
              <View style={{ flex: 1 }}>
                <Input
                  placeholder="Enter 10-digit mobile number"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={(val) => {
                    setPhoneNumber(val);
                    if (phoneError) setPhoneError(null);
                  }}
                  error={phoneError}
                  leftIcon={<PhoneCall size={16} color={colors.textMuted} />}
                  style={{ marginBottom: 0 }}
                />
              </View>
            </View>

            {/* Country Selector Dropdown */}
            {showCountrySelector && (
              <View style={styles.countryDropdown}>
                <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled>
                  {COUNTRY_CODES.map((item) => (
                    <TouchableOpacity
                      key={item.code}
                      style={styles.countryItem}
                      onPress={() => {
                        setCountryCode(item.code);
                        setShowCountrySelector(false);
                      }}
                    >
                      <Text style={styles.countryFlag}>{item.flag}</Text>
                      <Text style={styles.countryName}>{item.country}</Text>
                      <Text style={styles.countryCodeText}>{item.code}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Checkboxes for Information to Include */}
            <Text style={styles.sectionLabel}>Information to Include</Text>
            <View style={styles.checkboxGrid}>
              <OptionCheckbox
                label="Product Overview"
                checked={options.includeOverview}
                onToggle={() => toggleOption('includeOverview')}
              />
              <OptionCheckbox
                label="Key Features"
                checked={options.includeFeatures}
                onToggle={() => toggleOption('includeFeatures')}
              />
              <OptionCheckbox
                label="Technical Specifications"
                checked={options.includeSpecs}
                onToggle={() => toggleOption('includeSpecs')}
              />
              <OptionCheckbox
                label="Applicable Areas"
                checked={options.includeApplications}
                onToggle={() => toggleOption('includeApplications')}
              />
              <OptionCheckbox
                label="Testing & Quality"
                checked={options.includeTesting}
                onToggle={() => toggleOption('includeTesting')}
              />
              <OptionCheckbox
                label="Certificates Notice"
                checked={options.includeCertificates}
                onToggle={() => toggleOption('includeCertificates')}
              />
              <OptionCheckbox
                label="Product Web Link"
                checked={options.includeProductLink}
                onToggle={() => toggleOption('includeProductLink')}
              />
            </View>

            {/* Message Preview */}
            <Text style={styles.sectionLabel}>WhatsApp Message Preview</Text>
            <View style={styles.previewBox}>
              <Text style={styles.previewText}>{messagePreview}</Text>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <Button
              title="Share via WhatsApp"
              onPress={handleSendWhatsApp}
              variant="whatsApp"
              loading={isSending}
              icon={<Send size={18} color="#FFFFFF" />}
              style={{ flex: 1 }}
            />
            <Button
              title="Other Share"
              onPress={handleNativeShare}
              variant="outline"
              icon={<Share2 size={16} color={colors.primaryNavy} />}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const OptionCheckbox: React.FC<{ label: string; checked: boolean; onToggle: () => void }> = ({
  label,
  checked,
  onToggle,
}) => (
  <TouchableOpacity style={styles.checkboxItem} onPress={onToggle} activeOpacity={0.8}>
    {checked ? (
      <CheckSquare size={18} color={colors.accentBlue} />
    ) : (
      <Square size={18} color={colors.textMuted} />
    )}
    <Text style={[styles.checkboxLabel, checked && styles.checkboxLabelChecked]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 19, 41, 0.85)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: '92%',
    overflow: 'hidden',
    ...shadows.modal,
  },
  header: {
    height: 56,
    backgroundColor: colors.primaryNavy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 16,
  },
  bodyContent: {
    paddingBottom: 24,
  },
  productBanner: {
    backgroundColor: '#F0F7FF',
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(13, 96, 174, 0.2)',
    marginBottom: 16,
  },
  bannerSku: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentBlue,
  },
  bannerName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryNavy,
    marginTop: 2,
  },
  bannerVariant: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.amberGold,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  countryBtn: {
    height: 48,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countryText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  countryDropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    marginBottom: 12,
    ...shadows.card,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 8,
  },
  countryFlag: {
    fontSize: 16,
  },
  countryName: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },
  countryCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentBlue,
  },
  checkboxGrid: {
    gap: 8,
    marginBottom: 14,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  checkboxLabelChecked: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  previewBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    maxHeight: 140,
  },
  previewText: {
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
});
