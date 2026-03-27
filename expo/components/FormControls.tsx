import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/providers/ThemeProvider';

interface StepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  suffix?: string;
  formatValue?: (value: number) => string;
}

export function Stepper({ label, value, min, max, step, onChange, suffix, formatValue }: StepperProps) {
  const { colors } = useTheme();

  const handleDecrease = () => {
    const newVal = Math.max(min, Math.round((value - step) * 10) / 10);
    onChange(newVal);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleIncrease = () => {
    const newVal = Math.min(max, Math.round((value + step) * 10) / 10);
    onChange(newVal);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const displayValue = formatValue ? formatValue(value) : `${value}${suffix || ''}`;

  return (
    <View style={[styles.stepperRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={styles.stepperControls}>
        <TouchableOpacity
          onPress={handleDecrease}
          style={[styles.stepButton, { backgroundColor: colors.surfaceAlt }, value <= min && styles.stepButtonDisabled]}
          disabled={value <= min}
          testID={`stepper-${label}-minus`}
        >
          <Minus size={16} color={value <= min ? colors.textMuted : colors.primary} />
        </TouchableOpacity>
        <View style={styles.stepValueContainer}>
          <Text style={[styles.stepValue, { color: colors.text }]}>{displayValue}</Text>
        </View>
        <TouchableOpacity
          onPress={handleIncrease}
          style={[styles.stepButton, { backgroundColor: colors.surfaceAlt }, value >= max && styles.stepButtonDisabled]}
          disabled={value >= max}
          testID={`stepper-${label}-plus`}
        >
          <Plus size={16} color={value >= max ? colors.textMuted : colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface ToggleRowProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
}

export function ToggleRow({ label, value, onChange, description }: ToggleRowProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
      <View style={styles.toggleLabel}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        {description ? <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={(val) => {
          onChange(val);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        trackColor={{ false: colors.border, true: colors.primaryLight }}
        thumbColor={value ? colors.primary : '#f4f3f4'}
      />
    </View>
  );
}

interface OptionSelectorProps<T extends string> {
  label: string;
  value: T;
  options: { key: T; label: string }[];
  onChange: (value: T) => void;
  compact?: boolean;
}

export function OptionSelector<T extends string>({
  label,
  value,
  options,
  onChange,
  compact = false,
}: OptionSelectorProps<T>) {
  const { colors } = useTheme();

  return (
    <View style={[styles.optionSelector, { borderBottomColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={[styles.optionsGrid, compact && styles.optionsRow]}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.option,
              { backgroundColor: colors.surfaceAlt },
              compact && styles.optionCompact,
              value === opt.key && { backgroundColor: colors.errorLight, borderColor: colors.primary },
            ]}
            onPress={() => {
              onChange(opt.key);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            testID={`option-${opt.key}`}
          >
            <Text
              style={[
                styles.optionText,
                { color: colors.textSecondary },
                value === opt.key && { color: colors.primary, fontWeight: '700' as const },
              ]}
              numberOfLines={2}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function SectionCard({ title, children, icon }: SectionCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
      <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
        {icon}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: 15,
    fontWeight: '500' as const,
    flex: 1,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonDisabled: {
    opacity: 0.4,
  },
  stepValueContainer: {
    minWidth: 52,
    alignItems: 'center',
  },
  stepValue: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toggleLabel: {
    flex: 1,
    marginRight: 12,
  },
  description: {
    fontSize: 12,
    marginTop: 2,
  },
  optionSelector: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  optionsRow: {
    flexWrap: 'nowrap',
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    minWidth: '30%' as unknown as number,
  },
  optionCompact: {
    flex: 1,
    alignItems: 'center' as const,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
});
