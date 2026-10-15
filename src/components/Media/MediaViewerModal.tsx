import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Share as NativeShare,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MediaAsset } from '../../types/product';
import { colors, radii, shadows } from '../../theme';
import { X, Box, Video, FileText, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react-native';
import { ThreeDViewer } from './ThreeDViewer';
import { VideoPlayerView } from './VideoPlayerView';
import { PdfDocumentViewer } from './PdfDocumentViewer';
import { AnimatedPressable } from '../Common/AnimatedPressable';
import { WhatsAppIcon } from '../Common/WhatsAppIcon';
import { shareMediaAssetToWhatsApp, shareImageFileDirectly } from '../../utils/whatsapp';

interface MediaViewerModalProps {
  visible: boolean;
  asset?: MediaAsset | null;
  assets?: MediaAsset[];
  initialIndex?: number;
  customUrl?: string | null;
  customType?: 'IMAGE' | 'VIDEO' | 'PDF_BROCHURE' | 'TECH_SHEET' | 'THREE_D';
  title?: string;
  productName?: string;
  onClose: () => void;
  onShareAllWhatsApp?: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  visible,
  asset,
  assets = [],
  initialIndex = 0,
  customUrl,
  customType,
  title = 'Media Preview',
  productName,
  onClose,
  onShareAllWhatsApp,
}) => {
  // Combine provided single asset or custom URL into asset list if assets array is empty
  const mediaList: MediaAsset[] = React.useMemo(() => {
    let raw: MediaAsset[] = [];

    if (assets && assets.length > 0) {
      const cleanCustom = (customUrl || '').trim();
      if (cleanCustom.length > 0 && !assets.some((a) => (a.file_url || a.file || a.external_url || (a as any).url || '').trim() === cleanCustom)) {
        raw = [
          {
            id: 'custom_1',
            title: title || 'Media Asset',
            asset_type: customType || 'IMAGE',
            file_url: cleanCustom,
            file: cleanCustom,
          },
          ...assets,
        ];
      } else {
        raw = assets;
      }
    } else if (asset) {
      const resolvedUrl = (asset.file_url || asset.file || asset.external_url || (asset as any).url || customUrl || '').trim();
      raw = [
        {
          ...asset,
          file_url: resolvedUrl,
          file: resolvedUrl,
        },
      ];
    } else if (customUrl && customUrl.trim().length > 0) {
      const cleanCustom = customUrl.trim();
      raw = [
        {
          id: 'custom_1',
          title: title || 'Media Asset',
          asset_type: customType || 'IMAGE',
          file_url: cleanCustom,
          file: cleanCustom,
        },
      ];
    }

    // Filter out items that do not have any valid URL
    return raw.filter((item) => {
      const u = (item.file_url || item.file || item.external_url || (item as any).url || '').trim();
      return u.length > 0;
    });
  }, [assets, asset, customUrl, customType, title]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    if (!visible) return;

    if (asset) {
      const targetAssetUrl = (asset.file_url || asset.file || asset.external_url || (asset as any).url || '').trim();
      const idx = mediaList.findIndex(
        (m) =>
          (m.id && m.id === asset.id) ||
          (targetAssetUrl && (m.file_url || m.file || m.external_url || (m as any).url || '').trim() === targetAssetUrl)
      );
      if (idx !== -1) {
        setActiveIndex(idx);
        return;
      }
    }

    if (customUrl && customUrl.trim().length > 0) {
      const cleanCustom = customUrl.trim();
      const idx = mediaList.findIndex(
        (m) => (m.file_url || m.file || m.external_url || (m as any).url || '').trim() === cleanCustom
      );
      if (idx !== -1) {
        setActiveIndex(idx);
        return;
      }
    }

    if (initialIndex >= 0 && initialIndex < mediaList.length) {
      setActiveIndex(initialIndex);
    } else {
      setActiveIndex(0);
    }
  }, [visible, asset, customUrl, initialIndex, mediaList]);

  if (!visible || mediaList.length === 0) return null;

  const currentMedia = mediaList[activeIndex] || mediaList[0];
  const url = (currentMedia?.file_url || currentMedia?.file || currentMedia?.external_url || (currentMedia as any)?.url || '').trim();
  const type = currentMedia?.asset_type || (currentMedia as any)?.type || 'IMAGE';
  const displayTitle = currentMedia?.title || title;

  const hasMultiple = mediaList.length > 1;

  const [isSharingImage, setIsSharingImage] = useState(false);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : mediaList.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < mediaList.length - 1 ? prev + 1 : 0));
  };

  const handleShareToWhatsApp = async () => {
    if (!url || url.trim().length === 0) return;
    setIsSharingImage(true);
    try {
      const isPhoto = type === 'IMAGE' || !type || (!url.toLowerCase().endsWith('.pdf') && type !== 'VIDEO' && type !== 'THREE_D');
      if (isPhoto) {
        // Share the actual image file directly to WhatsApp/contacts
        const shared = await shareImageFileDirectly(url.trim(), displayTitle || 'Share Image');
        if (!shared) {
          Alert.alert('Notice', 'Unable to prepare photo file for sharing.');
        }
      } else {
        await shareMediaAssetToWhatsApp(url.trim(), displayTitle, productName, type);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to share image.');
    } finally {
      setIsSharingImage(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header Bar */}
          <View style={styles.header}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text numberOfLines={1} style={styles.headerTitle}>
                {displayTitle}
              </Text>
              {hasMultiple && (
                <Text style={styles.counterText}>
                  Media Asset {activeIndex + 1} of {mediaList.length}
                </Text>
              )}
            </View>

            {/* Direct WhatsApp Share button in expanded modal */}
            {url && url.trim().length > 0 && (
              <TouchableOpacity
                style={styles.whatsAppShareBtn}
                onPress={handleShareToWhatsApp}
                disabled={isSharingImage}
                activeOpacity={0.8}
                accessibilityLabel="Share image directly to WhatsApp"
              >
                {isSharingImage ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <WhatsAppIcon size={18} color="#FFFFFF" />
                )}
                <Text style={styles.whatsAppShareBtnText}>
                  {isSharingImage ? 'Sharing...' : 'Share Image'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Quick Share All Photos to WhatsApp */}
            {hasMultiple && onShareAllWhatsApp && (
              <TouchableOpacity
                style={styles.whatsAppShareAllBtn}
                onPress={onShareAllWhatsApp}
                activeOpacity={0.8}
                accessibilityLabel="Share all product photos to WhatsApp"
              >
                <WhatsAppIcon size={16} color="#FFFFFF" />
                <Text style={styles.whatsAppShareBtnText}>Share All</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Main Content Area */}
          <View style={styles.content}>
            {type === 'THREE_D' && url ? (
              <ThreeDViewer modelUrl={url} title={displayTitle} style={{ flex: 1, height: '100%' }} />
            ) : type === 'VIDEO' && url ? (
              <VideoPlayerView url={url} autoPlay={true} />
            ) : (type === 'PDF_BROCHURE' || type === 'TECH_SHEET' || url.toLowerCase().endsWith('.pdf')) && url ? (
              <PdfDocumentViewer pdfUrl={url} title={displayTitle} allowExpand={false} />
            ) : url && url.trim().length > 0 ? (
              <View style={styles.imageBox}>
                <Image source={{ uri: url.trim() }} style={styles.fullImage} resizeMode="contain" />
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <ImageIcon size={48} color={colors.textMuted} strokeWidth={1.5} />
                <Text style={styles.imagePlaceholderText}>Image preview not available</Text>
              </View>
            )}

            {/* Slide Navigation Overlay Buttons (Left & Right) */}
            {hasMultiple && (
              <>
                <AnimatedPressable style={[styles.navArrow, styles.navArrowLeft]} onPress={handlePrev}>
                  <ChevronLeft size={24} color="#FFFFFF" />
                </AnimatedPressable>

                <AnimatedPressable style={[styles.navArrow, styles.navArrowRight]} onPress={handleNext}>
                  <ChevronRight size={24} color="#FFFFFF" />
                </AnimatedPressable>
              </>
            )}
          </View>

          {/* Bottom Thumbnail Strip for Multi-Media */}
          {hasMultiple && (
            <View style={styles.bottomBar}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbScroll}>
                {mediaList.map((m, idx) => {
                  const isActive = idx === activeIndex;
                  const itemType = m.asset_type || (m as any).type || 'IMAGE';
                  const thumbUrl = (m.file_url || m.file || m.external_url || (m as any).url || '').trim();

                  return (
                    <TouchableOpacity
                      key={m.id || idx}
                      activeOpacity={0.8}
                      onPress={() => setActiveIndex(idx)}
                      style={[styles.thumbItem, isActive && styles.thumbItemActive]}
                    >
                      {itemType === 'IMAGE' && thumbUrl && thumbUrl.length > 0 ? (
                        <Image source={{ uri: thumbUrl }} style={styles.thumbImg} resizeMode="cover" />
                      ) : itemType === 'THREE_D' ? (
                        <Box size={20} color={isActive ? colors.amberGold : '#FFFFFF'} />
                      ) : itemType === 'VIDEO' ? (
                        <Video size={20} color={isActive ? colors.accentBlue : '#FFFFFF'} />
                      ) : itemType === 'PDF_BROCHURE' || itemType === 'TECH_SHEET' ? (
                        <FileText size={20} color={isActive ? colors.amberGold : '#FFFFFF'} />
                      ) : (
                        <ImageIcon size={20} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 19, 41, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '94%',
    height: 640,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...shadows.modal,
  },
  header: {
    height: 58,
    backgroundColor: colors.primaryNavy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  counterText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.amberGold,
    marginTop: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#0B1329',
    position: 'relative',
  },
  imageBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  navArrow: {
    position: 'absolute',
    top: '44%',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    ...shadows.card,
  },
  navArrowLeft: {
    left: 12,
  },
  navArrowRight: {
    right: 12,
  },
  bottomBar: {
    backgroundColor: colors.primaryNavy,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  thumbScroll: {
    paddingHorizontal: 16,
    gap: 10,
    alignItems: 'center',
  },
  thumbItem: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbItemActive: {
    borderColor: colors.accentBlue,
    backgroundColor: 'rgba(13, 96, 174, 0.3)',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  whatsAppShareBtn: {
    backgroundColor: colors.whatsAppGreen,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.md,
    marginRight: 8,
  },
  whatsAppShareAllBtn: {
    backgroundColor: 'rgba(37, 211, 102, 0.2)',
    borderWidth: 1,
    borderColor: colors.whatsAppGreen,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radii.md,
    marginRight: 8,
  },
  whatsAppShareBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imagePlaceholderText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});

