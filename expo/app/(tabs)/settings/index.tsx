import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  Shield,
  Info,
  ChevronRight,
  ExternalLink,
  Mail,
  Moon,
  Sun,
  Smartphone,
  AlertTriangle,
  MessageSquare,
  Globe,
  TrendingUp,
  FileText,
  MapPin,
  Briefcase,
  Users,
  BookOpen,
} from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useUser } from '@/providers/UserProvider';
import type { ThemeMode } from '@/providers/ThemeProvider';

interface SettingsRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}

function SettingsRow({ icon, title, subtitle, onPress, rightElement, destructive, colors }: SettingsRowProps) {
  return (
    <TouchableOpacity
      style={[styles.settingsRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={0.7}
    >
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, { color: colors.text }, destructive && { color: colors.error }]}>{title}</Text>
        {subtitle ? <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>{subtitle}</Text> : null}
      </View>
      {rightElement || (onPress ? <ChevronRight size={18} color={colors.textMuted} /> : null)}
    </TouchableOpacity>
  );
}

const THEME_OPTIONS: { key: ThemeMode; label: string; icon: React.ComponentType<{ size: number; color: string }> }[] = [
  { key: 'light', label: 'Light', icon: Sun },
  { key: 'dark', label: 'Dark', icon: Moon },
  { key: 'system', label: 'System', icon: Smartphone },
];

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useUser();
  const { colors, themeMode, setTheme, isDark } = useTheme();
  const [reminderNotifications, setReminderNotifications] = useState(false);

  const DEVELOPER_EMAIL = 'ravijha01.97@gmail.com';

  const handleEmailContact = () => {
    Linking.openURL(`mailto:${DEVELOPER_EMAIL}?subject=CanImmigrate App Feedback`).catch(() => {
      Alert.alert('Email', `Contact us at: ${DEVELOPER_EMAIL}`);
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top disclaimer banner */}
      <View style={[styles.topDisclaimerBanner, { backgroundColor: isDark ? '#2A1200' : '#FFF3E0', borderColor: '#E8830A' }]}>
        <AlertTriangle size={13} color="#E8830A" />
        <Text style={[styles.topDisclaimerText, { color: isDark ? '#F5A642' : '#8B4A00' }]}>
          Unofficial App — Not IRCC / Gov of Canada
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.profileCard, { backgroundColor: colors.surface }]}
        onPress={() => router.push('/settings/profile' as any)}
        activeOpacity={0.8}
      >
        <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.profileAvatarText, { color: colors.textLight }]}>
            {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text }]}>{profile.name || 'Set up your profile'}</Text>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
            {profile.email || 'Tap to add your details'}
          </Text>
        </View>
        <ChevronRight size={20} color={colors.textMuted} />
      </TouchableOpacity>

      {/* Appearance */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Appearance</Text>
        <View style={[styles.themeSelector, { backgroundColor: colors.surface }]}>
          {THEME_OPTIONS.map((option) => {
            const IconComp = option.icon;
            const isActive = themeMode === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.themeOption,
                  { backgroundColor: colors.surfaceAlt },
                  isActive && { backgroundColor: colors.primary },
                ]}
                onPress={() => setTheme(option.key)}
                activeOpacity={0.7}
              >
                <IconComp size={18} color={isActive ? colors.textLight : colors.textSecondary} />
                <Text
                  style={[
                    styles.themeOptionText,
                    { color: colors.textSecondary },
                    isActive && { color: colors.textLight },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Notifications — reminders only */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Notifications</Text>
        <View style={[styles.notifNote, { backgroundColor: isDark ? '#0D1A0D' : '#F1F8F1', borderColor: colors.border }]}>
          <Info size={13} color={colors.textMuted} />
          <Text style={[styles.notifNoteText, { color: colors.textMuted }]}>
            Reminders only — this app does not push draw results or policy updates
          </Text>
        </View>
        <SettingsRow
          colors={colors}
          icon={<Bell size={20} color={colors.warning} />}
          title="General Reminders"
          subtitle="Remind yourself to check official sites for updates"
          rightElement={
            <Switch
              value={reminderNotifications}
              onValueChange={setReminderNotifications}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={reminderNotifications ? colors.primary : '#f4f3f4'}
            />
          }
        />
      </View>

      {/* Contact Us — prominent dedicated page */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Contact</Text>
        <TouchableOpacity
          style={[styles.contactHighlight, { backgroundColor: colors.surface, borderColor: colors.success }]}
          onPress={() => router.push('/settings/contact' as any)}
          activeOpacity={0.8}
        >
          <View style={[styles.contactIconCircle, { backgroundColor: colors.successLight }]}>
            <Mail size={22} color={colors.success} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={[styles.contactTitle, { color: colors.text }]}>Contact Us</Text>
            <Text style={[styles.contactSubtitle, { color: colors.textSecondary }]}>
              Feedback, bug reports, or questions
            </Text>
            <Text style={[styles.emailText, { color: colors.primary }]}>{DEVELOPER_EMAIL}</Text>
          </View>
          <ChevronRight size={20} color={colors.textMuted} />
        </TouchableOpacity>
        <SettingsRow
          colors={colors}
          icon={<MessageSquare size={20} color={colors.primary} />}
          title="Send Feedback / Report Issue"
          subtitle={`Email: ${DEVELOPER_EMAIL}`}
          onPress={handleEmailContact}
        />
      </View>

      {/* Official Resources */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Official Government Resources</Text>
        <View style={[styles.officialNote, { backgroundColor: isDark ? '#0D1520' : '#E3F2FD', borderColor: '#1565C0' }]}>
          <FileText size={13} color="#1565C0" />
          <Text style={[styles.officialNoteText, { color: isDark ? '#90CAF9' : '#0D47A1' }]}>
            This app does not aggregate news. Tap any link to view official information directly on government websites.
          </Text>
        </View>
        <SettingsRow
          colors={colors}
          icon={<TrendingUp size={20} color="#2E7D32" />}
          title="Express Entry Draw Results"
          subtitle="Latest rounds of invitations & CRS cutoffs — canada.ca"
          onPress={() => Linking.openURL('https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/submit-profile/rounds-invitations.html')}
        />
        <SettingsRow
          colors={colors}
          icon={<Globe size={20} color={colors.info} />}
          title="Express Entry Overview"
          subtitle="How Express Entry works — canada.ca"
          onPress={() => Linking.openURL('https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html')}
        />
        <SettingsRow
          colors={colors}
          icon={<FileText size={20} color="#6A1B9A" />}
          title="Official CRS Calculator (IRCC)"
          subtitle="Official points calculator on ircc.canada.ca"
          onPress={() => Linking.openURL('https://ircc.canada.ca/english/immigrate/skilled/crs-tool.asp')}
        />
        <SettingsRow
          colors={colors}
          icon={<MapPin size={20} color="#E65100" />}
          title="Provincial Nominee Programs"
          subtitle="Official PNP guides — canada.ca"
          onPress={() => Linking.openURL('https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees.html')}
        />
        <SettingsRow
          colors={colors}
          icon={<Briefcase size={20} color="#00695C" />}
          title="Federal Skilled Worker Program"
          subtitle="FSW eligibility & requirements — canada.ca"
          onPress={() => Linking.openURL('https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/federal-skilled-workers.html')}
        />
        <SettingsRow
          colors={colors}
          icon={<Users size={20} color={colors.info} />}
          title="Canadian Experience Class"
          subtitle="CEC requirements & process — canada.ca"
          onPress={() => Linking.openURL('https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/canadian-experience-class.html')}
        />
        <SettingsRow
          colors={colors}
          icon={<BookOpen size={20} color="#4527A0" />}
          title="Immigration Levels Plan"
          subtitle="Annual immigration targets — canada.ca"
          onPress={() => Linking.openURL('https://www.canada.ca/en/immigration-refugees-citizenship/news/notices/supplementary-immigration-levels-2024.html')}
        />
        <SettingsRow
          colors={colors}
          icon={<ExternalLink size={20} color={colors.textSecondary} />}
          title="Statistics Canada"
          subtitle="statcan.gc.ca — public datasets"
          onPress={() => Linking.openURL('https://www.statcan.gc.ca')}
        />
        <SettingsRow
          colors={colors}
          icon={<Globe size={20} color="#AD1457" />}
          title="IRCC Website"
          subtitle="canada.ca/en/immigration-refugees-citizenship"
          onPress={() => Linking.openURL('https://www.canada.ca/en/immigration-refugees-citizenship.html')}
        />
      </View>

      {/* Legal */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Legal & Privacy</Text>
        <SettingsRow
          colors={colors}
          icon={<Info size={20} color="#E8830A" />}
          title="About & Full Disclaimer"
          subtitle="Independent app — not a government service"
          onPress={() => router.push('/disclaimer' as any)}
        />
        <SettingsRow
          colors={colors}
          icon={<Shield size={20} color={colors.textSecondary} />}
          title="Privacy Policy"
          subtitle="All data stored locally — no servers"
          onPress={() => Alert.alert(
            'Privacy Policy',
            'CanImmigrate respects your privacy. All profile data is stored locally on your device only. We do not collect, transmit, or store any personal information on external servers. Your CRS calculations and saved data remain private and accessible only to you on this device.',
            [{ text: 'OK' }]
          )}
        />
      </View>

      {/* Full disclaimer block */}
      <View style={[styles.fullDisclaimerBlock, { backgroundColor: isDark ? '#1A0900' : '#FFF8F0', borderColor: '#E8830A' }]}>
        <View style={styles.fullDisclaimerHeader}>
          <AlertTriangle size={16} color="#E8830A" />
          <Text style={[styles.fullDisclaimerHeading, { color: '#E8830A' }]}>IMPORTANT DISCLAIMER</Text>
        </View>
        <Text style={[styles.fullDisclaimerText, { color: isDark ? '#F5A642' : '#7A3500' }]}>
          CanImmigrate is an <Text style={styles.boldText}>independent, unofficial informational app</Text>. It is{' '}
          <Text style={styles.boldText}>NOT affiliated with, endorsed by, or representing</Text> the Government of Canada,
          Immigration Refugees and Citizenship Canada (IRCC), Statistics Canada, or any Canadian federal or provincial
          government agency.{'\n\n'}
          This app does <Text style={styles.boldText}>NOT</Text> provide legal or immigration advice, facilitate
          government applications, or guarantee any immigration outcome. CRS scores shown are{' '}
          <Text style={styles.boldText}>unofficial estimates only</Text>.{'\n\n'}
          Always verify all information directly on{' '}
          <Text
            style={[styles.linkText]}
            onPress={() => Linking.openURL('https://www.canada.ca')}
          >
            canada.ca
          </Text>{' '}
          or{' '}
          <Text
            style={styles.linkText}
            onPress={() => Linking.openURL('https://ircc.canada.ca')}
          >
            ircc.canada.ca
          </Text>
          . Consult a licensed RCIC for personalized advice.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>CanImmigrate — Unofficial CRS Estimator</Text>
        <Text style={[styles.footerSubtext, { color: colors.textMuted }]}>
          Not affiliated with the Government of Canada, IRCC, or any government agency
        </Text>
        <Text style={[styles.footerContact, { color: colors.textMuted }]}>
          {DEVELOPER_EMAIL}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  topDisclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginBottom: 16,
    marginTop: 8,
  },
  topDisclaimerText: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    fontSize: 22,
    fontWeight: '700' as const,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  profileEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  themeSelector: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 6,
    gap: 6,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  notifNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 8,
  },
  notifNoteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: {
    width: 36,
    alignItems: 'center',
  },
  rowContent: {
    flex: 1,
    marginLeft: 8,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  rowSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  contactHighlight: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    gap: 14,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  contactCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  contactIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  contactSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  emailText: {
    fontSize: 13,
    fontWeight: '600' as const,
    textDecorationLine: 'underline' as const,
  },
  fullDisclaimerBlock: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 18,
    marginBottom: 20,
  },
  fullDisclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  fullDisclaimerHeading: {
    fontSize: 12,
    fontWeight: '800' as const,
    letterSpacing: 0.8,
  },
  fullDisclaimerText: {
    fontSize: 13,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '800' as const,
  },
  linkText: {
    fontWeight: '700' as const,
    textDecorationLine: 'underline' as const,
    color: '#E8830A',
  },
  officialNote: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  officialNoteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  footerSubtext: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center' as const,
    lineHeight: 16,
  },
  footerContact: {
    fontSize: 11,
    marginTop: 4,
  },
});
