<script lang="ts">
  import { auth, walletAddress } from '$lib/stores/auth';
  import { connectWallet, disconnectWallet } from '$lib/services/dynamic';
  import DynamicWidget from './DynamicWidget.svelte';
  import { Wallet, LogOut, Loader2 } from 'lucide-svelte';
  import { browser } from '$app/environment';

  let showWidget = false;

  async function handleAuth() {
    if ($auth.isAuthenticated) {
      await disconnectWallet();
    } else {
      // For Dynamic.xyz, we show the widget instead of calling connect directly
      if (browser && import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID) {
        showWidget = true;
      } else {
        // Fallback to direct connect attempt
        await connectWallet();
      }
    }
  }

  function formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
</script>

<div class="relative">
  <button
    on:click={handleAuth}
    class="flex items-center gap-2 px-4 py-2 glass glass-hover rounded-lg transition-all duration-200"
    disabled={$auth.loading}
  >
    {#if $auth.loading}
      <Loader2 class="w-4 h-4 animate-spin" />
      <span>Connecting...</span>
    {:else if $auth.isAuthenticated && $walletAddress}
      <Wallet class="w-4 h-4 text-purple-400" />
      <span class="font-mono text-sm">{formatAddress($walletAddress)}</span>
      <LogOut class="w-4 h-4 ml-2 text-gray-400" />
    {:else}
      <Wallet class="w-4 h-4" />
      <span>Connect Wallet</span>
    {/if}
  </button>
  
  {#if showWidget}
    <div class="absolute top-full right-0 mt-2 z-50">
      <DynamicWidget />
    </div>
  {/if}
</div>

{#if $auth.error}
  <div class="fixed bottom-4 right-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg max-w-sm">
    <p class="text-sm text-red-400">{$auth.error}</p>
  </div>
{/if}