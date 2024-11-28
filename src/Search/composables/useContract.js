import { ref, markRaw } from 'vue';
import { ethers } from 'ethers';
import DiomandDapp from '../../../artifacts/contracts/DiamondDapp.sol/DiomandDapp.json';

export function useContract() {
  const contract = ref(null);
  const contractError = ref(null);

  async function initContract(signer) {
    try {
      const contractAddress = process.env.VUE_APP_CONTRACT_ADDRESS;
      
      // 创建新的 provider 实例并使用 markRaw
      const provider = markRaw(new ethers.providers.Web3Provider(window.ethereum));
      
      // 验证合约地址
      const code = await provider.getCode(contractAddress);
      if (code === '0x') {
        throw new Error("No contract found at this address");
      }

      // 初始化合约并使用 markRaw
      const newContract = markRaw(new ethers.Contract(
        contractAddress,
        DiomandDapp.abi,
        signer
      ));

      contract.value = newContract;

      // 验证合约连接
      try {
        const name = await contract.value.name();
        console.log("Contract initialized:", name);
      } catch (error) {
        console.error("Error getting contract name:", error);
        throw new Error("Failed to verify contract connection");
      }
      
      return contract.value;
    } catch (error) {
      console.error("Contract initialization error:", error);
      contractError.value = error;
      throw error;
    }
  }

  return {
    contract,
    contractError,
    initContract
  };
} 