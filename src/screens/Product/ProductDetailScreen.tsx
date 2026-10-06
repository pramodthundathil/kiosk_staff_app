import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/Header/AppHeader';
import { ProductGallery } from '../../components/Product/ProductGallery';
import { VariantSelector } from '../../components/Product/VariantSelector';
import { SpecificationTable } from '../../components/Product/SpecificationTable';
import { FeatureList } from '../../components/Product/FeatureList';
import { ApplicableAreasList } from '../../components/Product/ApplicableAreasList';
import { TestingCard } from '../../components/Product/TestingCard';
import { CertificateCard } from '../../components/Product/CertificateCard';
import { RelatedProducts } from '../../components/Product/RelatedProducts';
import { ThreeDViewer } from '../../components/Media/ThreeDViewer';
import { VideoPlayerView } from '../../components/Media/VideoPlayerView';
import { PdfDocumentViewer } from '../../components/Media/PdfDocumentViewer';
import { MediaViewerModal } from '../../components/Media/MediaViewerModal';
import { WhatsAppShareModal } from '../../components/Sharing/WhatsAppShareModal';
import { Button } from '../../components/Common/Button';
import { Badge } from '../../components/Common/Badge';
import { LoadingSkeleton } from '../../components/Common/LoadingSkeleton';
import { fetchProductDetail, fetchProducts } from '../../api/products';
import { Product, ProductVariant, MediaAsset } from '../../types/product';
import { useResponsiveLayout } from '../../utils/responsive';
import { colors, radii, shadows } from '../../theme';
import { addRecentlyViewedProduct } from '../../utils/storage';
import {
  Send,
  Box,
  Video,
  FileText,
  Star,
  Sliders,
  Building2,
  FlaskConical,
  Award,
} from 'lucide-react-native';

export const ProductDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const layout = useResponsiveLayout();

  const productId: string = route.params?.productId;
  const initialProduct: Product | undefined = route.params?.product;

  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(!initialProduct);
  const [refreshing, setRefreshing] = useState(false);

  // Active detail tab state
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Modals
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [activeMediaAsset, setActiveMediaAsset] = useState<MediaAsset | null>(null);
  const [customMediaUrl, setCustomMediaUrl] = useState<string | null>(null);
  const [customMediaType, setCustomMediaType] = useState<any>(null);
  const [modalInitialIndex, setModalInitialIndex] = useState<number>(0);

  const loadDetail = async () => {
    if (!productId) return;
    setIsLoading(true);
    try {
      const data = await fetchProductDetail(productId);
      setProduct(data);
      addRecentlyViewedProduct(data).catch(() => {});

      // Fetch related products in category
      if (data.category_id || data.category?.id) {
        const catId = data.category_id || data.category?.id;
        const related = await fetchProducts({ category_id: catId });
        setRelatedProducts(related.filter((p) => p.id !== data.id).slice(0, 8));
      }
    } catch (err) {
      console.warn('Failed to load product detail:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [productId]);

  if (!product && isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader showBack={true} onBack={() => navigation.goBack()} />
        <View style={{ padding: 20 }}>
          <LoadingSkeleton height={280} borderRadius={radii.lg} style={{ marginBottom: 16 }} />
          <LoadingSkeleton height={40} borderRadius={radii.md} style={{ marginBottom: 12 }} />
          <LoadingSkeleton height={120} borderRadius={radii.md} />
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <AppHeader showBack={true} onBack={() => navigation.goBack()} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Product Not Found</Text>
          <Button title="Go Back to Catalogue" onPress={() => navigation.goBack()} variant="primary" />
        </View>
      </View>
    );
  }

  // Active displaying item (selected variant or main product)
  const currentItem = selectedVariant || product;
  const mainImage = currentItem.image_url || product.image_url || '';
  const allMedia = [...(product.media_assets || []), ...(selectedVariant?.media_assets || [])];

  // Visual gallery media only (excludes document PDFs so datasheets don't hijack photo/3D gallery)
  const visualMedia = allMedia.filter(
    (a) =>
      a.asset_type !== 'PDF_BROCHURE' &&
      a.asset_type !== 'TECH_SHEET' &&
      !(a.file_url && a.file_url.toLowerCase().endsWith('.pdf'))
  );

  const threeDAsset = allMedia.find((a) => a.asset_type === 'THREE_D');
  const videoAsset = allMedia.find((a) => a.asset_type === 'VIDEO');
  const pdfAsset = allMedia.find(
    (a) =>
      a.asset_type === 'PDF_BROCHURE' ||
      a.asset_type === 'TECH_SHEET' ||
      (a.file_url && a.file_url.toLowerCase().endsWith('.pdf'))
  );

  // Check section data existence for dynamic tabs
  const checkHasData = (val: any) => {
    if (!val) return false;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'string') return val.trim().length > 0;
    if (typeof val === 'object') return Object.keys(val).length > 0;
    return false;
  };

  const hasOverview = Boolean(currentItem.description || product.description);
  const hasFeatures = checkHasData(currentItem.features) || checkHasData(product.features);
  const hasSpecs = checkHasData(currentItem.specifications) || checkHasData(product.specifications);
  const hasApplications = checkHasData(currentItem.applicable_areas) || checkHasData(product.applicable_areas);
  const hasTesting = checkHasData(currentItem.in_house_tests) || checkHasData(product.in_house_tests);
  const hasCertificates = checkHasData(currentItem.certifications) || checkHasData(product.certifications);
  const has3D = Boolean(threeDAsset);
  const hasVideo = Boolean(videoAsset);
  const hasPdf = Boolean(pdfAsset);

  // Available tab keys
  const availableTabs: { key: string; label: string; icon: any }[] = [];
  if (hasOverview) availableTabs.push({ key: 'overview', label: 'Overview', icon: FileText });
  if (hasFeatures) availableTabs.push({ key: 'features', label: 'Features', icon: Star });
  if (hasSpecs) availableTabs.push({ key: 'specs', label: 'Specifications', icon: Sliders });
  if (hasApplications) availableTabs.push({ key: 'applications', label: 'Applications', icon: Building2 });
  if (hasTesting) availableTabs.push({ key: 'testing', label: 'Testing', icon: FlaskConical });
  if (hasCertificates) availableTabs.push({ key: 'certificates', label: 'Certificates', icon: Award });
  if (hasPdf) availableTabs.push({ key: 'pdf', label: 'Data sheet', icon: FileText });
  if (has3D) availableTabs.push({ key: '3d', label: '3D View', icon: Box });
  if (hasVideo) availableTabs.push({ key: 'video', label: 'Video', icon: Video });

  const openDoc = (url: string, title: string) => {
    setCustomMediaUrl(url);
    setCustomMediaType('PDF_BROCHURE');
    setActiveMediaAsset({ id: 'pdf', title, asset_type: 'PDF_BROCHURE', file_url: url });
    setModalInitialIndex(0);
    setMediaModalVisible(true);
  };

  const openFullscreenMedia = (item: any, explicitType?: 'IMAGE' | 'THREE_D' | 'VIDEO') => {
    let targetUrl = '';
    let targetType: 'IMAGE' | 'THREE_D' | 'VIDEO' = explicitType || 'IMAGE';
    let targetAsset: MediaAsset | null = null;

    if (typeof item === 'string') {
      targetUrl = item;
      const found = visualMedia.find((m) => (m.file_url || m.file) === item);
      if (found) {
        targetAsset = found;
        targetType = (found.asset_type as any) || targetType;
      }
    } else if (item) {
      targetAsset = item.asset || item;
      targetUrl = targetAsset?.file_url || targetAsset?.file || item.url || '';
      targetType = (targetAsset?.asset_type as any) || item.type || explicitType || 'IMAGE';
    }

    let idx = visualMedia.findIndex(
      (m) =>
        (targetUrl && (m.file_url || m.file) === targetUrl) ||
        (targetAsset && targetAsset.id && m.id === targetAsset.id)
    );
    if (idx === -1) idx = 0;

    setModalInitialIndex(idx);
    setCustomMediaUrl(targetUrl);
    setCustomMediaType(targetType);
    setActiveMediaAsset(
      targetAsset || { id: 'active_visual', title: product.name, asset_type: targetType, file_url: targetUrl }
    );
    setMediaModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={product.sku || 'Product Detail'}
        showBack={true}
        onBack={() => navigation.goBack()}
        showSearch={true}
        onSearchPress={() => navigation.navigate('Search')}
      />

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDetail(); }} />
        }
      >
        {/* Tablet Landscape 2-Column Mode or Standard Stacked Mode */}
        {layout.isTablet && layout.isLandscape ? (
          /* Landscape 2-Column Layout */
          <View style={styles.landscapeTopRow}>
            {/* Left Column: Media Gallery & Quick Actions */}
            <View style={styles.leftCol}>
              <ProductGallery
                mainImageUrl={mainImage}
                mediaAssets={allMedia}
                productName={product.name}
                onOpenFullscreen={openFullscreenMedia}
                height={320}
              />

              {/* Share & Demo Action Bar */}
              <View style={styles.demoActionsBox}>
                <Button
                  title="Share with Customer via WhatsApp"
                  onPress={() => setShareModalVisible(true)}
                  variant="whatsApp"
                  size="lg"
                  icon={<Send size={20} color="#FFFFFF" />}
                  style={{ width: '100%' }}
                />
              </View>
            </View>

            {/* Right Column: Product Header & Summary */}
            <View style={styles.rightCol}>
              <Text style={styles.skuText}>{currentItem.sku || product.sku}</Text>
              <Text style={styles.titleText}>{product.name}</Text>

              {product.category?.name && (
                <Text style={styles.categoryBreadcrumb}>
                  {product.category.name} {product.sub_category?.name ? `→ ${product.sub_category.name}` : ''}
                </Text>
              )}

              {/* Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <VariantSelector
                  variants={product.variants}
                  selectedVariantId={selectedVariant?.id || null}
                  onSelectVariant={setSelectedVariant}
                  mainProductName={product.name}
                />
              )}

              {/* Key Highlights */}
              <View style={styles.highlightBadgeRow}>
                {has3D && <Badge label="Interactive 3D" variant="amber" icon={<Box size={12} color="#D97706" />} />}
                {hasPdf && <Badge label="Data Sheet Available" variant="accent" icon={<FileText size={12} color="#0D60AE" />} />}
                {hasVideo && <Badge label="Video Demo" variant="navy" icon={<Video size={12} color="#FFFFFF" />} />}
                {hasTesting && <Badge label="Quality Tested" variant="success" />}
              </View>

              {/* Short Overview */}
              {(currentItem.description || product.description) ? (
                <Text style={styles.shortDesc}>
                  {currentItem.description || product.description}
                </Text>
              ) : null}
            </View>
          </View>
        ) : (
          /* Portrait Stacked Layout */
          <View style={styles.portraitSection}>
            <ProductGallery
              mainImageUrl={mainImage}
              mediaAssets={allMedia}
              productName={product.name}
              onOpenFullscreen={openFullscreenMedia}
              height={layout.isTablet ? 340 : 260}
            />

            <View style={styles.summaryCard}>
              <Text style={styles.skuText}>{currentItem.sku || product.sku}</Text>
              <Text style={styles.titleText}>{product.name}</Text>

              {product.category?.name && (
                <Text style={styles.categoryBreadcrumb}>
                  {product.category.name} {product.sub_category?.name ? `→ ${product.sub_category.name}` : ''}
                </Text>
              )}

              {/* Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <VariantSelector
                  variants={product.variants}
                  selectedVariantId={selectedVariant?.id || null}
                  onSelectVariant={setSelectedVariant}
                  mainProductName={product.name}
                />
              )}

              <Button
                title="Share with Customer via WhatsApp"
                onPress={() => setShareModalVisible(true)}
                variant="whatsApp"
                size="lg"
                icon={<Send size={20} color="#FFFFFF" />}
                style={styles.shareBtnPortrait}
              />
            </View>
          </View>
        )}

        {/* Dynamic Detail Navigation Tabs */}
        {availableTabs.length > 0 && (
          <View style={styles.tabsSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
              {availableTabs.map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.key;
                return (
                  <TouchableOpacity
                    key={t.key}
                    style={[styles.tabBtn, isActive && styles.activeTabBtn]}
                    onPress={() => setActiveTab(t.key)}
                  >
                    <Icon size={16} color={isActive ? '#FFFFFF' : colors.primaryNavy} />
                    <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>{t.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Tab Dynamic Content Container */}
            <View style={styles.tabContentContainer}>
              {activeTab === 'overview' && (
                <View style={styles.detailCard}>
                  <Text style={styles.detailHeading}>Product Overview</Text>
                  <Text style={styles.detailBody}>{currentItem.description || product.description}</Text>
                </View>
              )}

              {activeTab === 'features' && (
                <FeatureList features={currentItem.features || product.features} />
              )}

              {activeTab === 'specs' && (
                <SpecificationTable specifications={currentItem.specifications || product.specifications} />
              )}

              {activeTab === 'applications' && (
                <ApplicableAreasList areas={currentItem.applicable_areas || product.applicable_areas} />
              )}

              {activeTab === 'testing' && (
                <TestingCard tests={currentItem.in_house_tests || product.in_house_tests} onOpenDocument={openDoc} />
              )}

              {activeTab === 'certificates' && (
                <CertificateCard certificates={currentItem.certifications || product.certifications} onOpenDocument={openDoc} />
              )}

              {activeTab === 'pdf' && pdfAsset && (
                <PdfDocumentViewer
                  pdfUrl={pdfAsset.file_url || pdfAsset.file || ''}
                  title={pdfAsset.title || 'Official Product Datasheet'}
                  subtitle={product.name}
                />
              )}

              {activeTab === '3d' && threeDAsset && (
                <View style={styles.mediaTabBox}>
                  <ThreeDViewer
                    modelUrl={threeDAsset.file_url || threeDAsset.file || ''}
                    title={product.name}
                    style={{ height: 360 }}
                  />
                </View>
              )}

              {activeTab === 'video' && videoAsset && (
                <View style={styles.mediaTabBox}>
                  <VideoPlayerView url={videoAsset.file_url || videoAsset.file || ''} autoPlay={true} />
                </View>
              )}
            </View>
          </View>
        )}

        {/* Related Catalogue Products */}
        <RelatedProducts
          products={relatedProducts}
          onSelectProduct={(p) => navigation.push('ProductDetail', { productId: p.id, product: p })}
        />
      </ScrollView>

      {/* WhatsApp Sharing Modal */}
      <WhatsAppShareModal
        visible={shareModalVisible}
        product={product}
        selectedVariant={selectedVariant}
        onClose={() => setShareModalVisible(false)}
      />

      {/* Media Inspection Modal */}
      <MediaViewerModal
        visible={mediaModalVisible}
        asset={activeMediaAsset}
        assets={
          customMediaType === 'PDF_BROCHURE' || customMediaType === 'TECH_SHEET'
            ? activeMediaAsset ? [activeMediaAsset] : []
            : visualMedia
        }
        initialIndex={modalInitialIndex}
        customUrl={customMediaUrl}
        customType={customMediaType}
        onClose={() => setMediaModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 50,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  landscapeTopRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  leftCol: {
    width: '45%',
    gap: 12,
  },
  rightCol: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  demoActionsBox: {
    marginTop: 8,
  },
  portraitSection: {
    marginBottom: 16,
    gap: 14,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  skuText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.accentBlue,
    letterSpacing: 0.8,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryNavy,
    marginTop: 4,
    lineHeight: 28,
  },
  categoryBreadcrumb: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 10,
  },
  highlightBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 10,
  },
  shortDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginTop: 8,
  },
  shareBtnPortrait: {
    marginTop: 14,
  },
  tabsSection: {
    marginVertical: 14,
  },
  tabsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
    ...shadows.subtle,
  },
  activeTabBtn: {
    backgroundColor: colors.primaryNavy,
    borderColor: colors.primaryNavy,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  activeTabLabel: {
    color: '#FFFFFF',
  },
  tabContentContainer: {
    marginTop: 12,
  },
  detailCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  detailHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryNavy,
    marginBottom: 8,
  },
  detailBody: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  mediaTabBox: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginTop: 4,
  },
});
