import { ethers } from "ethers";
import DiomandDapp from "../../artifacts/contracts/DiamondDapp.sol/DiomandDapp.json";
import { CONTRACT_ADDRESS } from '../config';

<template>
  <div class="search-result">
    <h2>Diamond NFT Details</h2>
    
    <div v-if="loading" class="loading">
      <p>Loading...</p>
    </div>
    
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <div class="actions">
        <button @click="goBack" class="action-btn">{{ backButtonText }}</button>
      </div>
    </div>
    
    <div v-else-if="diamond && isValidDiamondData(diamond)">
      <div class="actions top-actions">
        <button @click="goBack" class="action-btn">{{ backButtonText }}</button>
      </div>

      <h2>Mining Stage</h2>
      <ul>
        <li><strong>Diamond ID:</strong> {{ String(diamond.Mining.diamondID) }}</li>
        <li><strong>Mining Company:</strong> {{ diamond.Mining.miningCompany || 'N/A' }}</li>
        <li><strong>Mining Company Address:</strong> {{ diamond.Mining.miningAddress || 'N/A' }}</li>
        <li><strong>Location:</strong> {{ diamond.Mining.location || 'N/A' }}</li>
        <li><strong>Mined Date:</strong> {{ formatDate(diamond.Mining.minedDate) }}</li>
        <li><strong>Stage Status:</strong> {{ getStageStatus(diamond.position, 0, diamond) }}</li>
      </ul>

      <h2>Cutting Stage</h2>
      <ul>
        <li><strong>Cutting Company:</strong> {{ diamond.Cutting.cuttingCompany || 'N/A' }}</li>
        <li><strong>Cutting Company Address:</strong> {{ diamond.Cutting.cuttingAddress || 'N/A' }}</li>
        <li><strong>Cut Date:</strong> {{ formatDate(diamond.Cutting.cutDate) }}</li>
        <li><strong>Cut Grade:</strong> {{ diamond.Cutting.cutGrade || 'N/A' }}</li>
        <li><strong>Stage Status:</strong> {{ getStageStatus(diamond.position, 1, diamond) }}</li>
      </ul>

      <h2>Grading Stage</h2>
      <ul>
        <li><strong>Grading Lab:</strong> {{ diamond.grading.gradingLab || 'N/A' }}</li>
        <li><strong>Grading Lab Address:</strong> {{ diamond.grading.gradingAddress || 'N/A' }}</li>
        <li><strong>Engraved ID:</strong> {{ diamond.grading.engravedID || 'N/A' }}</li>
        <li><strong>Grading Level:</strong> {{ diamond.grading.grading || 'N/A' }}</li>
        <li><strong>Grading Date:</strong> {{ formatDate(diamond.grading.gradingDate) }}</li>
        <li><strong>Quality Report:</strong> {{ diamond.grading.qualityReport || 'N/A' }}</li>
        <li><strong>Stage Status:</strong> {{ getStageStatus(diamond.position, 2, diamond) }}</li>
      </ul>

      <h2>Jewelry Making Stage</h2>
      <ul>
        <li><strong>Jewelry Maker:</strong> {{ diamond.jewelry.jewelryMaker || 'N/A' }}</li>
        <li><strong>Jewelry Maker Address:</strong> {{ diamond.jewelry.jewelryAddress || 'N/A' }}</li>
        <li><strong>Jewelry Type:</strong> {{ diamond.jewelry.jewelryType || 'N/A' }}</li>
        <li><strong>Possession Date:</strong> {{ formatDate(diamond.jewelry.possessionDate) }}</li>
        <li><strong>Stage Status:</strong> {{ getStageStatus(diamond.position, 3, diamond) }}</li>
      </ul>

      <h2>Design Stage</h2>
      <ul>
        <li><strong>Designer:</strong> {{ diamond.design.designer || 'N/A' }}</li>
        <li><strong>Designer Address:</strong> {{ diamond.design.designerAddress || 'N/A' }}</li>
        <li><strong>Design Date:</strong> {{ formatDate(diamond.design.designDate) }}</li>
        <li><strong>Design Price:</strong> {{ diamond.design.designPrice || 'N/A' }} ETH</li>
        <li><strong>Stage Status:</strong> {{ getStageStatus(diamond.position, 4, diamond) }}</li>
      </ul>

      <h2>Customer Stage</h2>
      <ul>
        <li><strong>Customer Name:</strong> {{ diamond.customer.name || 'N/A' }}</li>
        <li><strong>Customer Address:</strong> {{ diamond.customer.customerAddress || 'N/A' }}</li>
        <li><strong>Purchase Date:</strong> {{ formatDate(diamond.customer.purchaseDate) }}</li>
        <li><strong>Stage Status:</strong> {{ getStageStatus(diamond.position, 5, diamond) }}</li>
      </ul>

      <h2>Ownership Information</h2>
      <ul>
        <li><strong>Current Stage:</strong> {{ getPosition(diamond.position) }}</li>
        <li><strong>Current Owner:</strong> {{ diamond.owner }}</li>
      </ul>
    </div>

    <div v-else class="actions">
      <button @click="goBack" class="action-btn">{{ backButtonText }}</button>
    </div>
  </div>
</template>

<script>
import { ethers } from "ethers";
import DiomandDapp from "../../artifacts/contracts/DiamondDapp.sol/DiomandDapp.json";
import { CONTRACT_ADDRESS } from '../config';

export default {
  name: 'SearchResult',
  data() {
    return {
      diamond: null,
      tokenId: null,
      contract: null,
      isConnected: false,
      loading: true,
      error: null,
      fromPage: null
    }
  },
  computed: {
    backButtonText() {
      return this.fromPage === 'all-tokens' ? 'Back to All Tokens' : 'Back to Search';
    }
  },
  async created() {
    const tokenId = this.$route.query.id;
    if (!tokenId) {
      this.$router.push('/');
      return;
    }
    
    this.fromPage = this.$route.query.from || 'search';
    
    this.tokenId = parseInt(tokenId);
    
    try {
      await this.initContract();
      await this.fetchDiamondData();
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
            params: [{ chainId: '0x7A69' }], // 31337 in hex
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
        
        this.isConnected = true;

      } catch (error) {
        console.error("Contract initialization error:", error);
        throw error;
      }
    },
    async fetchDiamondData() {
      try {
        if (!this.contract) {
          throw new Error("Contract not initialized");
        }

        // 首先检查代币是否存在
        try {
          await this.contract.ownerOf(this.tokenId);
        } catch (error) {
          console.error("Token does not exist:", error);
          this.diamond = null;
          this.error = `Token ID ${this.tokenId} does not exist`;
          return;
        }

        // 获取所有阶段的详细信息
        const [miningDetails, cuttingDetails, gradingDetails, jewelryDetails, designDetails, customerDetails, position, owner] = 
          await Promise.all([
            this.contract.getMiningDetails(this.tokenId),
            this.contract.getCuttingDetails(this.tokenId),
            this.contract.getGradingDetails(this.tokenId),
            this.contract.getJewelryDetails(this.tokenId),
            this.contract.getDesignDetails(this.tokenId),
            this.contract.getCustomerDetails(this.tokenId),
            this.contract.getDiamondPosition(this.tokenId),
            this.contract.ownerOf(this.tokenId)
          ]);

        // 构建钻石数据对象
        this.diamond = {
          Mining: {
            diamondID: this.tokenId,
            miningCompany: this.bytesToString(miningDetails[0]),
            location: this.bytesToString(miningDetails[1]),
            minedDate: miningDetails[2].toNumber(),
            miningAddress: this.isZeroAddress(miningDetails[3]) ? 'N/A' : miningDetails[3]
          },
          Cutting: {
            cuttingCompany: this.bytesToString(cuttingDetails[0]),
            cutDate: cuttingDetails[1].toNumber(),
            cutGrade: this.bytesToString(cuttingDetails[2]),
            cuttingAddress: this.isZeroAddress(cuttingDetails[3]) ? 'N/A' : cuttingDetails[3]
          },
          grading: {
            gradingLab: this.bytesToString(gradingDetails[0]),
            engravedID: this.bytesToString(gradingDetails[1]),
            grading: this.bytesToString(gradingDetails[2]),
            gradingDate: gradingDetails[3].toNumber(),
            qualityReport: gradingDetails[4],
            gradingAddress: this.isZeroAddress(gradingDetails[5]) ? 'N/A' : gradingDetails[5]
          },
          jewelry: {
            jewelryMaker: this.bytesToString(jewelryDetails[0]),
            jewelryType: this.bytesToString(jewelryDetails[1]),
            possessionDate: jewelryDetails[2].toNumber(),
            jewelryAddress: this.isZeroAddress(jewelryDetails[3]) ? 'N/A' : jewelryDetails[3]
          },
          design: {
            designer: this.bytesToString(designDetails[0]),
            designDate: designDetails[1].toNumber(),
            designPrice: ethers.utils.formatEther(designDetails[2]),
            designerAddress: this.isZeroAddress(designDetails[3]) ? 'N/A' : designDetails[3]
          },
          customer: {
            name: this.bytesToString(customerDetails[0]),
            purchaseDate: customerDetails[1].toNumber(),
            customerAddress: this.isZeroAddress(customerDetails[2]) ? 'N/A' : customerDetails[2]
          },
          position: position.toNumber(),
          owner: owner
        };
      } catch (error) {
        console.error('Error fetching diamond data:', error);
        this.error = "Failed to fetch diamond data";
      }
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
    isZeroAddress(address) {
      return !address || address === '0x0000000000000000000000000000000000000000';
    },
    formatDate(timestamp) {
      if (!timestamp || timestamp === 0) return 'N/A';
      try {
        return new Date(timestamp * 1000).toLocaleDateString();
      } catch (error) {
        console.warn('Error formatting date:', error);
        return 'N/A';
      }
    },
    getPosition(position) {
      const stages = ["Mining", "Cutting", "Grading", "Jewelry Making", "Design", "Customer"];
      return position >= 5 ? "Customer" : stages[position] || "Unknown";
    },
    isValidDiamondData(data) {
      return data && 
             data.Mining && 
             (data.Mining.miningCompany !== 'N/A' || 
              data.Mining.location !== 'N/A' || 
              data.Mining.minedDate !== 0);
    },
    getStageStatus(position, stage, data) {
      if (!data) {
        return 'Unknown';
      }

      if (stage === 5 && position >= 5) {
        return 'In Progress';
      }

      if (position < stage) {
        return 'Not Started';
      }

      if (position > stage) {
        switch(stage) {
          case 0:
            return data.Mining && data.Mining.miningCompany && data.Mining.miningCompany !== 'N/A' 
              ? 'Completed' 
              : 'Incomplete';
          case 1:
            return data.Cutting && data.Cutting.cuttingCompany && data.Cutting.cuttingCompany !== 'N/A' 
              ? 'Completed' 
              : 'Incomplete';
          case 2:
            return data.grading && data.grading.gradingLab && data.grading.gradingLab !== 'N/A' 
              ? 'Completed' 
              : 'Incomplete';
          case 3:
            return data.jewelry && data.jewelry.jewelryMaker && data.jewelry.jewelryMaker !== 'N/A' 
              ? 'Completed' 
              : 'Incomplete';
          case 4:
            return data.design && data.design.designer && data.design.designer !== 'N/A' 
              ? 'Completed' 
              : 'Incomplete';
          case 5:
            return data.customer && data.customer.name && data.customer.name !== 'N/A' 
              ? 'Completed' 
              : 'Incomplete';
          default:
            return 'Unknown';
        }
      }
      return 'In Progress';
    },
    goBack() {
      if (this.fromPage === 'all-tokens') {
        this.$router.push('/all-tokens');
      } else {
        this.$router.push('/');
      }
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
.search-result {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}

h2 {
  color: #2c3e50;
  border-bottom: 2px solid #4CAF50;
  padding-bottom: 10px;
  margin-top: 30px;
}

ul {
  list-style: none;
  padding: 0;
  margin: 15px 0;
}

li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

li strong {
  color: #2c3e50;
  margin-right: 10px;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error-message {
  color: #ff4444;
  margin: 20px 0;
  padding: 20px;
  background-color: #ffebee;
  border-radius: 4px;
  text-align: center;
}

.actions {
  margin: 20px 0;
  text-align: center;
}

.top-actions {
  margin-bottom: 30px;
  text-align: left;  /* 让返回按钮靠左对齐 */
}

.action-btn {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action-btn:hover {
  background-color: #45a049;
}
</style>
