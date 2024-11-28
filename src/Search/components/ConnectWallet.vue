<template>
  <div class="connect-wallet">
    <div v-if="!isConnected" class="connect-section">
      <p>Please connect your wallet first</p>
      <button @click="handleConnect">Connect MetaMask</button>
    </div>
    <div v-else class="wallet-info">
      <p>Wallet Connected: {{ formatAddress(account) }}</p>
      <button @click="handleDisconnect" class="disconnect-btn">Disconnect</button>
    </div>
  </div>
</template>

<script>
import { useWallet } from '../composables/useWallet';

export default {
  name: 'ConnectWallet',
  emits: ['connected', 'disconnected'],
  setup(props, { emit }) {
    const { isConnected, account, connectWallet, disconnect } = useWallet();

    async function handleConnect() {
      try {
        await connectWallet();
        emit('connected');
      } catch (error) {
        console.error('Connection error:', error);
        alert(`Failed to connect: ${error.message}`);
      }
    }

    async function handleDisconnect() {
      try {
        await disconnect();
        emit('disconnected');
      } catch (error) {
        console.error('Disconnection error:', error);
        alert(`Failed to disconnect: ${error.message}`);
      }
    }

    function formatAddress(address) {
      if (!address) return '';
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    return {
      isConnected,
      account,
      handleConnect,
      handleDisconnect,
      formatAddress
    };
  }
}
</script>

<style scoped>
.connect-wallet {
  margin: 20px 0;
  padding: 15px;
  border-radius: 8px;
  background-color: #f5f5f5;
}

.connect-section, .wallet-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.disconnect-btn {
  background-color: #ff4444;
}

button:hover {
  opacity: 0.9;
}

p {
  margin: 0;
  color: #2c3e50;
}
</style> 