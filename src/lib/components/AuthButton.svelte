<script lang="ts">
  import { auth, walletAddress } from '$lib/stores/auth';
  import { connectWallet, disconnectWallet } from '$lib/services/dynamic';
  import { Wallet, LogOut, Loader2 } from 'lucide-svelte';

  async function handleAuth() {
    if ($auth.isAuthenticated) {
      await disconnectWallet();
    } else {
      await connectWallet();
    }
  }

  function formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
</script>

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