import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrendingUp, Users, FileText, ExternalLink } from 'lucide-react-native';
import { Linking } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { newsItems, drawHistory } from '@/mocks/news';
import type { NewsItem } from '@/types/immigration';

type NewsCategory = 'all' | 'draw' | 'policy' | 'update';

const CATEGORY_FILTERS: { key: NewsCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draw', label: 'Draws' },
  { key: 'policy', label: 'Policy' },
  { key: 'update', label: 'Updates' },
];

function NewsCard({ item }: { item: NewsItem }) {
  const { colors } = useTheme();

  const CATEGORY_CONFIG: Record<string, { color: string; bgColor: string; icon: React.ComponentType<{ size: number; color: string }> }> = {
    draw: { color: colors.primary, bgColor: colors.errorLight, icon: TrendingUp },
    policy: { color: colors.info, bgColor: colors.infoLight, icon: FileText },
    update: { color: colors.success, bgColor: colors.successLight, icon: Users },
  };

  const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.update;
  const IconComp = config.icon;

  return (
    <View style={[styles.newsCard, { backgroundColor: colors.surface }]}>
      <View style={styles.newsCardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: config.bgColor }]}>
          <IconComp size={12} color={config.color} />
          <Text style={[styles.categoryText, { color: config.color }]}>
            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
          </Text>
        </View>
        <Text style={[styles.newsDate, { color: colors.textMuted }]}>{item.date}</Text>
      </View>
      <Text style={[styles.newsTitle, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.newsSummary, { color: colors.textSecondary }]}>{item.summary}</Text>
      {item.drawScore !== undefined && (
        <View style={[styles.drawDetails, { backgroundColor: colors.surfaceAlt }]}>
          <View style={styles.drawDetail}>
            <Text style={[styles.drawDetailValue, { color: colors.primary }]}>{item.drawScore}</Text>
            <Text style={[styles.drawDetailLabel, { color: colors.textMuted }]}>CRS Cutoff</Text>
          </View>
          <View style={[styles.drawDetailDivider, { backgroundColor: colors.border }]} />
          <View style={styles.drawDetail}>
            <Text style={[styles.drawDetailValue, { color: colors.primary }]}>
              {item.drawInvitations?.toLocaleString()}
            </Text>
            <Text style={[styles.drawDetailLabel, { color: colors.textMuted }]}>Invitations</Text>
          </View>
        </View>
      )}
      <TouchableOpacity
        style={styles.sourceRow}
        onPress={() => item.url && Linking.openURL(item.url)}
        disabled={!item.url}
        activeOpacity={0.7}
      >
        <Text style={[styles.newsSource, { color: colors.textMuted }]}>Source: {item.source}</Text>
        {item.url && <ExternalLink size={12} color={colors.primary} />}
      </TouchableOpacity>
    </View>
  );
}

function DrawHistoryChart() {
  const { colors } = useTheme();
  const maxScore = Math.max(...drawHistory.map((d) => d.score));
  const minScore = Math.min(...drawHistory.map((d) => d.score));
  const isGeneralType = (type: string) => ['CEC', 'FSW', 'General'].includes(type);
  const range = maxScore - minScore || 1;

  return (
    <View style={[styles.chartSection, { backgroundColor: colors.surface }]}>
      <Text style={[styles.chartTitle, { color: colors.text }]}>Historical Draw Scores</Text>
      <Text style={[styles.chartSubtitle, { color: colors.textMuted }]}>Last 24 draws</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
        <View style={styles.chartContainer}>
          {drawHistory.map((draw, idx) => {
            const heightPct = ((draw.score - minScore + 20) / (range + 40)) * 100;
            const isGeneral = isGeneralType(draw.type);
            return (
              <View key={idx} style={styles.chartBar}>
                <Text style={[styles.chartBarScore, { color: colors.text }]}>{draw.score}</Text>
                <View style={[styles.chartBarTrack, { backgroundColor: colors.surfaceAlt }]}>
                  <View
                    style={[
                      styles.chartBarFill,
                      {
                        height: `${heightPct}%`,
                        backgroundColor: isGeneral ? colors.primary : colors.info,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.chartBarDate, { color: colors.textMuted }]}>
                  {draw.date.split('-').slice(1).join('/')}
                </Text>
                <Text style={[styles.chartBarType, { color: colors.textMuted }]}>{draw.type}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>CEC / FSW / General</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.info }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>PNP / French / Other</Text>
        </View>
      </View>
    </View>
  );
}

export default function NewsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [activeFilter, setActiveFilter] = useState<NewsCategory>('all');

  const filteredNews = useMemo(() => {
    if (activeFilter === 'all') return newsItems;
    return newsItems.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.screenTitle, { color: colors.text }]}>News & Updates</Text>
        <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>Latest immigration developments</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {CATEGORY_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                { backgroundColor: colors.surface, borderColor: colors.border },
                activeFilter === filter.key && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: colors.textSecondary },
                  activeFilter === filter.key && { color: colors.textLight },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <DrawHistoryChart />

        {filteredNews.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 15,
    marginTop: 2,
    marginBottom: 16,
  },
  filterScroll: {
    marginBottom: 20,
    marginHorizontal: -20,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  chartSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  chartSubtitle: {
    fontSize: 13,
    marginBottom: 16,
    marginTop: 2,
  },
  chartScroll: {
    marginHorizontal: -4,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    paddingHorizontal: 4,
    height: 160,
  },
  chartBar: {
    alignItems: 'center',
    width: 50,
  },
  chartBarScore: {
    fontSize: 10,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  chartBarTrack: {
    width: 28,
    height: 100,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBarFill: {
    width: 28,
    borderRadius: 6,
  },
  chartBarDate: {
    fontSize: 9,
    marginTop: 4,
  },
  chartBarType: {
    fontSize: 8,
    fontWeight: '500' as const,
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
  },
  newsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  newsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  newsDate: {
    fontSize: 12,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 6,
    lineHeight: 22,
  },
  newsSummary: {
    fontSize: 14,
    lineHeight: 20,
  },
  drawDetails: {
    flexDirection: 'row',
    marginTop: 12,
    borderRadius: 10,
    padding: 12,
  },
  drawDetail: {
    flex: 1,
    alignItems: 'center',
  },
  drawDetailValue: {
    fontSize: 20,
    fontWeight: '800' as const,
  },
  drawDetailLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    marginTop: 2,
  },
  drawDetailDivider: {
    width: 1,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  newsSource: {
    fontSize: 11,
  },
});
