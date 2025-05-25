<script lang="ts">
  import { isAuthenticated } from '$lib/stores/auth';
  import { currentBlockchain } from '$lib/stores/blockchain';
  import { positions } from '$lib/stores/positions';
  import { openLongPosition } from '$lib/services/trading';
  import LeverageSlider from './LeverageSlider.svelte';
  import { TrendingUp, AlertCircle, Loader2 } from 'lucide-svelte';
  
  let amount = '';
  let leverage = 10;
  let loading = false;
  let error = '';
  
  $: collateral = Number(amount) || 0;
  $: positionSize = collateral * leverage;
  $: liquidationPrice = calculateLiquidationPrice();
  
  function calculateLiquidationPrice() {
    // Simplified calculation for demo
    const maintenanceMargin = 0.005; // 0.5%
    return 100 * (1 - (1 - maintenanceMargin) / leverage);
  }
  
  async function handleOpenPosition() {
    if (!$isAuthenticated) {
      error = 'Please connect your wallet first';
      return;
    }
    
    if (!amount || Number(amount) <= 0) {
      error = 'Please enter a valid amount';
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      const position = await openLongPosition({
        blockchain: $currentBlockchain.id,
        asset: $currentBlockchain.symbol,
        collateral: Number(amount),
        leverage
      });
      
      positions.addPosition(position);
      
      // Reset form
      amount = '';
      leverage = 10;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to open position';
    } finally {
      loading = false;
    }
  }
</script>

<div class="card max-w-md mx-auto animate-slide-up">
  <div class="flex items-center gap-3 mb-6">
    <div class="p-3 bg-green-500/20 rounded-lg">
      <TrendingUp class="w-6 h-6 text-green-400" />
    </div>
    <div>
      <h2 class="text-xl font-semibold">Long Position</h2>
      <p class="text-sm text-gray-400">Profit from price increases</p>
    </div>
  </div>
  
  <div class="space-y-6">
    <div>
      <label for="amount" class="block text-sm font-medium text-gray-400 mb-2">
        Collateral ({$currentBlockchain.symbol})
      </label>
      <input
        id="amount"
        type="number"
        bind:value={amount}
        placeholder="0.0"
        step="0.01"
        min="0"
        class="input-field font-mono text-lg"
        disabled={loading}
      />
    </div>
    
    <LeverageSlider bind:value={leverage} max={100} />
    
    <div class="space-y-3 p-4 bg-white/5 rounded-lg">
      <div class="flex justify-between text-sm">
        <span class="text-gray-400">Position Size</span>
        <span class="font-mono font-medium">
          {positionSize.toFixed(4)} {$currentBlockchain.symbol}
        </span>
      </div>
      
      <div class="flex justify-between text-sm">
        <span class="text-gray-400">Liquidation Price</span>
        <span class="font-mono font-medium text-orange-400">
          ~{liquidationPrice.toFixed(2)}% below entry
        </span>
      </div>
      
      <div class="flex justify-between text-sm">
        <span class="text-gray-400">Max Loss</span>
        <span class="font-mono font-medium text-red-400">
          -{collateral.toFixed(4)} {$currentBlockchain.symbol}
        </span>
      </div>
    </div>
    
    {#if error}
      <div class="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
        <AlertCircle class="w-4 h-4 text-red-400 flex-shrink-0" />
        <p class="text-sm text-red-400">{error}</p>
      </div>
    {/if}
    
    <button
      on:click={handleOpenPosition}
      disabled={loading || !$isAuthenticated}
      class="w-full btn-primary flex items-center justify-center gap-2"
    >
      {#if loading}
        <Loader2 class="w-4 h-4 animate-spin" />
        <span>Opening Position...</span>
      {:else}
        <TrendingUp class="w-4 h-4" />
        <span>Open Long Position</span>
      {/if}
    </button>
    
    {#if !$isAuthenticated}
      <p class="text-center text-sm text-gray-400">
        Connect your wallet to start trading
      </p>
    {/if}
  </div>
</div>