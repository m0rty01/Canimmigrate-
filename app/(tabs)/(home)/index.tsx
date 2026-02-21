import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  Circle,
  Newspaper,
  Calculator,
  Map,
  Sparkles,
  MessageCircle,
} from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useUser } from '@/providers/UserProvider';
import { newsItems, drawHistory } from '@/mocks/news';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const {
    profile,
    crsBreakdown,
    tips,
    checklist,
    checklistProgress,
    toggleChecklistItem,
    onboardingDone,
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
    if (!onboardingDone && !isLoading) {
      router.push('/onboarding' as any);
    }
  }, [onboardingDone, isLoading]);

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

  const recentDraws = drawHistory.slice(0, 3);
  const topTips = tips.slice(0, 3);
  const visibleChecklist = checklist;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>
              {profile.name ? `Hello, ${profile.name}` : 'Welcome back'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your immigration journey</Text>
          </View>
          <View style={[styles.headerBadge, { backgroundColor: colors.errorLight }]}>
            <Text style={styles.headerBadgeText}>🍁</Text>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/calculator' as any)}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scoreCard}
          >
            <View style={styles.scoreCardHeader}>
              <Text style={styles.scoreLabel}>Your CRS Score</Text>
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

            {!profile.profileCompleted && (
              <View style={styles.setupPrompt}>
                <Text style={[styles.setupPromptText, { color: colors.textLight }]}>
                  Complete your profile for an accurate score →
                </Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.quickActions}>
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.surface }]} onPress={() => router.push('/calculator' as any)}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.infoLight }]}>
              <Calculator size={20} color={colors.info} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Calculate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.surface }]} onPress={() => router.push('/pathways' as any)}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.successLight }]}>
              <Map size={20} color={colors.success} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Pathways</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.surface }]} onPress={() => router.push('/news' as any)}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.warningLight }]}>
              <Newspaper size={20} color={colors.warning} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>News</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.aiChatBanner, { backgroundColor: colors.secondary }]}
          onPress={() => router.push('/ai-chat' as any)}
          activeOpacity={0.85}
          testID="ai-chat-btn"
        >
          <View style={styles.aiChatLeft}>
            <View style={[styles.aiChatIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <MessageCircle size={20} color={colors.textLight} />
            </View>
            <View>
              <Text style={[styles.aiChatTitle, { color: colors.textLight }]}>AI Immigration Assistant</Text>
              <Text style={[styles.aiChatSubtitle, { color: 'rgba(255,255,255,0.75)' }]}>Get personalized guidance</Text>
            </View>
          </View>
          <Sparkles size={18} color={colors.textLight} />
        </TouchableOpacity>

        {topTips.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <View style={styles.sectionHeader}>
              <Sparkles size={18} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Tips to Improve</Text>
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

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Draws</Text>
          </View>
          {recentDraws.map((draw, idx) => (
            <View key={`${draw.date}-${draw.type}-${idx}`} style={[styles.drawCard, { borderBottomColor: colors.border }]}>
              <View style={styles.drawInfo}>
                <Text style={[styles.drawType, { color: colors.text }]}>{draw.type}</Text>
                <Text style={[styles.drawDate, { color: colors.textMuted }]}>{draw.date}</Text>
              </View>
              <View style={styles.drawStats}>
                <View style={styles.drawStat}>
                  <Text style={[styles.drawStatValue, { color: colors.primary }]}>{draw.score}</Text>
                  <Text style={[styles.drawStatLabel, { color: colors.textMuted }]}>CRS</Text>
                </View>
                <View style={[styles.drawStatDivider, { backgroundColor: colors.border }]} />
                <View style={styles.drawStat}>
                  <Text style={[styles.drawStatValue, { color: colors.primary }]}>{draw.invitations.toLocaleString()}</Text>
                  <Text style={[styles.drawStatLabel, { color: colors.textMuted }]}>ITAs</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <CheckCircle2 size={18} color={colors.success} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Checklist</Text>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {checklistProgress.completed}/{checklistProgress.total}
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
    fontSize: 15,
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
  setupPrompt: {
    marginTop: 16,
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
    marginBottom: 24,
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
    fontSize: 12,
    fontWeight: '600' as const,
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
    marginBottom: 14,
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
  drawCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  drawInfo: {
    flex: 1,
  },
  drawType: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  drawDate: {
    fontSize: 12,
    marginTop: 2,
  },
  drawStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  drawStat: {
    alignItems: 'center',
  },
  drawStatValue: {
    fontSize: 16,
    fontWeight: '800' as const,
  },
  drawStatLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  drawStatDivider: {
    width: 1,
    height: 24,
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
  aiChatBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  aiChatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiChatIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiChatTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  aiChatSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
});
