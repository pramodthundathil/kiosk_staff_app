import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ViewStyle,
  Modal,
} from 'react-native';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Box,
  AlertCircle,
  X,
} from 'lucide-react-native';
import { colors, radii, shadows } from '../../theme';
import { AnimatedPressable } from '../Common/AnimatedPressable';

let NativeWebView: any = null;
if (Platform.OS !== 'web') {
  try {
    NativeWebView = require('react-native-webview').WebView;
  } catch (e) {
    console.warn('react-native-webview unavailable');
  }
}

interface ThreeDViewerProps {
  modelUrl: string;
  posterUrl?: string;
  title?: string;
  style?: ViewStyle;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({
  modelUrl,
  posterUrl,
  title = '3D Product Model',
  style,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isModalExpanded, setIsModalExpanded] = useState(false);

  const webViewRef = useRef<any>(null);
  const iframeRef = useRef<any>(null);

  const generateHtml = (url: string, poster?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #0B1329; }
    model-viewer { width: 100%; height: 100%; outline: none; }
  </style>
</head>
<body>
  <model-viewer
    id="viewer"
    src="${url}"
    ${poster ? `poster="${poster}"` : ''}
    camera-controls
    auto-rotate
    rotation-per-second="20deg"
    shadow-intensity="1.5"
    exposure="1.1"
    loading="eager"
  ></model-viewer>

  <script>
    const viewer = document.getElementById('viewer');
    function post(data) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      }
    }
    if (viewer) {
      viewer.addEventListener('load', () => post({ type: 'LOADED' }));
      viewer.addEventListener('error', (err) => post({ type: 'ERROR', detail: '3D model failed to load.' }));
    }
    window.addEventListener('message', (event) => {
      try {
        const cmd = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!viewer) return;
        if (cmd.action === 'toggle-auto-rotate') {
          cmd.value ? viewer.setAttribute('auto-rotate', '') : viewer.removeAttribute('auto-rotate');
        } else if (cmd.action === 'reset-camera') {
          viewer.cameraOrbit = '0deg 75deg 105%';
        } else if (cmd.action === 'zoom-in') {
          viewer.zoom(0.85);
        } else if (cmd.action === 'zoom-out') {
          viewer.zoom(1.18);
        }
      } catch (e) {}
    });
  </script>
</body>
</html>
`;

  const sendCommand = (cmd: object) => {
    const payload = JSON.stringify(cmd);
    if (NativeWebView && webViewRef.current) {
      webViewRef.current.postMessage(payload);
    } else if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(payload, '*');
    }
  };

  const toggleAutoRotate = () => {
    const nextVal = !isAutoRotating;
    setIsAutoRotating(nextVal);
    sendCommand({ action: 'toggle-auto-rotate', value: nextVal });
  };

  const resetCamera = () => sendCommand({ action: 'reset-camera' });
  const zoomIn = () => sendCommand({ action: 'zoom-in' });
  const zoomOut = () => sendCommand({ action: 'zoom-out' });

  const handleExpandToggle = () => {
    if (onToggleFullscreen) {
      onToggleFullscreen();
    } else {
      setIsModalExpanded(!isModalExpanded);
    }
  };

  if (!modelUrl || !modelUrl.trim()) {
    return (
      <View style={[styles.container, style, styles.errorOverlay]}>
        <Box size={40} color={colors.textMuted} strokeWidth={1.5} />
        <Text style={styles.errorTitle}>3D Preview Unavailable</Text>
        <Text style={styles.errorSubText}>No 3D asset URL provided for this product.</Text>
      </View>
    );
  }

  const activeHtml = generateHtml(modelUrl, posterUrl);

  const renderContent = (isModal: boolean = false) => (
    <View style={styles.viewerWrapper}>
      {Platform.OS === 'web' ? (
        <iframe
          ref={iframeRef}
          srcDoc={activeHtml}
          style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#0B1329' } as any}
          title={title}
          onLoad={() => setIsLoading(false)}
        />
      ) : NativeWebView ? (
        <NativeWebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: activeHtml }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={(e: any) => {
            try {
              const data = JSON.parse(e.nativeEvent?.data || e.data);
              if (data.type === 'LOADED') setIsLoading(false);
              if (data.type === 'ERROR') {
                setIsLoading(false);
                setHasError(true);
                setErrorMessage(data.detail || '3D preview unavailable');
              }
            } catch (err) {}
          }}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      ) : (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorSubText}>3D viewer is not supported on this device.</Text>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.accentBlue} />
          <Text style={styles.loadingText}>Rendering 3D Model...</Text>
        </View>
      )}

      {hasError && (
        <View style={styles.errorOverlay}>
          <AlertCircle size={32} color={colors.brandRed} />
          <Text style={styles.errorTitle}>3D Preview Unavailable</Text>
          <Text style={styles.errorSubText}>{errorMessage || 'Could not load 3D model.'}</Text>
        </View>
      )}

      {!hasError && (
        <View style={styles.controlsBar}>
          <AnimatedPressable style={styles.ctrlBtn} onPress={toggleAutoRotate}>
            {isAutoRotating ? <Pause size={16} color="#FFFFFF" /> : <Play size={16} color="#FFFFFF" />}
          </AnimatedPressable>
          <AnimatedPressable style={styles.ctrlBtn} onPress={resetCamera}>
            <RotateCcw size={16} color="#FFFFFF" />
          </AnimatedPressable>
          <AnimatedPressable style={styles.ctrlBtn} onPress={zoomIn}>
            <ZoomIn size={16} color="#FFFFFF" />
          </AnimatedPressable>
          <AnimatedPressable style={styles.ctrlBtn} onPress={zoomOut}>
            <ZoomOut size={16} color="#FFFFFF" />
          </AnimatedPressable>
          <AnimatedPressable style={[styles.ctrlBtn, styles.fullBtn]} onPress={handleExpandToggle}>
            {isModal || isFullscreen ? <Minimize2 size={16} color="#FFFFFF" /> : <Maximize2 size={16} color="#FFFFFF" />}
          </AnimatedPressable>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {renderContent(false)}

      {/* Fullscreen Modal View */}
      <Modal visible={isModalExpanded} transparent={false} animationType="slide" onRequestClose={() => setIsModalExpanded(false)}>
        <View style={styles.modalFullscreenContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <Box size={22} color={colors.amberGold} />
              <Text style={styles.modalHeaderTitle}>{title} (Interactive 3D)</Text>
            </View>
            <AnimatedPressable style={styles.modalCloseBtn} onPress={() => setIsModalExpanded(false)}>
              <X size={20} color="#FFFFFF" />
            </AnimatedPressable>
          </View>

          <View style={{ flex: 1 }}>
            {renderContent(true)}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    backgroundColor: '#0B1329',
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  viewerWrapper: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(11, 19, 41, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    zIndex: 5,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(11, 19, 41, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
    zIndex: 5,
  },
  errorTitle: {
    color: colors.brandRed,
    fontSize: 15,
    fontWeight: '700',
  },
  errorSubText: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
  },
  controlsBar: {
    position: 'absolute',
    top: 12,
    right: 12,
    gap: 8,
    zIndex: 10,
  },
  ctrlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullBtn: {
    backgroundColor: colors.accentBlue,
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
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

