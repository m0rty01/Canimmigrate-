import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calculator,
  Map,
  Shield,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/providers/ThemeProvider';
import { useUser } from '@/providers/UserProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  emoji: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  gradientColors: [string, string];
  disclaimer?: string;
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { completeOnboarding } = useUser();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const SLIDES: OnboardingSlide[] = [
    {
      id: '1',
      emoji: '⚠️',
      title: 'Important\nDisclaimer',
      description: 'CanImmigrate is an INDEPENDENT, UNOFFICIAL informational reference app. It is NOT affiliated with, endorsed by, or authorized by IRCC, the Government of Canada, or any government body. This app does NOT provide official advice or facilitate applications.',
      icon: AlertTriangle,
      gradientColors: ['#B34700', '#8B3300'],
      disclaimer: 'Always verify information on canada.ca',
    },
    {
      id: '2',
      emoji: '🍁',
      title: 'CRS Score\nEstimator',
      description: 'Estimate your Comprehensive Ranking System score based on the publicly available IRCC formula. For reference only — not an official score. Always check ircc.canada.ca for your actual profile.',
      icon: Calculator,
      gradientColors: [colors.primary, colors.primaryDark],
      disclaimer: 'Estimation only — not an official CRS score',
    },
    {
      id: '3',
      emoji: '📋',
      title: 'General\nReference Guides',
      description: 'Explore general overviews of Canadian immigration pathways derived from publicly available canada.ca sources. Content is for research purposes only — consult a licensed RCIC for personalized advice.',
      icon: Map,
      gradientColors: ['#1B6B4A', '#155236'],
      disclaimer: 'General info only — consult a licensed RCIC',
    },
    {
      id: '4',
      emoji: '🔒',
      title: 'Your Privacy\nMatters',
      description: 'All your data stays on your device. We do not collect, transmit, or store any personal information on external servers. Your calculations and checklist are private and local only.',
      icon: Shield,
      gradientColors: [isDark ? '#1A2035' : '#2C3E50', isDark ? '#0D1525' : '#1A252F'],
    },
  ];

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = () => {
    completeOnboarding();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/');
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    const IconComp = item.icon;
    return (
      <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
        <LinearGradient
          colors={item.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.slideGradient}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.emoji}>{item.emoji}</Text>
          </View>
          <IconComp size={44} color="rgba(255,255,255,0.2)" />
          {item.disclaimer && (
            <View style={styles.slideDisclaimerBadge}>
              <Text style={styles.slideDisclaimerText}>{item.disclaimer}</Text>
            </View>
          )}
        </LinearGradient>
        <View style={styles.slideContent}>
          <Text style={[styles.slideTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.slideDescription, { color: colors.textSecondary }]}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: colors.background }]}>
      <View style={styles.topBar}>
        <View style={[styles.unofficialBadge, { backgroundColor: isDark ? '#2A1A0A' : '#FFF3E0', borderColor: '#E8830A' }]}>
          <AlertTriangle size={11} color="#E8830A" />
          <Text style={styles.unofficialBadgeText}>UNOFFICIAL APP — NOT IRCC</Text>
        </View>
        {!isLast && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(newIndex);
        }}
      />

      <View style={styles.bottomSection}>
        <View style={styles.dots}>
          {SLIDES.map((_, idx) => {
            const inputRange = [
              (idx - 1) * SCREEN_WIDTH,
              idx * SCREEN_WIDTH,
              (idx + 1) * SCREEN_WIDTH,
            ];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={idx}
                style={[
                  styles.dot,
                  { width: dotWidth, opacity: dotOpacity, backgroundColor: colors.primary },
                ]}
              />
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.nextButton,
            { backgroundColor: colors.primary, shadowColor: colors.primary },
            isLast && styles.getStartedButton,
          ]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          {isLast ? (
            <Text style={[styles.getStartedText, { color: colors.textLight }]}>Get Started</Text>
          ) : (
            <ArrowRight size={24} color={colors.textLight} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  unofficialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  unofficialBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 0.6,
    color: '#E8830A',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  slideGradient: {
    width: SCREEN_WIDTH - 64,
    height: 260,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 8,
    paddingBottom: 12,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 44,
  },
  slideDisclaimerBadge: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 4,
  },
  slideDisclaimerText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  slideTitle: {
    fontSize: 30,
    fontWeight: '800' as const,
    textAlign: 'center' as const,
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 14,
  },
  slideDescription: {
    fontSize: 15,
    textAlign: 'center' as const,
    lineHeight: 23,
  },
  bottomSection: {
    paddingHorizontal: 32,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 28,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  getStartedButton: {
    width: undefined,
    paddingHorizontal: 40,
    borderRadius: 32,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
});
