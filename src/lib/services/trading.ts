import type { Position } from '$lib/stores/positions';
import type { SupportedBlockchain } from '$lib/stores/blockchain';

export interface OpenPositionParams {
  blockchain: SupportedBlockchain;
  asset: string;
  collateral: number;
  leverage: number;
}

// Mock trading service
// In production, integrate with smart contracts or trading API
export async function openLongPosition(params: OpenPositionParams): Promise<Position> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const entryPrice = 3542.18; // Mock price
  const positionSize = params.collateral * params.leverage;
  
  const position: Position = {
    id: 'pos_' + Math.random().toString(36).substr(2, 9),
    blockchain: params.blockchain,
    asset: params.asset,
    type: 'long',
    entryPrice,
    currentPrice: entryPrice,
    size: positionSize,
    leverage: params.leverage,
    collateral: params.collateral,
    pnl: 0,
    pnlPercentage: 0,
    liquidationPrice: calculateLiquidationPrice(entryPrice, params.leverage),
    timestamp: Date.now(),
    status: 'open'
  };
  
  return position;
}

export async function closePosition(positionId: string): Promise<void> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In production, interact with smart contracts
  // to close the position and return collateral + PnL
}

export async function updatePositionPrices(positions: Position[]): Promise<Position[]> {
  // Mock price updates
  return positions.map(pos => {
    if (pos.status !== 'open') return pos;
    
    // Simulate price movement (-2% to +2%)
    const priceChange = (Math.random() - 0.5) * 0.04;
    const newPrice = pos.currentPrice * (1 + priceChange);
    
    const priceDiff = newPrice - pos.entryPrice;
    const pnl = (priceDiff / pos.entryPrice) * pos.size;
    const pnlPercentage = (pnl / pos.collateral) * 100;
    
    return {
      ...pos,
      currentPrice: newPrice,
      pnl,
      pnlPercentage
    };
  });
}

function calculateLiquidationPrice(entryPrice: number, leverage: number): number {
  // Simplified liquidation price calculation
  const maintenanceMarginRate = 0.005; // 0.5%
  const initialMarginRate = 1 / leverage;
  
  // For long positions
  return entryPrice * (1 - initialMarginRate + maintenanceMarginRate);
}