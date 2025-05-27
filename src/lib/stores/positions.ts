import { writable, derived } from 'svelte/store';
import type { SupportedBlockchain } from './blockchain';

export interface Position {
  id: string;
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
    setPositions: (items: Position[]) => {
      update(state => ({
        ...state,
        positions: items
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
  $positions => $positions.positions.filter(p => p.status === 'open')
);

export const totalPnL = derived(
  openPositions,
  $openPositions => $openPositions.reduce((sum, p) => sum + p.pnl, 0)
);

export const totalCollateral = derived(
  openPositions,
  $openPositions => $openPositions.reduce((sum, p) => sum + p.collateral, 0)
);