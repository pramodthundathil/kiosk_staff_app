import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CertificationPoint, TestPoint } from '../../types/product';
import { colors, radii, shadows } from '../../theme';
import { Award, FileCheck, ExternalLink, CheckCircle2 } from 'lucide-react-native';
import { Button } from '../Common/Button';
import { formatDate } from '../../utils/formatters';

interface CertificateCardProps {
  certificates?: (string | CertificationPoint | any)[] | null;
  onOpenDocument?: (url: string, title: string) => void;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ certificates, onOpenDocument }) => {
  if (!certificates || !Array.isArray(certificates) || certificates.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Award size={18} color={colors.amberGold} />
        <Text style={styles.title}>Certificates & Accreditation</Text>
      </View>

      <View style={styles.list}>
        {certificates.map((cert, index) => {
          let title = '';
          let number = '';
          let authority = '';
          let issueDate = '';
          let expiryDate = '';
          let docUrl = '';
          let description = '';
          let testsList: any[] = [];
          let subPoints: string[] = [];

          if (typeof cert === 'string') {
            title = cert;
          } else if (cert && typeof cert === 'object') {
            title = cert.title || cert.name || cert.cert_title || 'Certificate';
            number = cert.number || cert.cert_number || '';
            authority = cert.authority || cert.issuing_authority || '';
            issueDate = cert.issue_date || cert.date || '';
            expiryDate = cert.expiry_date || cert.valid_till || '';
            docUrl = cert.document_url || cert.preview_url || cert.file || '';
            description = cert.description || cert.notes || '';
            testsList = Array.isArray(cert.tests) ? cert.tests : [];
            subPoints = Array.isArray(cert.sub_points)
              ? cert.sub_points
              : Array.isArray(cert.bullets)
              ? cert.bullets
              : [];
          }

          if (!title) return null;

          return (
            <View key={index} style={styles.card}>
              <View style={styles.cardHeader}>
                <Award size={20} color={colors.accentBlue} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.certTitle}>{title}</Text>
                  {number ? <Text style={styles.certNumber}>Cert No: {number}</Text> : null}
                </View>
              </View>

              {description ? <Text style={styles.descText}>{description}</Text> : null}

              <View style={styles.metaRow}>
                {authority ? (
                  <Text style={styles.metaText}>
                    <Text style={styles.metaLabel}>Issued By: </Text>
                    {authority}
                  </Text>
                ) : null}

                {issueDate ? (
                  <Text style={styles.metaText}>
                    <Text style={styles.metaLabel}>Issued Date: </Text>
                    {formatDate(issueDate)}
                  </Text>
                ) : null}

                {expiryDate ? (
                  <Text style={styles.metaText}>
                    <Text style={styles.metaLabel}>Valid Until: </Text>
                    {formatDate(expiryDate)}
                  </Text>
                ) : null}
              </View>

              {/* Sub-points under Certificate */}
              {subPoints.length > 0 && (
                <View style={styles.subPointsContainer}>
                  {subPoints.map((sp, spIdx) => (
                    <View key={spIdx} style={styles.bulletRow}>
                      <CheckCircle2 size={13} color={colors.accentBlue} />
                      <Text style={styles.bulletText}>{sp}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Nested Tests under Certificate */}
              {testsList.length > 0 && (
                <View style={styles.nestedTestsContainer}>
                  <Text style={styles.nestedTestsTitle}>Accredited Test Specifications:</Text>
                  {testsList.map((t, tIdx) => {
                    const tName = typeof t === 'string' ? t : t.test_name || t.name || 'Test';
                    const tStd = typeof t === 'object' ? t.standard : '';
                    const tResult = typeof t === 'object' ? t.result : '';
                    return (
                      <View key={tIdx} style={styles.testItemRow}>
                        <FileCheck size={14} color={colors.accentBlue} />
                        <Text style={styles.testItemText}>
                          <Text style={{ fontWeight: '700' }}>{tName}</Text>
                          {tStd ? ` (${tStd})` : ''}
                          {tResult ? ` - ${tResult}` : ''}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}

              {docUrl && onOpenDocument ? (
                <Button
                  title="Open Certificate Document"
                  onPress={() => onOpenDocument(docUrl, title)}
                  variant="outline"
                  size="sm"
                  icon={<ExternalLink size={14} color={colors.primaryNavy} />}
                  style={styles.btn}
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
    gap: 12,
  },
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  certTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  certNumber: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accentBlue,
    marginTop: 2,
  },
  descText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  metaRow: {
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
  subPointsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bulletText: {
    fontSize: 12,
    color: colors.textPrimary,
    flex: 1,
  },
  nestedTestsContainer: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 6,
  },
  nestedTestsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryNavy,
    marginBottom: 2,
  },
  testItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  testItemText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  btn: {
    marginTop: 12,
  },
});
