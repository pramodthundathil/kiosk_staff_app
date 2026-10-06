import React, { useState, useMemo } from 'react';
import { View, Image, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { MediaAsset } from '../../types/product';
import { colors, radii, shadows } from '../../theme';
import { Maximize2, Image as ImageIcon, Box, Video } from 'lucide-react-native';
import { AnimatedPressable } from '../Common/AnimatedPressable';
import { ThreeDViewer } from '../Media/ThreeDViewer';
import { VideoPlayerView } from '../Media/VideoPlayerView';

export interface GalleryItem {
  id: string;
  type: 'IMAGE' | 'THREE_D' | 'VIDEO';
  url: string;
  title: string;
  asset?: MediaAsset;
}

interface ProductGalleryProps {
  mainImageUrl?: string;
  mediaAssets?: MediaAsset[];
  productName?: string;
  onOpenFullscreen?: (item: GalleryItem | string, type?: 'IMAGE' | 'THREE_D' | 'VIDEO') => void;
  height?: number;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  mainImageUrl,
  mediaAssets = [],
  productName,
  onOpenFullscreen,
  height = 280,
}) => {
  // Collect all visual items (photos, 3D models, videos)
  const items: GalleryItem[] = useMemo(() => {
    const list: GalleryItem[] = [];

    // Main image
    if (mainImageUrl) {
      list.push({
        id: 'main_image',
        type: 'IMAGE',
        url: mainImageUrl,
        title: productName ? `${productName} (Main Photo)` : 'Main Photo',
      });
    }

    // Media assets
    mediaAssets.forEach((a, idx) => {
      const fileUrl = a.file_url || a.file || '';
      if (!fileUrl) return;

      if (a.asset_type === 'THREE_D') {
        list.push({
          id: a.id || `3d_${idx}`,
          type: 'THREE_D',
          url: fileUrl,
          title: a.title || `${productName || 'Product'} (Interactive 3D)`,
          asset: a,
        });
      } else if (a.asset_type === 'VIDEO') {
        list.push({
          id: a.id || `video_${idx}`,
          type: 'VIDEO',
          url: fileUrl,
          title: a.title || `${productName || 'Product'} (Video Demo)`,
          asset: a,
        });
      } else if (a.asset_type === 'IMAGE') {
        if (fileUrl !== mainImageUrl) {
          list.push({
            id: a.id || `img_${idx}`,
            type: 'IMAGE',
            url: fileUrl,
            title: a.title || `${productName || 'Product'} (Photo ${idx + 1})`,
            asset: a,
          });
        }
      }
    });

    return list;
  }, [mainImageUrl, mediaAssets, productName]);

  const [activeIndex, setActiveIndex] = useState(0);
  const currentItem = items[activeIndex] || items[0] || null;

  return (
    <View style={styles.container}>
      {/* Main Media Display Card */}
      <View style={[styles.mainImageWrapper, { height }]}>
        {currentItem?.type === 'THREE_D' ? (
          <ThreeDViewer
            modelUrl={currentItem.url}
            title={currentItem.title}
            isFullscreen={false}
            onToggleFullscreen={() => onOpenFullscreen?.(currentItem, 'THREE_D')}
            style={{ width: '100%', height: '100%' }}
          />
        ) : currentItem?.type === 'VIDEO' ? (
          <VideoPlayerView url={currentItem.url} autoPlay={false} />
        ) : currentItem?.type === 'IMAGE' && currentItem.url ? (
          <Image
            source={{ uri: currentItem.url }}
            style={styles.mainImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholder}>
            <ImageIcon size={48} color={colors.textMuted} strokeWidth={1.5} />
            <Text style={styles.placeholderText}>No Image Available</Text>
          </View>
        )}

        {/* Media Type & Pagination Badge */}
        {items.length > 1 && (
          <View style={styles.paginationBadge}>
            <Text style={styles.paginationText}>
              {currentItem?.type === 'THREE_D'
                ? `3D Model (${activeIndex + 1}/${items.length})`
                : currentItem?.type === 'VIDEO'
                ? `Video (${activeIndex + 1}/${items.length})`
                : `${activeIndex + 1} / ${items.length}`}
            </Text>
          </View>
        )}

        {/* Fullscreen Expand Button on top right corner for Images/Videos */}
        {currentItem && currentItem.type !== 'THREE_D' && onOpenFullscreen && (
          <AnimatedPressable
            style={styles.fullscreenBtn}
            onPress={() => onOpenFullscreen(currentItem, currentItem.type)}
          >
            <Maximize2 size={16} color="#FFFFFF" />
          </AnimatedPressable>
        )}
      </View>

      {/* Thumbnails Row */}
      {items.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailContainer}
        >
          {items.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <TouchableOpacity
                key={item.id || index}
                activeOpacity={0.8}
                onPress={() => setActiveIndex(index)}
                style={[styles.thumbnailWrapper, isActive && styles.activeThumbnail]}
              >
                {item.type === 'IMAGE' ? (
                  <Image source={{ uri: item.url }} style={styles.thumbnailImage} resizeMode="contain" />
                ) : item.type === 'THREE_D' ? (
                  <View style={styles.iconThumbBox}>
                    <Box size={22} color={isActive ? colors.amberGold : colors.primaryNavy} />
                    <Text style={[styles.iconThumbText, isActive && styles.activeIconThumbText]}>3D</Text>
                  </View>
                ) : (
                  <View style={styles.iconThumbBox}>
                    <Video size={20} color={isActive ? colors.accentBlue : colors.primaryNavy} />
                    <Text style={[styles.iconThumbText, isActive && styles.activeIconThumbText]}>Video</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  mainImageWrapper: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.subtle,
  },
  mainImage: {
    width: '95%',
    height: '95%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  paginationBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    zIndex: 10,
  },
  paginationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  fullscreenBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryNavy,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...shadows.subtle,
  },
  thumbnailContainer: {
    paddingVertical: 10,
    gap: 10,
  },
  thumbnailWrapper: {
    width: 60,
    height: 60,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    padding: 4,
    overflow: 'hidden',
  },
  activeThumbnail: {
    borderColor: colors.accentBlue,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  iconThumbBox: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: radii.sm,
  },
  iconThumbText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryNavy,
  },
  activeIconThumbText: {
    color: colors.amberGold,
  },
});
