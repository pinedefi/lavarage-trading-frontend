import type { Position } from "$lib/stores/positions";
import type { SupportedBlockchain } from "$lib/stores/blockchain";
import { getCurrentAccount } from "$lib/services/wallet";
import { config } from "$lib/config/wagmi";
import { sendTransaction, waitForTransactionReceipt } from "@wagmi/core";
import { BSC_TOKEN_ADDRESSES } from "$lib/services/birdeye";
import { appConfig } from '$lib/config/appConfig';

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
  margin: string;
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
  value?: string;
}

interface CloseBscPositionDto {
  loanId: number;
  userPubKey: string;
  partnerFeeRecipient?: string;
  quoteToken: string;
  slippage?: number;
}

const API_URL =
  import.meta.env.VITE_API_URL || "https://ng-api.lavarave.wtf/api/sdk/v1.0";
const API_KEY = import.meta.env.VITE_API_KEY || "";

export async function openLongPosition(
  params: OpenPositionParams,
): Promise<string> {
  const account = getCurrentAccount();
  if (!account.address) throw new Error("Wallet not connected");

  const body: OpenBscPositionDto = {
    collateralAddress: params.collateralAddress,
    margin: (
      BigInt(Math.round(params.collateral * 1000000)) * BigInt(1000000000000)
    ).toString(),
    leverage: params.leverage,
    quoteToken: params.quoteToken,
    userPubKey: account.address,
    slippage: params.slippage ?? 500,
    partnerFeeRecipient: params.partnerFeeRecipient,
  };

  const res = await fetch(`${API_URL}/positions/bsc/open`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("Failed to get transaction data");
  }

  const tx: TransactionBscModel = await res.json();

  const hash = await sendTransaction(config, {
    account: account.address,
    to: tx.to as `0x${string}`,
    data: tx.data as `0x${string}`,
    gasPrice: tx.gasPrice ? BigInt(tx.gasPrice) : undefined,
    value: tx.value ? BigInt(tx.value) : undefined,
  });

  await waitForTransactionReceipt(config, { hash });

  return hash;
}

export async function closePosition(positionId: number): Promise<string> {
  const account = getCurrentAccount();
  if (!account.address) throw new Error("Wallet not connected");

  const body: CloseBscPositionDto = {
    loanId: Number(positionId),
    userPubKey: account.address,
    quoteToken: BSC_TOKEN_ADDRESSES[appConfig.token.gas_symbol],
    slippage: 500,
  };

  const res = await fetch(`${API_URL}/positions/bsc/close`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("Failed to get transaction data");
  }

  const tx: TransactionBscModel = await res.json();

  const hash = await sendTransaction(config, {
    account: account.address,
    to: tx.to as `0x${string}`,
    data: tx.data as `0x${string}`,
    gasPrice: tx.gasPrice ? BigInt(tx.gasPrice) : undefined,
    value: tx.value ? BigInt(tx.value) : undefined,
  });

  await waitForTransactionReceipt(config, { hash });

  return hash;
}

export async function updatePositionPrices(
  positions: Position[],
): Promise<Position[]> {
  // Mock price updates
  return positions.map((pos) => {
    if (pos.status !== "open") return pos;

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
      pnlPercentage,
    };
  });
}

function calculateLiquidationPrice(
  entryPrice: number,
  leverage: number,
): number {
  // Simplified liquidation price calculation
  const maintenanceMarginRate = 0.005; // 0.5%
  const initialMarginRate = 1 / leverage;

  // For long positions
  return entryPrice * (1 - initialMarginRate + maintenanceMarginRate);
}
