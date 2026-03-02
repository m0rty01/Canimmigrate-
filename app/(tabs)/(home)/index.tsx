import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  Circle,
  Calculator,
  Map,
  Sparkles,
  ExternalLink,
  AlertTriangle,
  BookOpen,
  MessageCircle,
} from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useUser } from '@/providers/UserProvider';

const OFFICIAL_DRAWS_URL =
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/submit-profile/rounds-invitations.html';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const {
    profile,
    crsBreakdown,
    tips,
    checklist,
    checklistProgress,
    toggleChecklistItem,
    onboardingDone,
    disclaimerAccepted,
    isLoading,
  } = useUser();

  const SCORE_CATEGORIES = useMemo(() => [
    { key: 'age' as const, label: 'Age', color: colors.scoreAge, max: 110 },
    { key: 'education' as const, label: 'Education', color: colors.scoreEducation, max: 150 },
    { key: 'firstLanguage' as const, label: 'Language', color: colors.scoreLanguage, max: 136 },
    { key: 'canadianWorkExperience' as const, label: 'Work Exp', color: colors.scoreWork, max: 80 },
    { key: 'skillTransferability' as const, label: 'Skills', color: colors.scoreSkill, max: 100 },
    { key: 'additionalPoints' as const, label: 'Additional', color: colors.scoreAdditional, max: 600 },
  ], [colors]);

  const scoreAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) return;
    if (!disclaimerAccepted) {
      router.push('/disclaimer' as any);
    } else if (!onboardingDone) {
      router.push('/onboarding' as any);
    }
  }, [disclaimerAccepted, onboardingDone, isLoading]);

  useEffect(() => {
    Animated.timing(scoreAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [crsBreakdown.total]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const topTips = tips.slice(0, 3);
  const visibleChecklist = checklist;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      {/* Persistent disclaimer banner */}
      <View style={[styles.persistentBanner, { backgroundColor: isDark ? '#2A1200' : '#FFF3E0', borderBottomColor: '#E8830A' }]}>
        <AlertTriangle size={12} color="#E8830A" />
        <Text style={styles.persistentBannerText}>
          Unofficial — Not IRCC / Gov of Canada — Verify on canada.ca
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>
              {profile.name ? `Hello, ${profile.name}` : 'Welcome'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>CRS Estimator & General Reference</Text>
          </View>
          <View style={[styles.headerBadge, { backgroundColor: colors.errorLight }]}>
            <Text style={styles.headerBadgeText}>🍁</Text>
          </View>
        </View>

        {/* CRS Score Card */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/calculator' as any)}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scoreCard}
          >
            <View style={styles.scoreCardHeader}>
              <Text style={styles.scoreLabel}>Estimated CRS Score</Text>
              <View style={styles.scoreBadge}>
                <TrendingUp size={14} color={colors.textLight} />
                <Text style={[styles.scoreBadgeText, { color: colors.textLight }]}>
                  {crsBreakdown.total >= 490 ? 'Competitive' : 'Building'}
                </Text>
              </View>
            </View>
            <Animated.View style={{ opacity: scoreAnim, transform: [{ scale: scoreAnim }] }}>
              <Text style={[styles.scoreNumber, { color: colors.textLight }]}>{crsBreakdown.total}</Text>
            </Animated.View>
            <Text style={styles.scoreMax}>out of 1,200 points</Text>

            <View style={styles.scoreBreakdownMini}>
              {SCORE_CATEGORIES.map((cat) => {
                const value = crsBreakdown[cat.key];
                const pct = cat.max > 0 ? Math.min((value / cat.max) * 100, 100) : 0;
                return (
                  <View key={cat.key} style={styles.miniBarContainer}>
                    <View style={styles.miniBarBg}>
                      <View
                        style={[
                          styles.miniBarFill,
                          { width: `${pct}%`, backgroundColor: cat.color },
                        ]}
                      />
                    </View>
                    <Text style={styles.miniBarLabel}>{cat.label}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.estimateWarning}>
              <Text style={styles.estimateWarningText}>
                ⚠ Unofficial estimate only — not an official score
              </Text>
            </View>

            {!profile.profileCompleted && (
              <View style={styles.setupPrompt}>
                <Text style={[styles.setupPromptText, { color: colors.textLight }]}>
                  Complete your profile for a better estimate →
                </Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.surface }]} onPress={() => router.push('/calculator' as any)}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.infoLight }]}>
              <Calculator size={20} color={colors.info} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>CRS Estimator</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.surface }]} onPress={() => router.push('/pathways' as any)}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.successLight }]}>
              <Map size={20} color={colors.success} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Pathways</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.surface }]} onPress={() => router.push('/process' as any)}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.warningLight }]}>
              <BookOpen size={20} color={colors.warning} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Process</Text>
          </TouchableOpacity>
        </View>

        {/* Official Draws Link — replaces in-app draws display */}
        <TouchableOpacity
          style={[styles.officialDrawsCard, { backgroundColor: isDark ? '#0D1F0D' : '#F0FFF0', borderColor: '#2E7D32' }]}
          onPress={() => Linking.openURL(OFFICIAL_DRAWS_URL)}
          activeOpacity={0.8}
          testID="official-draws-btn"
        >
          <View style={styles.officialDrawsLeft}>
            <View style={[styles.officialDrawsIcon, { backgroundColor: '#2E7D32' }]}>
              <ExternalLink size={18} color="#FFFFFF" />
            </View>
            <View style={styles.officialDrawsText}>
              <Text style={[styles.officialDrawsTitle, { color: isDark ? '#81C784' : '#1B5E20' }]}>
                View Latest Express Entry Draws
              </Text>
              <Text style={[styles.officialDrawsSubtitle, { color: isDark ? '#66BB6A' : '#2E7D32' }]}>
                Opens canada.ca — official IRCC source
              </Text>
            </View>
          </View>
          <ExternalLink size={16} color={isDark ? '#81C784' : '#2E7D32'} />
        </TouchableOpacity>

        {/* General Q&A Reference banner */}
        <TouchableOpacity
          style={[styles.qaRefBanner, { backgroundColor: colors.secondary }]}
          onPress={() => router.push('/ai-chat' as any)}
          activeOpacity={0.85}
          testID="qa-ref-btn"
        >
          <View style={styles.qaRefLeft}>
            <View style={[styles.qaRefIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <MessageCircle size={20} color={colors.textLight} />
            </View>
            <View>
              <Text style={[styles.qaRefTitle, { color: colors.textLight }]}>General Q&amp;A Reference</Text>
              <Text style={[styles.qaRefSubtitle, { color: 'rgba(255,255,255,0.75)' }]}>Not official advice — general info only</Text>
            </View>
          </View>
          <Sparkles size={18} color={colors.textLight} />
        </TouchableOpacity>

        {/* Tips */}
        {topTips.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <View style={styles.sectionHeader}>
              <Sparkles size={18} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Score Improvement Tips</Text>
            </View>
            <View style={[styles.sectionDisclaimer, { backgroundColor: isDark ? '#1A1200' : '#FFFDE7', borderColor: '#F9A825' }]}>
              <Text style={[styles.sectionDisclaimerText, { color: isDark ? '#FFD54F' : '#795548' }]}>
                General reference from public IRCC formula — not official advice
              </Text>
            </View>
            {topTips.map((tip) => (
              <View key={tip.id} style={[styles.tipCard, { backgroundColor: colors.surfaceWarm }]}>
                <View style={styles.tipHeader}>
                  <Lightbulb size={16} color={colors.accent} />
                  <Text style={[styles.tipTitle, { color: colors.text }]}>{tip.title}</Text>
                  <View style={[styles.tipGain, { backgroundColor: colors.successLight }]}>
                    <Text style={[styles.tipGainText, { color: colors.success }]}>+{tip.potentialGain}</Text>
                  </View>
                </View>
                <Text style={[styles.tipDescription, { color: colors.textSecondary }]}>{tip.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Checklist */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <CheckCircle2 size={18} color={colors.success} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>General Checklist</Text>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {checklistProgress.completed}/{checklistProgress.total}
            </Text>
          </View>
          <View style={[styles.sectionDisclaimer, { backgroundColor: isDark ? '#1A1200' : '#FFFDE7', borderColor: '#F9A825' }]}>
            <Text style={[styles.sectionDisclaimerText, { color: isDark ? '#FFD54F' : '#795548' }]}>
              General reference checklist only — not official requirements
            </Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceAlt }]}>
            <View
              style={[styles.progressBarFill, { width: `${checklistProgress.percentage}%`, backgroundColor: colors.success }]}
            />
          </View>
          {visibleChecklist.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.checklistItem, { borderBottomColor: colors.border }]}
              onPress={() => toggleChecklistItem(item.id)}
              activeOpacity={0.7}
            >
              {item.completed ? (
                <CheckCircle2 size={22} color={colors.success} />
              ) : (
                <Circle size={22} color={colors.textMuted} />
              )}
              <Text
                style={[
                  styles.checklistText,
                  { color: colors.text },
                  item.completed && { textDecorationLine: 'line-through' as const, color: colors.textMuted },
                ]}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom disclaimer */}
        <View style={[styles.bottomDisclaimer, { backgroundColor: isDark ? '#1A0A00' : '#FFF8F0', borderColor: '#E8830A' }]}>
          <AlertTriangle size={14} color="#E8830A" />
          <Text style={[styles.bottomDisclaimerText, { color: isDark ? '#F5A642' : '#8B4A00' }]}>
            CanImmigrate is an independent, unofficial app. Not affiliated with IRCC, the Government of Canada, or any government body. Always verify on{' '}
            <Text
              style={styles.bottomDisclaimerLink}
              onPress={() => Linking.openURL('https://www.canada.ca')}
            >
              canada.ca
            </Text>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  headerBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadgeText: {
    fontSize: 24,
  },
  scoreCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  scoreCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600' as const,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  scoreNumber: {
    fontSize: 72,
    fontWeight: '900' as const,
    letterSpacing: -2,
    lineHeight: 80,
  },
  scoreMax: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 20,
  },
  scoreBreakdownMini: {
    gap: 6,
  },
  miniBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: 6,
    borderRadius: 3,
  },
  miniBarLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    width: 56,
    textAlign: 'right' as const,
  },
  estimateWarning: {
    marginTop: 16,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  estimateWarningText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  setupPrompt: {
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    padding: 12,
  },
  setupPromptText: {
    fontSize: 13,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickAction: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  officialDrawsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 14,
  },
  officialDrawsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  officialDrawsIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  officialDrawsText: {
    flex: 1,
  },
  officialDrawsTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  officialDrawsSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  qaRefBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  qaRefLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qaRefIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qaRefTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  qaRefSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    flex: 1,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  sectionDisclaimer: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  sectionDisclaimerText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  tipCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    flex: 1,
  },
  tipGain: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tipGainText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  tipDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 24,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    marginBottom: 14,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  checklistText: {
    fontSize: 14,
    flex: 1,
  },
  bottomDisclaimer: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 4,
  },
  bottomDisclaimerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  bottomDisclaimerLink: {
    fontWeight: '700' as const,
    textDecorationLine: 'underline' as const,
  },
});
