<template>
  <BaseForm 
    title="Customer Stage" 
    submitButtonText="Submit Customer Info"
    @close="$emit('close')"
    @submit="handleSubmit"
  >
    <div class="form-group">
      <label>Token ID:</label>
      <input type="number" v-model="formData.tokenId" disabled />
    </div>
    <div class="form-group">
      <label>Customer Name:</label>
      <input v-model="formData.customerName" required />
    </div>
    <div class="form-group">
      <label>Purchase Date:</label>
      <input type="date" v-model="formData.purchaseDate" required />
    </div>
  </BaseForm>
</template>

<script>
import { ref } from 'vue';
import BaseForm from './BaseForm.vue';
import { useContract } from '../../composables/useContract';
import { useWallet } from '../../composables/useWallet';
import { ethers } from 'ethers';

export default {
  name: 'CustomerForm',
  components: {
    BaseForm
  },
  props: {
    tokenId: {
      type: [String, Number],
      required: true
    }
  },
  emits: ['close', 'success'],
  setup(props, { emit }) {
    const { contract, initContract } = useContract();
    const { isConnected, provider, connectWallet } = useWallet();
    const formData = ref({
      tokenId: props.tokenId,
      customerName: '',
      purchaseDate: ''
    });

    async function handleSubmit() {
      try {
        // 检查钱包连接状态
        if (!isConnected.value) {
          try {
            await connectWallet();
          } catch (error) {
            throw new Error("Please connect your wallet first");
          }
        }

        // 确保 provider 存在
        if (!provider.value) {
          throw new Error("Provider not initialized");
        }

        // 获取 signer
        const signer = provider.value.getSigner();
        
        // 如果合约未初始化，尝试初始化
        if (!contract.value) {
          await initContract(signer);
        }

        if (!contract.value) {
          throw new Error("Contract not initialized");
        }

        // 检查 position
        const position = await contract.value.getDiamondPosition(formData.value.tokenId);
        if (position.toNumber() < 5) {
          throw new Error(`Diamond is not in the Customer stage yet. Current position: ${position.toString()}`);
        }

        // 转换数据格式
        const customerNameBytes32 = ethers.utils.formatBytes32String(formData.value.customerName);
        const purchaseDateTimestamp = Math.floor(new Date(formData.value.purchaseDate).getTime() / 1000);

        // 调用合约方法
        const tx = await contract.value.setCustomer(
          formData.value.tokenId,
          customerNameBytes32,
          purchaseDateTimestamp,
          { gasLimit: 500000 }
        );

        await tx.wait();
        emit('success');
        emit('close');
      } catch (error) {
        console.error('Error submitting customer info:', error);
        alert(error.message); // 添加用户提示
        throw error;
      }
    }

    return {
      formData,
      handleSubmit,
      isConnected
    };
  }
}
</script> 