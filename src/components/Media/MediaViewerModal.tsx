import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { MediaAsset } from '../../types/product';
import { colors, radii, shadows } from '../../theme';
import { X, Box, Video, FileText, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react-native';
import { ThreeDViewer } from './ThreeDViewer';
import { VideoPlayerView } from './VideoPlayerView';
import { PdfDocumentViewer } from './PdfDocumentViewer';
import { AnimatedPressable } from '../Common/AnimatedPressable';

interface MediaViewerModalProps {
  visible: boolean;
  asset?: MediaAsset | null;
  assets?: MediaAsset[];
  initialIndex?: number;
  customUrl?: string | null;
  customType?: 'IMAGE' | 'VIDEO' | 'PDF_BROCHURE' | 'TECH_SHEET' | 'THREE_D';
  title?: string;
  onClose: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  visible,
  asset,
  assets = [],
  initialIndex = 0,
  customUrl,
  customType,
  title = 'Media Preview',
  onClose,
}) => {
  // Combine provided single asset or custom URL into asset list if assets array is empty
  const mediaList: MediaAsset[] = React.useMemo(() => {
    if (assets && assets.length > 0) return assets;
    if (asset) return [asset];
    if (customUrl) {
      return [
        {
          id: 'custom_1',
          title: title || 'Media Asset',
          asset_type: customType || 'IMAGE',
          file_url: customUrl,
        },
      ];
    }
    return [];
  }, [assets, asset, customUrl, customType, title]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    if (initialIndex >= 0 && initialIndex < mediaList.length) {
      setActiveIndex(initialIndex);
    } else {
      setActiveIndex(0);
    }
  }, [initialIndex, mediaList]);

  if (!visible || mediaList.length === 0) return null;

  const currentMedia = mediaList[activeIndex] || mediaList[0];
  const url = currentMedia.file_url || currentMedia.file || currentMedia.external_url || '';
  const type = currentMedia.asset_type || 'IMAGE';
  const displayTitle = currentMedia.title || title;

  const hasMultiple = mediaList.length > 1;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : mediaList.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < mediaList.length - 1 ? prev + 1 : 0));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header Bar */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={styles.headerTitle}>
                {displayTitle}
              </Text>
              {hasMultiple && (
                <Text style={styles.counterText}>
                  Media Asset {activeIndex + 1} of {mediaList.length}
                </Text>
              )}
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Main Content Area */}
          <View style={styles.content}>
            {type === 'THREE_D' ? (
              <ThreeDViewer modelUrl={url} title={displayTitle} style={{ flex: 1, height: '100%' }} />
            ) : type === 'VIDEO' ? (
              <VideoPlayerView url={url} autoPlay={true} />
            ) : type === 'PDF_BROCHURE' || type === 'TECH_SHEET' || url.toLowerCase().endsWith('.pdf') ? (
              <PdfDocumentViewer pdfUrl={url} title={displayTitle} allowExpand={false} />
            ) : (
              <View style={styles.imageBox}>
                <Image source={{ uri: url }} style={styles.fullImage} resizeMode="contain" />
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
                  const itemType = m.asset_type || 'IMAGE';
                  const thumbUrl = m.file_url || m.file || '';

                  return (
                    <TouchableOpacity
                      key={m.id || idx}
                      activeOpacity={0.8}
                      onPress={() => setActiveIndex(idx)}
                      style={[styles.thumbItem, isActive && styles.thumbItemActive]}
                    >
                      {itemType === 'IMAGE' && thumbUrl ? (
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
});

