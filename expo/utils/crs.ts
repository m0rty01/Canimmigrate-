import { CRSInputs, ScoreBreakdown, EducationLevel, LanguageScores } from '@/types/immigration';

function getAgePoints(age: number, hasSpouse: boolean): number {
  if (age < 18 || age > 44) return 0;

  const singlePoints: Record<number, number> = {
    18: 99, 19: 105, 20: 110, 21: 110, 22: 110, 23: 110, 24: 110,
    25: 110, 26: 110, 27: 110, 28: 110, 29: 110,
    30: 105, 31: 99, 32: 94, 33: 88, 34: 83,
    35: 77, 36: 72, 37: 66, 38: 61, 39: 55,
    40: 50, 41: 39, 42: 28, 43: 17, 44: 6,
  };

  const marriedPoints: Record<number, number> = {
    18: 90, 19: 95, 20: 100, 21: 100, 22: 100, 23: 100, 24: 100,
    25: 100, 26: 100, 27: 100, 28: 100, 29: 100,
    30: 95, 31: 90, 32: 85, 33: 80, 34: 75,
    35: 70, 36: 65, 37: 60, 38: 55, 39: 50,
    40: 45, 41: 35, 42: 25, 43: 15, 44: 5,
  };

  return hasSpouse ? (marriedPoints[age] ?? 0) : (singlePoints[age] ?? 0);
}

function getEducationPoints(edu: EducationLevel, hasSpouse: boolean): number {
  const single: Record<EducationLevel, number> = {
    none: 0, secondary: 30, one_year_post: 90, two_year_post: 98,
    bachelors: 120, two_or_more_post: 128, masters: 135, doctoral: 150,
  };
  const married: Record<EducationLevel, number> = {
    none: 0, secondary: 28, one_year_post: 84, two_year_post: 91,
    bachelors: 112, two_or_more_post: 119, masters: 126, doctoral: 140,
  };
  return hasSpouse ? (married[edu] ?? 0) : (single[edu] ?? 0);
}

function getCLBFromScore(score: number): number {
  if (score >= 8.5) return 10;
  if (score >= 8) return 9;
  if (score >= 7) return 8;
  if (score >= 6.5) return 7;
  if (score >= 6) return 7;
  if (score >= 5.5) return 6;
  if (score >= 5) return 5;
  if (score >= 4) return 4;
  return 3;
}

function getFirstLanguagePoints(scores: LanguageScores, hasSpouse: boolean): number {
  const abilities = [scores.speaking, scores.listening, scores.reading, scores.writing];
  let total = 0;

  for (const score of abilities) {
    const clb = getCLBFromScore(score);
    if (hasSpouse) {
      if (clb >= 10) total += 32;
      else if (clb === 9) total += 29;
      else if (clb === 8) total += 22;
      else if (clb === 7) total += 16;
      else if (clb === 6) total += 8;
      else if (clb >= 4) total += 6;
    } else {
      if (clb >= 10) total += 34;
      else if (clb === 9) total += 31;
      else if (clb === 8) total += 23;
      else if (clb === 7) total += 17;
      else if (clb === 6) total += 9;
      else if (clb >= 4) total += 6;
    }
  }
  return total;
}

function getSecondLanguagePoints(scores?: LanguageScores): number {
  if (!scores) return 0;
  const abilities = [scores.speaking, scores.listening, scores.reading, scores.writing];
  let total = 0;
  for (const score of abilities) {
    const clb = getCLBFromScore(score);
    if (clb >= 9) total += 6;
    else if (clb >= 7) total += 3;
    else if (clb >= 5) total += 1;
  }
  return Math.min(24, total);
}

function getWorkExperiencePoints(years: number, hasSpouse: boolean): number {
  if (years <= 0) return 0;
  if (hasSpouse) {
    if (years >= 6) return 70;
    if (years >= 4) return 56;
    if (years >= 2) return 46;
    return 35;
  }
  if (years >= 6) return 80;
  if (years >= 4) return 64;
  if (years >= 2) return 53;
  return 40;
}

function getSkillTransferabilityPoints(inputs: CRSInputs): number {
  let points = 0;
  const minCLB = getCLBFromScore(
    Math.min(
      inputs.firstLanguage.speaking,
      inputs.firstLanguage.listening,
      inputs.firstLanguage.reading,
      inputs.firstLanguage.writing
    )
  );

  const hasPostSecondary = inputs.education !== 'none' && inputs.education !== 'secondary';

  if (hasPostSecondary && minCLB >= 7) {
    points += minCLB >= 9 ? 25 : 13;
  }

  if (hasPostSecondary && inputs.canadianWorkExperience >= 1) {
    points += inputs.canadianWorkExperience >= 2 ? 25 : 13;
  }

  if (inputs.foreignWorkExperience >= 1 && minCLB >= 7) {
    points += (inputs.foreignWorkExperience >= 3 && minCLB >= 9) ? 25 : 13;
  }

  if (inputs.foreignWorkExperience >= 1 && inputs.canadianWorkExperience >= 1) {
    points += (inputs.foreignWorkExperience >= 3 && inputs.canadianWorkExperience >= 2) ? 25 : 13;
  }

  return Math.min(100, points);
}

function getSpousePoints(inputs: CRSInputs): number {
  if (inputs.maritalStatus !== 'married') return 0;
  let points = 0;

  if (inputs.spouseEducation) {
    const eduPoints: Record<EducationLevel, number> = {
      none: 0, secondary: 2, one_year_post: 6, two_year_post: 7,
      bachelors: 8, two_or_more_post: 9, masters: 10, doctoral: 10,
    };
    points += eduPoints[inputs.spouseEducation] ?? 0;
  }

  if (inputs.spouseLanguage) {
    const abilities = [
      inputs.spouseLanguage.speaking, inputs.spouseLanguage.listening,
      inputs.spouseLanguage.reading, inputs.spouseLanguage.writing,
    ];
    for (const score of abilities) {
      const clb = getCLBFromScore(score);
      if (clb >= 9) points += 5;
      else if (clb >= 7) points += 3;
      else if (clb >= 5) points += 1;
    }
  }

  if (inputs.spouseCanadianWorkExperience && inputs.spouseCanadianWorkExperience >= 1) {
    points += inputs.spouseCanadianWorkExperience >= 5 ? 10 :
              inputs.spouseCanadianWorkExperience >= 2 ? 5 : 5;
  }

  return Math.min(40, points);
}

function getAdditionalPoints(inputs: CRSInputs): number {
  let points = 0;
  if (inputs.hasPNP) points += 600;
  if (inputs.hasJobOffer) {
    if (inputs.jobOfferNOC === 'noc_00') points += 200;
    else points += 50;
  }
  if (inputs.hasCanadianEducation) points += 30;
  if (inputs.hasSiblingInCanada) points += 15;
  return points;
}

export function calculateCRS(inputs: CRSInputs): ScoreBreakdown {
  const hasSpouse = inputs.maritalStatus === 'married';

  const age = getAgePoints(inputs.age, hasSpouse);
  const education = getEducationPoints(inputs.education, hasSpouse);
  const firstLanguage = getFirstLanguagePoints(inputs.firstLanguage, hasSpouse);
  const secondLanguage = getSecondLanguagePoints(
    inputs.hasSecondLanguage ? inputs.secondLanguage : undefined
  );
  const canadianWorkExperience = getWorkExperiencePoints(inputs.canadianWorkExperience, hasSpouse);
  const spouseFactors = getSpousePoints(inputs);
  const skillTransferability = getSkillTransferabilityPoints(inputs);
  const additionalPoints = getAdditionalPoints(inputs);

  const total = age + education + firstLanguage + secondLanguage +
    canadianWorkExperience + spouseFactors + skillTransferability + additionalPoints;

  return {
    age, education, firstLanguage, secondLanguage,
    canadianWorkExperience, spouseFactors, skillTransferability,
    additionalPoints, total,
  };
}

export const defaultCRSInputs: CRSInputs = {
  age: 30,
  education: 'bachelors',
  firstLanguage: { speaking: 7, listening: 7, reading: 7, writing: 7 },
  hasSecondLanguage: false,
  canadianWorkExperience: 0,
  foreignWorkExperience: 1,
  maritalStatus: 'single',
  hasJobOffer: false,
  hasPNP: false,
  hasCanadianEducation: false,
  hasSiblingInCanada: false,
};

export interface CRSTip {
  id: string;
  title: string;
  description: string;
  potentialGain: number;
  category: string;
}

export function generateTips(inputs: CRSInputs): CRSTip[] {
  const tips: CRSTip[] = [];
  const minLang = Math.min(
    inputs.firstLanguage.speaking, inputs.firstLanguage.listening,
    inputs.firstLanguage.reading, inputs.firstLanguage.writing
  );

  if (minLang < 8) {
    tips.push({
      id: 'lang_improve',
      title: 'Improve Language Scores',
      description: 'Raising your lowest band to 8.0+ (CLB 9) can significantly boost your score.',
      potentialGain: 40,
      category: 'Language',
    });
  }

  if (!inputs.hasPNP) {
    tips.push({
      id: 'pnp',
      title: 'Apply for Provincial Nomination',
      description: 'A PNP nomination adds 600 points, virtually guaranteeing an invitation.',
      potentialGain: 600,
      category: 'PNP',
    });
  }

  if (!inputs.hasJobOffer) {
    tips.push({
      id: 'job_offer',
      title: 'Get a Valid Job Offer',
      description: 'A valid LMIA-supported job offer can add 50-200 points.',
      potentialGain: 50,
      category: 'Employment',
    });
  }

  if (inputs.canadianWorkExperience < 1) {
    tips.push({
      id: 'can_work',
      title: 'Gain Canadian Work Experience',
      description: 'Even 1 year of Canadian experience adds 40+ points and unlocks bonuses.',
      potentialGain: 70,
      category: 'Work',
    });
  }

  if (!inputs.hasCanadianEducation) {
    tips.push({
      id: 'can_edu',
      title: 'Study in Canada',
      description: 'A Canadian post-secondary credential adds 30 additional points.',
      potentialGain: 30,
      category: 'Education',
    });
  }

  if (inputs.education !== 'masters' && inputs.education !== 'doctoral') {
    tips.push({
      id: 'higher_edu',
      title: 'Pursue Higher Education',
      description: "A Master's or PhD increases education points and skill transferability.",
      potentialGain: 30,
      category: 'Education',
    });
  }

  if (!inputs.hasSecondLanguage) {
    tips.push({
      id: 'second_lang',
      title: 'Take a Second Language Test',
      description: 'French as a second language can add up to 24 additional points.',
      potentialGain: 24,
      category: 'Language',
    });
  }

  return tips.sort((a, b) => b.potentialGain - a.potentialGain);
}
