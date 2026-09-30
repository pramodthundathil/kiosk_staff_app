import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { colors, radii, shadows } from '../../theme';
import { Video as VideoIcon } from 'lucide-react-native';

interface VideoPlayerViewProps {
  url: string;
  autoPlay?: boolean;
}

export const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({ url, autoPlay = false }) => {
  const player = useVideoPlayer(url, (p) => {
    p.loop = false;
    p.muted = false;
    if (autoPlay) {
      p.play();
    }
  });

  if (!url) {
    return (
      <View style={styles.errorBox}>
        <VideoIcon size={32} color={colors.textMuted} />
        <Text style={styles.errorText}>No product video available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        nativeControls={true}
        contentFit="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 240,
    backgroundColor: '#000000',
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  errorBox: {
    width: '100%',
    height: 180,
    backgroundColor: '#F8FAFC',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
