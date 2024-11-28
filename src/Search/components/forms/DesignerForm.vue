<template>
  <BaseForm 
    title="Designer Stage" 
    submitButtonText="Submit Designer Info"
    @close="$emit('close')"
    @submit="handleSubmit"
  >
    <div class="form-group">
      <label>Token ID:</label>
      <input type="number" v-model="formData.tokenId" disabled />
    </div>
    <div class="form-group">
      <label>Designer Name:</label>
      <input v-model="formData.designerName" required />
    </div>
    <div class="form-group">
      <label>Design Date:</label>
      <input type="date" v-model="formData.designDate" required />
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
  name: 'DesignerForm',
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
      designerName: '',
      designDate: ''
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
        if (position.toNumber() !== 4) {
          throw new Error(`Diamond is not in the Design stage. Current position: ${position.toString()}`);
        }

        // 转换数据格式
        const designerNameBytes32 = ethers.utils.formatBytes32String(formData.value.designerName);
        const designDateTimestamp = Math.floor(new Date(formData.value.designDate).getTime() / 1000);

        // 调用合约方法
        const tx = await contract.value.setDesigner(
          formData.value.tokenId,
          designerNameBytes32,
          designDateTimestamp,
          { gasLimit: 500000 }
        );

        await tx.wait();
        emit('success');
        emit('close');
      } catch (error) {
        console.error('Error submitting designer info:', error);
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