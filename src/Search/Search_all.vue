<template>
  <div class="all-tokens">
    <h1>All Diamonds</h1>
    
    <div class="back-section">
      <button @click="goBack" class="action-btn">Back to Search</button>
    </div>

    <div class="loading" v-if="loading">
      <p>Loading tokens...</p>
    </div>

    <div class="error" v-if="error">
      <p>{{ error }}</p>
    </div>

    <div class="tokens-grid" v-else>
      <div v-for="token in tokens" 
           :key="token.tokenId" 
           class="token-card"
           @click="viewDetails(token.tokenId)"
           style="cursor: pointer;">
        <h3>Token ID: {{ token.tokenId }}</h3>
        <p>Diamond ID: {{ token.diamondID || 'N/A' }}</p>
        <p>Current Stage: {{ getPosition(token.position) }}</p>
        <p>Status: {{ getStageStatus(token.position) }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ethers } from "ethers";
import DiomandDapp from "../../artifacts/contracts/DiamondDapp.sol/DiomandDapp.json";
import { CONTRACT_ADDRESS } from '../config';

export default {
  name: 'AllTokens',
  data() {
    return {
      tokens: [],
      loading: true,
      error: null,
      contract: null,
      isConnected: false
    }
  },
  async created() {
    try {
      await this.initContract();
      await this.fetchAllTokens();
    } catch (error) {
      console.error('Error initializing:', error);
      this.error = "Failed to initialize contract or fetch data";
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async initContract() {
      try {
        if (!window.ethereum) {
          throw new Error("MetaMask is not installed");
        }

        // 请求切换到本地网络
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x7A69' }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x7A69',
                  chainName: 'Localhost 8545',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18
                  },
                  rpcUrls: ['http://127.0.0.1:8545/']
                }]
              });
            } catch (addError) {
              throw new Error("Failed to add the local network");
            }
          } else {
            throw new Error("Failed to switch to the local network");
          }
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        
        const contractAddress = CONTRACT_ADDRESS;
        
        const code = await provider.getCode(contractAddress);
        if (code === '0x') {
          throw new Error("No contract found at this address");
        }

        this.contract = new ethers.Contract(
          contractAddress,
          DiomandDapp.abi,
          signer
        );

      } catch (error) {
        console.error("Contract initialization error:", error);
        throw error;
      }
    },
    async fetchAllTokens() {
      try {
        const totalSupply = await this.contract.totalSupply();
        this.tokens = [];

        for (let i = 0; i < totalSupply; i++) {
          const tokenId = await this.contract.tokenByIndex(i);
          const position = await this.contract.getDiamondPosition(tokenId);
          const miningDetails = await this.contract.getMiningDetails(tokenId);

          this.tokens.push({
            tokenId: tokenId.toString(),
            diamondID: this.bytesToString(miningDetails[4]),
            position: position.toNumber()
          });
        }
      } catch (error) {
        console.error('Error fetching tokens:', error);
        this.error = "Failed to fetch tokens";
      }
    },
    getPosition(position) {
      const stages = ["Mining", "Cutting", "Grading", "Jewelry Making", "Design", "Customer"];
      return position >= 5 ? "Customer" : stages[position] || "Unknown";
    },
    getStageStatus(position) {
      if (position >= 5) {
        return "Completed";
      }
      return "In Progress";
    },
    bytesToString(bytes32) {
      if (!bytes32) return 'N/A';
      try {
        const string = ethers.utils.parseBytes32String(bytes32);
        return string === '' ? 'N/A' : string;
      } catch (error) {
        console.warn('Error parsing bytes32 to string:', error);
        return 'Invalid Data';
      }
    },
    viewDetails(tokenId) {
      this.$router.push({
        name: 'search-result',
        query: { 
          id: tokenId,
          from: 'all-tokens'
        }
      });
    },
    goBack() {
      this.$router.push('/');
    },
    async logout() {
      this.isConnected = false;
      this.contract = null;
      
      window.localStorage.setItem('walletLogout', 'true');
      
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.all-tokens {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
}

.back-section {
  margin-bottom: 20px;
}

.action-btn {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action-btn:hover {
  background-color: #45a049;
}

.tokens-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.token-card {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.token-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.token-card h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.token-card p {
  margin: 5px 0;
  color: #666;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  color: #ff4444;
}

.header-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.logout-btn {
  padding: 8px 16px;
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: #ff0000;
}
</style>
