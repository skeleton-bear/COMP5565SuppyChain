/* eslint-disable no-unused-vars */
import { ref, markRaw } from 'vue';
import { ethers } from 'ethers';

export function useWallet() {
  const isConnected = ref(false);
  const account = ref('');
  const provider = ref(null);
  const signer = ref(null);
  const network = ref(null);

  // 网络配置
  const NETWORKS = {
    hardhat: {
      chainId: '0x7A69', // 31337 in hex
      chainName: 'Hardhat Local',
      rpcUrls: ['http://127.0.0.1:8545'],
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
      }
    },
    sepolia: {
      chainId: '0xaa36a7', // 11155111 in hex
      chainName: 'Sepolia Test Network',
      rpcUrls: ['https://sepolia.infura.io/v3/YOUR-PROJECT-ID'], // 需要替换为你的 Infura Project ID
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
      },
      blockExplorerUrls: ['https://sepolia.etherscan.io']
    }
  };

  // 获取当前环境的网络配置
  function getCurrentNetwork() {
    const network = process.env.VUE_APP_NETWORK;
    const chainId = process.env.VUE_APP_CHAIN_ID;
    
    if (network === 'hardhat') {
      return {
        chainId: chainId,
        chainName: 'Hardhat Local',
        rpcUrls: ['http://127.0.0.1:8545'],
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18
        }
      };
    } else {
      return {
        chainId: chainId,
        chainName: 'Sepolia Test Network',
        rpcUrls: ['https://sepolia.infura.io/v3/YOUR-PROJECT-ID'],
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18
        },
        blockExplorerUrls: ['https://sepolia.etherscan.io']
      };
    }
  }

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask!");
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found!");
      }

      // 获取目标网络配置
      const targetNetwork = getCurrentNetwork();

      // 检查当前网络
      const currentChainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });

      // 如果网络不匹配，尝试切换
      if (currentChainId !== targetNetwork.chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetNetwork.chainId }]
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: targetNetwork.chainId,
                chainName: targetNetwork.chainName,
                nativeCurrency: targetNetwork.nativeCurrency,
                rpcUrls: targetNetwork.rpcUrls,
                blockExplorerUrls: targetNetwork.blockExplorerUrls
              }]
            });
          } else {
            throw switchError;
          }
        }
      }

      // 使用 markRaw 包装 provider 对象
      const newProvider = markRaw(new ethers.providers.Web3Provider(window.ethereum));
      const newSigner = markRaw(newProvider.getSigner());
      
      // 设置状态
      provider.value = newProvider;
      signer.value = newSigner;
      account.value = accounts[0];
      isConnected.value = true;
      
      // 添加事件监听
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return signer.value;
    } catch (error) {
      console.error("Wallet connection error:", error);
      isConnected.value = false;
      provider.value = null;
      signer.value = null;
      account.value = '';
      throw error;
    }
  }

  async function switchToNetwork(networkConfig) {
    try {
      // 尝试切换到目标网络
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainId }]
      });
    } catch (switchError) {
      // 如果网络不存在，则添加网络
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: networkConfig.chainId,
              chainName: networkConfig.chainName,
              nativeCurrency: networkConfig.nativeCurrency,
              rpcUrls: networkConfig.rpcUrls,
              blockExplorerUrls: networkConfig.blockExplorerUrls
            }]
          });
        } catch (addError) {
          throw new Error(`Failed to add network: ${addError.message}`);
        }
      } else {
        throw new Error(`Failed to switch network: ${switchError.message}`);
      }
    }
  }

  function handleChainChanged(chainId) {
    console.log('Chain changed to:', chainId);
    const targetChainId = process.env.VUE_APP_CHAIN_ID;
    if (chainId !== targetChainId) {
      alert(`Please switch to the ${process.env.VUE_APP_NETWORK} network`);
    }
    window.location.reload();
  }

  async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // MetaMask 断开连接
      isConnected.value = false;
      account.value = "";
      signer.value = null;
      provider.value = null;
      network.value = null;
    } else if (accounts[0] !== account.value) {
      // 账户切换
      account.value = accounts[0];
      if (provider.value) {
        signer.value = provider.value.getSigner();
      }
    }
  }

  function disconnect() {
    isConnected.value = false;
    account.value = '';
    provider.value = null;
    signer.value = null;
    network.value = null;

    // 移除事件监听器
    if (window.ethereum) {
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    }
  }

  // 添加检查连接状态的方法
  async function checkConnection() {
    try {
      if (!window.ethereum) {
        return false;
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });

      return accounts && accounts.length > 0;
    } catch (error) {
      console.error("Check connection error:", error);
      return false;
    }
  }

  return {
    isConnected,
    account,
    provider,
    signer,
    network,
    connectWallet,
    disconnect,
    getCurrentNetwork,
    checkConnection
  };
} 