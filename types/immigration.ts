export type EducationLevel =
  | 'none'
  | 'secondary'
  | 'one_year_post'
  | 'two_year_post'
  | 'bachelors'
  | 'two_or_more_post'
  | 'masters'
  | 'doctoral';

export type MaritalStatus = 'single' | 'married';

export type LanguageTest = 'ielts' | 'celpip' | 'tef' | 'tcf';

export interface LanguageScores {
  speaking: number;
  listening: number;
  reading: number;
  writing: number;
}

export interface CRSInputs {
  age: number;
  education: EducationLevel;
  firstLanguage: LanguageScores;
  hasSecondLanguage: boolean;
  secondLanguage?: LanguageScores;
  canadianWorkExperience: number;
  foreignWorkExperience: number;
  maritalStatus: MaritalStatus;
  spouseEducation?: EducationLevel;
  spouseLanguage?: LanguageScores;
  spouseCanadianWorkExperience?: number;
  hasJobOffer: boolean;
  jobOfferNOC?: 'noc_00' | 'noc_0ab' | 'noc_other';
  hasPNP: boolean;
  hasCanadianEducation: boolean;
  hasSiblingInCanada: boolean;
}

export interface ScoreBreakdown {
  age: number;
  education: number;
  firstLanguage: number;
  secondLanguage: number;
  canadianWorkExperience: number;
  spouseFactors: number;
  skillTransferability: number;
  additionalPoints: number;
  total: number;
}

export interface CRSScenario {
  id: string;
  name: string;
  inputs: CRSInputs;
  breakdown: ScoreBreakdown;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  age: number;
  education: EducationLevel;
  firstLanguageTest: LanguageTest;
  firstLanguage: LanguageScores;
  hasSecondLanguage: boolean;
  secondLanguageTest?: LanguageTest;
  secondLanguage?: LanguageScores;
  canadianWorkExperience: number;
  foreignWorkExperience: number;
  maritalStatus: MaritalStatus;
  spouseEducation?: EducationLevel;
  spouseLanguage?: LanguageScores;
  spouseCanadianWorkExperience?: number;
  hasJobOffer: boolean;
  jobOfferNOC?: 'noc_00' | 'noc_0ab' | 'noc_other';
  hasPNP: boolean;
  hasCanadianEducation: boolean;
  hasSiblingInCanada: boolean;
  onboardingCompleted: boolean;
  profileCompleted: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  category: 'draw' | 'policy' | 'update' | 'guide';
  source: string;
  url?: string;
  drawScore?: number;
  drawInvitations?: number;
}

export interface DrawRecord {
  date: string;
  score: number;
  invitations: number;
  type: string;
}

export interface PathwayInfo {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  category: 'federal' | 'pnp' | 'rcip' | 'temporary' | 'other';
  description: string;
  eligibility: string[];
  steps: string[];
  documents: string[];
  processingTime: string;
  fees: string;
  websiteUrl?: string;
  faqs: { question: string; answer: string }[];
  pros?: string[];
  cons?: string[];
  groundReality?: string[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  category: string;
}

export function profileToCRSInputs(profile: UserProfile): CRSInputs {
  return {
    age: profile.age,
    education: profile.education,
    firstLanguage: profile.firstLanguage,
    hasSecondLanguage: profile.hasSecondLanguage,
    secondLanguage: profile.secondLanguage,
    canadianWorkExperience: profile.canadianWorkExperience,
    foreignWorkExperience: profile.foreignWorkExperience,
    maritalStatus: profile.maritalStatus,
    spouseEducation: profile.spouseEducation,
    spouseLanguage: profile.spouseLanguage,
    spouseCanadianWorkExperience: profile.spouseCanadianWorkExperience,
    hasJobOffer: profile.hasJobOffer,
    jobOfferNOC: profile.jobOfferNOC,
    hasPNP: profile.hasPNP,
    hasCanadianEducation: profile.hasCanadianEducation,
    hasSiblingInCanada: profile.hasSiblingInCanada,
  };
}

export const defaultProfile: UserProfile = {
  name: '',
  email: '',
  age: 30,
  education: 'bachelors',
  firstLanguageTest: 'ielts',
  firstLanguage: { speaking: 7, listening: 7, reading: 7, writing: 7 },
  hasSecondLanguage: false,
  canadianWorkExperience: 0,
  foreignWorkExperience: 1,
  maritalStatus: 'single',
  hasJobOffer: false,
  hasPNP: false,
  hasCanadianEducation: false,
  hasSiblingInCanada: false,
  onboardingCompleted: false,
  profileCompleted: false,
};

export const defaultChecklist: ChecklistItem[] = [
  { id: '1', title: 'Take language test (IELTS/CELPIP/TEF)', completed: false, category: 'Language' },
  { id: '2', title: 'Get Educational Credential Assessment (ECA)', completed: false, category: 'Education' },
  { id: '3', title: 'Gather work experience reference letters', completed: false, category: 'Work' },
  { id: '4', title: 'Create Express Entry profile', completed: false, category: 'Application' },
  { id: '5', title: 'Get police clearance certificates', completed: false, category: 'Documents' },
  { id: '6', title: 'Complete medical examination', completed: false, category: 'Medical' },
  { id: '7', title: 'Prepare proof of funds', completed: false, category: 'Financial' },
  { id: '8', title: 'Submit permanent residence application', completed: false, category: 'Application' },
];

export const educationLabels: Record<EducationLevel, string> = {
  none: 'No formal education',
  secondary: 'High school diploma',
  one_year_post: '1-year post-secondary',
  two_year_post: '2-year post-secondary',
  bachelors: "Bachelor's degree",
  two_or_more_post: 'Two or more credentials',
  masters: "Master's degree",
  doctoral: 'Doctoral degree (PhD)',
};
