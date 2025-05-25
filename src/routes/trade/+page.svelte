<script lang="ts">
  import TradingPanel from '$lib/components/TradingPanel.svelte';
  import { isAuthenticated } from '$lib/stores/auth';
  import { openPositions } from '$lib/stores/positions';
  import { currentBlockchain } from '$lib/stores/blockchain';
  import { Info, Shield, TrendingUp } from 'lucide-svelte';
</script>

<div class="max-w-6xl mx-auto">
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 space-y-6">
      <div class="card">
        <h1 class="text-2xl font-bold mb-4">Trade {$currentBlockchain.symbol}</h1>
        
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="p-4 bg-white/5 rounded-lg">
            <p class="text-sm text-gray-400 mb-1">Current Price</p>
            <p class="text-xl font-mono font-semibold">$3,542.18</p>
            <p class="text-sm text-green-400">+2.34%</p>
          </div>
          
          <div class="p-4 bg-white/5 rounded-lg">
            <p class="text-sm text-gray-400 mb-1">24h Volume</p>
            <p class="text-xl font-mono font-semibold">$24.8B</p>
            <p class="text-sm text-gray-400">1,234,567 {$currentBlockchain.symbol}</p>
          </div>
        </div>
        
        <div class="h-64 bg-white/5 rounded-lg flex items-center justify-center">
          <p class="text-gray-500">Price chart placeholder</p>
        </div>
      </div>
      
      <div class="card space-y-4">
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <Info class="w-5 h-5 text-purple-400" />
          Trading Information
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-400">Max Leverage</span>
              <span class="font-mono">100x</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Funding Rate</span>
              <span class="font-mono text-green-400">+0.01%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Open Interest</span>
              <span class="font-mono">$1.2B</span>
            </div>
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-400">Maintenance Margin</span>
              <span class="font-mono">0.5%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Trading Fee</span>
              <span class="font-mono">0.05%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Min Position</span>
              <span class="font-mono">0.001 {$currentBlockchain.symbol}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="space-y-6">
      <TradingPanel />
      
      <div class="card space-y-3">
        <h3 class="text-sm font-semibold text-gray-400 flex items-center gap-2">
          <Shield class="w-4 h-4" />
          Risk Management
        </h3>
        
        <div class="space-y-2 text-sm">
          <p class="text-gray-400">
            • Use stop-loss orders to limit losses
          </p>
          <p class="text-gray-400">
            • Never trade more than you can afford to lose
          </p>
          <p class="text-gray-400">
            • Higher leverage = higher risk
          </p>
          <p class="text-gray-400">
            • Monitor liquidation prices closely
          </p>
        </div>
      </div>
      
      {#if $isAuthenticated && $openPositions.length > 0}
        <div class="card">
          <h3 class="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
            <TrendingUp class="w-4 h-4" />
            Active Positions
          </h3>
          <p class="text-2xl font-mono font-semibold">{$openPositions.length}</p>
          <a href="/positions" class="text-sm text-purple-400 hover:text-purple-300 mt-2 inline-block">
            View all positions →
          </a>
        </div>
      {/if}
    </div>
  </div>
</div>