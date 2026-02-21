import type { TrendAlert } from '@/types/analytics';
import { trendAlerts as fallbackAlerts } from '@/mocks/ircc-plans';

const IRCC_ROUNDS_URL =
  'https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json';

interface IRCCRound {
  drawNumber: string;
  drawDate: string;
  drawDateFull: string;
  drawName: string;
  drawSize: string;
  drawCRS: string;
  [key: string]: string | undefined;
}

interface IRCCResponse {
  rounds: IRCCRound[];
}

function parseDateString(dateStr: string): string {
  try {
    const cleaned = dateStr.replace(/<[^>]*>/g, '').trim();
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
    const parts = cleaned.match(/(\w+)\s+(\d+),?\s+(\d+)/);
    if (parts) {
      const monthDate = new Date(`${parts[1]} 1, 2000`);
      const month = String(monthDate.getMonth() + 1).padStart(2, '0');
      return `${parts[3]}-${month}-${String(parts[2]).padStart(2, '0')}`;
    }
    return cleaned;
  } catch {
    return dateStr;
  }
}

function parseNumber(str: string): number {
  return parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
}

function roundToAlert(round: IRCCRound, index: number): TrendAlert {
  const drawNumber = round.drawNumber.replace(/<[^>]*>/g, '').trim();
  const cleanName = round.drawName.replace(/<[^>]*>/g, '').trim();
  const score = parseNumber(round.drawCRS);
  const invitations = parseNumber(round.drawSize);
  const date = parseDateString(round.drawDateFull || round.drawDate);

  const isLowScore = score < 500;
  const isLargeRound = invitations > 5000;

  let severity: TrendAlert['severity'] = 'info';
  if (isLowScore && isLargeRound) severity = 'critical';
  else if (isLowScore || isLargeRound) severity = 'important';

  return {
    id: `live-draw-${drawNumber}-${index}`,
    title: `Express Entry Draw #${drawNumber}: ${cleanName}`,
    description: `IRCC invited ${invitations.toLocaleString()} candidates with a minimum CRS of ${score}. ${isLowScore ? 'This is a relatively low CRS cutoff — check if you qualify.' : ''} ${isLargeRound ? 'Large round size indicates IRCC is actively working to meet targets.' : ''}`.trim(),
    category: 'immigration',
    severity,
    date,
    source: 'IRCC Express Entry',
  };
}

export interface LiveAlertsData {
  alerts: TrendAlert[];
  lastUpdated: string;
  isLive: boolean;
}

export async function fetchLiveAlerts(): Promise<LiveAlertsData> {
  try {
    console.log('[AlertsService] Fetching live draw data from IRCC...');
    const response = await fetch(IRCC_ROUNDS_URL, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`IRCC API returned ${response.status}`);
    }

    const data: IRCCResponse = await response.json();
    console.log('[AlertsService] Received', data.rounds?.length, 'rounds');

    if (!data.rounds || data.rounds.length === 0) {
      throw new Error('No rounds data in response');
    }

    const drawAlerts = data.rounds
      .slice(0, 10)
      .map((round, idx) => roundToAlert(round, idx));

    const seenIds = new Set(drawAlerts.map(a => a.id));
    const uniqueFallback = fallbackAlerts.filter(a => !seenIds.has(a.id));
    const allAlerts = [...drawAlerts, ...uniqueFallback].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    console.log('[AlertsService] Live alerts processed:', allAlerts.length, 'items');

    return {
      alerts: allAlerts,
      lastUpdated: new Date().toISOString(),
      isLive: true,
    };
  } catch (error) {
    console.warn('[AlertsService] Failed to fetch live data, using fallback:', error);
    return {
      alerts: fallbackAlerts,
      lastUpdated: new Date().toISOString(),
      isLive: false,
    };
  }
}
