<script lang="ts">
  import { page } from '$app/stores';
  import { blockchain } from '$lib/stores/blockchain';
  import AuthButton from './AuthButton.svelte';
  import { TrendingUp, LayoutGrid, Activity, Menu, X } from 'lucide-svelte';

  let mobileOpen = false;

  function toggleMenu() {
    mobileOpen = !mobileOpen;
  }

  const navItems = [
    { path: '/', label: 'Overview', icon: LayoutGrid },
    { path: '/trade', label: 'Trade', icon: TrendingUp },
    { path: '/positions', label: 'Positions', icon: Activity }
  ];
</script>

<nav class="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      <a href="/" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg gradient-border flex items-center justify-center">
          <span class="text-xl font-bold bg-gradient-to-r from-[#E85D4C] via-[#C8963E] to-[#F4A261] bg-clip-text text-transparent">
            🍹
          </span>
        </div>
        <span class="text-xl font-semibold">Beverage</span>
      </a>

      <div class="hidden md:flex items-center gap-1">
        {#each navItems as item}
          <a
            href={item.path}
            class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
              {$page.url.pathname === item.path
                ? 'bg-primary/20 text-primary'
                : 'text-gray-400 hover:text-white hover:bg-white/5'}"
          >
            <svelte:component this={item.icon} class="w-4 h-4" />
            <span class="text-sm font-medium">{item.label}</span>
          </a>
        {/each}
      </div>

      <div class="hidden md:flex items-center gap-4">
        <div class="flex items-center gap-2 px-3 py-1.5 glass rounded-lg">
          <span class="text-sm font-medium">{$blockchain.config.name}</span>
        </div>
        <AuthButton />
      </div>

      <button class="md:hidden p-2" on:click={toggleMenu} aria-label="Toggle menu">
        {#if mobileOpen}
          <X class="w-6 h-6" />
        {:else}
          <Menu class="w-6 h-6" />
        {/if}
      </button>
    </div>

    {#if mobileOpen}
      <div class="md:hidden py-2 space-y-1">
        {#each navItems as item}
          <a
            href={item.path}
            class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
              {$page.url.pathname === item.path
                ? 'bg-primary/20 text-primary'
                : 'text-gray-400 hover:text-white hover:bg-white/5'}"
          >
            <svelte:component this={item.icon} class="w-4 h-4" />
            <span class="text-sm font-medium">{item.label}</span>
          </a>
        {/each}
        <div class="flex items-center gap-2 px-4">
          <div class="flex items-center gap-2 px-3 py-1.5 glass rounded-lg flex-1">
            <span class="text-sm font-medium">{$blockchain.config.name}</span>
          </div>
          <AuthButton />
        </div>
      </div>
    {/if}
  </div>
</nav>