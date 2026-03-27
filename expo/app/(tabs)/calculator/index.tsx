import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Save,
  RotateCcw,
  User,
  GraduationCap,
  Languages,
  Briefcase,
  Users,
  Award,
  Trash2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/providers/ThemeProvider';
import { Stepper, ToggleRow, OptionSelector, SectionCard } from '@/components/FormControls';
import { useUser } from '@/providers/UserProvider';
import { calculateCRS } from '@/utils/crs';
import {
  CRSInputs,
  EducationLevel,
  MaritalStatus,
} from '@/types/immigration';
import type { ScoreBreakdown, CRSScenario } from '@/types/immigration';

const EDUCATION_OPTIONS: { key: EducationLevel; label: string }[] = [
  { key: 'none', label: 'None' },
  { key: 'secondary', label: 'High school' },
  { key: 'one_year_post', label: '1-yr diploma' },
  { key: 'two_year_post', label: '2-yr diploma' },
  { key: 'bachelors', label: "Bachelor's" },
  { key: 'two_or_more_post', label: 'Two+ credentials' },
  { key: 'masters', label: "Master's" },
  { key: 'doctoral', label: 'PhD' },
];

const MARITAL_OPTIONS: { key: MaritalStatus; label: string }[] = [
  { key: 'single', label: 'Single' },
  { key: 'married', label: 'Married / CL' },
];

export default function CalculatorScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { profile, scenarios, saveScenario, deleteScenario } = useUser();

  const BREAKDOWN_ITEMS = useMemo(() => [
    { key: 'age' as keyof ScoreBreakdown, label: 'Age', color: colors.scoreAge, max: 110 },
    { key: 'education' as keyof ScoreBreakdown, label: 'Education', color: colors.scoreEducation, max: 150 },
    { key: 'firstLanguage' as keyof ScoreBreakdown, label: 'First Language', color: colors.scoreLanguage, max: 136 },
    { key: 'secondLanguage' as keyof ScoreBreakdown, label: 'Second Language', color: colors.scoreLanguage, max: 24 },
    { key: 'canadianWorkExperience' as keyof ScoreBreakdown, label: 'Work Experience', color: colors.scoreWork, max: 80 },
    { key: 'spouseFactors' as keyof ScoreBreakdown, label: 'Spouse Factors', color: colors.scoreSpouse, max: 40 },
    { key: 'skillTransferability' as keyof ScoreBreakdown, label: 'Skill Transferability', color: colors.scoreSkill, max: 100 },
    { key: 'additionalPoints' as keyof ScoreBreakdown, label: 'Additional Points', color: colors.scoreAdditional, max: 600 },
  ], [colors]);

  const initialInputs: CRSInputs = useMemo(() => {
    if (profile.profileCompleted) {
      return {
        age: profile.age,
        education: profile.education,
        firstLanguage: { ...profile.firstLanguage },
        hasSecondLanguage: profile.hasSecondLanguage,
        secondLanguage: profile.secondLanguage ? { ...profile.secondLanguage } : undefined,
        canadianWorkExperience: profile.canadianWorkExperience,
        foreignWorkExperience: profile.foreignWorkExperience,
        maritalStatus: profile.maritalStatus,
        spouseEducation: profile.spouseEducation,
        spouseCanadianWorkExperience: profile.spouseCanadianWorkExperience,
        hasJobOffer: profile.hasJobOffer,
        hasPNP: profile.hasPNP,
        hasCanadianEducation: profile.hasCanadianEducation,
        hasSiblingInCanada: profile.hasSiblingInCanada,
      };
    }
    return {
      age: 30,
      education: 'bachelors' as EducationLevel,
      firstLanguage: { speaking: 7, listening: 7, reading: 7, writing: 7 },
      hasSecondLanguage: false,
      canadianWorkExperience: 0,
      foreignWorkExperience: 1,
      maritalStatus: 'single' as MaritalStatus,
      hasJobOffer: false,
      hasPNP: false,
      hasCanadianEducation: false,
      hasSiblingInCanada: false,
    };
  }, [profile]);

  const [inputs, setInputs] = useState<CRSInputs>(initialInputs);
  const [scenarioName, setScenarioName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const breakdown = useMemo(() => calculateCRS(inputs), [inputs]);

  const updateInput = useCallback(<K extends keyof CRSInputs>(key: K, value: CRSInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setInputs(initialInputs);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [initialInputs]);

  const handleSave = useCallback(() => {
    if (!scenarioName.trim()) {
      Alert.alert('Name Required', 'Please enter a name for this scenario.');
      return;
    }
    const scenario: CRSScenario = {
      id: Date.now().toString(),
      name: scenarioName.trim(),
      inputs: { ...inputs },
      breakdown: { ...breakdown },
      createdAt: new Date().toISOString(),
    };
    saveScenario(scenario);
    setScenarioName('');
    setShowSaveInput(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Saved', `Scenario "${scenario.name}" saved successfully.`);
  }, [scenarioName, inputs, breakdown, saveScenario]);

  const handleDeleteScenario = useCallback((id: string, name: string) => {
    Alert.alert('Delete Scenario', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteScenario(id),
      },
    ]);
  }, [deleteScenario]);

  const loadScenario = useCallback((scenario: CRSScenario) => {
    setInputs(scenario.inputs);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.screenTitle, { color: colors.text }]}>CRS Calculator</Text>
          <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>Adjust values to simulate your score</Text>

          <LinearGradient
            colors={[colors.secondary, isDark ? '#0D1B2E' : '#152A45']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scoreCard}
          >
            <Text style={styles.scoreLabel}>Total CRS Score</Text>
            <Text style={[styles.scoreNumber, { color: colors.textLight }]}>{breakdown.total}</Text>
            <Text style={styles.scoreMax}>/ 1,200</Text>
          </LinearGradient>

          <View style={[styles.breakdownCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.breakdownTitle, { color: colors.text }]}>Score Breakdown</Text>
            {BREAKDOWN_ITEMS.map((item) => {
              const value = breakdown[item.key];
              if (value === 0 && item.key === 'spouseFactors' && inputs.maritalStatus !== 'married') return null;
              const pct = item.max > 0 ? Math.min((value / item.max) * 100, 100) : 0;
              return (
                <View key={item.key} style={styles.breakdownRow}>
                  <View style={styles.breakdownLabelRow}>
                    <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                    <Text style={[styles.breakdownValue, { color: colors.text }]}>{value}/{item.max}</Text>
                  </View>
                  <View style={[styles.breakdownBarBg, { backgroundColor: colors.surfaceAlt }]}>
                    <View
                      style={[
                        styles.breakdownBarFill,
                        { width: `${pct}%`, backgroundColor: item.color },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.resetButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={handleReset}>
              <RotateCcw size={16} color={colors.textSecondary} />
              <Text style={[styles.resetText, { color: colors.textSecondary }]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowSaveInput(!showSaveInput)}
            >
              <Save size={16} color={colors.textLight} />
              <Text style={[styles.saveText, { color: colors.textLight }]}>Save Scenario</Text>
            </TouchableOpacity>
          </View>

          {showSaveInput && (
            <View style={styles.saveInputRow}>
              <TextInput
                style={[styles.saveInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Scenario name..."
                placeholderTextColor={colors.textMuted}
                value={scenarioName}
                onChangeText={setScenarioName}
                testID="scenario-name-input"
              />
              <TouchableOpacity style={[styles.confirmSaveBtn, { backgroundColor: colors.success }]} onPress={handleSave}>
                <Text style={[styles.confirmSaveText, { color: colors.textLight }]}>Save</Text>
              </TouchableOpacity>
            </View>
          )}

          <SectionCard
            title="Personal Info"
            icon={<User size={18} color={colors.scoreAge} />}
          >
            <Stepper
              label="Age"
              value={inputs.age}
              min={17}
              max={45}
              step={1}
              onChange={(v) => updateInput('age', v)}
              suffix=" yrs"
            />
            <OptionSelector
              label="Marital Status"
              value={inputs.maritalStatus}
              options={MARITAL_OPTIONS}
              onChange={(v) => updateInput('maritalStatus', v)}
              compact
            />
          </SectionCard>

          <SectionCard
            title="Education"
            icon={<GraduationCap size={18} color={colors.scoreEducation} />}
          >
            <OptionSelector
              label="Highest Education"
              value={inputs.education}
              options={EDUCATION_OPTIONS}
              onChange={(v) => updateInput('education', v)}
            />
          </SectionCard>

          <SectionCard
            title="First Language"
            icon={<Languages size={18} color={colors.scoreLanguage} />}
          >
            <Stepper
              label="Speaking"
              value={inputs.firstLanguage.speaking}
              min={0}
              max={9}
              step={0.5}
              onChange={(v) =>
                updateInput('firstLanguage', { ...inputs.firstLanguage, speaking: v })
              }
            />
            <Stepper
              label="Listening"
              value={inputs.firstLanguage.listening}
              min={0}
              max={9}
              step={0.5}
              onChange={(v) =>
                updateInput('firstLanguage', { ...inputs.firstLanguage, listening: v })
              }
            />
            <Stepper
              label="Reading"
              value={inputs.firstLanguage.reading}
              min={0}
              max={9}
              step={0.5}
              onChange={(v) =>
                updateInput('firstLanguage', { ...inputs.firstLanguage, reading: v })
              }
            />
            <Stepper
              label="Writing"
              value={inputs.firstLanguage.writing}
              min={0}
              max={9}
              step={0.5}
              onChange={(v) =>
                updateInput('firstLanguage', { ...inputs.firstLanguage, writing: v })
              }
            />
          </SectionCard>

          <SectionCard
            title="Second Language"
            icon={<Languages size={18} color={colors.scoreLanguage} />}
          >
            <ToggleRow
              label="Second Language Test"
              value={inputs.hasSecondLanguage}
              onChange={(v) => {
                updateInput('hasSecondLanguage', v);
                if (v && !inputs.secondLanguage) {
                  updateInput('secondLanguage', {
                    speaking: 5,
                    listening: 5,
                    reading: 5,
                    writing: 5,
                  });
                }
              }}
            />
            {inputs.hasSecondLanguage && inputs.secondLanguage && (
              <>
                <Stepper
                  label="Speaking"
                  value={inputs.secondLanguage.speaking}
                  min={0}
                  max={9}
                  step={0.5}
                  onChange={(v) =>
                    updateInput('secondLanguage', {
                      ...inputs.secondLanguage!,
                      speaking: v,
                    })
                  }
                />
                <Stepper
                  label="Listening"
                  value={inputs.secondLanguage.listening}
                  min={0}
                  max={9}
                  step={0.5}
                  onChange={(v) =>
                    updateInput('secondLanguage', {
                      ...inputs.secondLanguage!,
                      listening: v,
                    })
                  }
                />
                <Stepper
                  label="Reading"
                  value={inputs.secondLanguage.reading}
                  min={0}
                  max={9}
                  step={0.5}
                  onChange={(v) =>
                    updateInput('secondLanguage', {
                      ...inputs.secondLanguage!,
                      reading: v,
                    })
                  }
                />
                <Stepper
                  label="Writing"
                  value={inputs.secondLanguage.writing}
                  min={0}
                  max={9}
                  step={0.5}
                  onChange={(v) =>
                    updateInput('secondLanguage', {
                      ...inputs.secondLanguage!,
                      writing: v,
                    })
                  }
                />
              </>
            )}
          </SectionCard>

          <SectionCard
            title="Work Experience"
            icon={<Briefcase size={18} color={colors.scoreWork} />}
          >
            <Stepper
              label="Canadian Experience"
              value={inputs.canadianWorkExperience}
              min={0}
              max={10}
              step={1}
              onChange={(v) => updateInput('canadianWorkExperience', v)}
              suffix=" yrs"
            />
            <Stepper
              label="Foreign Experience"
              value={inputs.foreignWorkExperience}
              min={0}
              max={10}
              step={1}
              onChange={(v) => updateInput('foreignWorkExperience', v)}
              suffix=" yrs"
            />
          </SectionCard>

          {inputs.maritalStatus === 'married' && (
            <SectionCard
              title="Spouse / Partner"
              icon={<Users size={18} color={colors.scoreSpouse} />}
            >
              <OptionSelector
                label="Spouse Education"
                value={inputs.spouseEducation || 'none'}
                options={EDUCATION_OPTIONS}
                onChange={(v) => updateInput('spouseEducation', v)}
              />
              <Stepper
                label="Spouse Canadian Work Exp"
                value={inputs.spouseCanadianWorkExperience || 0}
                min={0}
                max={10}
                step={1}
                onChange={(v) => updateInput('spouseCanadianWorkExperience', v)}
                suffix=" yrs"
              />
            </SectionCard>
          )}

          <SectionCard
            title="Additional Factors"
            icon={<Award size={18} color={colors.scoreAdditional} />}
          >
            <ToggleRow
              label="Provincial Nomination (PNP)"
              value={inputs.hasPNP}
              onChange={(v) => updateInput('hasPNP', v)}
              description="+600 points"
            />
            <ToggleRow
              label="Valid Job Offer (LMIA)"
              value={inputs.hasJobOffer}
              onChange={(v) => updateInput('hasJobOffer', v)}
              description="+50 to +200 points"
            />
            <ToggleRow
              label="Canadian Education"
              value={inputs.hasCanadianEducation}
              onChange={(v) => updateInput('hasCanadianEducation', v)}
              description="+30 points"
            />
            <ToggleRow
              label="Sibling in Canada"
              value={inputs.hasSiblingInCanada}
              onChange={(v) => updateInput('hasSiblingInCanada', v)}
              description="+15 points"
            />
          </SectionCard>

          {scenarios.length > 0 && (
            <View style={styles.scenariosSection}>
              <Text style={[styles.scenariosSectionTitle, { color: colors.text }]}>Saved Scenarios</Text>
              {scenarios.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.scenarioCard, { backgroundColor: colors.surface }]}
                  onPress={() => loadScenario(s)}
                  activeOpacity={0.7}
                >
                  <View style={styles.scenarioInfo}>
                    <Text style={[styles.scenarioName, { color: colors.text }]}>{s.name}</Text>
                    <Text style={[styles.scenarioDate, { color: colors.textMuted }]}>
                      {new Date(s.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.scenarioRight}>
                    <Text style={[styles.scenarioScore, { color: colors.secondary }]}>{s.breakdown.total}</Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteScenario(s.id, s.name)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Trash2 size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={[styles.disclaimer, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[styles.disclaimerText, { color: colors.textMuted }]}>
              This calculator provides an estimate based on publicly available CRS criteria. Actual
              scores may vary. Not official legal guidance.
            </Text>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 15,
    marginBottom: 20,
    marginTop: 2,
  },
  scoreCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600' as const,
  },
  scoreNumber: {
    fontSize: 80,
    fontWeight: '900' as const,
    letterSpacing: -3,
    lineHeight: 88,
  },
  scoreMax: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600' as const,
  },
  breakdownCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  breakdownTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  breakdownRow: {
    marginBottom: 10,
  },
  breakdownLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 13,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  breakdownBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: 8,
    borderRadius: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  saveInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  saveInput: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
  },
  confirmSaveBtn: {
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  confirmSaveText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  scenariosSection: {
    marginBottom: 16,
  },
  scenariosSectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 10,
  },
  scenarioCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  scenarioInfo: {
    flex: 1,
  },
  scenarioName: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  scenarioDate: {
    fontSize: 12,
    marginTop: 2,
  },
  scenarioRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  scenarioScore: {
    fontSize: 22,
    fontWeight: '800' as const,
  },
  disclaimer: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center' as const,
  },
});
