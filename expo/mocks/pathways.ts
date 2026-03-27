import { PathwayInfo } from '@/types/immigration';
import { federalPathways } from './pathways-federal';
import { rcipPathways } from './pathways-rcip';
import { pnpPathways } from './pathways-pnp';
import { temporaryPathways, otherPathways } from './pathways-other';

export const pathways: PathwayInfo[] = [
  ...federalPathways,
  ...rcipPathways,
  ...pnpPathways,
  ...temporaryPathways,
  ...otherPathways,
];
