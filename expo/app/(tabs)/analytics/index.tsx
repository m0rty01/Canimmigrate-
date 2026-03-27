import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Briefcase,
  DollarSign,
  TrendingUp,
  Users,
  Target,
  Bell,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Star,
  AlertTriangle,
  Info,
  Zap,
  Globe,
  BarChart3,
  ArrowRight,
  X,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useUser } from '@/providers/UserProvider';
import { occupations, cityLivingCosts, settlementOutcomes, demographicInsights } from '@/mocks/statcan-data';
import { immigrationTargets, categoryBreakdowns, trendAlerts } from '@/mocks/ircc-plans';
import { fetchLiveAlerts } from '@/services/alertsService';
import type { OccupationData, CityLivingCost, SettlementOutcome, DemographicInsight, AnalyticsSection, TrendAlert as TrendAlertType } from '@/types/analytics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SECTIONS: { key: AnalyticsSection; label: string; icon: typeof Briefcase }[] = [
  { key: 'jobs', label: 'Jobs', icon: Briefcase },
  { key: 'cost', label: 'Cost of Living', icon: DollarSign },
  { key: 'settlement', label: 'Settlement', icon: TrendingUp },
  { key: 'demographics', label: 'Community', icon: Users },
  { key: 'projections', label: 'IRCC Targets', icon: Target },
  { key: 'trends', label: 'Alerts', icon: Bell },
];

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { profile } = useUser();
  const [activeSection, setActiveSection] = useState<AnalyticsSection>('jobs');
  const [jobSearch, setJobSearch] = useState<string>('');
  const [selectedOccupation, setSelectedOccupation] = useState<OccupationData | null>(null);
  const [compareCities, setCompareCities] = useState<string[]>(['Toronto', 'Calgary']);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedDemoCity, setSelectedDemoCity] = useState<string>('Toronto');
  const [citySearch, setCitySearch] = useState<string>('');
  const [demoSearch, setDemoSearch] = useState<string>('');
  const [alertFilter, setAlertFilter] = useState<string>('all');
  const headerAnim = useRef(new Animated.Value(0)).current;

  const liveAlertsQuery = useQuery({
    queryKey: ['live-alerts'],
    queryFn: fetchLiveAlerts,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 3 * 60 * 1000,
  });

  const liveAlerts = useMemo(() => {
    return liveAlertsQuery.data?.alerts ?? trendAlerts;
  }, [liveAlertsQuery.data]);

  const isAlertsLive = liveAlertsQuery.data?.isLive ?? false;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredOccupations = useMemo(() => {
    if (!jobSearch.trim()) return occupations;
    const q = jobSearch.toLowerCase();
    return occupations.filter(
      (o) => o.title.toLowerCase().includes(q) || o.category.toLowerCase().includes(q) || o.noc.includes(q)
    );
  }, [jobSearch]);

  const filteredCostCities = useMemo(() => {
    if (!citySearch.trim()) return cityLivingCosts;
    const q = citySearch.toLowerCase();
    return cityLivingCosts.filter(
      (c) => c.city.toLowerCase().includes(q) || c.province.toLowerCase().includes(q)
    );
  }, [citySearch]);

  const comparedCities = useMemo(() => {
    return cityLivingCosts.filter((c) => compareCities.includes(c.city));
  }, [compareCities]);

  const filteredDemoCities = useMemo(() => {
    if (!demoSearch.trim()) return demographicInsights;
    const q = demoSearch.toLowerCase();
    return demographicInsights.filter(
      (d) => d.city.toLowerCase().includes(q) || d.province.toLowerCase().includes(q)
    );
  }, [demoSearch]);

  const filteredAlerts = useMemo(() => {
    if (alertFilter === 'all') return liveAlerts;
    return liveAlerts.filter((a) => a.category === alertFilter);
  }, [liveAlerts, alertFilter]);

  const selectedTarget = useMemo(() => {
    return immigrationTargets.find((t) => t.year === selectedYear) ?? immigrationTargets[1];
  }, [selectedYear]);

  const selectedDemographic = useMemo(() => {
    return demographicInsights.find((d) => d.city === selectedDemoCity) ?? demographicInsights[0];
  }, [selectedDemoCity]);

  const formatCurrency = useCallback((val: number) => {
    return '$' + val.toLocaleString('en-CA');
  }, []);

  const formatNumber = useCallback((val: number) => {
    if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
    return val.toString();
  }, []);

  const getDemandColor = useCallback((level: string) => {
    switch (level) {
      case 'high': return colors.success;
      case 'medium': return colors.warning;
      case 'low': return colors.error;
      default: return colors.textMuted;
    }
  }, [colors]);

  const getSeverityColor = useCallback((severity: string) => {
    switch (severity) {
      case 'critical': return colors.error;
      case 'important': return colors.warning;
      case 'info': return colors.info;
      default: return colors.textMuted;
    }
  }, [colors]);

  const getTrendIcon = useCallback((trend: string) => {
    switch (trend) {
      case 'up': return ArrowUpRight;
      case 'down': return ArrowDownRight;
      default: return Minus;
    }
  }, []);

  const renderSectionPills = () => (
    <View style={styles.pillWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillContainer}
      >
        {SECTIONS.map((section) => {
          const isActive = activeSection === section.key;
          const IconComp = section.icon;
          return (
            <TouchableOpacity
              key={section.key}
              onPress={() => setActiveSection(section.key)}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? colors.primary : colors.surface,
                  borderColor: isActive ? colors.primary : colors.border,
                },
              ]}
              activeOpacity={0.7}
            >
              <IconComp size={14} color={isActive ? '#FFF' : colors.textSecondary} />
              <Text style={[styles.pillText, { color: isActive ? '#FFF' : colors.textSecondary }]}>
                {section.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderJobExplorer = () => (
    <View>
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search occupation (e.g. software engineer, nurse)..."
          placeholderTextColor={colors.textMuted}
          value={jobSearch}
          onChangeText={setJobSearch}
        />
        {jobSearch.length > 0 && (
          <TouchableOpacity onPress={() => setJobSearch('')}>
            <X size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {selectedOccupation ? (
        <View>
          <TouchableOpacity
            onPress={() => setSelectedOccupation(null)}
            style={[styles.backButton, { backgroundColor: colors.surfaceAlt }]}
          >
            <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back to all occupations</Text>
          </TouchableOpacity>
          {renderOccupationDetail(selectedOccupation)}
        </View>
      ) : (
        <View>
          {filteredOccupations.map((occ) => (
            <TouchableOpacity
              key={occ.noc}
              style={[styles.occupationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setSelectedOccupation(occ)}
              activeOpacity={0.7}
            >
              <View style={styles.occupationCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.occupationTitle, { color: colors.text }]}>{occ.title}</Text>
                  <Text style={[styles.occupationMeta, { color: colors.textSecondary }]}>
                    NOC {occ.noc} · {occ.category}
                  </Text>
                </View>
                <View style={[styles.outlookBadge, { backgroundColor: occ.outlook === 'growing' ? colors.successLight : occ.outlook === 'stable' ? colors.infoLight : colors.errorLight }]}>
                  <Text style={[styles.outlookText, { color: occ.outlook === 'growing' ? colors.success : occ.outlook === 'stable' ? colors.info : colors.error }]}>
                    {occ.outlook === 'growing' ? '↑ Growing' : occ.outlook === 'stable' ? '→ Stable' : '↓ Declining'}
                  </Text>
                </View>
              </View>
              <View style={styles.occupationStats}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{formatCurrency(occ.nationalAvgWage)}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Avg Wage</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{occ.nationalEmploymentRate}%</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Employment</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{occ.pnpHighDemand.length}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>PNP Provinces</Text>
                </View>
              </View>
              <View style={styles.occupationCardFooter}>
                <Text style={[styles.exploreText, { color: colors.primary }]}>Explore by province</Text>
                <ChevronRight size={16} color={colors.primary} />
              </View>
            </TouchableOpacity>
          ))}
          {filteredOccupations.length === 0 && (
            <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <Search size={40} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No occupations found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Try a different search term</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderOccupationDetail = (occ: OccupationData) => (
    <View>
      <View style={[styles.detailHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.detailTitle, { color: colors.text }]}>{occ.title}</Text>
        <Text style={[styles.detailSubtitle, { color: colors.textSecondary }]}>
          NOC {occ.noc} · National Avg: {formatCurrency(occ.nationalAvgWage)}/yr
        </Text>
        {occ.pnpHighDemand.length > 0 && (
          <View style={styles.pnpBadges}>
            <Text style={[styles.pnpLabel, { color: colors.primary }]}>PNP High Demand:</Text>
            <View style={styles.pnpList}>
              {occ.pnpHighDemand.map((p) => (
                <View key={p} style={[styles.pnpChip, { backgroundColor: colors.primaryLight + '20', borderColor: colors.primary + '40' }]}>
                  <Text style={[styles.pnpChipText, { color: colors.primary }]}>{p}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {occ.provinces.sort((a, b) => b.averageWage - a.averageWage).map((prov) => (
        <View key={prov.provinceCode} style={[styles.provinceRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.provinceHeader}>
            <View style={styles.provinceNameRow}>
              <MapPin size={14} color={getDemandColor(prov.demandLevel)} />
              <Text style={[styles.provinceName, { color: colors.text }]}>{prov.province}</Text>
            </View>
            <View style={[styles.demandBadge, { backgroundColor: getDemandColor(prov.demandLevel) + '20' }]}>
              <Text style={[styles.demandText, { color: getDemandColor(prov.demandLevel) }]}>
                {prov.demandLevel.toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.provinceStats}>
            <View style={styles.provStatItem}>
              <Text style={[styles.provStatValue, { color: colors.text }]}>{formatCurrency(prov.averageWage)}</Text>
              <Text style={[styles.provStatLabel, { color: colors.textMuted }]}>Avg Wage</Text>
            </View>
            <View style={styles.provStatItem}>
              <Text style={[styles.provStatValue, { color: colors.text }]}>{prov.employmentRate}%</Text>
              <Text style={[styles.provStatLabel, { color: colors.textMuted }]}>Employed</Text>
            </View>
            <View style={styles.provStatItem}>
              <Text style={[styles.provStatValue, { color: colors.text }]}>{formatNumber(prov.jobVacancies)}</Text>
              <Text style={[styles.provStatLabel, { color: colors.textMuted }]}>Vacancies</Text>
            </View>
          </View>
          <View style={styles.sectorRow}>
            {prov.topSectors.map((s) => (
              <View key={s} style={[styles.sectorChip, { backgroundColor: colors.surfaceAlt }]}>
                <Text style={[styles.sectorText, { color: colors.textSecondary }]}>{s}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderCostComparator = () => {
    return (
      <View>
        <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
          Compare cost of living across {cityLivingCosts.length} Canadian cities. Data sourced from StatCan CPI, CMHC rental reports, and IMDB immigrant income statistics.
        </Text>

        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search city or province..."
            placeholderTextColor={colors.textMuted}
            value={citySearch}
            onChangeText={setCitySearch}
          />
          {citySearch.length > 0 && (
            <TouchableOpacity onPress={() => setCitySearch('')}>
              <X size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.citySelector}>
          <Text style={[styles.citySelectorLabel, { color: colors.text }]}>Select cities to compare (max 4):</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.citySelectorList}>
            {filteredCostCities.map((c) => {
              const isSelected = compareCities.includes(c.city);
              return (
                <TouchableOpacity
                  key={c.city}
                  onPress={() => {
                    if (isSelected) {
                      if (compareCities.length > 1) {
                        setCompareCities(compareCities.filter((ci) => ci !== c.city));
                      }
                    } else if (compareCities.length < 4) {
                      setCompareCities([...compareCities, c.city]);
                    }
                  }}
                  style={[
                    styles.cityChip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.cityChipText, { color: isSelected ? '#FFF' : colors.textSecondary }]}>
                    {c.city}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {comparedCities.length >= 2 ? (
          <View>
            <View style={[styles.comparisonTable, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
                <View style={styles.tableHeaderCell}>
                  <Text style={[styles.tableHeaderText, { color: colors.textMuted }]}>Metric</Text>
                </View>
                {comparedCities.map((city) => (
                  <View key={city.city} style={styles.tableHeaderCell}>
                    <Text style={[styles.tableHeaderText, { color: colors.text }]} numberOfLines={1}>{city.city}</Text>
                  </View>
                ))}
              </View>

              {renderComparisonRow('1-Bed Rent', comparedCities.map((c) => formatCurrency(c.avgRent1Bed) + '/mo'))}
              {renderComparisonRow('2-Bed Rent', comparedCities.map((c) => formatCurrency(c.avgRent2Bed) + '/mo'))}
              {renderComparisonRow('Groceries Index', comparedCities.map((c) => c.groceriesIndex.toString()))}
              {renderComparisonRow('Transit Pass', comparedCities.map((c) => c.transportPass > 0 ? formatCurrency(c.transportPass) + '/mo' : 'N/A'))}
              {renderComparisonRow('Utilities', comparedCities.map((c) => formatCurrency(c.utilitiesMonthly) + '/mo'))}
              {renderComparisonRow('Childcare', comparedCities.map((c) => formatCurrency(c.childcareMonthly) + '/mo'))}
              {renderComparisonRow('Immigrant Income', comparedCities.map((c) => formatCurrency(c.avgImmigrantIncome) + '/yr'), true)}
              {renderComparisonRow('CPI Index', comparedCities.map((c) => c.cpiIndex.toString()))}
              {renderComparisonRow('Affordability', comparedCities.map((c) => c.housingAffordabilityScore + '/100'), true)}
            </View>

            <View style={[styles.insightCard, { backgroundColor: colors.infoLight, borderColor: colors.info + '30' }]}>
              <Info size={16} color={colors.info} />
              <Text style={[styles.insightText, { color: colors.info }]}>
                Housing Affordability Score: 100 = most affordable. Scores below 40 indicate significant housing cost burden for newcomers.
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <DollarSign size={40} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Select at least 2 cities</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Choose cities above to compare costs</Text>
          </View>
        )}
      </View>
    );
  };

  const renderComparisonRow = (label: string, values: string[], highlight?: boolean) => (
    <View style={[styles.tableRow, highlight ? { backgroundColor: colors.surfaceAlt } : {}]} key={label}>
      <View style={styles.tableCell}>
        <Text style={[styles.tableCellLabel, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      {values.map((val, i) => (
        <View key={i} style={styles.tableCell}>
          <Text style={[styles.tableCellValue, { color: highlight ? colors.primary : colors.text }]}>{val}</Text>
        </View>
      ))}
    </View>
  );

  const renderSettlementSimulator = () => (
    <View>
      <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
        Predicted settlement outcomes based on IMDB mobility data by admission category, origin, and field. Shows income progression over 5 years.
      </Text>

      {settlementOutcomes.map((outcome, idx) => (
        <View key={`${outcome.admissionCategory}-${outcome.originRegion}-${outcome.field}-${outcome.province}`} style={[styles.settlementCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.settlementHeader}>
            <View style={[styles.admissionBadge, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.admissionBadgeText, { color: colors.primary }]}>{outcome.admissionCategory}</Text>
            </View>
            <Text style={[styles.settlementOrigin, { color: colors.textSecondary }]}>
              {outcome.originRegion} · {outcome.field}
            </Text>
          </View>

          <View style={styles.settlementLocation}>
            <MapPin size={14} color={colors.textMuted} />
            <Text style={[styles.settlementProvince, { color: colors.text }]}>{outcome.province}</Text>
          </View>

          <View style={styles.incomeProgression}>
            <View style={styles.incomeStep}>
              <Text style={[styles.incomeLabel, { color: colors.textMuted }]}>Year 1</Text>
              <Text style={[styles.incomeValue, { color: colors.text }]}>{formatCurrency(outcome.year1Income)}</Text>
            </View>
            <View style={styles.incomeArrow}>
              <ArrowRight size={14} color={colors.textMuted} />
            </View>
            <View style={styles.incomeStep}>
              <Text style={[styles.incomeLabel, { color: colors.textMuted }]}>Year 3</Text>
              <Text style={[styles.incomeValue, { color: colors.text }]}>{formatCurrency(outcome.year3Income)}</Text>
            </View>
            <View style={styles.incomeArrow}>
              <ArrowRight size={14} color={colors.textMuted} />
            </View>
            <View style={styles.incomeStep}>
              <Text style={[styles.incomeLabel, { color: colors.textMuted }]}>Year 5</Text>
              <Text style={[styles.incomeValue, { color: colors.success }]}>{formatCurrency(outcome.year5Income)}</Text>
            </View>
          </View>

          <View style={styles.retentionRow}>
            <View style={styles.retentionItem}>
              <Text style={[styles.retentionLabel, { color: colors.textMuted }]}>Retention Rate</Text>
              <Text style={[styles.retentionValue, { color: colors.success }]}>{outcome.retentionRate}%</Text>
            </View>
            <View style={styles.retentionItem}>
              <Text style={[styles.retentionLabel, { color: colors.textMuted }]}>Mobility Rate</Text>
              <Text style={[styles.retentionValue, { color: colors.warning }]}>{outcome.mobilityRate}%</Text>
            </View>
            <View style={styles.retentionItem}>
              <Text style={[styles.retentionLabel, { color: colors.textMuted }]}>5yr Growth</Text>
              <Text style={[styles.retentionValue, { color: colors.primary }]}>
                +{Math.round(((outcome.year5Income - outcome.year1Income) / outcome.year1Income) * 100)}%
              </Text>
            </View>
          </View>

          {outcome.insights.map((insight, i) => (
            <View key={i} style={styles.insightRow}>
              <View style={[styles.insightBullet, { backgroundColor: colors.primary }]} />
              <Text style={[styles.settlementInsight, { color: colors.textSecondary }]}>{insight}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );

  const renderDemographics = () => (
    <View>
      <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
        Find your community across {demographicInsights.length} Canadian cities. Ethnocultural data from StatCan Census to help reduce isolation and find support networks.
      </Text>

      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search city or province..."
          placeholderTextColor={colors.textMuted}
          value={demoSearch}
          onChangeText={setDemoSearch}
        />
        {demoSearch.length > 0 && (
          <TouchableOpacity onPress={() => setDemoSearch('')}>
            <X size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.citySelectorList}>
        {filteredDemoCities.map((d) => (
          <TouchableOpacity
            key={d.city}
            onPress={() => setSelectedDemoCity(d.city)}
            style={[
              styles.cityChip,
              {
                backgroundColor: selectedDemoCity === d.city ? colors.primary : colors.surface,
                borderColor: selectedDemoCity === d.city ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={[styles.cityChipText, { color: selectedDemoCity === d.city ? '#FFF' : colors.textSecondary }]}>
              {d.city}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={[styles.demoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.demoTitle, { color: colors.text }]}>{selectedDemographic.city}, {selectedDemographic.province}</Text>

        <View style={styles.demoStatsRow}>
          <View style={styles.demoStat}>
            <Text style={[styles.demoStatValue, { color: colors.primary }]}>
              {(selectedDemographic.totalPopulation / 1000).toFixed(0)}K
            </Text>
            <Text style={[styles.demoStatLabel, { color: colors.textMuted }]}>Population</Text>
          </View>
          <View style={styles.demoStat}>
            <Text style={[styles.demoStatValue, { color: colors.primary }]}>{selectedDemographic.immigrantPercentage}%</Text>
            <Text style={[styles.demoStatLabel, { color: colors.textMuted }]}>Immigrants</Text>
          </View>
          <View style={styles.demoStat}>
            <Text style={[styles.demoStatValue, { color: colors.primary }]}>{selectedDemographic.settlementServices}</Text>
            <Text style={[styles.demoStatLabel, { color: colors.textMuted }]}>Services</Text>
          </View>
          <View style={styles.demoStat}>
            <Text style={[styles.demoStatValue, { color: colors.primary }]}>{(selectedDemographic.diversityIndex * 100).toFixed(0)}%</Text>
            <Text style={[styles.demoStatLabel, { color: colors.textMuted }]}>Diversity</Text>
          </View>
        </View>

        <View style={[styles.demoSection, { borderTopColor: colors.border }]}>
          <Text style={[styles.demoSectionTitle, { color: colors.text }]}>Top Countries of Origin</Text>
          {selectedDemographic.topOriginCountries.map((c) => (
            <View key={c.country} style={styles.originRow}>
              <Text style={[styles.originCountry, { color: colors.text }]}>{c.country}</Text>
              <View style={styles.originBarContainer}>
                <View
                  style={[
                    styles.originBar,
                    { width: `${Math.min(c.percentage * 5, 100)}%`, backgroundColor: colors.primary },
                  ]}
                />
              </View>
              <Text style={[styles.originPercent, { color: colors.textSecondary }]}>{c.percentage}%</Text>
            </View>
          ))}
        </View>

        <View style={[styles.demoSection, { borderTopColor: colors.border }]}>
          <Text style={[styles.demoSectionTitle, { color: colors.text }]}>Languages Spoken (non-official)</Text>
          {selectedDemographic.languagesSpoken.map((l) => (
            <View key={l.language} style={styles.langRow}>
              <Globe size={13} color={colors.textMuted} />
              <Text style={[styles.langName, { color: colors.text }]}>{l.language}</Text>
              <Text style={[styles.langSpeakers, { color: colors.textSecondary }]}>
                {(l.speakers / 1000).toFixed(0)}K speakers
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderProjections = () => (
    <View>
      <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
        IRCC Immigration Levels Plan targets and category breakdowns. Use this to estimate your chances and plan your timeline.
      </Text>

      <View style={styles.yearSelector}>
        {immigrationTargets.map((t) => (
          <TouchableOpacity
            key={t.year}
            onPress={() => setSelectedYear(t.year)}
            style={[
              styles.yearChip,
              {
                backgroundColor: selectedYear === t.year ? colors.primary : colors.surface,
                borderColor: selectedYear === t.year ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={[styles.yearChipText, { color: selectedYear === t.year ? '#FFF' : colors.textSecondary }]}>
              {t.year}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.targetOverview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.targetTotal, { color: colors.text }]}>
          {selectedTarget.totalTarget.toLocaleString()} Total Target
        </Text>
        <View style={styles.targetBreakdownRow}>
          <View style={[styles.targetBlock, { backgroundColor: colors.primary + '15' }]}>
            <Text style={[styles.targetBlockValue, { color: colors.primary }]}>{formatNumber(selectedTarget.economicClass)}</Text>
            <Text style={[styles.targetBlockLabel, { color: colors.textMuted }]}>Economic</Text>
          </View>
          <View style={[styles.targetBlock, { backgroundColor: colors.info + '15' }]}>
            <Text style={[styles.targetBlockValue, { color: colors.info }]}>{formatNumber(selectedTarget.familyClass)}</Text>
            <Text style={[styles.targetBlockLabel, { color: colors.textMuted }]}>Family</Text>
          </View>
          <View style={[styles.targetBlock, { backgroundColor: colors.warning + '15' }]}>
            <Text style={[styles.targetBlockValue, { color: colors.warning }]}>{formatNumber(selectedTarget.refugees)}</Text>
            <Text style={[styles.targetBlockLabel, { color: colors.textMuted }]}>Refugees</Text>
          </View>
          <View style={[styles.targetBlock, { backgroundColor: colors.success + '15' }]}>
            <Text style={[styles.targetBlockValue, { color: colors.success }]}>{formatNumber(selectedTarget.humanitarian)}</Text>
            <Text style={[styles.targetBlockLabel, { color: colors.textMuted }]}>Other</Text>
          </View>
        </View>

        <View style={[styles.francophoneRow, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '30' }]}>
          <Star size={14} color={colors.accent} />
          <Text style={[styles.francophoneText, { color: colors.text }]}>
            Francophone Target: <Text style={{ fontWeight: '700' as const, color: colors.accent }}>{selectedTarget.francophoneTarget}%</Text> of all admissions outside Quebec
          </Text>
        </View>
      </View>

      <Text style={[styles.categoryTitle, { color: colors.text }]}>Category Breakdown & Trends</Text>

      {categoryBreakdowns.map((cat) => {
        const isExpanded = expandedCategory === cat.category;
        const TrendIcon = getTrendIcon(cat.trend);
        const trendColor = cat.trend === 'up' ? colors.success : cat.trend === 'down' ? colors.error : colors.textMuted;

        return (
          <TouchableOpacity
            key={cat.category}
            onPress={() => setExpandedCategory(isExpanded ? null : cat.category)}
            style={[styles.categoryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <View style={styles.categoryHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.categoryName, { color: colors.text }]}>{cat.category}</Text>
              </View>
              <TrendIcon size={16} color={trendColor} />
              {isExpanded ? (
                <ChevronUp size={18} color={colors.textMuted} />
              ) : (
                <ChevronDown size={18} color={colors.textMuted} />
              )}
            </View>

            <View style={styles.categoryNumbers}>
              <View style={styles.catNumItem}>
                <Text style={[styles.catNumLabel, { color: colors.textMuted }]}>2025</Text>
                <Text style={[styles.catNumValue, { color: colors.text }]}>{formatNumber(cat.target2025)}</Text>
              </View>
              <View style={styles.catNumItem}>
                <Text style={[styles.catNumLabel, { color: colors.textMuted }]}>2026</Text>
                <Text style={[styles.catNumValue, { color: colors.primary }]}>{formatNumber(cat.target2026)}</Text>
              </View>
              <View style={styles.catNumItem}>
                <Text style={[styles.catNumLabel, { color: colors.textMuted }]}>2027</Text>
                <Text style={[styles.catNumValue, { color: colors.text }]}>{formatNumber(cat.target2027)}</Text>
              </View>
            </View>

            {isExpanded && (
              <View style={[styles.categoryDescription, { borderTopColor: colors.border }]}>
                <Text style={[styles.categoryDescText, { color: colors.textSecondary }]}>{cat.description}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      <View style={[styles.profileFitCard, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '25' }]}>
        <Zap size={18} color={colors.primary} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.profileFitTitle, { color: colors.text }]}>Your Profile Fit</Text>
          <Text style={[styles.profileFitText, { color: colors.textSecondary }]}>
            {profile.profileCompleted
              ? `Based on your CRS score and background, Federal High Skilled (${formatNumber(selectedTarget.breakdown.federalHighSkilled)} spots) and PNP (${formatNumber(selectedTarget.breakdown.pnp)} spots) are your strongest routes in ${selectedYear}.`
              : 'Complete your profile to get personalized pathway projections based on immigration targets.'}
          </Text>
        </View>
      </View>
    </View>
  );

  const ALERT_FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'immigration', label: 'Immigration' },
    { key: 'job_market', label: 'Jobs' },
    { key: 'policy', label: 'Policy' },
    { key: 'economic', label: 'Economic' },
  ];

  const renderTrendAlerts = () => (
    <View>
      <View style={[styles.liveStatusBar, { backgroundColor: isAlertsLive ? colors.success + '15' : colors.warning + '15', borderColor: isAlertsLive ? colors.success + '30' : colors.warning + '30' }]}>
        {isAlertsLive ? <Wifi size={14} color={colors.success} /> : <WifiOff size={14} color={colors.warning} />}
        <Text style={[styles.liveStatusText, { color: isAlertsLive ? colors.success : colors.warning }]}>
          {isAlertsLive ? 'Live — Auto-refreshing every 5 min' : 'Offline — Showing cached alerts'}
        </Text>
        {liveAlertsQuery.isRefetching && <ActivityIndicator size="small" color={colors.primary} />}
        <TouchableOpacity onPress={() => liveAlertsQuery.refetch()} style={styles.refreshButton}>
          <RefreshCw size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
        Key intelligence from IRCC draws, StatCan data, policy updates, and labour market shifts. Monitoring {filteredAlerts.length} alerts.
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.citySelectorList, { marginBottom: 12 }]}>
        {ALERT_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setAlertFilter(f.key)}
            style={[
              styles.cityChip,
              {
                backgroundColor: alertFilter === f.key ? colors.primary : colors.surface,
                borderColor: alertFilter === f.key ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={[styles.cityChipText, { color: alertFilter === f.key ? '#FFF' : colors.textSecondary }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredAlerts.map((alert) => (
        <View key={alert.id} style={[styles.alertCard, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: getSeverityColor(alert.severity), borderLeftWidth: 4 }]}>
          <View style={styles.alertHeader}>
            <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(alert.severity) + '15' }]}>
              {alert.severity === 'critical' ? (
                <AlertTriangle size={12} color={getSeverityColor(alert.severity)} />
              ) : alert.severity === 'important' ? (
                <Zap size={12} color={getSeverityColor(alert.severity)} />
              ) : (
                <Info size={12} color={getSeverityColor(alert.severity)} />
              )}
              <Text style={[styles.severityText, { color: getSeverityColor(alert.severity) }]}>
                {alert.severity.toUpperCase()}
              </Text>
            </View>
            <View style={[styles.alertCategoryBadge, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={[styles.alertCategoryText, { color: colors.textSecondary }]}>
                {alert.category.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={[styles.alertTitle, { color: colors.text }]}>{alert.title}</Text>
          <Text style={[styles.alertDescription, { color: colors.textSecondary }]}>{alert.description}</Text>
          <View style={styles.alertFooter}>
            <Text style={[styles.alertSource, { color: colors.textMuted }]}>{alert.source}</Text>
            <Text style={[styles.alertDate, { color: colors.textMuted }]}>{alert.date}</Text>
          </View>
        </View>
      ))}

      {filteredAlerts.length === 0 && (
        <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
          <Bell size={40} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No alerts in this category</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Try a different filter</Text>
        </View>
      )}
    </View>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'jobs': return renderJobExplorer();
      case 'cost': return renderCostComparator();
      case 'settlement': return renderSettlementSimulator();
      case 'demographics': return renderDemographics();
      case 'projections': return renderProjections();
      case 'trends': return renderTrendAlerts();
      default: return null;
    }
  };

  const activeSectionData = SECTIONS.find((s) => s.key === activeSection);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? [colors.surface, colors.background] : [colors.secondary, colors.secondary + 'CC']}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <Animated.View style={{ opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
          <View style={styles.headerContent}>
            <BarChart3 size={22} color="#FFF" />
            <Text style={styles.headerTitle}>Data Intelligence</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            StatCan & IRCC insights for smarter decisions
          </Text>
        </Animated.View>
      </LinearGradient>

      {renderSectionPills()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {activeSectionData?.label}
          </Text>
        </View>

        {renderActiveSection()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  pillWrapper: {
    flexShrink: 0,
  },
  pillContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  sectionDescription: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  occupationCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  occupationCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  occupationTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  occupationMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  outlookBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  outlookText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  occupationStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  occupationCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  exploreText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  detailHeader: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
  },
  detailSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  pnpBadges: {
    marginTop: 12,
  },
  pnpLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    marginBottom: 6,
  },
  pnpList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pnpChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  pnpChipText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  provinceRow: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  provinceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  provinceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  provinceName: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  demandBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  demandText: {
    fontSize: 10,
    fontWeight: '800' as const,
  },
  provinceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  provStatItem: {
    alignItems: 'center',
  },
  provStatValue: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  provStatLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  sectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sectorChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sectorText: {
    fontSize: 11,
  },
  citySelector: {
    marginBottom: 16,
  },
  citySelectorLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  citySelectorList: {
    gap: 8,
    paddingBottom: 4,
  },
  cityChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  cityChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  comparisonTable: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    flex: 1,
    alignItems: 'center',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 8,
  },
  tableCell: {
    flex: 1,
    alignItems: 'center',
  },
  tableCellLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  tableCellValue: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  insightCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    alignItems: 'flex-start',
  },
  insightText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  settlementCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  settlementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  admissionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  admissionBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  settlementOrigin: {
    fontSize: 12,
  },
  settlementLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 14,
  },
  settlementProvince: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  incomeProgression: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    gap: 4,
  },
  incomeStep: {
    alignItems: 'center',
    flex: 1,
  },
  incomeLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  incomeValue: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  incomeArrow: {
    paddingHorizontal: 2,
    paddingTop: 8,
  },
  retentionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 10,
  },
  retentionItem: {
    alignItems: 'center',
  },
  retentionLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  retentionValue: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 6,
  },
  insightBullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 6,
  },
  settlementInsight: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  demoCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 14,
  },
  demoStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  demoStat: {
    alignItems: 'center',
  },
  demoStatValue: {
    fontSize: 18,
    fontWeight: '800' as const,
  },
  demoStatLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  demoSection: {
    borderTopWidth: 1,
    paddingTop: 14,
    marginTop: 14,
  },
  demoSectionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    marginBottom: 10,
  },
  originRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  originCountry: {
    fontSize: 13,
    width: 90,
  },
  originBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  originBar: {
    height: '100%',
    borderRadius: 4,
  },
  originPercent: {
    fontSize: 12,
    width: 40,
    textAlign: 'right',
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  langName: {
    fontSize: 13,
    flex: 1,
  },
  langSpeakers: {
    fontSize: 12,
  },
  yearSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  yearChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  yearChipText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  targetOverview: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  targetTotal: {
    fontSize: 22,
    fontWeight: '800' as const,
    textAlign: 'center',
    marginBottom: 16,
  },
  targetBreakdownRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  targetBlock: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  targetBlockValue: {
    fontSize: 16,
    fontWeight: '800' as const,
  },
  targetBlockLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  francophoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  francophoneText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  categoryCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  categoryNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  catNumItem: {
    alignItems: 'center',
  },
  catNumLabel: {
    fontSize: 10,
  },
  catNumValue: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  categoryDescription: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  categoryDescText: {
    fontSize: 12,
    lineHeight: 18,
  },
  profileFitCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 16,
    alignItems: 'flex-start',
  },
  profileFitTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  profileFitText: {
    fontSize: 12,
    lineHeight: 18,
  },
  alertCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '800' as const,
  },
  alertCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  alertCategoryText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    marginBottom: 6,
  },
  alertDescription: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alertSource: {
    fontSize: 11,
  },
  alertDate: {
    fontSize: 11,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    marginBottom: 12,
  },
  liveStatusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    flex: 1,
  },
  refreshButton: {
    padding: 4,
  },
});
