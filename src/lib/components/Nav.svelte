<script lang="ts">
  import { page } from '$app/stores';
  import { blockchain } from '$lib/stores/blockchain';
  import AuthButton from './AuthButton.svelte';
  import { TrendingUp, LayoutGrid, Activity } from 'lucide-svelte';

  const navItems = [
    { path: '/', label: 'Overview', icon: LayoutGrid },
    { path: '/trade', label: 'Trade', icon: TrendingUp },
    { path: '/positions', label: 'Positions', icon: Activity }
  ];
</script>

<nav class="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      <div class="flex items-center gap-8">
        <a href="/" class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg gradient-border flex items-center justify-center">
            <span class="text-xl font-bold bg-gradient-to-r from-red-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
              T
            </span>
          </div>
          <span class="text-xl font-semibold">TradeFi</span>
        </a>

        <div class="flex items-center gap-1">
          {#each navItems as item}
            <a
              href={item.path}
              class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                {$page.url.pathname === item.path 
                  ? 'bg-purple-600/20 text-purple-400' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'}"
            >
              <svelte:component this={item.icon} class="w-4 h-4" />
              <span class="text-sm font-medium">{item.label}</span>
            </a>
          {/each}
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 px-3 py-1.5 glass rounded-lg">
          <span class="text-sm font-medium">{$blockchain.config.name}</span>
        </div>
        
        <AuthButton />
      </div>
    </div>
  </div>
</nav>