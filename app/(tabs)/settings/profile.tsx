import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  User,
  GraduationCap,
  Languages,
  Briefcase,
  Award,
  Save,
  Users,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/providers/ThemeProvider';
import { Stepper, ToggleRow, OptionSelector, SectionCard } from '@/components/FormControls';
import { useUser } from '@/providers/UserProvider';
import {
  UserProfile,
  EducationLevel,
  MaritalStatus,
} from '@/types/immigration';

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

export default function ProfileScreen() {
  const { profile, updateProfile } = useUser();
  const { colors } = useTheme();
  const [form, setForm] = useState<UserProfile>({ ...profile });

  const updateForm = useCallback(<K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(() => {
    if (!form.name.trim()) {
      Alert.alert('Name Required', 'Please enter your name to save your profile.');
      return;
    }
    updateProfile({ ...form, profileCompleted: true });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Profile Saved', 'Your profile has been updated successfully.');
  }, [form, updateProfile]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SectionCard title="Personal Details" icon={<User size={18} color={colors.scoreAge} />}>
          <View style={[styles.inputGroup, { borderBottomColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Full Name</Text>
            <TextInput
              style={[styles.textInput, { color: colors.text, backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              value={form.name}
              onChangeText={(v) => updateForm('name', v)}
              placeholder="Enter your name"
              placeholderTextColor={colors.textMuted}
              testID="profile-name-input"
            />
          </View>
          <View style={[styles.inputGroup, { borderBottomColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
            <TextInput
              style={[styles.textInput, { color: colors.text, backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              value={form.email}
              onChangeText={(v) => updateForm('email', v)}
              placeholder="your@email.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="profile-email-input"
            />
          </View>
          <Stepper
            label="Age"
            value={form.age}
            min={17}
            max={55}
            step={1}
            onChange={(v) => updateForm('age', v)}
            suffix=" yrs"
          />
          <OptionSelector
            label="Marital Status"
            value={form.maritalStatus}
            options={MARITAL_OPTIONS}
            onChange={(v) => updateForm('maritalStatus', v)}
            compact
          />
        </SectionCard>

        <SectionCard title="Education" icon={<GraduationCap size={18} color={colors.scoreEducation} />}>
          <OptionSelector
            label="Highest Education"
            value={form.education}
            options={EDUCATION_OPTIONS}
            onChange={(v) => updateForm('education', v)}
          />
        </SectionCard>

        <SectionCard title="First Language (IELTS Bands)" icon={<Languages size={18} color={colors.scoreLanguage} />}>
          <Stepper
            label="Speaking"
            value={form.firstLanguage.speaking}
            min={0}
            max={9}
            step={0.5}
            onChange={(v) => updateForm('firstLanguage', { ...form.firstLanguage, speaking: v })}
          />
          <Stepper
            label="Listening"
            value={form.firstLanguage.listening}
            min={0}
            max={9}
            step={0.5}
            onChange={(v) => updateForm('firstLanguage', { ...form.firstLanguage, listening: v })}
          />
          <Stepper
            label="Reading"
            value={form.firstLanguage.reading}
            min={0}
            max={9}
            step={0.5}
            onChange={(v) => updateForm('firstLanguage', { ...form.firstLanguage, reading: v })}
          />
          <Stepper
            label="Writing"
            value={form.firstLanguage.writing}
            min={0}
            max={9}
            step={0.5}
            onChange={(v) => updateForm('firstLanguage', { ...form.firstLanguage, writing: v })}
          />
        </SectionCard>

        <SectionCard title="Second Language" icon={<Languages size={18} color={colors.scoreLanguage} />}>
          <ToggleRow
            label="Have second language test?"
            value={form.hasSecondLanguage}
            onChange={(v) => {
              updateForm('hasSecondLanguage', v);
              if (v && !form.secondLanguage) {
                updateForm('secondLanguage', { speaking: 5, listening: 5, reading: 5, writing: 5 });
              }
            }}
          />
          {form.hasSecondLanguage && form.secondLanguage && (
            <>
              <Stepper label="Speaking" value={form.secondLanguage.speaking} min={0} max={9} step={0.5}
                onChange={(v) => updateForm('secondLanguage', { ...form.secondLanguage!, speaking: v })} />
              <Stepper label="Listening" value={form.secondLanguage.listening} min={0} max={9} step={0.5}
                onChange={(v) => updateForm('secondLanguage', { ...form.secondLanguage!, listening: v })} />
              <Stepper label="Reading" value={form.secondLanguage.reading} min={0} max={9} step={0.5}
                onChange={(v) => updateForm('secondLanguage', { ...form.secondLanguage!, reading: v })} />
              <Stepper label="Writing" value={form.secondLanguage.writing} min={0} max={9} step={0.5}
                onChange={(v) => updateForm('secondLanguage', { ...form.secondLanguage!, writing: v })} />
            </>
          )}
        </SectionCard>

        <SectionCard title="Work Experience" icon={<Briefcase size={18} color={colors.scoreWork} />}>
          <Stepper
            label="Canadian Experience"
            value={form.canadianWorkExperience}
            min={0}
            max={10}
            step={1}
            onChange={(v) => updateForm('canadianWorkExperience', v)}
            suffix=" yrs"
          />
          <Stepper
            label="Foreign Experience"
            value={form.foreignWorkExperience}
            min={0}
            max={10}
            step={1}
            onChange={(v) => updateForm('foreignWorkExperience', v)}
            suffix=" yrs"
          />
        </SectionCard>

        {form.maritalStatus === 'married' && (
          <SectionCard title="Spouse / Partner" icon={<Users size={18} color={colors.scoreSpouse} />}>
            <OptionSelector
              label="Spouse Education"
              value={form.spouseEducation || 'none'}
              options={EDUCATION_OPTIONS}
              onChange={(v) => updateForm('spouseEducation', v)}
            />
            <Stepper
              label="Spouse Canadian Work Exp"
              value={form.spouseCanadianWorkExperience || 0}
              min={0}
              max={10}
              step={1}
              onChange={(v) => updateForm('spouseCanadianWorkExperience', v)}
              suffix=" yrs"
            />
          </SectionCard>
        )}

        <SectionCard title="Additional Factors" icon={<Award size={18} color={colors.scoreAdditional} />}>
          <ToggleRow label="Provincial Nomination (PNP)" value={form.hasPNP}
            onChange={(v) => updateForm('hasPNP', v)} description="+600 points" />
          <ToggleRow label="Valid Job Offer (LMIA)" value={form.hasJobOffer}
            onChange={(v) => updateForm('hasJobOffer', v)} description="+50 to +200 points" />
          <ToggleRow label="Canadian Education" value={form.hasCanadianEducation}
            onChange={(v) => updateForm('hasCanadianEducation', v)} description="+30 points" />
          <ToggleRow label="Sibling in Canada" value={form.hasSiblingInCanada}
            onChange={(v) => updateForm('hasSiblingInCanada', v)} description="+15 points" />
        </SectionCard>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Save size={18} color={colors.textLight} />
          <Text style={[styles.saveBtnText, { color: colors.textLight }]}>Save Profile</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  inputGroup: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginBottom: 6,
  },
  textInput: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
});
