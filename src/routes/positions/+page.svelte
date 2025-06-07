<script lang="ts">
  import { isAuthenticated } from '$lib/stores/auth';
  import {
    openPositions,
    closedPositions,
    totalPnL,
    totalCollateral,
    startPositionsUpdates
  } from '$lib/stores/positions';
  import { formatNumber } from '$lib/utils/formatters';
  import { appConfig } from '$lib/config/appConfig';
  import PositionCard from '$lib/components/PositionCard.svelte';
  import { Activity, TrendingUp, DollarSign, AlertCircle } from 'lucide-svelte';

  let showClosed = false;

  function toggleView() {
    showClosed = !showClosed;
    startPositionsUpdates(showClosed ? 'closed' : 'open');
  }

  $: positionsList = showClosed ? $closedPositions : $openPositions;

  // Stats for open positions
  $: totalEquity = $openPositions.reduce(
    (sum, p) => sum + p.baseAmount * p.currentPrice,
    0
  );
  $: totalReturn = $totalCollateral > 0 ? ($totalPnL / $totalCollateral) * 100 : 0;

  // Stats for closed positions
  $: totalClosedPnL = $closedPositions.reduce(
    (sum, p) => sum + (p.realizedPnL || 0),
    0
  );
  $: totalInitialCollateral = $closedPositions.reduce(
    (sum, p) => sum + p.collateral,
    0
  );
  // $: totalClosedEquity = $closedPositions.reduce(
  //   (sum, p) => sum + p.baseAmount * (p.closingPrice || p.currentPrice),
  //   0
  // );
  $: totalClosedReturn = totalInitialCollateral > 0 
    ? (totalClosedPnL / totalInitialCollateral) * 100 
    : 0;
</script>

<div class="max-w-6xl mx-auto space-y-8">
  <header>
    <h1 class="text-3xl font-bold mb-2">Position Management</h1>
    <p class="text-gray-400">Monitor and manage your open trading positions</p>
  </header>
  
  {#if !$isAuthenticated}
    <div class="card text-center py-12">
      <Activity class="w-12 h-12 text-gray-500 mx-auto mb-4" />
      <h2 class="text-xl font-semibold mb-2">Connect Wallet to View Positions</h2>
      <p class="text-gray-400">Please connect your wallet to see your trading positions</p>
    </div>
  {:else}
    <!-- Stats Grid - Always show when authenticated -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {#if !showClosed}
        <div class="card">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-gray-400">Total Collateral ({appConfig.token.gas_symbol})</p>
            <DollarSign class="w-4 h-4 text-primary" />
          </div>
          <p class="text-2xl font-mono font-semibold">{formatNumber($totalCollateral, 4)} {appConfig.token.gas_symbol}</p>
        </div>
      {/if}
      
      <div class="card">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm text-gray-400">{showClosed ? 'Total Closed' : 'Total'} PnL</p>
          <TrendingUp class="w-4 h-4 {(showClosed ? totalClosedPnL : $totalPnL) >= 0 ? 'text-green-400' : 'text-red-400'}" />
        </div>
        <p class="text-2xl font-mono font-semibold {(showClosed ? totalClosedPnL : $totalPnL) >= 0 ? 'text-green-400' : 'text-red-400'}">
          {(showClosed ? totalClosedPnL : $totalPnL) >= 0 ? '+' : ''}{formatNumber(showClosed ? totalClosedPnL : $totalPnL, 4)} {appConfig.token.gas_symbol}
        </p>
      </div>
      
      {#if !showClosed}
        <div class="card">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-gray-400">Total Equity</p>
            <Activity class="w-4 h-4 text-orange-400" />
          </div>
          <p class="text-2xl font-mono font-semibold">{formatNumber(totalEquity, 4)} {appConfig.token.gas_symbol}</p>
        </div>
      {/if}
      
      <div class="card">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm text-gray-400">{showClosed ? 'Total Closed' : 'Total'} Return</p>
          <AlertCircle class="w-4 h-4 {(showClosed ? totalClosedReturn : totalReturn) >= 0 ? 'text-green-400' : 'text-red-400'}" />
        </div>
        <p class="text-2xl font-mono font-semibold {(showClosed ? totalClosedReturn : totalReturn) >= 0 ? 'text-green-400' : 'text-red-400'}">
          {(showClosed ? totalClosedReturn : totalReturn) >= 0 ? '+' : ''}{formatNumber(showClosed ? totalClosedReturn : totalReturn, 2)}%
        </p>
      </div>
    </div>

    <!-- Empty State or Positions List -->
    {#if (showClosed ? $closedPositions.length === 0 : $openPositions.length === 0)}
      <div class="card text-center py-12">
        <TrendingUp class="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h2 class="text-xl font-semibold mb-2">No {showClosed ? 'Closed' : 'Open'} Positions</h2>
        {#if showClosed}
          <p class="text-gray-400">Your closed positions history will appear here</p>
        {:else}
          <p class="text-gray-400 mb-6">Start trading to see your positions here</p>
          <a href="/trade" class="btn-primary inline-flex items-center gap-2">
            <TrendingUp class="w-4 h-4" />
            Open Position
          </a>
        {/if}
      </div>
    {:else}
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">
            {#if showClosed}
              Closed Positions ({$closedPositions.length})
            {:else}
              Open Positions ({$openPositions.length})
            {/if}
          </h2>
          <div class="flex items-center gap-2">
            <button class="btn-secondary text-sm" on:click={toggleView}>
              {showClosed ? 'View Open' : 'View Closed'}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each positionsList as position (position.id)}
            <div class="animate-fade-in">
              <PositionCard {position} />
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>
