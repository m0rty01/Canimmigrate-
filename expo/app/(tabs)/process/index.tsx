import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Linking,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Briefcase,
  MapPin,
  Sparkles,
  CheckCircle2,
  FileText,
  Clock,
  DollarSign,
  Building2,
  Mail,
  Globe,
  Users,
  Heart,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Send,
  Bot,
  User as UserIcon,
} from 'lucide-react-native';
import { generateText } from '@rork-ai/toolkit-sdk';
import { useTheme } from '@/providers/ThemeProvider';
import { useUser } from '@/providers/UserProvider';
import { useMutation } from '@tanstack/react-query';

type StepId = 'welcome' | 'education' | 'work' | 'relocation' | 'preferences' | 'analyzing' | 'results' | 'chat';

interface ProfileAnswers {
  fieldOfStudy: string;
  highestEducation: string;
  yearsOfExperience: string;
  currentOccupation: string;
  skills: string;
  willingToRelocate: boolean | null;
  preferredProvinces: string[];
  budgetRange: string;
  familySize: string;
  languageAbility: string;
  interests: string;
  genuineBackground: string;
  hasCanadianConnection: boolean | null;
  canadianConnectionDetails: string;
}

interface PathwayResult {
  recommendedPathway: string;
  matchScore: string;
  whyThisPathway: string;
  eligibility: string[];
  detailedProcess: string[];
  timeline: string[];
  documents: string[];
  employers: { name: string; email: string; sector: string; location: string }[];
  estimatedCosts: string[];
  additionalTips: string[];
  alternativePathways: string[];
}

const PROVINCES = [
  'Ontario', 'British Columbia', 'Alberta', 'Manitoba',
  'Saskatchewan', 'Nova Scotia', 'New Brunswick',
  'Newfoundland & Labrador', 'Prince Edward Island',
  'Any Province',
];

const EDUCATION_LEVELS = [
  'High School', 'Diploma / Certificate', 'Bachelor\'s Degree',
  'Master\'s Degree', 'PhD / Doctorate', 'Trade Certification',
];

const BUDGET_RANGES = [
  'Under CAD $10,000', 'CAD $10,000 - $25,000',
  'CAD $25,000 - $50,000', 'Over CAD $50,000',
];

const defaultAnswers: ProfileAnswers = {
  fieldOfStudy: '',
  highestEducation: '',
  yearsOfExperience: '',
  currentOccupation: '',
  skills: '',
  willingToRelocate: null,
  preferredProvinces: [],
  budgetRange: '',
  familySize: '',
  languageAbility: '',
  interests: '',
  genuineBackground: '',
  hasCanadianConnection: null,
  canadianConnectionDetails: '',
};

export default function ProcessScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { profile, crsBreakdown } = useUser();

  const [currentStep, setCurrentStep] = useState<StepId>('welcome');
  const [answers, setAnswers] = useState<ProfileAnswers>(defaultAnswers);
  const [result, setResult] = useState<PathwayResult | null>(null);
  const [selectedPathway, setSelectedPathway] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const steps: StepId[] = ['welcome', 'education', 'work', 'relocation', 'preferences', 'analyzing', 'results'];

  const stepIndex = steps.indexOf(currentStep);
  const progress = currentStep === 'chat' ? 1 : stepIndex / (steps.length - 1);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const animateTransition = useCallback((next: StepId) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(next);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  }, [fadeAnim]);

  const updateAnswer = useCallback(<K extends keyof ProfileAnswers>(key: K, value: ProfileAnswers[K]) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleProvince = useCallback((province: string) => {
    setAnswers(prev => {
      const current = prev.preferredProvinces;
      if (province === 'Any Province') {
        return { ...prev, preferredProvinces: current.includes('Any Province') ? [] : ['Any Province'] };
      }
      const filtered = current.filter(p => p !== 'Any Province');
      if (filtered.includes(province)) {
        return { ...prev, preferredProvinces: filtered.filter(p => p !== province) };
      }
      return { ...prev, preferredProvinces: [...filtered, province] };
    });
  }, []);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const prompt = buildAnalysisPrompt();
      console.log('[Process] Sending analysis prompt to AI');
      const response = await generateText({ messages: [{ role: 'user', content: prompt }] });
      console.log('[Process] Received AI response, length:', response.length);
      return parseAIResponse(response);
    },
    onSuccess: (data) => {
      setResult(data);
      animateTransition('results');
    },
    onError: (err) => {
      console.error('[Process] AI analysis failed:', err);
      animateTransition('preferences');
    },
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const context = result ? `The user was recommended the "${result.recommendedPathway}" pathway. ` : '';
      const history = chatMessages.map(m => `${m.role}: ${m.text}`).join('\n');
      const prompt = `You are CanImmigrate+ immigration advisor. ${context}
User profile: Field: ${answers.fieldOfStudy}, Education: ${answers.highestEducation}, Occupation: ${answers.currentOccupation}, Experience: ${answers.yearsOfExperience} years.
Previous conversation:
${history}
User: ${message}

Provide helpful, specific immigration advice. Be concise but thorough. Include specific details like employer names, contact info, or resources when relevant. Format your response clearly.`;
      const response = await generateText({ messages: [{ role: 'user', content: prompt }] });
      return response;
    },
    onSuccess: (response, message) => {
      setChatMessages(prev => [
        ...prev,
        { role: 'user', text: message },
        { role: 'assistant', text: cleanText(response) },
      ]);
    },
  });

  const buildAnalysisPrompt = useCallback(() => {
    const profileData = profile.profileCompleted
      ? `CRS Score: ${crsBreakdown.total}, Age: ${profile.age}, Canadian Work Exp: ${profile.canadianWorkExperience} years, Foreign Work Exp: ${profile.foreignWorkExperience} years, Has Job Offer: ${profile.hasJobOffer}, Has PNP: ${profile.hasPNP}.`
      : 'No CRS profile completed yet.';

    return `You are an expert Canadian immigration consultant. Analyze this applicant's profile and recommend the BEST matching PR pathway.

APPLICANT PROFILE:
- Field of Study: ${answers.fieldOfStudy}
- Highest Education: ${answers.highestEducation}
- Current Occupation: ${answers.currentOccupation}
- Years of Experience: ${answers.yearsOfExperience}
- Key Skills: ${answers.skills}
- Willing to Relocate: ${answers.willingToRelocate ? 'Yes' : 'No'}
- Preferred Provinces: ${answers.preferredProvinces.join(', ') || 'Not specified'}
- Budget: ${answers.budgetRange}
- Family Size: ${answers.familySize}
- Language Ability: ${answers.languageAbility}
- Interests: ${answers.interests}
- Background: ${answers.genuineBackground}
- Canadian Connection: ${answers.hasCanadianConnection ? answers.canadianConnectionDetails : 'None'}
- ${profileData}

INSTRUCTIONS: Respond in this EXACT JSON format (no markdown, no code blocks, just raw JSON):
{
  "recommendedPathway": "Name of the best matching PR program",
  "matchScore": "percentage like 85%",
  "whyThisPathway": "2-3 sentences explaining why this is the best match for BOTH the applicant AND the program's goals of attracting suitable candidates who will benefit the community",
  "eligibility": ["detailed eligibility requirement 1", "requirement 2", "requirement 3", "requirement 4", "requirement 5"],
  "detailedProcess": ["Step 1: detailed description", "Step 2: detailed description", "Step 3", "Step 4", "Step 5", "Step 6", "Step 7", "Step 8"],
  "timeline": ["Phase 1 (Month 1-2): what to do", "Phase 2 (Month 3-4): what to do", "Phase 3 (Month 5-8): what to do", "Phase 4 (Month 9-12): what to do"],
  "documents": ["Document 1 with details", "Document 2", "Document 3", "Document 4", "Document 5", "Document 6", "Document 7", "Document 8"],
  "employers": [
    {"name": "Real Company Name", "email": "hr@company.com or careers@company.com", "sector": "Industry", "location": "City, Province"},
    {"name": "Company 2", "email": "email", "sector": "sector", "location": "location"},
    {"name": "Company 3", "email": "email", "sector": "sector", "location": "location"},
    {"name": "Company 4", "email": "email", "sector": "sector", "location": "location"},
    {"name": "Company 5", "email": "email", "sector": "sector", "location": "location"}
  ],
  "estimatedCosts": ["Item: CAD $amount", "Item 2: CAD $amount"],
  "additionalTips": ["Tip 1 specific to their profile", "Tip 2", "Tip 3", "Tip 4"],
  "alternativePathways": ["Alternative 1 with brief explanation", "Alternative 2"]
}

IMPORTANT: 
- Suggest REAL Canadian employers in the applicant's field who are known to hire immigrants, with their actual career/HR email addresses.
- Match the pathway to what the PR program is specifically designed to attract — choose the program where this applicant would be the most valuable contribution to the community.
- Be specific about the applicant's field, not generic.
- Include actual processing times and costs from IRCC.`;
  }, [answers, profile, crsBreakdown]);

  const parseAIResponse = useCallback((text: string): PathwayResult => {
    try {
      let cleaned = text.trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }
      const parsed = JSON.parse(cleaned);
      return {
        recommendedPathway: parsed.recommendedPathway || 'Express Entry',
        matchScore: parsed.matchScore || '75%',
        whyThisPathway: parsed.whyThisPathway || 'Based on your profile analysis.',
        eligibility: parsed.eligibility || [],
        detailedProcess: parsed.detailedProcess || [],
        timeline: parsed.timeline || [],
        documents: parsed.documents || [],
        employers: (parsed.employers || []).map((e: Record<string, string>) => ({
          name: e.name || '',
          email: e.email || '',
          sector: e.sector || '',
          location: e.location || '',
        })),
        estimatedCosts: parsed.estimatedCosts || [],
        additionalTips: parsed.additionalTips || [],
        alternativePathways: parsed.alternativePathways || [],
      };
    } catch (e) {
      console.error('[Process] Failed to parse AI response:', e);
      return {
        recommendedPathway: 'Express Entry - Federal Skilled Worker',
        matchScore: '70%',
        whyThisPathway: 'Based on your profile, Express Entry appears to be a strong pathway. Please consult an RCIC for personalized advice.',
        eligibility: ['Minimum CLB 7 in all language abilities', 'At least 1 year skilled work experience', 'Educational Credential Assessment (ECA)', 'Proof of settlement funds', 'Score above CRS draw cutoff'],
        detailedProcess: ['Take IELTS/CELPIP language test', 'Get Educational Credential Assessment', 'Create Express Entry profile', 'Enter candidate pool', 'Receive ITA from draw', 'Submit PR application', 'Provide biometrics', 'Complete medical exam'],
        timeline: ['Month 1-2: Language test & ECA', 'Month 3-4: Create profile & enter pool', 'Month 5-6: Wait for ITA', 'Month 7-12: Submit application & processing'],
        documents: ['Valid passport', 'Language test results', 'ECA report', 'Work reference letters', 'Proof of funds', 'Police clearance', 'Medical exam results', 'Digital photos'],
        employers: [],
        estimatedCosts: ['Application fee: CAD $1,365', 'Language test: CAD $300-400', 'ECA: CAD $200-300', 'Medical exam: CAD $200-450', 'Police clearance: varies'],
        additionalTips: ['Start language prep early', 'Gather documents in parallel', 'Consider provincial nominations for extra 600 points'],
        alternativePathways: ['Provincial Nominee Programs', 'Atlantic Immigration Program'],
      };
    }
  }, []);

  const cleanText = useCallback((text: string): string => {
    let cleaned = text.replace(/```[\w]*\n?/g, '');
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
    cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
    cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    return cleaned.trim();
  }, []);

  const handleStartAnalysis = useCallback(() => {
    animateTransition('analyzing');
    analyzeMutation.mutate();
  }, [animateTransition, analyzeMutation]);

  const handleSelectPathway = useCallback(() => {
    setSelectedPathway(true);
    setExpandedSection('eligibility');
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const handleChatSend = useCallback(() => {
    const trimmed = chatInput.trim();
    if (!trimmed || chatMutation.isPending) return;
    chatMutation.mutate(trimmed);
    setChatInput('');
  }, [chatInput, chatMutation]);

  const handleReset = useCallback(() => {
    setAnswers(defaultAnswers);
    setResult(null);
    setSelectedPathway(false);
    setChatMessages([]);
    setExpandedSection(null);
    animateTransition('welcome');
  }, [animateTransition]);

  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 'education':
        return answers.fieldOfStudy.length > 0 && answers.highestEducation.length > 0;
      case 'work':
        return answers.currentOccupation.length > 0 && answers.yearsOfExperience.length > 0;
      case 'relocation':
        return answers.willingToRelocate !== null;
      case 'preferences':
        return answers.genuineBackground.length > 0;
      default:
        return true;
    }
  }, [currentStep, answers]);

  const renderProgressBar = () => (
    <View style={[styles.progressContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={[styles.progressTrack, { backgroundColor: colors.surfaceAlt }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.primary,
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      {currentStep !== 'welcome' && currentStep !== 'analyzing' && currentStep !== 'results' && currentStep !== 'chat' && (
        <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
          Step {stepIndex} of {steps.length - 2}
        </Text>
      )}
    </View>
  );

  const renderChip = (label: string, selected: boolean, onPress: () => void) => (
    <TouchableOpacity
      key={label}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, { color: selected ? colors.textLight : colors.text }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderInput = (
    placeholder: string,
    value: string,
    onChangeText: (t: string) => void,
    multiline = false
  ) => (
    <TextInput
      style={[
        styles.input,
        multiline && styles.inputMultiline,
        { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border },
      ]}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  );

  const renderSectionHeader = (
    title: string,
    icon: React.ReactNode,
    sectionKey: string,
    count?: number
  ) => (
    <TouchableOpacity
      style={[styles.sectionHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => setExpandedSection(expandedSection === sectionKey ? null : sectionKey)}
      activeOpacity={0.7}
    >
      <View style={styles.sectionHeaderLeft}>
        {icon}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        {count !== undefined && (
          <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.badgeText, { color: colors.textLight }]}>{count}</Text>
          </View>
        )}
      </View>
      <ChevronRight
        size={20}
        color={colors.textMuted}
        style={{ transform: [{ rotate: expandedSection === sectionKey ? '90deg' : '0deg' }] }}
      />
    </TouchableOpacity>
  );

  const renderWelcome = () => (
    <View style={styles.stepContent}>
      <View style={[styles.welcomeIcon, { backgroundColor: colors.primaryLight + '20' }]}>
        <Sparkles size={48} color={colors.primary} />
      </View>
      <Text style={[styles.welcomeTitle, { color: colors.text }]}>
        Find Your Best{'\n'}PR Pathway
      </Text>
      <Text style={[styles.welcomeDesc, { color: colors.textSecondary }]}>
        Answer a few questions about your background, and our AI will match you with the Canadian PR program that best fits your profile — and where you'll make the biggest impact.
      </Text>
      <View style={styles.welcomeFeatures}>
        {[
          { icon: <GraduationCap size={20} color={colors.info} />, text: 'Profile-based matching' },
          { icon: <Briefcase size={20} color={colors.success} />, text: 'Employer suggestions' },
          { icon: <FileText size={20} color={colors.warning} />, text: 'Document checklists' },
          { icon: <Clock size={20} color={colors.primary} />, text: 'Detailed timelines' },
        ].map((item, i) => (
          <View key={i} style={[styles.featureRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.featureIcon, { backgroundColor: colors.surfaceAlt }]}>{item.icon}</View>
            <Text style={[styles.featureText, { color: colors.text }]}>{item.text}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
        onPress={() => animateTransition('education')}
        activeOpacity={0.8}
        testID="process-start-btn"
      >
        <Text style={[styles.primaryBtnText, { color: colors.textLight }]}>Let's Get Started</Text>
        <ArrowRight size={20} color={colors.textLight} />
      </TouchableOpacity>
    </View>
  );

  const renderEducation = () => (
    <View style={styles.stepContent}>
      <View style={[styles.stepIcon, { backgroundColor: colors.info + '20' }]}>
        <GraduationCap size={28} color={colors.info} />
      </View>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Education & Study</Text>
      <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Tell us about your educational background</Text>

      <Text style={[styles.label, { color: colors.text }]}>Highest Education Level</Text>
      <View style={styles.chipGroup}>
        {EDUCATION_LEVELS.map(level =>
          renderChip(level, answers.highestEducation === level, () => updateAnswer('highestEducation', level))
        )}
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Field of Study</Text>
      {renderInput('e.g. Computer Science, Nursing, Business...', answers.fieldOfStudy, t => updateAnswer('fieldOfStudy', t))}

      <Text style={[styles.label, { color: colors.text }]}>Key Interests & Passions</Text>
      {renderInput('e.g. AI/ML, healthcare, sustainability, finance...', answers.interests, t => updateAnswer('interests', t))}

      <Text style={[styles.label, { color: colors.text }]}>Language Proficiency</Text>
      {renderInput('e.g. English CLB 9, French CLB 5, bilingual...', answers.languageAbility, t => updateAnswer('languageAbility', t))}
    </View>
  );

  const renderWork = () => (
    <View style={styles.stepContent}>
      <View style={[styles.stepIcon, { backgroundColor: colors.success + '20' }]}>
        <Briefcase size={28} color={colors.success} />
      </View>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Work Experience</Text>
      <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Your professional background helps us find the right match</Text>

      <Text style={[styles.label, { color: colors.text }]}>Current / Most Recent Occupation</Text>
      {renderInput('e.g. Software Engineer, Registered Nurse...', answers.currentOccupation, t => updateAnswer('currentOccupation', t))}

      <Text style={[styles.label, { color: colors.text }]}>Years of Work Experience</Text>
      <View style={styles.chipGroup}>
        {['Less than 1', '1-3 years', '3-5 years', '5-10 years', '10+ years'].map(y =>
          renderChip(y, answers.yearsOfExperience === y, () => updateAnswer('yearsOfExperience', y))
        )}
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Key Skills & Certifications</Text>
      {renderInput('e.g. AWS certified, PMP, CPA, full-stack dev...', answers.skills, t => updateAnswer('skills', t))}
    </View>
  );

  const renderRelocation = () => (
    <View style={styles.stepContent}>
      <View style={[styles.stepIcon, { backgroundColor: colors.warning + '20' }]}>
        <MapPin size={28} color={colors.warning} />
      </View>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Relocation Preferences</Text>
      <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Where in Canada would you like to settle?</Text>

      <Text style={[styles.label, { color: colors.text }]}>Are you willing to relocate to any province?</Text>
      <View style={styles.boolRow}>
        <TouchableOpacity
          style={[
            styles.boolBtn,
            {
              backgroundColor: answers.willingToRelocate === true ? colors.success : colors.surface,
              borderColor: answers.willingToRelocate === true ? colors.success : colors.border,
            },
          ]}
          onPress={() => updateAnswer('willingToRelocate', true)}
        >
          <Text style={[styles.boolText, { color: answers.willingToRelocate === true ? colors.textLight : colors.text }]}>
            Yes, I'm flexible
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.boolBtn,
            {
              backgroundColor: answers.willingToRelocate === false ? colors.primary : colors.surface,
              borderColor: answers.willingToRelocate === false ? colors.primary : colors.border,
            },
          ]}
          onPress={() => updateAnswer('willingToRelocate', false)}
        >
          <Text style={[styles.boolText, { color: answers.willingToRelocate === false ? colors.textLight : colors.text }]}>
            I have preferences
          </Text>
        </TouchableOpacity>
      </View>

      {answers.willingToRelocate === false && (
        <>
          <Text style={[styles.label, { color: colors.text }]}>Preferred Province(s)</Text>
          <View style={styles.chipGroup}>
            {PROVINCES.map(p =>
              renderChip(p, answers.preferredProvinces.includes(p), () => toggleProvince(p))
            )}
          </View>
        </>
      )}

      <Text style={[styles.label, { color: colors.text }]}>Do you have any connections in Canada?</Text>
      <View style={styles.boolRow}>
        <TouchableOpacity
          style={[
            styles.boolBtn,
            {
              backgroundColor: answers.hasCanadianConnection === true ? colors.success : colors.surface,
              borderColor: answers.hasCanadianConnection === true ? colors.success : colors.border,
            },
          ]}
          onPress={() => updateAnswer('hasCanadianConnection', true)}
        >
          <Text style={[styles.boolText, { color: answers.hasCanadianConnection === true ? colors.textLight : colors.text }]}>
            Yes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.boolBtn,
            {
              backgroundColor: answers.hasCanadianConnection === false ? colors.primary : colors.surface,
              borderColor: answers.hasCanadianConnection === false ? colors.primary : colors.border,
            },
          ]}
          onPress={() => updateAnswer('hasCanadianConnection', false)}
        >
          <Text style={[styles.boolText, { color: answers.hasCanadianConnection === false ? colors.textLight : colors.text }]}>
            No
          </Text>
        </TouchableOpacity>
      </View>

      {answers.hasCanadianConnection === true && (
        <>
          <Text style={[styles.label, { color: colors.text }]}>Connection Details</Text>
          {renderInput('e.g. Sibling in Toronto, friend in Vancouver...', answers.canadianConnectionDetails, t => updateAnswer('canadianConnectionDetails', t))}
        </>
      )}

      <Text style={[styles.label, { color: colors.text }]}>Family Size (including you)</Text>
      <View style={styles.chipGroup}>
        {['Just me', '2 (with spouse)', '3-4 (small family)', '5+ (large family)'].map(f =>
          renderChip(f, answers.familySize === f, () => updateAnswer('familySize', f))
        )}
      </View>
    </View>
  );

  const renderPreferences = () => (
    <View style={styles.stepContent}>
      <View style={[styles.stepIcon, { backgroundColor: colors.accent + '20' }]}>
        <Heart size={28} color={colors.accent} />
      </View>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Your Story</Text>
      <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Help us understand your genuine motivation</Text>

      <Text style={[styles.label, { color: colors.text }]}>Tell us about your background & why Canada?</Text>
      {renderInput(
        'Share your story — why do you want to immigrate to Canada? What drives you? This helps us find the program where you\'ll thrive...',
        answers.genuineBackground,
        t => updateAnswer('genuineBackground', t),
        true
      )}

      <Text style={[styles.label, { color: colors.text }]}>Approximate Budget for Immigration</Text>
      <View style={styles.chipGroup}>
        {BUDGET_RANGES.map(b =>
          renderChip(b, answers.budgetRange === b, () => updateAnswer('budgetRange', b))
        )}
      </View>

      <View style={[styles.infoBox, { backgroundColor: colors.infoLight, borderColor: colors.info + '30' }]}>
        <AlertCircle size={18} color={colors.info} />
        <Text style={[styles.infoText, { color: colors.info }]}>
          Your responses are analyzed by AI to find the best-fit PR pathway. This is informational and not legal counsel.
        </Text>
      </View>
    </View>
  );

  const renderAnalyzing = () => (
    <View style={[styles.stepContent, styles.centerContent]}>
      <View style={[styles.analyzeIcon, { backgroundColor: colors.primary + '15' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
      <Text style={[styles.analyzeTitle, { color: colors.text }]}>Analyzing Your Profile</Text>
      <Text style={[styles.analyzeDesc, { color: colors.textSecondary }]}>
        Our AI is matching your background with Canadian PR programs to find where you'll be the best fit...
      </Text>
      <View style={styles.analyzeSteps}>
        {['Evaluating education & skills', 'Matching with PR program goals', 'Finding suitable employers', 'Building your roadmap'].map((s, i) => (
          <View key={i} style={styles.analyzeStep}>
            <View style={[styles.analyzeDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.analyzeStepText, { color: colors.textSecondary }]}>{s}</Text>
          </View>
        ))}
      </View>
      {analyzeMutation.isError && (
        <View style={{ marginTop: 24 }}>
          <Text style={[styles.errorText, { color: colors.error }]}>Analysis failed. Please try again.</Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 12 }]}
            onPress={() => analyzeMutation.mutate()}
          >
            <RotateCcw size={18} color={colors.textLight} />
            <Text style={[styles.primaryBtnText, { color: colors.textLight }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderResults = () => {
    if (!result) return null;

    if (!selectedPathway) {
      return (
        <View style={styles.stepContent}>
          <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.matchBadge, { backgroundColor: colors.success }]}>
              <Text style={[styles.matchText, { color: colors.textLight }]}>{result.matchScore} Match</Text>
            </View>
            <Text style={[styles.resultPathway, { color: colors.text }]}>{result.recommendedPathway}</Text>
            <Text style={[styles.resultWhy, { color: colors.textSecondary }]}>{result.whyThisPathway}</Text>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={handleSelectPathway}
              activeOpacity={0.8}
              testID="process-select-pathway"
            >
              <Text style={[styles.primaryBtnText, { color: colors.textLight }]}>Select This Pathway</Text>
              <ArrowRight size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>

          {result.alternativePathways.length > 0 && (
            <View style={styles.altSection}>
              <Text style={[styles.altTitle, { color: colors.textSecondary }]}>Alternative Pathways</Text>
              {result.alternativePathways.map((alt, i) => (
                <View key={i} style={[styles.altCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.altText, { color: colors.text }]}>{alt}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: colors.border }]}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <RotateCcw size={16} color={colors.textSecondary} />
            <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>Start Over</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.stepContent}>
        <View style={[styles.selectedHeader, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
          <CheckCircle2 size={22} color={colors.primary} />
          <View style={styles.selectedHeaderText}>
            <Text style={[styles.selectedTitle, { color: colors.primary }]}>{result.recommendedPathway}</Text>
            <Text style={[styles.selectedMatch, { color: colors.textSecondary }]}>{result.matchScore} match with your profile</Text>
          </View>
        </View>

        {renderSectionHeader('Eligibility Requirements', <CheckCircle2 size={18} color={colors.success} />, 'eligibility', result.eligibility.length)}
        {expandedSection === 'eligibility' && (
          <View style={[styles.sectionBody, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {result.eligibility.map((item, i) => (
              <View key={i} style={styles.listItem}>
                <View style={[styles.listDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.listText, { color: colors.text }]}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {renderSectionHeader('Step-by-Step Process', <FileText size={18} color={colors.info} />, 'process', result.detailedProcess.length)}
        {expandedSection === 'process' && (
          <View style={[styles.sectionBody, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {result.detailedProcess.map((step, i) => (
              <View key={i} style={styles.stepItem}>
                <View style={[styles.stepNumber, { backgroundColor: colors.info }]}>
                  <Text style={[styles.stepNumText, { color: colors.textLight }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.listText, { color: colors.text, flex: 1 }]}>{step}</Text>
              </View>
            ))}
          </View>
        )}

        {renderSectionHeader('Timeline', <Clock size={18} color={colors.warning} />, 'timeline', result.timeline.length)}
        {expandedSection === 'timeline' && (
          <View style={[styles.sectionBody, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {result.timeline.map((phase, i) => (
              <View key={i} style={styles.timelineItem}>
                <View style={[styles.timelineLine, { backgroundColor: colors.warning + '40' }]}>
                  <View style={[styles.timelineDot, { backgroundColor: colors.warning }]} />
                </View>
                <Text style={[styles.listText, { color: colors.text, flex: 1 }]}>{phase}</Text>
              </View>
            ))}
          </View>
        )}

        {renderSectionHeader('Required Documents', <FileText size={18} color={colors.primary} />, 'documents', result.documents.length)}
        {expandedSection === 'documents' && (
          <View style={[styles.sectionBody, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {result.documents.map((doc, i) => (
              <View key={i} style={styles.listItem}>
                <View style={[styles.listDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.listText, { color: colors.text }]}>{doc}</Text>
              </View>
            ))}
          </View>
        )}

        {result.employers.length > 0 && (
          <>
            {renderSectionHeader('Potential Employers', <Building2 size={18} color={colors.secondary} />, 'employers', result.employers.length)}
            {expandedSection === 'employers' && (
              <View style={[styles.sectionBody, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {result.employers.map((emp, i) => (
                  <View key={i} style={[styles.employerCard, { borderColor: colors.border }]}>
                    <Text style={[styles.employerName, { color: colors.text }]}>{emp.name}</Text>
                    <View style={styles.employerDetail}>
                      <Briefcase size={13} color={colors.textMuted} />
                      <Text style={[styles.employerDetailText, { color: colors.textSecondary }]}>{emp.sector}</Text>
                    </View>
                    <View style={styles.employerDetail}>
                      <MapPin size={13} color={colors.textMuted} />
                      <Text style={[styles.employerDetailText, { color: colors.textSecondary }]}>{emp.location}</Text>
                    </View>
                    {emp.email ? (
                      <TouchableOpacity
                        style={styles.employerDetail}
                        onPress={() => Linking.openURL(`mailto:${emp.email}`)}
                      >
                        <Mail size={13} color={colors.info} />
                        <Text style={[styles.employerDetailText, { color: colors.info }]}>{emp.email}</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {renderSectionHeader('Estimated Costs', <DollarSign size={18} color={colors.accent} />, 'costs', result.estimatedCosts.length)}
        {expandedSection === 'costs' && (
          <View style={[styles.sectionBody, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {result.estimatedCosts.map((cost, i) => (
              <View key={i} style={styles.listItem}>
                <View style={[styles.listDot, { backgroundColor: colors.accent }]} />
                <Text style={[styles.listText, { color: colors.text }]}>{cost}</Text>
              </View>
            ))}
          </View>
        )}

        {renderSectionHeader('Tips & Recommendations', <Sparkles size={18} color={colors.primary} />, 'tips', result.additionalTips.length)}
        {expandedSection === 'tips' && (
          <View style={[styles.sectionBody, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {result.additionalTips.map((tip, i) => (
              <View key={i} style={styles.listItem}>
                <Sparkles size={14} color={colors.primary} />
                <Text style={[styles.listText, { color: colors.text }]}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.chatBtn, { backgroundColor: colors.secondary }]}
          onPress={() => animateTransition('chat')}
          activeOpacity={0.8}
          testID="process-chat-btn"
        >
          <Bot size={20} color={colors.textLight} />
          <Text style={[styles.chatBtnText, { color: colors.textLight }]}>Ask Follow-up Questions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: colors.border }]}
          onPress={handleReset}
          activeOpacity={0.7}
        >
          <RotateCcw size={16} color={colors.textSecondary} />
          <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>Start Over</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderChat = () => (
    <View style={styles.chatContainer}>
      <TouchableOpacity
        style={[styles.chatBackBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => animateTransition('results')}
      >
        <ChevronLeft size={18} color={colors.text} />
        <Text style={[styles.chatBackText, { color: colors.text }]}>Back to Results</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.chatMessages}
        contentContainerStyle={styles.chatMessagesContent}
        ref={scrollRef}
      >
        {chatMessages.length === 0 && (
          <View style={styles.chatEmpty}>
            <Bot size={32} color={colors.textMuted} />
            <Text style={[styles.chatEmptyText, { color: colors.textSecondary }]}>
              Ask anything about your recommended pathway, employer contacts, or next steps.
            </Text>
          </View>
        )}
        {chatMessages.map((msg, i) => (
          <View
            key={i}
            style={[styles.chatMsg, msg.role === 'user' ? styles.chatMsgUser : styles.chatMsgAssistant]}
          >
            {msg.role === 'assistant' && (
              <View style={[styles.chatAvatar, { backgroundColor: colors.primaryLight }]}>
                <Bot size={14} color={colors.textLight} />
              </View>
            )}
            <View
              style={[
                styles.chatBubble,
                msg.role === 'user'
                  ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 }
                  : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth, borderBottomLeftRadius: 4 },
              ]}
            >
              <Text style={[styles.chatBubbleText, { color: msg.role === 'user' ? colors.textLight : colors.text }]}>
                {msg.text}
              </Text>
            </View>
            {msg.role === 'user' && (
              <View style={[styles.chatAvatar, { backgroundColor: colors.secondary }]}>
                <UserIcon size={14} color={colors.textLight} />
              </View>
            )}
          </View>
        ))}
        {chatMutation.isPending && (
          <View style={[styles.chatMsg, styles.chatMsgAssistant]}>
            <View style={[styles.chatAvatar, { backgroundColor: colors.primaryLight }]}>
              <Bot size={14} color={colors.textLight} />
            </View>
            <View style={[styles.chatBubble, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth }]}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.chatInputBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TextInput
          style={[styles.chatInput, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
          placeholder="Ask a question..."
          placeholderTextColor={colors.textMuted}
          value={chatInput}
          onChangeText={setChatInput}
          onSubmitEditing={handleChatSend}
          returnKeyType="send"
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          style={[styles.chatSendBtn, { backgroundColor: chatInput.trim() ? colors.primary : colors.surfaceAlt }]}
          onPress={handleChatSend}
          disabled={!chatInput.trim() || chatMutation.isPending}
        >
          <Send size={18} color={chatInput.trim() ? colors.textLight : colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome': return renderWelcome();
      case 'education': return renderEducation();
      case 'work': return renderWork();
      case 'relocation': return renderRelocation();
      case 'preferences': return renderPreferences();
      case 'analyzing': return renderAnalyzing();
      case 'results': return renderResults();
      case 'chat': return renderChat();
      default: return null;
    }
  };

  const showNav = ['education', 'work', 'relocation', 'preferences'].includes(currentStep);
  const prevStep: Record<string, StepId> = { education: 'welcome', work: 'education', relocation: 'work', preferences: 'relocation' };
  const nextStep: Record<string, StepId | 'analyze'> = { education: 'work', work: 'relocation', relocation: 'preferences', preferences: 'analyze' };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>PR Process Guide</Text>
        <Text style={[styles.headerSub, { color: colors.textMuted }]}>AI-Powered Pathway Finder</Text>
      </View>

      {currentStep !== 'chat' && renderProgressBar()}

      {currentStep === 'chat' ? (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
            {renderStepContent()}
          </Animated.View>
        </KeyboardAvoidingView>
      ) : (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: showNav ? 100 : insets.bottom + 20 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={{ opacity: fadeAnim }}>
              {renderStepContent()}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {showNav && (
        <View style={[styles.navBar, { paddingBottom: insets.bottom + 12, backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.navBtn, { borderColor: colors.border }]}
            onPress={() => animateTransition(prevStep[currentStep])}
            activeOpacity={0.7}
          >
            <ChevronLeft size={18} color={colors.text} />
            <Text style={[styles.navBtnText, { color: colors.text }]}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.navBtnPrimary,
              {
                backgroundColor: canProceed() ? colors.primary : colors.surfaceAlt,
              },
            ]}
            onPress={() => {
              const n = nextStep[currentStep];
              if (n === 'analyze') {
                handleStartAnalysis();
              } else if (n) {
                animateTransition(n);
              }
            }}
            disabled={!canProceed()}
            activeOpacity={0.8}
          >
            <Text style={[styles.navBtnPrimaryText, { color: canProceed() ? colors.textLight : colors.textMuted }]}>
              {nextStep[currentStep] === 'analyze' ? 'Find My Pathway' : 'Continue'}
            </Text>
            {nextStep[currentStep] === 'analyze' ? (
              <Sparkles size={18} color={canProceed() ? colors.textLight : colors.textMuted} />
            ) : (
              <ChevronRight size={18} color={canProceed() ? colors.textLight : colors.textMuted} />
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center' as const,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  stepContent: {
    gap: 16,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  welcomeIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    textAlign: 'center' as const,
    lineHeight: 34,
  },
  welcomeDesc: {
    fontSize: 15,
    textAlign: 'center' as const,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  welcomeFeatures: {
    gap: 10,
    marginTop: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  stepIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  },
  stepDesc: {
    fontSize: 14,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: 14,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  boolRow: {
    flexDirection: 'row',
    gap: 10,
  },
  boolBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  boolText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  analyzeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  analyzeTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  },
  analyzeDesc: {
    fontSize: 14,
    textAlign: 'center' as const,
    lineHeight: 20,
    marginTop: 8,
    paddingHorizontal: 20,
  },
  analyzeSteps: {
    marginTop: 28,
    gap: 14,
    alignSelf: 'stretch',
    paddingHorizontal: 20,
  },
  analyzeStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  analyzeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  analyzeStepText: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center' as const,
  },
  resultCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  matchBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  matchText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  resultPathway: {
    fontSize: 22,
    fontWeight: '800' as const,
    textAlign: 'center' as const,
  },
  resultWhy: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center' as const,
  },
  altSection: {
    gap: 8,
    marginTop: 8,
  },
  altTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  altCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  altText: {
    fontSize: 14,
    lineHeight: 20,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  selectedHeaderText: {
    flex: 1,
  },
  selectedTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  selectedMatch: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  sectionBody: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: -4,
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  listDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  listText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timelineLine: {
    width: 3,
    minHeight: 40,
    borderRadius: 2,
    alignItems: 'center',
    paddingTop: 4,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: -3.5,
  },
  employerCard: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  employerName: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  employerDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  employerDetailText: {
    fontSize: 13,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 16,
  },
  chatBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  navBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  navBtnPrimaryText: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  chatContainer: {
    flex: 1,
  },
  chatBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chatBackText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  chatMessages: {
    flex: 1,
  },
  chatMessagesContent: {
    padding: 16,
    flexGrow: 1,
    gap: 12,
  },
  chatEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 60,
  },
  chatEmptyText: {
    fontSize: 14,
    textAlign: 'center' as const,
    lineHeight: 20,
    paddingHorizontal: 32,
  },
  chatMsg: {
    flexDirection: 'row',
    gap: 8,
  },
  chatMsgUser: {
    justifyContent: 'flex-end',
  },
  chatMsgAssistant: {
    justifyContent: 'flex-start',
  },
  chatAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  chatBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chatBubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
  },
  chatSendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
