<template>
  <BaseForm 
    title="Transfer NFT" 
    submitButtonText="Transfer"
    @close="$emit('close')"
    @submit="handleSubmit"
  >
    <div class="form-group">
      <label>Token ID:</label>
      <input type="number" v-model="formData.tokenId" disabled />
    </div>
    <div class="form-group">
      <label>Recipient Address:</label>
      <input v-model="formData.to" required placeholder="0x..." />
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
  name: 'TransferForm',
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
      to: ''
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

        // 验证地址格式
        if (!ethers.utils.isAddress(formData.value.to)) {
          throw new Error("Invalid recipient address");
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

        // 调用合约方法
        const tx = await contract.value.transit(
          formData.value.tokenId,
          formData.value.to,
          { gasLimit: 500000 }
        );

        await tx.wait();
        emit('success');
        emit('close');
      } catch (error) {
        console.error('Error transferring NFT:', error);
        alert(error.message);
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