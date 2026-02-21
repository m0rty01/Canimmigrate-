export interface ProvinceJobData {
  province: string;
  provinceCode: string;
  employmentRate: number;
  averageWage: number;
  jobVacancies: number;
  demandLevel: 'high' | 'medium' | 'low';
  topSectors: string[];
}

export interface OccupationData {
  noc: string;
  title: string;
  category: string;
  nationalAvgWage: number;
  nationalEmploymentRate: number;
  provinces: ProvinceJobData[];
  pnpHighDemand: string[];
  outlook: 'growing' | 'stable' | 'declining';
}

export interface CityLivingCost {
  city: string;
  province: string;
  avgRent1Bed: number;
  avgRent2Bed: number;
  groceriesIndex: number;
  transportPass: number;
  utilitiesMonthly: number;
  childcareMonthly: number;
  avgImmigrantIncome: number;
  cpiIndex: number;
  housingAffordabilityScore: number;
}

export interface SettlementOutcome {
  admissionCategory: string;
  originRegion: string;
  field: string;
  province: string;
  year1Income: number;
  year3Income: number;
  year5Income: number;
  mobilityRate: number;
  retentionRate: number;
  insights: string[];
}

export interface DemographicInsight {
  city: string;
  province: string;
  totalPopulation: number;
  immigrantPercentage: number;
  topOriginCountries: { country: string; percentage: number }[];
  languagesSpoken: { language: string; speakers: number }[];
  settlementServices: number;
  diversityIndex: number;
}

export interface ImmigrationTarget {
  year: number;
  totalTarget: number;
  economicClass: number;
  familyClass: number;
  refugees: number;
  humanitarian: number;
  breakdown: {
    federalHighSkilled: number;
    federalBusinessClass: number;
    economicPilots: number;
    atlanticProgram: number;
    pnp: number;
    caregivers: number;
    trToPr: number;
  };
  francophoneTarget: number;
}

export interface CategoryBreakdown {
  category: string;
  target2025: number;
  target2026: number;
  target2027: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

export interface TrendAlert {
  id: string;
  title: string;
  description: string;
  category: 'job_market' | 'immigration' | 'economic' | 'policy';
  severity: 'info' | 'important' | 'critical';
  date: string;
  source: string;
}

export type AnalyticsSection = 'jobs' | 'cost' | 'settlement' | 'demographics' | 'projections' | 'trends';
