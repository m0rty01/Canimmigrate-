import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import {
  UserProfile,
  CRSScenario,
  ChecklistItem,
  defaultProfile,
  defaultChecklist,
  profileToCRSInputs,
} from '@/types/immigration';
import { calculateCRS, generateTips } from '@/utils/crs';
import type { ScoreBreakdown } from '@/types/immigration';
import type { CRSTip } from '@/utils/crs';

const PROFILE_KEY = 'canimmigrate_profile';
const SCENARIOS_KEY = 'canimmigrate_scenarios';
const CHECKLIST_KEY = 'canimmigrate_checklist';
const ONBOARDING_KEY = 'canimmigrate_onboarding';
const DISCLAIMER_KEY = 'canimmigrate_disclaimer';

export const [UserProvider, useUser] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [scenarios, setScenarios] = useState<CRSScenario[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(defaultChecklist);
  const [onboardingDone, setOnboardingDone] = useState<boolean>(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean>(false);

  const profileQuery = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(PROFILE_KEY);
      return stored ? (JSON.parse(stored) as UserProfile) : null;
    },
  });

  const scenariosQuery = useQuery({
    queryKey: ['crs-scenarios'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(SCENARIOS_KEY);
      return stored ? (JSON.parse(stored) as CRSScenario[]) : [];
    },
  });

  const checklistQuery = useQuery({
    queryKey: ['checklist'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(CHECKLIST_KEY);
      return stored ? (JSON.parse(stored) as ChecklistItem[]) : defaultChecklist;
    },
  });

  const onboardingQuery = useQuery({
    queryKey: ['onboarding'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(ONBOARDING_KEY);
      return stored === 'true';
    },
  });

  const disclaimerQuery = useQuery({
    queryKey: ['disclaimer'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(DISCLAIMER_KEY);
      return stored === 'true';
    },
  });

  useEffect(() => {
    if (profileQuery.data) {
      setProfile(profileQuery.data);
    }
  }, [profileQuery.data]);

  useEffect(() => {
    if (scenariosQuery.data) {
      setScenarios(scenariosQuery.data);
    }
  }, [scenariosQuery.data]);

  useEffect(() => {
    if (checklistQuery.data) {
      setChecklist(checklistQuery.data);
    }
  }, [checklistQuery.data]);

  useEffect(() => {
    if (onboardingQuery.data !== undefined) {
      setOnboardingDone(onboardingQuery.data);
    }
  }, [onboardingQuery.data]);

  useEffect(() => {
    if (disclaimerQuery.data !== undefined) {
      setDisclaimerAccepted(disclaimerQuery.data);
    }
  }, [disclaimerQuery.data]);

  const profileMutation = useMutation({
    mutationFn: async (newProfile: UserProfile) => {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
      return newProfile;
    },
    onSuccess: (data) => {
      setProfile(data);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });

  const scenarioMutation = useMutation({
    mutationFn: async (newScenarios: CRSScenario[]) => {
      await AsyncStorage.setItem(SCENARIOS_KEY, JSON.stringify(newScenarios));
      return newScenarios;
    },
    onSuccess: (data) => {
      setScenarios(data);
      queryClient.invalidateQueries({ queryKey: ['crs-scenarios'] });
    },
  });

  const checklistMutation = useMutation({
    mutationFn: async (newChecklist: ChecklistItem[]) => {
      await AsyncStorage.setItem(CHECKLIST_KEY, JSON.stringify(newChecklist));
      return newChecklist;
    },
    onSuccess: (data) => {
      setChecklist(data);
    },
  });

  const onboardingMutation = useMutation({
    mutationFn: async () => {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      return true;
    },
    onSuccess: () => {
      setOnboardingDone(true);
    },
  });

  const disclaimerMutation = useMutation({
    mutationFn: async () => {
      await AsyncStorage.setItem(DISCLAIMER_KEY, 'true');
      return true;
    },
    onSuccess: () => {
      setDisclaimerAccepted(true);
    },
  });

  const { mutate: mutateProfile } = profileMutation;
  const updateProfile = useCallback((newProfile: UserProfile) => {
    mutateProfile(newProfile);
  }, [mutateProfile]);

  const { mutate: mutateScenario } = scenarioMutation;
  const saveScenario = useCallback((scenario: CRSScenario) => {
    const updated = [...scenarios, scenario];
    mutateScenario(updated);
  }, [scenarios, mutateScenario]);

  const deleteScenario = useCallback((id: string) => {
    const updated = scenarios.filter((s) => s.id !== id);
    mutateScenario(updated);
  }, [scenarios, mutateScenario]);

  const { mutate: mutateChecklist } = checklistMutation;
  const toggleChecklistItem = useCallback((id: string) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    mutateChecklist(updated);
  }, [checklist, mutateChecklist]);

  const { mutate: mutateOnboarding } = onboardingMutation;
  const completeOnboarding = useCallback(() => {
    mutateOnboarding();
  }, [mutateOnboarding]);

  const { mutate: mutateDisclaimer } = disclaimerMutation;
  const acceptDisclaimer = useCallback(() => {
    mutateDisclaimer();
  }, [mutateDisclaimer]);

  const crsBreakdown: ScoreBreakdown = useMemo(() => {
    if (!profile.profileCompleted) {
      return calculateCRS(profileToCRSInputs(defaultProfile));
    }
    return calculateCRS(profileToCRSInputs(profile));
  }, [profile]);

  const tips: CRSTip[] = useMemo(() => {
    return generateTips(profileToCRSInputs(profile));
  }, [profile]);

  const checklistProgress = useMemo(() => {
    const completed = checklist.filter((item) => item.completed).length;
    return { completed, total: checklist.length, percentage: Math.round((completed / checklist.length) * 100) };
  }, [checklist]);

  const isLoading = profileQuery.isLoading || scenariosQuery.isLoading || onboardingQuery.isLoading || disclaimerQuery.isLoading;

  return {
    profile,
    scenarios,
    checklist,
    onboardingDone,
    disclaimerAccepted,
    crsBreakdown,
    tips,
    checklistProgress,
    isLoading,
    updateProfile,
    saveScenario,
    deleteScenario,
    toggleChecklistItem,
    completeOnboarding,
    acceptDisclaimer,
  };
});
