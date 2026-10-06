import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Platform, Linking, ActivityIndicator, Modal } from 'react-native';
import { colors, radii, shadows } from '../../theme';
import { FileText, ExternalLink, RefreshCw, Maximize2, Minimize2, X } from 'lucide-react-native';
import { Button } from '../Common/Button';
import { AnimatedPressable } from '../Common/AnimatedPressable';

let NativeWebView: any = null;
if (Platform.OS !== 'web') {
  try {
    NativeWebView = require('react-native-webview').WebView;
  } catch (e) {
    console.warn('WebView unavailable for PDF');
  }
}

interface PdfDocumentViewerProps {
  pdfUrl: string;
  title?: string;
  subtitle?: string;
  allowExpand?: boolean;
}

export const PdfDocumentViewer: React.FC<PdfDocumentViewerProps> = ({
  pdfUrl,
  title = 'Technical Document & Datasheet',
  subtitle,
  allowExpand = true,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [viewerKey, setViewerKey] = useState(0);
  const [isModalExpanded, setIsModalExpanded] = useState(false);

  const handleOpenExternal = () => {
    if (pdfUrl) {
      Linking.openURL(pdfUrl).catch(() => {});
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    setLoadError(false);
    setViewerKey((k) => k + 1);
  };

  // PDF.js HTML renderer for offline / native viewing
  const pdfJsHtml = useMemo(() => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #0B1329;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px 0;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #container {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 900px;
      padding: 0 12px;
    }
    .page-card {
      margin-bottom: 20px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.5);
      border-radius: 6px;
      overflow: hidden;
      background: #FFFFFF;
      width: 100%;
      display: flex;
      justify-content: center;
    }
    canvas {
      display: block;
      width: 100%;
      height: auto;
    }
    #status {
      color: #38BDF8;
      font-size: 14px;
      font-weight: 600;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div id="status">Loading Engineering PDF Document...</div>
  <div id="container"></div>

  <script>
    const url = '${pdfUrl}';
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      
      pdfjsLib.getDocument(url).promise.then(pdf => {
        document.getElementById('status').style.display = 'none';
        const container = document.getElementById('container');
        
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          pdf.getPage(pageNum).then(page => {
            const viewport = page.getViewport({ scale: 1.5 });
            const card = document.createElement('div');
            card.className = 'page-card';
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            card.appendChild(canvas);
            container.appendChild(card);
            
            page.render({ canvasContext: context, viewport: viewport });
          });
        }
      }).catch(err => {
        document.getElementById('status').innerText = 'Standard viewer loading...';
      });
    }
  </script>
</body>
</html>`;
  }, [pdfUrl, viewerKey]);

  const renderViewerBody = () => (
    <View style={styles.viewerBox}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.accentBlue} />
          <Text style={styles.loadingText}>Rendering Technical PDF...</Text>
        </View>
      )}

      {Platform.OS === 'web' ? (
        <iframe
          key={viewerKey}
          src={pdfUrl}
          style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#FFFFFF' } as any}
          title={title}
          onLoad={() => setIsLoading(false)}
        />
      ) : NativeWebView ? (
        <NativeWebView
          key={viewerKey}
          originWhitelist={['*']}
          source={
            Platform.OS === 'ios'
              ? { uri: pdfUrl }
              : { html: pdfJsHtml, baseUrl: 'https://cdnjs.cloudflare.com' }
          }
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scalesPageToFit={true}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setLoadError(true);
          }}
        />
      ) : (
        <View style={styles.fallbackBox}>
          <FileText size={48} color={colors.accentBlue} />
          <Text style={styles.fallbackTitle}>{title}</Text>
          <Text style={styles.fallbackText}>Technical PDF Document Ready for Review.</Text>
          <Button
            title="Open Data Sheet"
            onPress={handleOpenExternal}
            variant="primary"
            icon={<ExternalLink size={16} color="#FFFFFF" />}
          />
        </View>
      )}

      {loadError && (
        <View style={styles.fallbackBox}>
          <FileText size={44} color={colors.accentBlue} />
          <Text style={styles.fallbackTitle}>Online Viewer Note</Text>
          <Text style={styles.fallbackText}>The document can be opened directly on your device viewer.</Text>
          <Button
            title="Open Data Sheet"
            onPress={handleOpenExternal}
            variant="primary"
            icon={<ExternalLink size={16} color="#FFFFFF" />}
          />
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Document Control Header */}
      <View style={styles.topBar}>
        <View style={styles.titleBox}>
          <FileText size={20} color={colors.accentBlue} />
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={styles.docTitle}>{title}</Text>
            {subtitle ? <Text numberOfLines={1} style={styles.docSub}>{subtitle}</Text> : null}
          </View>
        </View>

        <View style={styles.actionsRow}>
          <AnimatedPressable style={styles.iconBtn} onPress={handleReload}>
            <RefreshCw size={16} color={colors.primaryNavy} />
          </AnimatedPressable>

          {allowExpand && (
            <AnimatedPressable
              style={[styles.iconBtn, styles.expandBtn]}
              onPress={() => setIsModalExpanded(true)}
            >
              <Maximize2 size={16} color="#FFFFFF" />
            </AnimatedPressable>
          )}

          <Button
            title="Open Data Sheet"
            onPress={handleOpenExternal}
            variant="secondary"
            size="sm"
            icon={<ExternalLink size={14} color="#FFFFFF" />}
          />
        </View>
      </View>

      {/* Main View Canvas */}
      {renderViewerBody()}

      {/* Fullscreen Expanded PDF Modal */}
      <Modal visible={isModalExpanded} transparent={false} animationType="slide" onRequestClose={() => setIsModalExpanded(false)}>
        <View style={styles.modalFullscreenContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <FileText size={22} color={colors.amberGold} />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={styles.modalHeaderTitle}>{title}</Text>
                {subtitle ? <Text numberOfLines={1} style={styles.modalHeaderSub}>{subtitle}</Text> : null}
              </View>
            </View>

            <View style={styles.actionsRow}>
              <AnimatedPressable style={styles.modalIconBtn} onPress={handleReload}>
                <RefreshCw size={16} color="#FFFFFF" />
              </AnimatedPressable>
              <AnimatedPressable style={styles.modalIconBtn} onPress={handleOpenExternal}>
                <ExternalLink size={16} color="#FFFFFF" />
              </AnimatedPressable>
              <AnimatedPressable style={styles.modalCloseBtn} onPress={() => setIsModalExpanded(false)}>
                <X size={20} color="#FFFFFF" />
              </AnimatedPressable>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            {renderViewerBody()}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#F8FAFC',
    gap: 10,
  },
  titleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  docSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandBtn: {
    backgroundColor: colors.accentBlue,
    borderColor: colors.accentBlue,
  },
  viewerBox: {
    flex: 1,
    backgroundColor: '#0B1329',
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(11, 19, 41, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    zIndex: 10,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fallbackBox: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
    zIndex: 5,
  },
  fallbackTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryNavy,
    textAlign: 'center',
  },
  fallbackText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  modalFullscreenContainer: {
    flex: 1,
    backgroundColor: '#0B1329',
  },
  modalHeader: {
    height: 56,
    backgroundColor: colors.primaryNavy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modalHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalHeaderSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  modalIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

