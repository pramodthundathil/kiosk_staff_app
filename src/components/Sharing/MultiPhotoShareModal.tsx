import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  AppState,
  AppStateStatus,
  Alert,
} from 'react-native';
import { Product, ProductVariant, MediaAsset } from '../../types/product';
import { colors, radii, shadows } from '../../theme';
import {
  X,
  Check,
  ArrowRight,
  Share2,
  CheckSquare,
  Square,
} from 'lucide-react-native';
import { WhatsAppIcon } from '../Common/WhatsAppIcon';
import {
  getAllProductImageUrls,
  shareImageFileDirectly,
  shareMultipleImageFiles,
  openWhatsAppDirect,
} from '../../utils/whatsapp';

interface MultiPhotoShareModalProps {
  visible: boolean;
  product: Product | null;
  selectedVariant?: ProductVariant | null;
  customAssets?: MediaAsset[];
  onClose: () => void;
}

export const MultiPhotoShareModal: React.FC<MultiPhotoShareModalProps> = ({
  visible,
  product,
  selectedVariant,
  customAssets,
  onClose,
}) => {
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [sharedIndices, setSharedIndices] = useState<number[]>([]);
  const [currentSharingIndex, setCurrentSharingIndex] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [sharingStatusText, setSharingStatusText] = useState<string>('');

  // Load photo URLs whenever modal opens or product changes
  useEffect(() => {
    if (!visible || !product) {
      setPhotoUrls([]);
      setSelectedIndices([]);
      setSharedIndices([]);
      setCurrentSharingIndex(null);
      setIsProcessing(false);
      setSharingStatusText('');
      return;
    }

    const urls = getAllProductImageUrls(product, selectedVariant, customAssets);
    setPhotoUrls(urls);
    // Select all photos by default
    setSelectedIndices(urls.map((_, i) => i));
    setSharedIndices([]);
    setCurrentSharingIndex(null);
    setIsProcessing(false);
    setSharingStatusText('');
  }, [visible, product, selectedVariant, customAssets]);

  if (!visible || !product) return null;

  const totalPhotos = photoUrls.length;
  const currentItem = selectedVariant || product;

  // Toggle selection for an individual photo
  const toggleSelectIndex = (index: number) => {
    setSelectedIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index].sort((a, b) => a - b);
      }
    });
  };

  // Select all or Deselect all
  const toggleSelectAll = () => {
    if (selectedIndices.length === totalPhotos) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(photoUrls.map((_, i) => i));
    }
  };

  // Share a specific photo index
  const handleShareIndex = async (index: number) => {
    if (index < 0 || index >= photoUrls.length) return;
    const url = photoUrls[index];
    if (!url) return;

    setIsProcessing(true);
    setCurrentSharingIndex(index);
    setSharingStatusText(`Preparing photo ${index + 1}...`);

    try {
      const dialogTitle = `${product.name} (Photo ${index + 1} of ${totalPhotos})`;
      const success = await shareImageFileDirectly(url, dialogTitle);

      if (success) {
        setSharedIndices((prev) => (prev.includes(index) ? prev : [...prev, index]));
      }
    } catch (err) {
      Alert.alert('Notice', 'Unable to share photo. Please try again.');
    } finally {
      setIsProcessing(false);
      setCurrentSharingIndex(null);
      setSharingStatusText('');
    }
  };

  // Share all selected photos to WhatsApp at once
  const handleShareAllSelected = async () => {
    if (selectedIndices.length === 0) {
      Alert.alert('Notice', 'Please select at least 1 photo to share.');
      return;
    }

    const targetUrls = selectedIndices.map((i) => photoUrls[i]).filter(Boolean);
    if (targetUrls.length === 0) return;

    setIsProcessing(true);
    setSharingStatusText(`Preparing ${targetUrls.length} photos for WhatsApp...`);

    try {
      const success = await shareMultipleImageFiles(
        targetUrls,
        product.name,
        (step, current, total) => {
          if (step === 'downloading') {
            setSharingStatusText(`Preparing photo ${current} of ${total}...`);
          } else {
            setSharingStatusText(`Opening WhatsApp with ${total} photos...`);
          }
        }
      );

      if (success) {
        setSharedIndices((prev) => Array.from(new Set([...prev, ...selectedIndices])));
      }
    } catch (err) {
      Alert.alert('Notice', 'Unable to share photos. Please try again.');
    } finally {
      setIsProcessing(false);
      setSharingStatusText('');
    }
  };

  // Share selected photo links as a single direct WhatsApp message
  const handleShareSelectedLinksViaWhatsApp = async () => {
    if (selectedIndices.length === 0) {
      Alert.alert('Notice', 'Please select at least 1 photo to share.');
      return;
    }

    let msg = `*${product.name}*\n`;
    if (currentItem.sku) msg += `SKU: ${currentItem.sku}\n`;
    if (selectedVariant?.name) msg += `Variant: ${selectedVariant.name}\n`;
    msg += `\n*Product Photos (${selectedIndices.length}):*\n`;

    selectedIndices.forEach((idx, i) => {
      msg += `📸 Photo ${idx + 1}: ${photoUrls[idx]}\n`;
    });

    try {
      await openWhatsAppDirect(msg);
      onClose();
    } catch (e) {
      Alert.alert('Error', 'Failed to open WhatsApp.');
    }
  };

  const isAllSelectedShared =
    selectedIndices.length > 0 &&
    selectedIndices.every((idx) => sharedIndices.includes(idx));

  const isAllSelected = selectedIndices.length === totalPhotos;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleBox}>
              <View style={styles.headerIconBg}>
                <WhatsAppIcon size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>Select Photos to Share</Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  {product.name} • {selectedIndices.length} of {totalPhotos} selected
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {/* Selection Toolbar */}
            <View style={styles.selectionToolbar}>
              <Text style={styles.selectionSummaryText}>
                {selectedIndices.length === 0
                  ? 'No photos selected'
                  : selectedIndices.length === 1
                  ? '1 photo selected'
                  : `${selectedIndices.length} photos selected`}
              </Text>
              <TouchableOpacity
                style={styles.selectAllBtn}
                onPress={toggleSelectAll}
                activeOpacity={0.7}
              >
                {isAllSelected ? (
                  <CheckSquare size={16} color={colors.accentBlue} />
                ) : (
                  <Square size={16} color={colors.textSecondary} />
                )}
                <Text style={styles.selectAllBtnText}>
                  {isAllSelected ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Photo Cards Grid / List */}
            <View style={styles.photoList}>
              {photoUrls.map((url, index) => {
                const isSelected = selectedIndices.includes(index);
                const isShared = sharedIndices.includes(index);
                const isCurrent = currentSharingIndex === index;

                return (
                  <TouchableOpacity
                    key={`${url}_${index}`}
                    style={[
                      styles.photoCard,
                      isSelected && styles.photoCardSelected,
                      isShared && styles.photoCardShared,
                    ]}
                    onPress={() => toggleSelectIndex(index)}
                    activeOpacity={0.85}
                  >
                    {/* Selection Checkbox */}
                    <TouchableOpacity
                      style={styles.checkboxTouchable}
                      onPress={() => toggleSelectIndex(index)}
                      activeOpacity={0.7}
                    >
                      {isSelected ? (
                        <CheckSquare size={22} color={colors.whatsAppGreen} />
                      ) : (
                        <Square size={22} color={colors.textMuted} />
                      )}
                    </TouchableOpacity>

                    {/* Thumbnail Image */}
                    <View style={styles.thumbnailWrapper}>
                      <Image source={{ uri: url }} style={styles.thumbnailImage} resizeMode="contain" />
                      <View style={styles.indexBadge}>
                        <Text style={styles.indexBadgeText}>Photo {index + 1}</Text>
                      </View>
                    </View>

                    {/* Photo Info & Quick Share */}
                    <View style={styles.photoInfo}>
                      <View style={styles.photoStatusRow}>
                        <Text style={styles.photoTitle}>
                          {index === 0 ? 'Main Photo' : `Gallery Photo ${index + 1}`}
                        </Text>
                        {isShared && (
                          <View style={styles.sharedBadge}>
                            <Check size={12} color={colors.whatsAppDarkGreen} strokeWidth={3} />
                            <Text style={styles.sharedBadgeText}>Sent</Text>
                          </View>
                        )}
                      </View>

                      {/* Direct 1-tap share for this specific photo */}
                      <TouchableOpacity
                        style={[
                          styles.singleShareBtn,
                          isShared && styles.singleShareBtnShared,
                        ]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleShareIndex(index);
                        }}
                        disabled={isProcessing}
                        activeOpacity={0.8}
                      >
                        {isCurrent ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <WhatsAppIcon size={15} color="#FFFFFF" />
                        )}
                        <Text style={styles.singleShareBtnText}>
                          {isCurrent
                            ? 'Opening...'
                            : isShared
                            ? 'Share Again'
                            : `Share Photo ${index + 1}`}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Preparation / Progress Status Notice */}
            {isProcessing && sharingStatusText ? (
              <View style={styles.sequenceNotice}>
                <ActivityIndicator size="small" color={colors.accentBlue} style={{ marginRight: 8 }} />
                <Text style={styles.sequenceNoticeTitle}>{sharingStatusText}</Text>
              </View>
            ) : null}

            {isAllSelectedShared && selectedIndices.length > 0 && (
              <View style={styles.completedNotice}>
                <Check size={20} color={colors.whatsAppDarkGreen} strokeWidth={3} />
                <Text style={styles.completedNoticeText}>
                  All {selectedIndices.length} selected photos have been shared!
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            {/* Primary Action Button: Share All Selected Photos */}
            {!isAllSelectedShared ? (
              <TouchableOpacity
                style={[
                  styles.primaryActionBtn,
                  (isProcessing || selectedIndices.length === 0) &&
                    styles.primaryActionBtnDisabled,
                ]}
                onPress={handleShareAllSelected}
                disabled={isProcessing || selectedIndices.length === 0}
                activeOpacity={0.85}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <WhatsAppIcon size={20} color="#FFFFFF" />
                )}
                <Text style={styles.primaryActionBtnText}>
                  {isProcessing
                    ? (sharingStatusText || 'Preparing Photos...')
                    : selectedIndices.length === 0
                    ? 'Select Photos Above to Share'
                    : selectedIndices.length === 1
                    ? `Share 1 Selected Photo to WhatsApp`
                    : `Share All ${selectedIndices.length} Photos to WhatsApp`}
                </Text>
                {!isProcessing && selectedIndices.length > 0 && <ArrowRight size={18} color="#FFFFFF" />}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.8}>
                <Check size={20} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            )}

            {/* Secondary: Share selected photo links together in 1 message */}
            {selectedIndices.length > 0 && (
              <TouchableOpacity
                style={styles.secondaryActionBtn}
                onPress={handleShareSelectedLinksViaWhatsApp}
                activeOpacity={0.8}
              >
                <Share2 size={16} color={colors.accentBlue} />
                <Text style={styles.secondaryActionBtnText}>
                  Send {selectedIndices.length} Photo Links in 1 WhatsApp Message
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 17, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 540,
    maxHeight: '90%',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.modal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: colors.primaryNavy,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  headerIconBg: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.whatsAppGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flexGrow: 1,
  },
  bodyContent: {
    padding: 16,
    gap: 14,
  },
  selectionToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  selectionSummaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  selectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
    backgroundColor: colors.background,
  },
  selectAllBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentBlue,
  },
  photoList: {
    gap: 12,
  },
  photoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    padding: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 12,
    ...shadows.subtle,
  },
  photoCardSelected: {
    borderColor: colors.accentBlue,
    backgroundColor: '#F0F7FF',
  },
  photoCardNext: {
    borderColor: colors.whatsAppGreen,
    backgroundColor: 'rgba(37, 211, 102, 0.06)',
  },
  photoCardShared: {
    borderColor: colors.whatsAppDarkGreen,
  },
  checkboxTouchable: {
    padding: 2,
  },
  thumbnailWrapper: {
    width: 76,
    height: 76,
    borderRadius: radii.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailImage: {
    width: '90%',
    height: '90%',
  },
  indexBadge: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    backgroundColor: 'rgba(5, 8, 17, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  indexBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  photoInfo: {
    flex: 1,
    gap: 8,
  },
  photoStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  photoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  sharedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  sharedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.whatsAppDarkGreen,
  },
  singleShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.whatsAppGreen,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    gap: 6,
    alignSelf: 'flex-start',
    ...shadows.subtle,
  },
  singleShareBtnShared: {
    backgroundColor: colors.whatsAppDarkGreen,
  },
  singleShareBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sequenceNotice: {
    backgroundColor: '#DCFCE7',
    borderRadius: radii.md,
    padding: 12,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  sequenceNoticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.whatsAppDarkGreen,
    marginBottom: 2,
  },
  sequenceNoticeSubtitle: {
    fontSize: 12,
    color: '#166534',
    lineHeight: 16,
  },
  completedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    borderRadius: radii.md,
    padding: 14,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  completedNoticeText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.whatsAppDarkGreen,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.whatsAppGreen,
    paddingVertical: 14,
    borderRadius: radii.lg,
    gap: 10,
    ...shadows.subtle,
  },
  primaryActionBtnDisabled: {
    opacity: 0.6,
  },
  primaryActionBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryNavy,
    paddingVertical: 14,
    borderRadius: radii.lg,
    gap: 8,
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: radii.md,
    gap: 6,
    backgroundColor: colors.background,
  },
  secondaryActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentBlue,
  },
});
