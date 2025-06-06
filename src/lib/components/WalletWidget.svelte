<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { auth } from '$lib/stores/auth';
  import { connectWallet, disconnectWallet, restoreWalletSession } from '$lib/services/wallet';
  import { config } from '$lib/config/wagmi';
  import { Wallet, X, ChevronDown } from 'lucide-svelte';
  import { portal } from '$lib/utils/portal';
  import { appConfig } from '$lib/config/appConfig';

  let showModal = false;
  let connectingConnector: string | null = null;
  let connectors: any[] = [];

  // Initialize connectors only on client side
  onMount(async () => {
    if (browser) {
      try {
        // Dynamic imports to avoid SSR issues
        const { injected, metaMask, coinbaseWallet, walletConnect } = await import('@wagmi/connectors');
        
        connectors = [
          { connector: metaMask(), name: 'MetaMask', icon: '🦊' },
          { connector: coinbaseWallet({ appName: `${appConfig.network.name} Trading Platform` }), name: 'Coinbase Wallet', icon: '🔵' },
          { connector: injected(), name: 'Browser Wallet', icon: '🌐' }
        ];
        
        await restoreWalletSession();
      } catch (error) {
        console.warn('Failed to initialize wallet connectors:', error);
      }
    }
  });

  async function handleConnect(connectorData: any) {
    connectingConnector = connectorData.connector.id;
    try {
      await connectWallet(connectorData.connector);
      showModal = false;
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      connectingConnector = null;
    }
  }

  async function handleDisconnect() {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  }

  function openModal() {
    showModal = true;
  }

  function closeModal() {
    showModal = false;
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }

  function handleBackdropKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }

  function formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
</script>

{#if browser}
  {#if $auth.user}
    <!-- Connected State -->
    <div class="wallet-connected">
      <button 
        class="wallet-button connected"
        on:click={handleDisconnect}
        disabled={$auth.loading}
      >
        <div class="wallet-info">
          <span class="wallet-address">{formatAddress($auth.user.walletAddress)}</span>
          {#if $auth.user.balance}
            <span class="wallet-balance">{parseFloat($auth.user.balance).toFixed(4)} {appConfig.token.gas_symbol}</span>
          {/if}
        </div>
        <Wallet size={16} />
      </button>
    </div>
  {:else}
    <!-- Disconnected State -->
    <button 
      class="wallet-button"
      on:click={openModal}
      disabled={$auth.loading}
    >
      {#if $auth.loading}
        <span>Connecting...</span>
      {:else}
        <Wallet size={16} />
        <span>Connect Wallet</span>
      {/if}
    </button>
  {/if}

  {#if $auth.error}
    <div class="error-message">
      {$auth.error}
    </div>
  {/if}

  <!-- Wallet Selection Modal -->
  {#if showModal}
    <div
      class="modal-backdrop"
      use:portal
      on:click={handleBackdropClick}
      on:keydown={handleBackdropKeydown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-modal-title"
      tabindex="-1"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h2 id="wallet-modal-title">Connect Wallet</h2>
          <button 
            class="close-button"
            on:click={closeModal}
            aria-label="Close wallet selection modal"
          >
            <X size={20} />
          </button>
        </div>
        
        <div class="modal-body">
          <h3>Choose a wallet to connect to the {appConfig.network.name} trading platform</h3>
          <div class="wallet-options">
            {#if connectors.length > 0}
              {#each connectors as connectorData}
                <button
                  class="wallet-option"
                  class:connecting={connectingConnector === connectorData.connector.id}
                  disabled={connectingConnector !== null}
                  on:click={() => handleConnect(connectorData)}
                >
                  <div class="wallet-icon">
                    {connectorData.icon}
                  </div>
                  <div class="wallet-name">{connectorData.name}</div>
                  {#if connectingConnector === connectorData.connector.id}
                    <div class="connecting">Connecting...</div>
                  {/if}
                </button>
              {/each}
            {:else}
              <!-- Fallback for SSR -->
              <button class="wallet-option" disabled>
                <div class="wallet-icon">🔗</div>
                <div class="wallet-name">Loading wallets...</div>
              </button>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}
{:else}
  <!-- SSR fallback -->
  <button class="wallet-button" disabled>
    <Wallet size={16} />
    <span>Loading...</span>
  </button>
{/if}

<style>
  .wallet-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 140px;
    justify-content: center;
  }

  .wallet-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .wallet-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .wallet-button.connected {
    background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
    min-width: 200px;
  }

  .wallet-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .wallet-address {
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
  }

  .wallet-balance {
    font-size: 0.75rem;
    opacity: 0.9;
  }

  .error-message {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: #fee2e2;
    color: #dc2626;
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }

  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .modal-content {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 1.5rem 0;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
  }

  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;
    color: #6b7280;
    transition: color 0.2s ease;
  }

  .close-button:hover {
    color: #374151;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-description {
    margin: 0 0 1.5rem;
    color: #6b7280;
    font-size: 0.875rem;
  }

  .wallet-options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .wallet-option {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
    text-align: left;
  }

  .wallet-option:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
    transform: translateY(-1px);
  }

  .wallet-option:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .wallet-icon {
    font-size: 1.5rem;
    width: 2rem;
    text-align: center;
  }

  .wallet-name {
    flex: 1;
    font-weight: 500;
    color: #1f2937;
  }

  .connecting {
    font-size: 0.875rem;
    color: #6b7280;
  }

  @media (max-width: 640px) {
    .wallet-button {
      min-width: 120px;
      padding: 0.625rem 0.875rem;
    }

    .wallet-button.connected {
      min-width: 160px;
    }

    .modal-content {
      margin: 1rem;
      width: calc(100% - 2rem);
    }
  }
</style> 
 