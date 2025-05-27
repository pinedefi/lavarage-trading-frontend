import type { Position } from '$lib/stores/positions';
import type { SupportedBlockchain } from '$lib/stores/blockchain';
import { getCurrentAccount } from '$lib/services/wallet';
import { config } from '$lib/config/wagmi';
import { sendTransaction, waitForTransactionReceipt } from '@wagmi/core';

export interface OpenPositionParams {
  blockchain: SupportedBlockchain;
  asset: string;
  collateral: number;
  leverage: number;
  collateralAddress: string;
  quoteToken: string;
  slippage?: number;
  partnerFeeRecipient?: string;
}

interface OpenBscPositionDto {
  collateralAddress: string;
  margin: number;
  leverage: number;
  quoteToken: string;
  userPubKey: string;
  slippage?: number;
  partnerFeeRecipient?: string;
}

interface TransactionBscModel {
  data: string;
  to: string;
  gasLimit?: string;
  gasPrice?: string;
  txHash?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://api.lavarage.com/api/sdk/v1.0';
const API_KEY = import.meta.env.VITE_API_KEY || '';

export async function openLongPosition(params: OpenPositionParams): Promise<string> {
  const account = getCurrentAccount();
  if (!account.address) throw new Error('Wallet not connected');

  const body: OpenBscPositionDto = {
    collateralAddress: params.collateralAddress,
    margin: params.collateral,
    leverage: params.leverage,
    quoteToken: params.quoteToken,
    userPubKey: account.address,
    slippage: params.slippage ?? 500,
    partnerFeeRecipient: params.partnerFeeRecipient,
  };

  const res = await fetch(`${API_URL}/positions/bsc/open`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error('Failed to get transaction data');
  }

  const tx: TransactionBscModel = await res.json();

  const hash = await sendTransaction(config, {
    account: account.address,
    to: tx.to as `0x${string}`,
    data: tx.data as `0x${string}`,
    gas: tx.gasLimit ? BigInt(tx.gasLimit) : undefined,
    gasPrice: tx.gasPrice ? BigInt(tx.gasPrice) : undefined,
  });

  await waitForTransactionReceipt(config, { hash });

  return hash;
}

function mapPosition(raw: any): Position {
  const collateralSymbol =
    raw.collateralToken?.symbol || raw.offer?.collateralToken?.symbol || 'UNKNOWN';
  const quoteSymbol =
    typeof raw.quoteToken === 'string'
      ? raw.quoteToken
      : raw.quoteToken?.symbol || raw.offer?.quoteToken?.symbol || 'UNKNOWN';

  const entryPrice = Number(raw.entryPrice ?? 0);
  const currentPrice = Number(raw.currentPrice ?? entryPrice);
  const size = Number(raw.currentPositionBase ?? raw.initialPositionBase ?? 0);
  const collateral = Number(raw.initialMarginQuote ?? raw.collateralAmount ?? 0);
  const pnl = (currentPrice - entryPrice) * size;
  const pnlPercentage = collateral ? (pnl / collateral) * 100 : 0;

  let status: Position['status'] = 'open';
  if (raw.status && typeof raw.status === 'string') {
    if (raw.status.includes('liquidated')) status = 'liquidated';
    else if (raw.status.includes('closed') || raw.status.includes('sold')) status = 'closed';
  }

  return {
    id: raw.positionAddress || raw.publicKey || crypto.randomUUID(),
    blockchain: 'bsc',
    asset: `${collateralSymbol}-${quoteSymbol}`,
    type: 'long',
    entryPrice,
    currentPrice,
    size,
    leverage: Number(raw.currentLtv ?? raw.leverage ?? 1),
    collateral,
    pnl,
    pnlPercentage,
    liquidationPrice: Number(raw.liquidationPrice ?? 0),
    timestamp: raw.openTimestamp
      ? Date.parse(raw.openTimestamp)
      : Date.now(),
    status,
  };
}

export async function fetchPositions(
  userAddress: string,
  status: 'open' | 'closed' | 'liquidated' | 'all' = 'open'
): Promise<Position[]> {
  const url = new URL(`${API_URL}/positions/evm`);
  url.searchParams.set('status', status);
  if (userAddress) url.searchParams.set('userAddress', userAddress);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-api-key': API_KEY,
      referer: typeof window !== 'undefined' ? window.location.origin : '',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch positions');
  }

  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map(mapPosition);
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