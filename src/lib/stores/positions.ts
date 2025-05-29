import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { SupportedBlockchain } from './blockchain';
import { fetchPositionsEvm } from '$lib/services/positions';
import { walletAddress } from './auth';
import { blockchain } from './blockchain';
import { formatPrice } from '$lib/services/birdeye';
import BigNumber from 'bignumber.js';

export interface Position {
  id: string;
  loanId: number;
  blockchain: SupportedBlockchain;
  asset: string;
  type: 'long' | 'short';
  entryPrice: number;
  currentPrice: number;
  size: number;
  leverage: number;
  collateral: number;
  pnl: number;
  pnlPercentage: number;
  liquidationPrice: number;
  timestamp: number;
  status: 'open' | 'closed' | 'liquidated';
}

interface PositionsState {
  positions: Position[];
  loading: boolean;
  error: string | null;
}

function createPositionsStore() {
  const { subscribe, set, update } = writable<PositionsState>({
    positions: [],
    loading: false,
    error: null
  });

  return {
    subscribe,
    setPositions: (items: Position[]) => {
      update(state => ({ ...state, positions: items }));
    },
    addPosition: (position: Position) => {
      update(state => ({
        ...state,
        positions: [...state.positions, position]
      }));
    },
    updatePosition: (id: string, updates: Partial<Position>) => {
      update(state => ({
        ...state,
        positions: state.positions.map(p => 
          p.id === id ? { ...p, ...updates } : p
        )
      }));
    },
    removePosition: (id: string) => {
      update(state => ({
        ...state,
        positions: state.positions.filter(p => p.id !== id)
      }));
    },
    setLoading: (loading: boolean) => {
      update(state => ({ ...state, loading }));
    },
    setError: (error: string | null) => {
      update(state => ({ ...state, error }));
    },
    clearAll: () => {
      set({
        positions: [],
        loading: false,
        error: null
      });
    }
  };
}

export const positions = createPositionsStore();

export const openPositions = derived(
  positions,
  ($positions) => $positions.positions.filter((p) => p.status === 'open')
);

export const closedPositions = derived(
  positions,
  ($positions) => $positions.positions.filter((p) => p.status !== 'open')
);

export const totalPnL = derived(
  openPositions,
  $openPositions => $openPositions.reduce((sum, p) => sum + p.pnl, 0)
);

export const totalCollateral = derived(
  openPositions,
  $openPositions => $openPositions.reduce((sum, p) => sum + p.collateral, 0)
);

let updateInterval: NodeJS.Timeout | null = null;


export async function loadPositions(status: 'open' | 'closed' = 'open'): Promise<void> {
  const address = get(walletAddress);
  if (!address) return;

  positions.setLoading(true);
  positions.setError(null);

  try {
    const raw = await fetchPositionsEvm(address, status);
    const chain = get(blockchain).current;
    const mapped = raw.map((p: any) => ({
      id: p.positionAddress || p.publicKey || `${Date.now()}-${Math.random().toString(36).substring(2)}`,
      loanId: p.loanId,
      blockchain: chain,
      asset: p.token?.symbol || 'N/A',
      type: 'long',
      entryPrice: Number(p.openingPositionSize) / 1e18 / (Number(p.collateralAmount) / 10 ** p.token.decimals),
      currentPrice: Number(p.offers[0].priceVsQuote) || 0,
      size: Number(p.collateralAmount) / 10 ** p.token.decimals || 0,
      leverage: Number(p.openingPositionSize) / Number(p.initialMargin),
      collateral: Number(p.initialPositionBase) || 0,
      pnl: (Number(p.offers[0].priceVsQuote) - Number(p.openingPositionSize) / 1e18 / (Number(p.collateralAmount) / 10 ** p.token.decimals)) * Number(p.collateralAmount) / 10 ** p.token.decimals,
      pnlPercentage: 0,
      liquidationPrice: Number(Number(p.offers[0].priceVsQuote) * (1 - 1/(Number(p.openingPositionSize) / Number(p.initialMargin)) * 0.9)) || 0,
      timestamp: p.openTimestamp ? Date.parse(p.openTimestamp) : Date.now(),
      status: p.status === 'active' ? 'open' : p.status === 'liquidated' ? 'liquidated' : 'closed'
    }));

    positions.setPositions(mapped);
  } catch (e) {
    console.error('Failed to load positions:', e);
    positions.setError('Failed to load positions');
  } finally {
    positions.setLoading(false);
  }
}

export function startPositionsUpdates(interval = 10000) {
  if (!browser || updateInterval) return;
  loadPositions();
  updateInterval = setInterval(loadPositions, interval);
}

export function stopPositionsUpdates() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}
