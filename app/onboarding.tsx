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
  Bell,
  ArrowRight,
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
      emoji: '🍁',
      title: 'Welcome to\nCanImmigrate+',
      description: 'Your comprehensive companion for navigating the Canadian immigration journey with confidence.',
      icon: Map,
      gradientColors: [colors.primary, colors.primaryDark],
    },
    {
      id: '2',
      emoji: '📊',
      title: 'Smart CRS\nCalculator',
      description: 'Calculate your Comprehensive Ranking System score, simulate what-if scenarios, and discover ways to improve.',
      icon: Calculator,
      gradientColors: [colors.secondary, isDark ? '#0D1B2E' : '#152A45'],
    },
    {
      id: '3',
      emoji: '🔔',
      title: 'Stay Informed\n& Prepared',
      description: 'Get the latest draw results, policy updates, and personalized tips to keep your immigration plan on track.',
      icon: Bell,
      gradientColors: ['#1B6B4A', colors.success],
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
          <IconComp size={48} color="rgba(255,255,255,0.2)" />
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
        <View style={styles.topBarSpace} />
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
  topBarSpace: {
    width: 60,
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
    height: 280,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 48,
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    textAlign: 'center' as const,
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: 16,
    textAlign: 'center' as const,
    lineHeight: 24,
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
