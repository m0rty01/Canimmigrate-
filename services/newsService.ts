import { NewsItem, DrawRecord } from '@/types/immigration';
import { newsItems as fallbackNews, drawHistory as fallbackDrawHistory } from '@/mocks/news';

const IRCC_ROUNDS_URL =
  'https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json';

interface IRCCRound {
  drawNumber: string;
  drawNumberURL: string;
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

function parseDrawType(drawName: string): string {
  const name = drawName.toLowerCase();
  if (name.includes('provincial') || name.includes('pnp')) return 'PNP';
  if (name.includes('canadian experience') || name.includes('cec')) return 'CEC';
  if (name.includes('federal skilled worker') || name.includes('fsw')) return 'FSW';
  if (name.includes('federal skilled trade') || name.includes('fst')) return 'FST';
  if (name.includes('french')) return 'French';
  if (name.includes('healthcare')) return 'Healthcare';
  if (name.includes('stem')) return 'STEM';
  if (name.includes('trade')) return 'Trade';
  if (name.includes('transport')) return 'Transport';
  if (name.includes('agriculture') || name.includes('agri')) return 'Agri-food';
  if (name.includes('general') || name.includes('no program')) return 'General';
  return 'Other';
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
      const monthStr = parts[1];
      const day = parts[2];
      const year = parts[3];
      const monthDate = new Date(`${monthStr} 1, 2000`);
      const month = String(monthDate.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}-${String(day).padStart(2, '0')}`;
    }
    return cleaned;
  } catch {
    return dateStr;
  }
}

function parseNumber(str: string): number {
  return parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
}

function roundToNewsItem(round: IRCCRound, index: number): NewsItem {
  const date = parseDateString(round.drawDateFull || round.drawDate);
  const score = parseNumber(round.drawCRS);
  const invitations = parseNumber(round.drawSize);
  const drawNumber = round.drawNumber.replace(/<[^>]*>/g, '').trim();
  const cleanName = round.drawName.replace(/<[^>]*>/g, '').trim();

  return {
    id: `draw-${drawNumber}-${index}`,
    title: `Express Entry Draw #${drawNumber}: ${cleanName}`,
    summary: `IRCC conducted a ${cleanName} draw inviting ${invitations.toLocaleString()} candidates with a minimum CRS score of ${score}.`,
    date,
    category: 'draw',
    source: 'IRCC',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html',
    drawScore: score,
    drawInvitations: invitations,
  };
}

function roundToDrawRecord(round: IRCCRound): DrawRecord {
  return {
    date: parseDateString(round.drawDateFull || round.drawDate),
    score: parseNumber(round.drawCRS),
    invitations: parseNumber(round.drawSize),
    type: parseDrawType(round.drawName),
  };
}

export interface LiveNewsData {
  newsItems: NewsItem[];
  drawHistory: DrawRecord[];
  lastUpdated: string;
  isLive: boolean;
}

export async function fetchLiveNewsData(): Promise<LiveNewsData> {
  try {
    console.log('[NewsService] Fetching live data from IRCC...');
    const response = await fetch(IRCC_ROUNDS_URL, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`IRCC API returned ${response.status}`);
    }

    const data: IRCCResponse = await response.json();
    console.log('[NewsService] Received', data.rounds?.length, 'rounds from IRCC');

    if (!data.rounds || data.rounds.length === 0) {
      throw new Error('No rounds data in IRCC response');
    }

    const drawNewsItems = data.rounds
      .slice(0, 30)
      .map((round, idx) => roundToNewsItem(round, idx));

    const drawHistoryItems = data.rounds
      .slice(0, 24)
      .map(roundToDrawRecord);

    const policyAndUpdates = fallbackNews.filter(
      (item) => item.category === 'policy' || item.category === 'update'
    );

    const seenIds = new Set(drawNewsItems.map(n => n.id));
    const uniquePolicyUpdates = policyAndUpdates.filter(n => !seenIds.has(n.id));
    const allNews = [...drawNewsItems, ...uniquePolicyUpdates].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    console.log('[NewsService] Live data processed successfully:', allNews.length, 'items');

    return {
      newsItems: allNews,
      drawHistory: drawHistoryItems,
      lastUpdated: new Date().toISOString(),
      isLive: true,
    };
  } catch (error) {
    console.warn('[NewsService] Failed to fetch live data, using fallback:', error);
    return {
      newsItems: fallbackNews,
      drawHistory: fallbackDrawHistory,
      lastUpdated: new Date().toISOString(),
      isLive: false,
    };
  }
}
