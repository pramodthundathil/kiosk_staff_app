import React, { useState } from 'react';
import { View, Image, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { MediaAsset } from '../../types/product';
import { colors, radii, shadows } from '../../theme';
import { Maximize2, Image as ImageIcon } from 'lucide-react-native';
import { AnimatedPressable } from '../Common/AnimatedPressable';

interface ProductGalleryProps {
  mainImageUrl?: string;
  mediaAssets?: MediaAsset[];
  onOpenFullscreen?: (url: string) => void;
  height?: number;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  mainImageUrl,
  mediaAssets = [],
  onOpenFullscreen,
  height = 280,
}) => {
  const imagesOnly = mediaAssets.filter((a) => a.asset_type === 'IMAGE' && (a.file_url || a.file));
  const imageList = imagesOnly.map((a) => a.file_url || a.file || '').filter(Boolean);
  
  if (mainImageUrl && !imageList.includes(mainImageUrl)) {
    imageList.unshift(mainImageUrl);
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const currentImage = imageList[activeIndex] || mainImageUrl || '';

  return (
    <View style={styles.container}>
      {/* Main Image Display */}
      <View style={[styles.mainImageWrapper, { height }]}>
        {currentImage ? (
          <Image
            source={{ uri: currentImage }}
            style={styles.mainImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholder}>
            <ImageIcon size={48} color={colors.textMuted} strokeWidth={1.5} />
            <Text style={styles.placeholderText}>No Image Available</Text>
          </View>
        )}

        {/* Image Pagination Badge */}
        {imageList.length > 1 && (
          <View style={styles.paginationBadge}>
            <Text style={styles.paginationText}>
              {activeIndex + 1} / {imageList.length}
            </Text>
          </View>
        )}

        {/* Fullscreen Button */}
        {currentImage && onOpenFullscreen && (
          <AnimatedPressable
            style={styles.fullscreenBtn}
            onPress={() => onOpenFullscreen(currentImage)}
          >
            <Maximize2 size={16} color="#FFFFFF" />
          </AnimatedPressable>
        )}
      </View>

      {/* Thumbnails Row */}
      {imageList.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailContainer}
        >
          {imageList.map((url, index) => {
            const isActive = index === activeIndex;
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() => setActiveIndex(index)}
                style={[styles.thumbnailWrapper, isActive && styles.activeThumbnail]}
              >
                <Image source={{ uri: url }} style={styles.thumbnailImage} resizeMode="contain" />
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
});
