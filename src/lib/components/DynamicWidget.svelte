<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  let DynamicWidget: any;
  let mounted = false;
  
  onMount(async () => {
    if (!browser) return;
    
    try {
      const dynamicModule = await import('@dynamic-labs/sdk-react-core');
      DynamicWidget = dynamicModule.DynamicWidget;
      mounted = true;
    } catch (error) {
      console.error('Failed to load Dynamic Widget:', error);
    }
  });
</script>

{#if browser && mounted && DynamicWidget}
  <DynamicWidget />
{/if}