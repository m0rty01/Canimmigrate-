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
import { AlertTriangle, ExternalLink, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/providers/ThemeProvider';
import { useUser } from '@/providers/UserProvider';

interface DisclaimerScreenProps {
  readOnly?: boolean;
}

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
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Independent Informational App — Not a Government Service
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Please read and acknowledge before continuing
          </Text>
        </View>

        <View style={[styles.primaryDisclaimer, { backgroundColor: warningBg, borderColor: warningBorder }]}>
          <AlertTriangle size={22} color={warningBorder} style={{ marginBottom: 10 }} />
          <Text style={[styles.primaryDisclaimerText, { color: isDark ? '#F5A642' : '#8B4A00' }]}>
            CanImmigrate is an independent, unofficial informational app. It is{' '}
            <Text style={styles.bold}>not affiliated with, endorsed by, or representing</Text> the
            Government of Canada, Immigration Refugees and Citizenship Canada (IRCC), Statistics Canada,
            or any Canadian federal or provincial government agency.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: sectionBg }]}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>What This App Is</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            CanImmigrate is a personal research and planning tool designed to help individuals
            explore publicly available information about Canadian immigration pathways. All content
            is derived from publicly accessible government publications and datasets.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: sectionBg }]}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>What This App Is NOT</Text>
          {[
            'An official government service or portal',
            'Affiliated with or authorized by IRCC, Statistics Canada, or any government body',
            'A source of legal or immigration advice',
            'A guarantee of any immigration outcome or eligibility determination',
            'A replacement for a licensed immigration consultant (RCIC) or lawyer',
          ].map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={[styles.bulletDot, { backgroundColor: warningBorder }]} />
              <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: sectionBg }]}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Data Sources</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            Information in this app is based on publicly available data from:
          </Text>
          {[
            'IRCC published immigration levels plans and program guides',
            'Statistics Canada (StatCan) public datasets and Labour Force Survey',
            'Other publicly accessible Canadian government publications',
          ].map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{item}</Text>
            </View>
          ))}
          <Text style={[styles.bodyText, { color: colors.textSecondary, marginTop: 12 }]}>
            Data may not reflect the most current policies. Immigration rules and processing times
            change frequently.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: sectionBg }]}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Always Verify Official Sources</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            Always verify all information directly on official government websites before making
            any immigration decisions.
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
            onPress={() => Linking.openURL('https://www.statcan.gc.ca')}
            activeOpacity={0.7}
          >
            <ExternalLink size={16} color={colors.primary} />
            <Text style={[styles.officialLinkText, { color: colors.primary }]}>
              Visit Statistics Canada — statcan.gc.ca
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: sectionBg }]}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Seek Professional Advice</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            For personalized immigration advice, consult a{' '}
            <Text style={styles.bold}>Regulated Canadian Immigration Consultant (RCIC)</Text> or a
            licensed immigration lawyer. This app does not replace professional legal counsel.
          </Text>
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>

      {!readOnly && (
        <View style={[styles.footer, { backgroundColor: bg, paddingBottom: insets.bottom + 16 }]}>
          <Text style={[styles.footerNote, { color: colors.textMuted }]}>
            By tapping &quot;I Understand &amp; Accept&quot;, you acknowledge you have read and agree to the above disclaimer.
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
    marginBottom: 6,
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
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700' as const,
    marginBottom: 10,
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
