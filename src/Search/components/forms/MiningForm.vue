<template>
  <BaseForm 
    title="Mining Stage" 
    submitButtonText="Submit Mining Info"
    @close="$emit('close')"
    @submit="handleSubmit"
  >
    <div class="form-group">
      <label>Mining Company:</label>
      <input v-model="formData.miningCompany" required />
    </div>
    <div class="form-group">
      <label>Location:</label>
      <input v-model="formData.location" required />
    </div>
    <div class="form-group">
      <label>Mining Date:</label>
      <input type="date" v-model="formData.date" required />
    </div>
  </BaseForm>
</template>

<script>
/* eslint-disable no-unused-vars */
import { ref, onMounted } from 'vue';
import BaseForm from './BaseForm.vue';
import { useContract } from '../../composables/useContract';
import { useWallet } from '../../composables/useWallet';
import { ethers } from 'ethers';

export default {
  name: 'MiningForm',
  components: {
    BaseForm
  },
  emits: ['close', 'success'],
  setup(props, { emit }) {
    const { contract, initContract } = useContract();
    const { isConnected, account, provider, connectWallet } = useWallet();
    const formData = ref({
      miningCompany: '',
      location: '',
      date: ''
    });

    async function handleSubmit() {
      try {
        // 检查钱包连接状态
        if (!isConnected.value) {
          // 尝试重新连接钱包
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

        // 转换数据格式
        const miningCompanyBytes32 = ethers.utils.formatBytes32String(formData.value.miningCompany);
        const locationBytes32 = ethers.utils.formatBytes32String(formData.value.location);
        const dateTimestamp = Math.floor(new Date(formData.value.date).getTime() / 1000);

        // 调用合约方法
        const tx = await contract.value.mining(
          miningCompanyBytes32,
          locationBytes32,
          dateTimestamp,
          { gasLimit: 500000 }
        );

        await tx.wait();
        emit('success');
        emit('close');
      } catch (error) {
        console.error('Error minting diamond:', error);
        alert(error.message); // 添加用户提示
        throw error;
      }
    }

    // 在组件挂载时检查连接状态
    onMounted(async () => {
      if (!isConnected.value) {
        try {
          await connectWallet();
        } catch (error) {
          console.warn('Auto connection failed:', error);
        }
      }
    });

    return {
      formData,
      handleSubmit,
      isConnected
    };
  }
}
</script> 