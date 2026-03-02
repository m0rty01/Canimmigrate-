import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertTriangle, ExternalLink, CheckCircle2, XCircle, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/providers/ThemeProvider';
import { useUser } from '@/providers/UserProvider';

interface DisclaimerScreenProps {
  readOnly?: boolean;
}

const OFFICIAL_SOURCES = [
  {
    label: 'Express Entry & CRS — IRCC',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html',
  },
  {
    label: 'CRS Points Calculator — IRCC',
    url: 'https://ircc.canada.ca/english/immigrate/skilled/crs-tool.asp',
  },
  {
    label: 'Express Entry Rounds of Invitations',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/submit-profile/rounds-invitations.html',
  },
  {
    label: 'Federal Skilled Worker Program — IRCC',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/federal-skilled-workers.html',
  },
  {
    label: 'Canadian Experience Class — IRCC',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/canadian-experience-class.html',
  },
  {
    label: 'Provincial Nominee Programs — IRCC',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees.html',
  },
  {
    label: 'Immigration Levels Plan — IRCC',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/news/notices/supplementary-immigration-levels-2024.html',
  },
  {
    label: 'National Occupational Classification — Statistics Canada',
    url: 'https://www23.statcan.gc.ca/imdb/p3VD.pl?Function=getVD&TVD=1322554',
  },
  {
    label: 'Labour Force Survey — Statistics Canada',
    url: 'https://www.statcan.gc.ca/en/survey/household/3701',
  },
  {
    label: 'Statistics Canada — Main Portal',
    url: 'https://www.statcan.gc.ca',
  },
];

export default function DisclaimerScreen({ readOnly = false }: DisclaimerScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { acceptDisclaimer, onboardingDone } = useUser();

  const handleAccept = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    acceptDisclaimer();
    if (!onboardingDone) {
      router.replace('/onboarding' as any);
    } else {
      router.replace('/');
    }
  };

  const handleClose = () => {
    router.back();
  };

  const bg = isDark ? '#0A0E1A' : '#F2F4F8';
  const cardBg = isDark ? '#12182B' : '#FFFFFF';
  const warningBg = isDark ? '#2A1A0A' : '#FFF8F0';
  const warningBorder = '#E8830A';
  const sectionBg = isDark ? '#1A2035' : '#F8FAFC';
  const sourceBg = isDark ? '#0D1520' : '#E8F4FD';
  const sourceBorder = '#1565C0';
  const sourceText = isDark ? '#90CAF9' : '#0D47A1';

  return (
    <View style={[styles.root, { backgroundColor: bg, paddingTop: insets.top }]}>
      <View style={[styles.headerBar, { backgroundColor: bg }]}>
        <View style={[styles.warningBadge, { backgroundColor: warningBg, borderColor: warningBorder }]}>
          <AlertTriangle size={16} color={warningBorder} />
          <Text style={[styles.warningBadgeText, { color: warningBorder }]}>IMPORTANT NOTICE</Text>
        </View>
        {readOnly && (
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>Close</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main title card */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Independent Informational App
          </Text>
          <Text style={[styles.titleSub, { color: warningBorder }]}>
            NOT a Government Service or Government Entity
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Please read and acknowledge before continuing
          </Text>
        </View>

        {/* Primary bold disclaimer */}
        <View style={[styles.primaryDisclaimer, { backgroundColor: warningBg, borderColor: warningBorder }]}>
          <AlertTriangle size={22} color={warningBorder} style={{ marginBottom: 10 }} />
          <Text style={[styles.primaryDisclaimerText, { color: isDark ? '#F5A642' : '#8B4A00' }]}>
            <Text style={styles.bold}>CanImmigrate is an independent, unofficial informational app.</Text>
            {'\n\n'}
            It is <Text style={styles.bold}>NOT affiliated with, endorsed by, authorized by, or representing</Text> the
            Government of Canada, Immigration Refugees and Citizenship Canada (IRCC), Statistics Canada,
            or any Canadian federal or provincial government agency.
            {'\n\n'}
            This app <Text style={styles.bold}>does NOT represent a government entity</Text> and is
            not an official government service or portal.
          </Text>
        </View>

        {/* What this app is NOT */}
        <View style={[styles.section, { backgroundColor: sectionBg }]}>
          <View style={styles.sectionHeadingRow}>
            <XCircle size={16} color={warningBorder} />
            <Text style={[styles.sectionHeading, { color: colors.text }]}>What This App Is NOT</Text>
          </View>
          {[
            'An official government service, portal, or entity',
            'Affiliated with or authorized by IRCC, Statistics Canada, or any government body',
            'A source of legal or immigration advice',
            'A guarantee of any immigration outcome or eligibility determination',
            'A replacement for a licensed immigration consultant (RCIC) or lawyer',
            'A facilitator of government applications or services',
          ].map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={[styles.bulletDot, { backgroundColor: warningBorder }]} />
              <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{item}</Text>
            </View>
          ))}
        </View>

        {/* What this app is */}
        <View style={[styles.section, { backgroundColor: sectionBg }]}>
          <View style={styles.sectionHeadingRow}>
            <Info size={16} color={colors.primary} />
            <Text style={[styles.sectionHeading, { color: colors.text }]}>What This App Is</Text>
          </View>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            CanImmigrate is a personal research and planning tool designed to help individuals
            explore publicly available information about Canadian immigration pathways. All content
            is derived from publicly accessible government publications and datasets listed below.
            CRS scores shown are unofficial estimates only — for reference purposes.
          </Text>
        </View>

        {/* Official Sources — KEY SECTION for Play Store compliance */}
        <View style={[styles.sourcesCard, { backgroundColor: sourceBg, borderColor: sourceBorder }]}>
          <View style={styles.sourcesHeader}>
            <ExternalLink size={16} color={sourceBorder} />
            <Text style={[styles.sourcesHeading, { color: sourceText }]}>
              Official Government Sources Used
            </Text>
          </View>
          <Text style={[styles.sourcesIntro, { color: sourceText }]}>
            All government information in this app is based on data published at these official sources.
            Tap any link to verify directly:
          </Text>
          {OFFICIAL_SOURCES.map((source, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.sourceLink, { borderColor: isDark ? '#1E3A5F' : '#BBDEFB' }]}
              onPress={() => Linking.openURL(source.url)}
              activeOpacity={0.7}
            >
              <View style={styles.sourceLinkContent}>
                <Text style={[styles.sourceLinkLabel, { color: sourceText }]}>{source.label}</Text>
                <Text style={[styles.sourceLinkUrl, { color: isDark ? '#5C9BD4' : '#1976D2' }]} numberOfLines={1}>
                  {source.url.replace('https://', '')}
                </Text>
              </View>
              <ExternalLink size={14} color={sourceBorder} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Always verify */}
        <View style={[styles.section, { backgroundColor: sectionBg }]}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Always Verify Official Sources</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            Immigration rules, CRS cutoffs, and processing times change frequently. Always verify
            all information directly on official government websites before making any immigration decisions.
          </Text>
          <TouchableOpacity
            style={[styles.officialLink, { borderColor: colors.primary }]}
            onPress={() => Linking.openURL('https://www.canada.ca/en/immigration-refugees-citizenship.html')}
            activeOpacity={0.7}
          >
            <ExternalLink size={16} color={colors.primary} />
            <Text style={[styles.officialLinkText, { color: colors.primary }]}>
              Visit IRCC Official Website — canada.ca
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.officialLink, { borderColor: colors.primary, marginTop: 8 }]}
            onPress={() => Linking.openURL('https://ircc.canada.ca')}
            activeOpacity={0.7}
          >
            <ExternalLink size={16} color={colors.primary} />
            <Text style={[styles.officialLinkText, { color: colors.primary }]}>
              Visit IRCC Portal — ircc.canada.ca
            </Text>
          </TouchableOpacity>
        </View>

        {/* Professional advice */}
        <View style={[styles.section, { backgroundColor: sectionBg }]}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Seek Professional Advice</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            For personalized immigration advice, consult a{' '}
            <Text style={styles.bold}>Regulated Canadian Immigration Consultant (RCIC)</Text> or a
            licensed immigration lawyer. This app does not replace professional legal counsel.
          </Text>
          <TouchableOpacity
            style={[styles.officialLink, { borderColor: colors.primary, marginTop: 12 }]}
            onPress={() => Linking.openURL('https://college-ic.ca/protecting-you/find-an-immigration-consultant')}
            activeOpacity={0.7}
          >
            <ExternalLink size={16} color={colors.primary} />
            <Text style={[styles.officialLinkText, { color: colors.primary }]}>
              Find a Licensed RCIC — college-ic.ca
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>

      {!readOnly && (
        <View style={[styles.footer, { backgroundColor: bg, paddingBottom: insets.bottom + 16 }]}>
          <Text style={[styles.footerNote, { color: colors.textMuted }]}>
            By tapping &quot;I Understand &amp; Accept&quot;, you acknowledge you have read and agree to the above disclaimer. This app is independent and not affiliated with any government.
          </Text>
          <TouchableOpacity
            style={[styles.acceptButton, { backgroundColor: colors.primary }]}
            onPress={handleAccept}
            activeOpacity={0.85}
          >
            <CheckCircle2 size={20} color="#FFFFFF" />
            <Text style={styles.acceptButtonText}>I Understand & Accept</Text>
          </TouchableOpacity>
        </View>
      )}

      {readOnly && (
        <View style={[styles.footer, { backgroundColor: bg, paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={[styles.acceptButton, { backgroundColor: colors.primary }]}
            onPress={handleClose}
            activeOpacity={0.85}
          >
            <Text style={styles.acceptButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  warningBadgeText: {
    fontSize: 11,
    fontWeight: '800' as const,
    letterSpacing: 0.8,
  },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800' as const,
    letterSpacing: -0.4,
    lineHeight: 28,
    marginBottom: 4,
  },
  titleSub: {
    fontSize: 15,
    fontWeight: '800' as const,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 14,
  },
  primaryDisclaimer: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 18,
    alignItems: 'flex-start',
  },
  primaryDisclaimerText: {
    fontSize: 15,
    lineHeight: 23,
  },
  bold: {
    fontWeight: '800' as const,
  },
  section: {
    borderRadius: 16,
    padding: 18,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    gap: 10,
  },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 7,
    flexShrink: 0,
  },
  bulletText: {
    fontSize: 14,
    lineHeight: 22,
    flex: 1,
  },
  sourcesCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 18,
  },
  sourcesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sourcesHeading: {
    fontSize: 15,
    fontWeight: '800' as const,
    letterSpacing: -0.2,
  },
  sourcesIntro: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  sourceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  sourceLinkContent: {
    flex: 1,
  },
  sourceLinkLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 18,
  },
  sourceLinkUrl: {
    fontSize: 11,
    marginTop: 2,
  },
  officialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  officialLinkText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150,150,150,0.2)',
  },
  footerNote: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center' as const,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  acceptButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
