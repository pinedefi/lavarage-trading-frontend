<script lang="ts">
  import { isAuthenticated } from '$lib/stores/auth';
  import { openPositions, totalPnL, totalCollateral } from '$lib/stores/positions';
  import { blockchain } from '$lib/stores/blockchain';
  import { TrendingUp, DollarSign, Activity, Zap } from 'lucide-svelte';
  
  // Define proper types for stats
  interface Stat {
    label: string;
    value: any;
    icon: any;
    color: string;
    format: (v: any) => string;
  }
  
  // Declare store values at top level
  $: stats = [
    {
      label: 'Total Collateral',
      value: $totalCollateral,
      icon: DollarSign,
      color: 'primary',
      format: (v: number) => `${v.toFixed(4)} ${$blockchain.config.symbol}`
    },
    {
      label: 'Open Positions',
      value: $openPositions,
      icon: Activity,
      color: 'orange',
      format: (v: any[]) => v.length.toString()
    },
    {
      label: 'Total PnL',
      value: $totalPnL,
      icon: TrendingUp,
      color: 'green',
      format: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(4)} ${$blockchain.config.symbol}`
    }
  ] as Stat[];
</script>

<div class="max-w-6xl mx-auto space-y-8">
  <header class="text-center space-y-4 py-12">
    <h1 class="text-5xl font-bold bg-gradient-to-r from-[#E85D4C] via-[#C8963E] to-[#F4A261] bg-clip-text text-transparent">
      Hold my beer 🍺
    </h1>
    <p class="text-xl text-gray-400 max-w-2xl mx-auto">
      Professional crypto trading platform with up to 100x leverage. 
      Trade long positions across multiple blockchains.
    </p>
  </header>
  
  {#if $isAuthenticated}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {#each stats as stat}
        <div class="card hover:border-white/20 transition-all duration-200">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm text-gray-400 mb-2">{stat.label}</p>
              <p class="text-2xl font-mono font-semibold">
                {stat.format(stat.value)}
              </p>
            </div>
            <div class="p-3 bg-{stat.color}-500/20 rounded-lg">
              <svelte:component this={stat.icon} class="w-5 h-5 text-{stat.color}-400" />
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <a href="/trade" class="card hover:border-primary/50 transition-all duration-200 group">
      <div class="p-4 bg-primary/20 rounded-lg mb-4 group-hover:bg-primary/30 transition-colors">
        <TrendingUp class="w-8 h-8 text-primary" />
      </div>
      <h3 class="text-xl font-semibold mb-2">Long Positions</h3>
      <p class="text-gray-400">
        Open leveraged long positions to profit from price increases. 
        Trade with up to 100x leverage.
      </p>
    </a>
    
    <a href="/positions" class="card hover:border-orange-500/50 transition-all duration-200 group">
      <div class="p-4 bg-orange-500/20 rounded-lg mb-4 group-hover:bg-orange-500/30 transition-colors">
        <Activity class="w-8 h-8 text-orange-400" />
      </div>
      <h3 class="text-xl font-semibold mb-2">Manage Positions</h3>
      <p class="text-gray-400">
        Monitor and manage your open positions. Track PnL, adjust stops, 
        and close positions.
      </p>
    </a>
    
    <div class="card opacity-50 cursor-not-allowed">
      <div class="p-4 bg-red-500/20 rounded-lg mb-4">
        <Zap class="w-8 h-8 text-red-400" />
      </div>
      <h3 class="text-xl font-semibold mb-2">More Features</h3>
      <p class="text-gray-400">
        Short positions, advanced orders, and multi-chain support 
        coming soon.
      </p>
      <div class="mt-3 inline-flex items-center px-3 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">
        Coming Soon
      </div>
    </div>
  </div>
  
  {#if !$isAuthenticated}
    <div class="text-center py-12">
      <div class="inline-flex flex-col items-center gap-4 p-8 glass rounded-2xl">
        <Zap class="w-12 h-12 text-primary" />
        <h2 class="text-2xl font-semibold">Ready to Start Trading?</h2>
        <p class="text-gray-400 max-w-md">
          Connect your wallet to access leveraged trading across multiple blockchains.
        </p>
        <a href="/trade" class="btn-primary">
          Start Trading
        </a>
      </div>
    </div>
  {/if}
</div>