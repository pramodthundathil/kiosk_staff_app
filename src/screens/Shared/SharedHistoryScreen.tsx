import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/Header/AppHeader';
import { SharedHistoryCard } from '../../components/Sharing/SharedHistoryCard';
import { EmptyState } from '../../components/Common/EmptyState';
import { getSharedHistory } from '../../utils/storage';
import { SharedProductLog } from '../../types/share';
import { colors } from '../../theme';
import { Send, Shield } from 'lucide-react-native';

export const SharedHistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [history, setHistory] = useState<SharedProductLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getSharedHistory();
      setHistory(data);
    } catch (e) {
      console.warn('History load error:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Shared Products History"
        showSearch={true}
        onSearchPress={() => navigation.navigate('Search')}
      />

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadHistory(); }} />
        }
      >
        <View style={styles.banner}>
          <Shield size={20} color={colors.amberGold} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Customer Sharing Log</Text>
            <Text style={styles.bannerDesc}>
              Log of product information shared via WhatsApp. Customer phone numbers are masked for data privacy.
            </Text>
          </View>
        </View>

        {history.length === 0 ? (
          <EmptyState
            title="No shared products yet"
            description="Products shared with customers via WhatsApp will appear in this log."
            icon={<Send size={44} color={colors.accentBlue} />}
          />
        ) : (
          history.map((item) => <SharedHistoryCard key={item.id} item={item} />)
        )}
      </ScrollView>
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
    paddingBottom: 40,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryNavy,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bannerDesc: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    lineHeight: 16,
  },
});
