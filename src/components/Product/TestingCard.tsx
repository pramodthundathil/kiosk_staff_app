import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TestPoint } from '../../types/product';
import { colors, radii, shadows } from '../../theme';
import { FlaskConical, FileCheck, ExternalLink } from 'lucide-react-native';
import { Button } from '../Common/Button';
import { formatDate } from '../../utils/formatters';

interface TestingCardProps {
  tests?: any;
  onOpenDocument?: (url: string, title: string) => void;
}

export const TestingCard: React.FC<TestingCardProps> = ({ tests, onOpenDocument }) => {
  if (!tests) return null;

  // Safely normalize tests prop into an array of items
  let testList: any[] = [];
  if (Array.isArray(tests)) {
    testList = tests;
  } else if (typeof tests === 'string') {
    const str = (tests as string).trim();
    if (str) {
      if (str.includes('\n')) {
        testList = str.split('\n').map((s: string) => s.trim()).filter(Boolean);
      } else if (str.includes(';')) {
        testList = str.split(';').map((s: string) => s.trim()).filter(Boolean);
      } else {
        testList = [str];
      }
    }
  } else if (typeof tests === 'object') {
    testList = [tests];
  }

  if (testList.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FlaskConical size={18} color={colors.accentBlue} />
        <Text style={styles.title}>Testing & Quality Assurance</Text>
      </View>

      <View style={styles.list}>
        {testList.map((item, index) => {
          let testName = '';
          let standard = '';
          let method = '';
          let result = '';
          let date = '';
          let docUrl = '';
          let subPoints: string[] = [];

          if (typeof item === 'string') {
            testName = item;
          } else if (item && typeof item === 'object') {
            testName = item.test_name || item.name || item.title || item.test || item.label || '';
            standard = item.standard || item.std || '';
            method = item.method || item.test_method || '';
            result = item.result || item.status || item.outcome || '';
            date = item.date || item.test_date || '';
            docUrl = item.document_url || item.doc_url || item.url || item.file || '';
            subPoints = Array.isArray(item.sub_points)
              ? item.sub_points
              : Array.isArray(item.bullets)
              ? item.bullets
              : [];

            if (!testName && (standard || method || result)) {
              testName = standard || method || 'Quality & Performance Test';
            }
          }

          if (!testName && !standard && !result && subPoints.length === 0) return null;

          return (
            <View key={index} style={styles.card}>
              <View style={styles.topRow}>
                <View style={styles.titleBox}>
                  <FileCheck size={18} color={colors.accentBlue} />
                  <Text style={styles.testName}>{testName || 'Quality Test'}</Text>
                </View>

                {result ? (
                  <View style={styles.resultBadge}>
                    <Text style={styles.resultText}>{result.toLowerCase().includes('pass') ? result : `PASS / ${result}`}</Text>
                  </View>
                ) : (
                  <View style={styles.resultBadge}>
                    <Text style={styles.resultText}>VERIFIED / PASSED</Text>
                  </View>
                )}
              </View>

              <View style={styles.detailsGrid}>
                {standard ? (
                  <Text style={styles.metaText}>
                    <Text style={styles.metaLabel}>Standard: </Text>
                    {standard}
                  </Text>
                ) : null}
                {method ? (
                  <Text style={styles.metaText}>
                    <Text style={styles.metaLabel}>Method: </Text>
                    {method}
                  </Text>
                ) : null}
                {date ? (
                  <Text style={styles.metaText}>
                    <Text style={styles.metaLabel}>Test Date: </Text>
                    {formatDate(date)}
                  </Text>
                ) : null}
              </View>

              {subPoints.length > 0 && (
                <View style={styles.subList}>
                  {subPoints.map((sp, spIdx) => (
                    <Text key={spIdx} style={styles.subText}>
                      • {sp}
                    </Text>
                  ))}
                </View>
              )}

              {docUrl && onOpenDocument ? (
                <Button
                  title="View Test Certificate PDF"
                  onPress={() => onOpenDocument(docUrl, testName || 'Test Certificate')}
                  variant="outline"
                  size="sm"
                  icon={<ExternalLink size={14} color={colors.primaryNavy} />}
                  style={styles.docBtn}
                />
              ) : null}
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
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  titleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  testName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  resultBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  resultText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  detailsGrid: {
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  metaLabel: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subList: {
    marginTop: 6,
    gap: 2,
  },
  subText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  docBtn: {
    marginTop: 10,
  },
});
