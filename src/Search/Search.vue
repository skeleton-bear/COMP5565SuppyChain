<template>
  <div class="search">
    <h1>Diamond NFT System</h1>
    
    <!-- 钱包连接组件 -->
    <ConnectWallet 
      @connected="handleWalletConnected"
      @disconnected="handleWalletDisconnected"
    />

    <div v-if="isConnected">
      <div class="action-buttons">
        <button @click="showMiningDialog" class="action-btn">Mint New Diamond</button>
        <button @click="showMyNFTs" class="my-nfts-btn">My NFTs</button>
      </div>

      <!-- 搜索组件 -->
      <SearchForm 
        :isConnected="isConnected"
        @search="handleSearch"
      />

      <!-- 钻石详情组件 -->
      <DiamondDetails 
        v-if="diamond"
        :diamond="diamond"
        :tokenId="tokenId"
      />

      <!-- 各种表单组件 -->
      <MiningForm 
        v-if="showMiningForm"
        @close="showMiningForm = false"
        @success="handleMiningSuccess"
      />

      <CuttingForm 
        v-if="showCuttingForm"
        :tokenId="selectedTokenId"
        @close="closeForm"
        @success="handleCuttingSuccess"
      />

      <GradingForm 
        v-if="showGradingForm"
        :tokenId="selectedTokenId"
        @close="closeForm"
        @success="handleGradingSuccess"
      />

      <JewelryForm 
        v-if="showJewelryForm"
        :tokenId="selectedTokenId"
        @close="closeForm"
        @success="handleJewelrySuccess"
      />

      <DesignerForm 
        v-if="showDesignerForm"
        :tokenId="selectedTokenId"
        @close="closeForm"
        @success="handleDesignerSuccess"
      />

      <CustomerForm 
        v-if="showCustomerForm"
        :tokenId="selectedTokenId"
        @close="closeForm"
        @success="handleCustomerSuccess"
      />

      <!-- 添加 TransferForm 组件 -->
      <TransferForm 
        v-if="showTransferForm"
        :tokenId="selectedTokenId"
        @close="showTransferForm = false"
        @success="handleTransferSuccess"
      />

      <!-- NFT 列表对话框 -->
      <div v-if="showMyNFTsDialog" class="modal">
        <div class="modal-content">
          <span class="close" @click="showMyNFTsDialog = false">&times;</span>
          <h2>My Diamond NFTs</h2>
          <div v-if="myNFTs.length > 0">
            <div v-for="nft in myNFTs" :key="nft.tokenId" class="nft-item">
              <p>Token ID: {{ nft.tokenId }}</p>
              <p>Position: {{ nft.position }}</p>
              <RoleActions 
                :tokenId="nft.tokenId"
                :position="nft.position"
                :owner="nft.owner"
                :currentAccount="account"
                @showTransfer="handleShowTransfer"
                @showCutting="handleShowCutting"
                @showGrading="handleShowGrading"
                @showJewelry="handleShowJewelry"
                @showDesigner="handleShowDesigner"
                @showCustomer="handleShowCustomer"
              />
            </div>
          </div>
          <div v-else>
            <p>You don't own any diamond NFTs yet.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import { ref, onMounted } from 'vue';
import ConnectWallet from './components/ConnectWallet.vue';
import SearchForm from './components/SearchForm.vue';
import DiamondDetails from './components/DiamondDetails.vue';
import RoleActions from './components/RoleActions.vue';
import MiningForm from './components/forms/MiningForm.vue';
import CuttingForm from './components/forms/CuttingForm.vue';
import GradingForm from './components/forms/GradingForm.vue';
import JewelryForm from './components/forms/JewelryForm.vue';
import DesignerForm from './components/forms/DesignerForm.vue';
import CustomerForm from './components/forms/CustomerForm.vue';
import TransferForm from './components/forms/TransferForm.vue';
import { useWallet } from './composables/useWallet';
import { useContract } from './composables/useContract';

export default {
  name: 'SearchPage',
  components: {
    ConnectWallet,
    SearchForm,
    DiamondDetails,
    RoleActions,
    MiningForm,
    CuttingForm,
    GradingForm,
    JewelryForm,
    DesignerForm,
    CustomerForm,
    TransferForm
  },
  setup() {
    // 使用组合式 API
    const { isConnected, account, connectWallet } = useWallet();
    const { contract, initContract, bytesToString, isZeroAddress } = useContract();

    // 状态管理
    const tokenId = ref('');
    const diamond = ref(null);
    const myNFTs = ref([]);
    const selectedTokenId = ref(null);
    
    // 表单显示状态
    const showMiningForm = ref(false);
    const showCuttingForm = ref(false);
    const showGradingForm = ref(false);
    const showJewelryForm = ref(false);
    const showDesignerForm = ref(false);
    const showCustomerForm = ref(false);
    const showMyNFTsDialog = ref(false);

    // 添加 transfer 相关的状态
    const showTransferForm = ref(false);
    const transferFormData = ref({
      tokenId: '',
      to: ''
    });

    // 方法定义
    async function handleWalletConnected() {
      try {
        const signer = await connectWallet();
        if (!signer) {
          throw new Error("Failed to get signer");
        }
        await initContract(signer);
        await fetchMyNFTs();
      } catch (error) {
        console.error('Wallet connection error:', error);
        alert(`Failed to initialize: ${error.message}`);
      }
    }

    function handleWalletDisconnected() {
      diamond.value = null;
      myNFTs.value = [];
      closeAllForms();
    }

    async function handleSearch() {
      try {
        if (!contract.value) {
          throw new Error("Contract not initialized");
        }

        const result = await contract.value.getDiamondInfo(tokenId.value);
        
        // 确保所有 bytes32 类型的数据都被正确转换
        diamond.value = {
          miningCompany: bytesToString(result.miningCompany),
          cuttingCompany: bytesToString(result.cuttingCompany),
          gradingLab: bytesToString(result.gradingLab),
          jewelryMaker: bytesToString(result.jewelryMaker),
          designer: bytesToString(result.designer),
          customer: bytesToString(result.customer),
          // ... 其他字段
        };
      } catch (error) {
        console.error('Search error:', error);
        alert(`Search failed: ${error.message}`);
      }
    }

    async function fetchMyNFTs() {
      try {
        console.log("Fetching NFTs for account:", account.value);
        
        if (!contract.value) {
          throw new Error("Contract not initialized");
        }

        const balance = await contract.value.balanceOf(account.value);
        console.log("NFT balance:", balance.toString());
        
        myNFTs.value = [];

        for (let i = 0; i < balance; i++) {
          const tokenId = await contract.value.tokenOfOwnerByIndex(account.value, i);
          console.log("Found token ID:", tokenId.toString());
          
          const position = await contract.value.getDiamondPosition(tokenId);
          const owner = await contract.value.ownerOf(tokenId);
          
          myNFTs.value.push({
            tokenId: tokenId.toString(),
            position: position.toNumber(),
            owner
          });
        }

        console.log("Fetched NFTs:", myNFTs.value);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        alert('Failed to fetch your NFTs: ' + error.message);
      }
    }

    // 表单处理方法
    function showMiningDialog() {
      showMiningForm.value = true;
    }

    function handleShowCutting(tokenId) {
      selectedTokenId.value = tokenId;
      showCuttingForm.value = true;
      showMyNFTsDialog.value = false;
    }

    function handleShowGrading(tokenId) {
      selectedTokenId.value = tokenId;
      showGradingForm.value = true;
      showMyNFTsDialog.value = false;
    }

    function handleShowJewelry(tokenId) {
      selectedTokenId.value = tokenId;
      showJewelryForm.value = true;
      showMyNFTsDialog.value = false;
    }

    function handleShowDesigner(tokenId) {
      selectedTokenId.value = tokenId;
      showDesignerForm.value = true;
      showMyNFTsDialog.value = false;
    }

    function handleShowCustomer(tokenId) {
      selectedTokenId.value = tokenId;
      showCustomerForm.value = true;
      showMyNFTsDialog.value = false;
    }

    // 成功处理方法
    async function handleMiningSuccess() {
      await fetchMyNFTs();
      showMiningForm.value = false;
    }

    async function handleCuttingSuccess() {
      await fetchMyNFTs();
      showCuttingForm.value = false;
      showMyNFTsDialog.value = true;
    }

    async function handleGradingSuccess() {
      await fetchMyNFTs();
      showGradingForm.value = false;
      showMyNFTsDialog.value = true;
    }

    async function handleJewelrySuccess() {
      await fetchMyNFTs();
      showJewelryForm.value = false;
      showMyNFTsDialog.value = true;
    }

    async function handleDesignerSuccess() {
      await fetchMyNFTs();
      showDesignerForm.value = false;
      showMyNFTsDialog.value = true;
    }

    async function handleCustomerSuccess() {
      await fetchMyNFTs();
      showCustomerForm.value = false;
      showMyNFTsDialog.value = true;
    }

    async function showMyNFTs() {
      try {
        await fetchMyNFTs();
        showMyNFTsDialog.value = true;
      } catch (error) {
        console.error('Error showing NFTs:', error);
        alert('Failed to load NFTs');
      }
    }

    function closeForm() {
      showCuttingForm.value = false;
      showGradingForm.value = false;
      showJewelryForm.value = false;
      showDesignerForm.value = false;
      showCustomerForm.value = false;
      showMyNFTsDialog.value = true;
    }

    function closeAllForms() {
      showMiningForm.value = false;
      showCuttingForm.value = false;
      showGradingForm.value = false;
      showJewelryForm.value = false;
      showDesignerForm.value = false;
      showCustomerForm.value = false;
      showMyNFTsDialog.value = false;
    }

    // 添加 transfer 相关的方法
    function handleShowTransfer(tokenId) {
      selectedTokenId.value = tokenId;
      showTransferForm.value = true;
      showMyNFTsDialog.value = false;
    }

    async function handleTransferSuccess() {
      await fetchMyNFTs();
      showTransferForm.value = false;
      showMyNFTsDialog.value = true;
    }

    // 生命周期钩子
    onMounted(async () => {
      console.log("Component mounted, waiting for user to connect wallet");
    });

    return {
      // 状态
      isConnected,
      account,
      tokenId,
      diamond,
      myNFTs,
      selectedTokenId,
      
      // 表单状态
      showMiningForm,
      showCuttingForm,
      showGradingForm,
      showJewelryForm,
      showDesignerForm,
      showCustomerForm,
      showMyNFTsDialog,
      
      // 方法
      handleWalletConnected,
      handleWalletDisconnected,
      handleSearch,
      showMiningDialog,
      handleShowCutting,
      handleShowGrading,
      handleShowJewelry,
      handleShowDesigner,
      handleShowCustomer,
      handleMiningSuccess,
      handleCuttingSuccess,
      handleGradingSuccess,
      handleJewelrySuccess,
      handleDesignerSuccess,
      handleCustomerSuccess,
      showMyNFTs,
      closeForm,
      closeAllForms,
      bytesToString,
      isZeroAddress,
      showTransferForm,
      transferFormData,
      handleShowTransfer,
      handleTransferSuccess
    };
  }
};
</script>

<style scoped>
.search {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin: 20px 0;
}

.action-btn, .my-nfts-btn {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.action-btn {
  background-color: #4CAF50;
  color: white;
}

.my-nfts-btn {
  background-color: #2196F3;
  color: white;
}

.action-btn:hover {
  background-color: #45a049;
}

.my-nfts-btn:hover {
  background-color: #1976D2;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
  padding: 20px 0;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  position: relative;
  margin: 20px auto;
}

.close {
  position: absolute;
  right: 15px;
  top: 10px;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.nft-item {
  margin: 15px 0;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
  