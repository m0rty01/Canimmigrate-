import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Zap,
  MapPin,
  GraduationCap,
  Briefcase,
  Plane,
  Heart,
  Clock,
  DollarSign,
  CheckCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Anchor,
  Rocket,
  Palette,
  HeartHandshake,
  Wheat,
  Languages,
  Trees,
  MapPinHouse,
  Shield,
  Award,
} from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import CollapsibleSection from '@/components/CollapsibleSection';
import { pathways } from '@/mocks/pathways';
import type { PathwayInfo } from '@/types/immigration';

const ICON_MAP: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  Zap,
  MapPin,
  GraduationCap,
  Briefcase,
  Plane,
  Heart,
  Anchor,
  Rocket,
  Palette,
  HeartHandshake,
  Wheat,
  Languages,
  Trees,
  MapPinHouse,
  Shield,
  Award,
};

type CategoryKey = 'federal' | 'pnp' | 'rcip' | 'temporary' | 'other';

const CATEGORIES: { key: CategoryKey; label: string; color: string }[] = [
  { key: 'federal', label: 'Federal', color: '#C41E3A' },
  { key: 'pnp', label: 'PNPs', color: '#1A6B3C' },
  { key: 'rcip', label: 'RCIP', color: '#2563EB' },
  { key: 'temporary', label: 'Temporary', color: '#D97706' },
  { key: 'other', label: 'Other', color: '#7C3AED' },
];

const CATEGORY_TITLES: Record<CategoryKey, string> = {
  federal: 'Federal Programs',
  pnp: 'Provincial Nominee Programs (PNP)',
  rcip: 'Rural Community Immigration (RCIP)',
  temporary: 'Temporary Pathways',
  other: 'Other Programs',
};

function PathwayCard({ pathway }: { pathway: PathwayInfo }) {
  const [expanded, setExpanded] = useState(false);
  const { colors } = useTheme();
  const IconComponent = ICON_MAP[pathway.icon] || Zap;

  const ICON_COLORS: Record<string, string> = {
    Zap: colors.warning,
    MapPin: colors.success,
    GraduationCap: colors.info,
    Briefcase: colors.scoreWork,
    Plane: colors.scoreLanguage,
    Heart: colors.primary,
    Anchor: '#0E7490',
    Rocket: '#DC2626',
    Palette: '#9333EA',
    HeartHandshake: '#EC4899',
    Wheat: '#CA8A04',
    Languages: '#2563EB',
    Trees: '#16A34A',
    MapPinHouse: '#0D9488',
    Shield: '#6366F1',
    Award: '#B45309',
  };

  const iconColor = ICON_COLORS[pathway.icon] || colors.primary;

  return (
    <View style={[styles.pathwayCard, { backgroundColor: colors.surface }]}>
      <TouchableOpacity
        style={styles.pathwayHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={[styles.pathwayIcon, { backgroundColor: iconColor + '18' }]}>
          <IconComponent size={22} color={iconColor} />
        </View>
        <View style={styles.pathwayTitleArea}>
          <Text style={[styles.pathwayTitle, { color: colors.text }]}>{pathway.title}</Text>
          <Text style={[styles.pathwaySubtitle, { color: colors.textSecondary }]}>{pathway.subtitle}</Text>
        </View>
        {expanded ? (
          <ChevronUp size={20} color={colors.textMuted} />
        ) : (
          <ChevronDown size={20} color={colors.textMuted} />
        )}
      </TouchableOpacity>

      {expanded && (
        <View style={styles.pathwayContent}>
          <Text style={[styles.pathwayDescription, { color: colors.textSecondary }]}>{pathway.description}</Text>

          <View style={[styles.metaRow, { backgroundColor: colors.surfaceAlt }]}>
            <View style={styles.metaItem}>
              <Clock size={14} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{pathway.processingTime}</Text>
            </View>
            <View style={styles.metaItem}>
              <DollarSign size={14} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{pathway.fees}</Text>
            </View>
          </View>

          <CollapsibleSection title="Eligibility Requirements" defaultOpen>
            {pathway.eligibility.map((item, idx) => (
              <View key={idx} style={styles.listItem}>
                <CheckCircle size={14} color={colors.success} />
                <Text style={[styles.listText, { color: colors.text }]}>{item}</Text>
              </View>
            ))}
          </CollapsibleSection>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <CollapsibleSection title="Application Steps">
            {pathway.steps.map((step, idx) => (
              <View key={idx} style={styles.stepItem}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.stepNumberText, { color: colors.textLight }]}>{idx + 1}</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.text }]}>{step}</Text>
              </View>
            ))}
          </CollapsibleSection>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <CollapsibleSection title="Required Documents">
            {pathway.documents.map((doc, idx) => (
              <View key={idx} style={styles.listItem}>
                <FileText size={14} color={colors.info} />
                <Text style={[styles.listText, { color: colors.text }]}>{doc}</Text>
              </View>
            ))}
          </CollapsibleSection>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <CollapsibleSection title="FAQs">
            {pathway.faqs.map((faq, idx) => (
              <View key={idx} style={styles.faqItem}>
                <Text style={[styles.faqQuestion, { color: colors.text }]}>{faq.question}</Text>
                <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{faq.answer}</Text>
              </View>
            ))}
          </CollapsibleSection>

          {pathway.websiteUrl ? (
            <TouchableOpacity
              style={[styles.officialLink, { borderTopColor: colors.border }]}
              onPress={() => Linking.openURL(pathway.websiteUrl!)}
            >
              <ExternalLink size={14} color={colors.primary} />
              <Text style={[styles.officialLinkText, { color: colors.primary }]}>Visit Official Website</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.officialLink, { borderTopColor: colors.border }]}
              onPress={() => Linking.openURL('https://www.canada.ca/en/immigration-refugees-citizenship.html')}
            >
              <ExternalLink size={14} color={colors.primary} />
              <Text style={[styles.officialLinkText, { color: colors.primary }]}>Visit IRCC Official Website</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

export default function PathwaysScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [activeCategory, setActiveCategory] = useState<CategoryKey | 'all'>('all');

  const grouped = useMemo(() => {
    const order: CategoryKey[] = ['federal', 'rcip', 'pnp', 'temporary', 'other'];
    if (activeCategory !== 'all') {
      return [{ key: activeCategory, items: pathways.filter(p => p.category === activeCategory) }];
    }
    return order
      .map(key => ({ key, items: pathways.filter(p => p.category === key) }))
      .filter(g => g.items.length > 0);
  }, [activeCategory]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.screenTitle, { color: colors.text }]}>Immigration Pathways</Text>
        <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
          Explore programs and step-by-step guides
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={styles.filterScroll}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              { borderColor: colors.border },
              activeCategory === 'all' && { backgroundColor: colors.text, borderColor: colors.text },
            ]}
            onPress={() => setActiveCategory('all')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: colors.textSecondary },
                activeCategory === 'all' && { color: colors.background },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.filterChip,
                { borderColor: colors.border },
                activeCategory === cat.key && { backgroundColor: cat.color, borderColor: cat.color },
              ]}
              onPress={() => setActiveCategory(cat.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: colors.textSecondary },
                  activeCategory === cat.key && { color: '#FFFFFF' },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {grouped.map(group => (
          <View key={group.key}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {CATEGORY_TITLES[group.key as CategoryKey]}
            </Text>
            <Text style={[styles.sectionCount, { color: colors.textMuted }]}>
              {group.items.length} program{group.items.length !== 1 ? 's' : ''}
            </Text>
            {group.items.map(pathway => (
              <PathwayCard key={pathway.id} pathway={pathway} />
            ))}
          </View>
        ))}

        <View style={[styles.infoBox, { backgroundColor: colors.infoLight, borderColor: colors.info + '30' }]}>
          <Text style={[styles.infoTitle, { color: colors.secondary }]}>Need Official Information?</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Always verify details on the official IRCC website. Requirements and processing times
            may change without notice.
          </Text>
          <TouchableOpacity
            style={[styles.infoButton, { backgroundColor: colors.secondary }]}
            onPress={() => Linking.openURL('https://www.canada.ca/en/immigration-refugees-citizenship.html')}
          >
            <Text style={[styles.infoButtonText, { color: colors.textLight }]}>Go to Canada.ca</Text>
            <ExternalLink size={14} color={colors.textLight} />
          </TouchableOpacity>
        </View>

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
    marginBottom: 12,
    marginTop: 2,
  },
  filterScroll: {
    marginBottom: 20,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  sectionCount: {
    fontSize: 13,
    marginBottom: 12,
  },
  pathwayCard: {
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden',
  },
  pathwayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  pathwayIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathwayTitleArea: {
    flex: 1,
  },
  pathwayTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  pathwaySubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  pathwayContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  pathwayDescription: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
    borderRadius: 10,
    padding: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  listText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  stepText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
    paddingTop: 2,
  },
  faqItem: {
    marginBottom: 14,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 19,
  },
  officialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  officialLinkText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  infoBox: {
    borderRadius: 16,
    padding: 20,
    marginTop: 4,
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 12,
  },
  infoButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
});
