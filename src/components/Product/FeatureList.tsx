import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FeaturePoint } from '../../types/product';
import { colors, radii, shadows } from '../../theme';
import { CheckCircle2, Star } from 'lucide-react-native';

interface FeatureListProps {
  features?: any;
}

export const FeatureList: React.FC<FeatureListProps> = ({ features }) => {
  if (!features) return null;

  // Safely normalize features prop into an array of items
  let featureList: any[] = [];
  if (Array.isArray(features)) {
    featureList = features;
  } else if (typeof features === 'string') {
    const str = (features as string).trim();
    if (str) {
      if (str.includes('\n')) {
        featureList = str.split('\n').map((s: string) => s.trim()).filter(Boolean);
      } else if (str.includes(';')) {
        featureList = str.split(';').map((s: string) => s.trim()).filter(Boolean);
      } else {
        featureList = [str];
      }
    }
  } else if (typeof features === 'object') {
    featureList = [features];
  }

  if (featureList.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Star size={18} color={colors.amberGold} fill={colors.amberGold} />
        <Text style={styles.title}>Key Features & Performance</Text>
      </View>

      <View style={styles.list}>
        {featureList.map((feat, index) => {
          let title = '';
          let desc = '';
          let bullets: string[] = [];

          if (typeof feat === 'string') {
            title = feat;
          } else if (feat && typeof feat === 'object') {
            title = feat.title || feat.feature_name || feat.name || feat.label || '';
            desc = feat.description || feat.notes || feat.detail || '';
            bullets = Array.isArray(feat.bullets)
              ? feat.bullets
              : Array.isArray(feat.sub_points)
              ? feat.sub_points
              : Array.isArray(feat.points)
              ? feat.points
              : [];

            // If object has key-value pairs without standard title
            if (!title && !desc && bullets.length === 0) {
              const keys = Object.keys(feat);
              if (keys.length > 0) {
                title = `${keys[0]}: ${feat[keys[0]]}`;
              }
            }
          }

          if (!title && !desc && bullets.length === 0) return null;

          return (
            <View key={index} style={styles.card}>
              <View style={styles.iconBox}>
                <CheckCircle2 size={20} color={colors.accentBlue} strokeWidth={2.2} />
              </View>

              <View style={styles.content}>
                {title ? <Text style={styles.featureTitle}>{title}</Text> : null}
                {desc ? <Text style={styles.featureDesc}>{desc}</Text> : null}

                {bullets.length > 0 && (
                  <View style={styles.bulletList}>
                    {bullets.map((b, bIdx) => (
                      <Text key={bIdx} style={styles.bulletText}>
                        • {typeof b === 'string' ? b : JSON.stringify(b)}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginVertical: 10,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  list: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 10,
  },
  iconBox: {
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  featureDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  bulletList: {
    marginTop: 6,
    gap: 4,
  },
  bulletText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
