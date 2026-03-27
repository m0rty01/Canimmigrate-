import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, MessageSquare, Globe, AlertTriangle, ExternalLink } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';

const DEVELOPER_EMAIL = 'ravijha01.97@gmail.com';

export default function ContactScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const handleEmail = (subject: string) => {
    Linking.openURL(`mailto:${DEVELOPER_EMAIL}?subject=${encodeURIComponent(subject)}`).catch(() => {
      Alert.alert('Email Address', DEVELOPER_EMAIL, [{ text: 'OK' }]);
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header card */}
      <View style={[styles.headerCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1A2E22' : '#E6F5EC' }]}>
          <Mail size={32} color={colors.success} />
        </View>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Contact Us</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          We are independent developers and we welcome your feedback, questions, and bug reports.
          We typically respond within a few days.
        </Text>
      </View>

      {/* Primary contact */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Developer Contact</Text>

        <TouchableOpacity
          style={[styles.contactRow, { backgroundColor: colors.surface }]}
          onPress={() => handleEmail('CanImmigrate App — General Inquiry')}
          activeOpacity={0.75}
        >
          <View style={[styles.rowIconWrap, { backgroundColor: isDark ? '#152535' : '#E3F0FA' }]}>
            <Mail size={20} color={colors.info} />
          </View>
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>Email Developer</Text>
            <Text style={[styles.rowEmail, { color: colors.primary }]}>{DEVELOPER_EMAIL}</Text>
            <Text style={[styles.rowHint, { color: colors.textMuted }]}>Tap to open your email app</Text>
          </View>
          <ExternalLink size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Reason shortcuts */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Quick Contact Options</Text>

        {[
          { label: 'General Feedback', subject: 'CanImmigrate App — General Feedback', icon: MessageSquare, color: colors.primary },
          { label: 'Report a Bug or Issue', subject: 'CanImmigrate App — Bug Report', icon: AlertTriangle, color: colors.warning },
          { label: 'Data or Information Correction', subject: 'CanImmigrate App — Data Correction', icon: Globe, color: colors.info },
          { label: 'Privacy or Policy Question', subject: 'CanImmigrate App — Privacy Question', icon: Mail, color: colors.success },
        ].map((item) => {
          const IconComp = item.icon;
          return (
            <TouchableOpacity
              key={item.subject}
              style={[styles.quickRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleEmail(item.subject)}
              activeOpacity={0.75}
            >
              <View style={[styles.quickIcon, { backgroundColor: colors.surfaceAlt }]}>
                <IconComp size={18} color={item.color} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.text }]}>{item.label}</Text>
              <ExternalLink size={14} color={colors.textMuted} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* App info */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>App Information</Text>
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {[
            { label: 'App Name', value: 'CanImmigrate' },
            { label: 'Developer', value: 'Independent Developer' },
            { label: 'Contact Email', value: DEVELOPER_EMAIL },
            { label: 'Affiliation', value: 'None — unofficial, independent app' },
            { label: 'Government Affiliation', value: 'NOT affiliated with IRCC or Gov of Canada' },
          ].map((row) => (
            <View key={row.label} style={[styles.infoRow, { borderColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{row.label}</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{row.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Disclaimer note */}
      <View style={[styles.disclaimerNote, { backgroundColor: isDark ? '#2A1200' : '#FFF3E0', borderColor: '#E8830A' }]}>
        <AlertTriangle size={14} color="#E8830A" />
        <Text style={[styles.disclaimerText, { color: isDark ? '#F5A642' : '#7A3500' }]}>
          CanImmigrate is an <Text style={styles.bold}>independent, unofficial app</Text>. It is{' '}
          <Text style={styles.bold}>NOT affiliated with IRCC or the Government of Canada</Text>.
          For official immigration services, visit{' '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('https://ircc.canada.ca')}
          >
            ircc.canada.ca
          </Text>.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center' as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  rowIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  rowEmail: {
    fontSize: 13,
    fontWeight: '600' as const,
    marginTop: 3,
    textDecorationLine: 'underline' as const,
  },
  rowHint: {
    fontSize: 11,
    marginTop: 2,
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    gap: 12,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  quickLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden' as const,
  },
  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
    flexWrap: 'wrap' as const,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    width: 130,
    flexShrink: 0,
  },
  infoValue: {
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
  disclaimerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 8,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  bold: {
    fontWeight: '800' as const,
  },
  link: {
    fontWeight: '700' as const,
    textDecorationLine: 'underline' as const,
    color: '#E8830A',
  },
});
