export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryLight: string;
  accent: string;
  accentLight: string;

  background: string;
  surface: string;
  surfaceAlt: string;
  surfaceWarm: string;

  text: string;
  textSecondary: string;
  textMuted: string;
  textLight: string;

  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;

  border: string;
  borderDark: string;

  scoreAge: string;
  scoreEducation: string;
  scoreLanguage: string;
  scoreWork: string;
  scoreSpouse: string;
  scoreSkill: string;
  scoreAdditional: string;
}

export const lightColors: ThemeColors = {
  primary: '#C8102E',
  primaryDark: '#9B0D23',
  primaryLight: '#E8354A',
  secondary: '#1E3A5F',
  secondaryLight: '#2D5F8A',
  accent: '#D4A843',
  accentLight: '#F0D78C',

  background: '#F5F5F0',
  surface: '#FFFFFF',
  surfaceAlt: '#F0EDE8',
  surfaceWarm: '#FFF8F0',

  text: '#1C1C1E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textLight: '#FFFFFF',

  success: '#2D8B57',
  successLight: '#E6F5EC',
  warning: '#E5A100',
  warningLight: '#FFF8E1',
  error: '#DC3545',
  errorLight: '#FDE8EA',
  info: '#2D6DA3',
  infoLight: '#E3F0FA',

  border: '#E5E7EB',
  borderDark: '#D1D5DB',

  scoreAge: '#3B82F6',
  scoreEducation: '#8B5CF6',
  scoreLanguage: '#EC4899',
  scoreWork: '#F59E0B',
  scoreSpouse: '#10B981',
  scoreSkill: '#6366F1',
  scoreAdditional: '#EF4444',
};

export const darkColors: ThemeColors = {
  primary: '#E0384E',
  primaryDark: '#C8102E',
  primaryLight: '#F06070',
  secondary: '#4A8CC7',
  secondaryLight: '#6AACDF',
  accent: '#E8C060',
  accentLight: '#4A3D1A',

  background: '#0F1115',
  surface: '#1A1D23',
  surfaceAlt: '#242830',
  surfaceWarm: '#2A2218',

  text: '#F0F0F2',
  textSecondary: '#9BA1AE',
  textMuted: '#6B7280',
  textLight: '#FFFFFF',

  success: '#3EBF73',
  successLight: '#1A2E22',
  warning: '#F0B929',
  warningLight: '#2E2810',
  error: '#F0505E',
  errorLight: '#2E1518',
  info: '#4A9AD8',
  infoLight: '#152535',

  border: '#2D3139',
  borderDark: '#3A3F48',

  scoreAge: '#5B9DF6',
  scoreEducation: '#A07CF6',
  scoreLanguage: '#F06AAF',
  scoreWork: '#F5B82B',
  scoreSpouse: '#30D991',
  scoreSkill: '#838AF1',
  scoreAdditional: '#F56464',
};

const Colors = lightColors;
export default Colors;
