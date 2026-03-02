import React from 'react';
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
  ExternalLink,
  Globe,
  FileText,
  Users,
  TrendingUp,
  BookOpen,
  AlertTriangle,
  MapPin,
  Briefcase,
} from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';

interface OfficialLink {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  accentColor: string;
  bgColor: string;
  tag: string;
}

const OFFICIAL_LINKS: OfficialLink[] = [
  {
    id: 'draws',
    title: 'Express Entry Draw Results',
    description: 'Latest rounds of invitations, CRS cutoffs, and ITA counts — official IRCC source.',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/submit-profile/rounds-invitations.html',
    icon: TrendingUp,
    accentColor: '#2E7D32',
    bgColor: '#E8F5E9',
    tag: 'Draws',
  },
  {
    id: 'express-entry',
    title: 'Express Entry Overview',
    description: 'How the Express Entry system works, eligibility, and how to create a profile.',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html',
    icon: Globe,
    accentColor: '#1565C0',
    bgColor: '#E3F2FD',
    tag: 'Program',
  },
  {
    id: 'crs-tool',
    title: 'Official CRS Calculator (IRCC)',
    description: 'The official Comprehensive Ranking System points calculator on canada.ca.',
    url: 'https://ircc.canada.ca/english/immigrate/skilled/crs-tool.asp',
    icon: FileText,
    accentColor: '#6A1B9A',
    bgColor: '#F3E5F5',
    tag: 'CRS Tool',
  },
  {
    id: 'pnp',
    title: 'Provincial Nominee Programs',
    description: 'Official guides to provincial and territorial nominee programs across Canada.',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees.html',
    icon: MapPin,
    accentColor: '#E65100',
    bgColor: '#FFF3E0',
    tag: 'PNP',
  },
  {
    id: 'fsw',
    title: 'Federal Skilled Worker Program',
    description: 'Eligibility, points grid, and requirements for FSW applications.',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/federal-skilled-workers.html',
    icon: Briefcase,
    accentColor: '#00695C',
    bgColor: '#E0F2F1',
    tag: 'FSW',
  },
  {
    id: 'cec',
    title: 'Canadian Experience Class',
    description: 'Requirements and process for the Canadian Experience Class program.',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/canadian-experience-class.html',
    icon: Users,
    accentColor: '#1565C0',
    bgColor: '#E3F2FD',
    tag: 'CEC',
  },
  {
    id: 'levels-plan',
    title: 'Immigration Levels Plan',
    description: 'Annual immigration levels and targets published by IRCC.',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/news/notices/supplementary-immigration-levels-2024.html',
    icon: BookOpen,
    accentColor: '#4527A0',
    bgColor: '#EDE7F6',
    tag: 'Policy',
  },
  {
    id: 'ircc-news',
    title: 'IRCC Official News & Announcements',
    description: 'Policy announcements, program updates, and news directly from IRCC.',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/news.html',
    icon: Globe,
    accentColor: '#AD1457',
    bgColor: '#FCE4EC',
    tag: 'News',
  },
];

function OfficialLinkCard({ item }: { item: OfficialLink }) {
  const { colors, isDark } = useTheme();
  const IconComp = item.icon;
  const bgColor = isDark ? 'rgba(255,255,255,0.06)' : item.bgColor;

  return (
    <TouchableOpacity
      style={[styles.linkCard, { backgroundColor: colors.surface }]}
      onPress={() => Linking.openURL(item.url)}
      activeOpacity={0.75}
      testID={`official-link-${item.id}`}
    >
      <View style={[styles.linkIconWrap, { backgroundColor: bgColor }]}>
        <IconComp size={22} color={item.accentColor} />
      </View>
      <View style={styles.linkBody}>
        <View style={styles.linkTitleRow}>
          <Text style={[styles.linkTitle, { color: colors.text }]}>{item.title}</Text>
          <View style={[styles.tagBadge, { backgroundColor: bgColor }]}>
            <Text style={[styles.tagText, { color: item.accentColor }]}>{item.tag}</Text>
          </View>
        </View>
        <Text style={[styles.linkDescription, { color: colors.textSecondary }]}>{item.description}</Text>
        <View style={styles.urlRow}>
          <ExternalLink size={11} color={item.accentColor} />
          <Text style={[styles.urlText, { color: item.accentColor }]}>canada.ca / ircc.canada.ca</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function OfficialResourcesScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      {/* Persistent disclaimer banner */}
      <View style={[styles.persistentBanner, { backgroundColor: isDark ? '#2A1200' : '#FFF3E0', borderBottomColor: '#E8830A' }]}>
        <AlertTriangle size={12} color="#E8830A" />
        <Text style={styles.persistentBannerText}>
          Unofficial App — Links open official canada.ca sources
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.screenTitle, { color: colors.text }]}>Official Sources</Text>
            <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
              Direct links to canada.ca &amp; IRCC
            </Text>
          </View>
          <View style={[styles.govBadge, { backgroundColor: isDark ? '#0D1F0D' : '#E8F5E9', borderColor: '#2E7D32' }]}>
            <Globe size={14} color="#2E7D32" />
            <Text style={styles.govBadgeText}>Gov CA</Text>
          </View>
        </View>

        {/* Info callout */}
        <View style={[styles.infoCallout, { backgroundColor: isDark ? '#0D1520' : '#E3F2FD', borderColor: '#1565C0' }]}>
          <FileText size={15} color="#1565C0" />
          <Text style={[styles.infoCalloutText, { color: isDark ? '#90CAF9' : '#0D47A1' }]}>
            This app does not aggregate or display news. Tap any link below to view the latest official information directly on government websites. Data shown in other sections of this app is{' '}
            <Text style={styles.boldText}>not live</Text> — always verify on official sources.
          </Text>
        </View>

        <Text style={[styles.groupLabel, { color: colors.textMuted }]}>GOVERNMENT LINKS</Text>

        {OFFICIAL_LINKS.map((item) => (
          <OfficialLinkCard key={item.id} item={item} />
        ))}

        {/* Bottom disclaimer */}
        <View style={[styles.bottomDisclaimer, { backgroundColor: isDark ? '#1A0900' : '#FFF8F0', borderColor: '#E8830A' }]}>
          <AlertTriangle size={14} color="#E8830A" />
          <Text style={[styles.bottomDisclaimerText, { color: isDark ? '#F5A642' : '#8B4A00' }]}>
            CanImmigrate is an independent, unofficial app. Not affiliated with IRCC or the Government of Canada.
            Tapping links above opens external official government websites.
          </Text>
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
  persistentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderBottomWidth: 1,
  },
  persistentBannerText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#E8830A',
    letterSpacing: 0.2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  govBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 4,
  },
  govBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#2E7D32',
  },
  infoCallout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 20,
  },
  infoCalloutText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '800' as const,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    marginBottom: 10,
    marginLeft: 2,
  },
  linkCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  linkIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  linkBody: {
    flex: 1,
  },
  linkTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 5,
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    flex: 1,
    lineHeight: 19,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    flexShrink: 0,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  linkDescription: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 7,
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  urlText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  bottomDisclaimer: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 8,
  },
  bottomDisclaimerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
