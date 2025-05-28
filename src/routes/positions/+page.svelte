<script lang="ts">
  import { isAuthenticated } from '$lib/stores/auth';
  import { openPositions, totalPnL, totalCollateral } from '$lib/stores/positions';
  import { formatNumber } from '$lib/utils/formatters';
  import PositionCard from '$lib/components/PositionCard.svelte';
  import { Activity, TrendingUp, DollarSign, AlertCircle } from 'lucide-svelte';
  
  $: totalValue = $totalCollateral + $totalPnL;
  $: totalReturn = $totalCollateral > 0 ? ($totalPnL / $totalCollateral) * 100 : 0;
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
  {:else if $openPositions.length === 0}
    <div class="card text-center py-12">
      <TrendingUp class="w-12 h-12 text-gray-500 mx-auto mb-4" />
      <h2 class="text-xl font-semibold mb-2">No Open Positions</h2>
      <p class="text-gray-400 mb-6">Start trading to see your positions here</p>
      <a href="/trade" class="btn-primary inline-flex items-center gap-2">
        <TrendingUp class="w-4 h-4" />
        Open Position
      </a>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm text-gray-400">Total Collateral</p>
          <DollarSign class="w-4 h-4 text-purple-400" />
        </div>
        <p class="text-2xl font-mono font-semibold">{formatNumber($totalCollateral, 4)}</p>
      </div>
      
      <div class="card">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm text-gray-400">Total PnL</p>
          <TrendingUp class="w-4 h-4 {$totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}" />
        </div>
        <p class="text-2xl font-mono font-semibold {$totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}">
          {$totalPnL >= 0 ? '+' : ''}{formatNumber($totalPnL, 4)}
        </p>
      </div>
      
      <div class="card">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm text-gray-400">Total Value</p>
          <Activity class="w-4 h-4 text-orange-400" />
        </div>
        <p class="text-2xl font-mono font-semibold">{formatNumber(totalValue, 4)}</p>
      </div>
      
      <div class="card">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm text-gray-400">Total Return</p>
          <AlertCircle class="w-4 h-4 {totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}" />
        </div>
        <p class="text-2xl font-mono font-semibold {totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}">
          {totalReturn >= 0 ? '+' : ''}{formatNumber(totalReturn, 2)}%
        </p>
      </div>
    </div>
    
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">Open Positions ({$openPositions.length})</h2>
        <div class="flex items-center gap-2">
          <button class="btn-secondary text-sm">
            Close All
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each $openPositions as position (position.id)}
          <div class="animate-fade-in">
            <PositionCard {position} />
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>