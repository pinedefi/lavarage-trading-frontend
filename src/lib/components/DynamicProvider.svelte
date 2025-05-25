<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { getDynamicConfig, setDynamicClient } from '$lib/services/dynamic';
  
  let DynamicContextProvider: any;
  let mounted = false;
  
  onMount(async () => {
    if (!browser) return;
    
    try {
      // Dynamically import the SDK to avoid SSR issues
      const dynamicModule = await import('@dynamic-labs/sdk-react-core');
      DynamicContextProvider = dynamicModule.DynamicContextProvider;
      
      // Get the Dynamic SDK instance when it's ready
      if (window.dynamicContext) {
        setDynamicClient(window.dynamicContext);
      }
      
      mounted = true;
    } catch (error) {
      console.error('Failed to load Dynamic SDK:', error);
    }
  });
  
  $: config = getDynamicConfig();
</script>

{#if browser && mounted && DynamicContextProvider && config}
  <DynamicContextProvider
    settings={{
      environmentId: config.environmentId,
      walletConnectors: config.walletConnectors,
      events: config.events
    }}
  >
    <slot />
  </DynamicContextProvider>
{:else}
  <slot />
{/if}

<svelte:window
  on:dynamic-auth-success={(e) => {
    if (e.detail && window.dynamicContext) {
      setDynamicClient(window.dynamicContext);
    }
  }}
/>