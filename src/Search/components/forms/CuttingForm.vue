<template>
  <BaseForm 
    title="Cutting Stage" 
    submitButtonText="Submit Cutting Info"
    @close="$emit('close')"
    @submit="handleSubmit"
  >
    <div class="form-group">
      <label>Token ID:</label>
      <input type="number" v-model="formData.tokenId" disabled />
    </div>
    <div class="form-group">
      <label>Cutting Company:</label>
      <input v-model="formData.cuttingCompany" required />
    </div>
    <div class="form-group">
      <label>Cut Date:</label>
      <input type="date" v-model="formData.cutDate" required />
    </div>
    <div class="form-group">
      <label>Cut Grade:</label>
      <input v-model="formData.grade" required />
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
  name: 'CuttingForm',
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
      cuttingCompany: '',
      grade: '',
      cutDate: ''
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
        if (position.toNumber() !== 1) {
          throw new Error(`Diamond is not in the Cutting stage. Current position: ${position.toString()}`);
        }

        // 转换数据格式
        const cuttingCompanyBytes32 = ethers.utils.formatBytes32String(formData.value.cuttingCompany);
        const gradeBytes32 = ethers.utils.formatBytes32String(formData.value.grade);
        const cutDateTimestamp = Math.floor(new Date(formData.value.cutDate).getTime() / 1000);

        // 调用合约方法
        const tx = await contract.value.cutting(
          formData.value.tokenId,
          cuttingCompanyBytes32,
          gradeBytes32,
          cutDateTimestamp,
          { gasLimit: 500000 }
        );

        await tx.wait();
        emit('success');
        emit('close');
      } catch (error) {
        console.error('Error submitting cutting info:', error);
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