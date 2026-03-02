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
import {
  Bell,
  Shield,
  Info,
  ChevronRight,
  FileText,
  ExternalLink,
  Mail,
  Moon,
  Sun,
  Smartphone,
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
  const { profile } = useUser();
  const { colors, themeMode, setTheme, isDark } = useTheme();
  const [drawNotifications, setDrawNotifications] = useState(true);
  const [policyNotifications, setPolicyNotifications] = useState(true);
  const [reminderNotifications, setReminderNotifications] = useState(false);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
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

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Notifications</Text>
        <SettingsRow
          colors={colors}
          icon={<Bell size={20} color={colors.primary} />}
          title="Express Entry Draws"
          subtitle="Get notified when new draws occur"
          rightElement={
            <Switch
              value={drawNotifications}
              onValueChange={setDrawNotifications}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={drawNotifications ? colors.primary : '#f4f3f4'}
            />
          }
        />
        <SettingsRow
          colors={colors}
          icon={<FileText size={20} color={colors.info} />}
          title="Policy Changes"
          subtitle="Important immigration policy updates"
          rightElement={
            <Switch
              value={policyNotifications}
              onValueChange={setPolicyNotifications}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={policyNotifications ? colors.primary : '#f4f3f4'}
            />
          }
        />
        <SettingsRow
          colors={colors}
          icon={<Bell size={20} color={colors.warning} />}
          title="Reminders"
          subtitle="Document expiry and deadline reminders"
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

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Support</Text>
        <SettingsRow
          colors={colors}
          icon={<Mail size={20} color={colors.success} />}
          title="Contact Us"
          subtitle="Got questions / suggestions / need help with anything else? email me!"
          onPress={() => Linking.openURL('mailto:ravijha97.01@gmail.com')}
        />
        <SettingsRow
          colors={colors}
          icon={<ExternalLink size={20} color={colors.info} />}
          title="IRCC Official Website"
          onPress={() => Linking.openURL('https://www.canada.ca/en/immigration-refugees-citizenship.html')}
        />
      </View>

      <View style={[styles.disclaimerBanner, { backgroundColor: isDark ? '#2A1A0A' : '#FFF8F0', borderColor: '#E8830A' }]}>
        <Info size={18} color="#E8830A" />
        <Text style={[styles.disclaimerBannerText, { color: isDark ? '#F5A642' : '#8B4A00' }]}>
          CanImmigrate is an{' '}
          <Text style={styles.disclaimerBold}>independent, unofficial informational app</Text>.
          {' '}Not affiliated with, endorsed by, or representing the Government of Canada, IRCC, or any Canadian government agency.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Legal</Text>
        <SettingsRow
          colors={colors}
          icon={<Info size={20} color="#E8830A" />}
          title="About & Disclaimer"
          subtitle="Independent app — not a government service"
          onPress={() => router.push('/disclaimer' as any)}
        />
        <SettingsRow
          colors={colors}
          icon={<Shield size={20} color={colors.textSecondary} />}
          title="Privacy Policy"
          onPress={() => Alert.alert(
            'Privacy Policy',
            'CanImmigrate respects your privacy. All profile data is stored locally on your device. We do not collect, transmit, or store any personal information on external servers. Your CRS calculations and saved scenarios remain private and accessible only to you.'
          )}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>CanImmigrate v1.0.0</Text>
        <Text style={[styles.footerSubtext, { color: colors.textMuted }]}>
          Independent app — Not affiliated with the Government of Canada, IRCC, or any government agency
        </Text>
      </View>

      <View style={{ height: 24 }} />
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
  disclaimerBanner: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 4,
  },
  disclaimerBannerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  disclaimerBold: {
    fontWeight: '700' as const,
  },
});
