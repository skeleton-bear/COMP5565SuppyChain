import { ref, computed } from 'vue';

export function useRoleManagement() {
  const currentPosition = ref(0);
  
  const rolePermissions = {
    0: { // Mining Company
      canTransfer: true,
      canFillInfo: false,
      nextStage: 1
    },
    1: { // Cutting Company
      canTransfer: true,
      canFillInfo: true,
      nextStage: 2,
      requiredInfo: ['cuttingCompany', 'cutDate', 'grade']
    },
    2: { // Grading Lab
      canTransfer: true,
      canFillInfo: true,
      nextStage: 3,
      requiredInfo: ['gradingLab', 'engravedID', 'gradingLevel', 'gradingDate', 'qualityReport']
    },
    3: { // Jewelry Maker
      canTransfer: true,
      canFillInfo: true,
      nextStage: 4,
      requiredInfo: ['jewelryMaker', 'jewelryType', 'possessionDate']
    },
    4: { // Designer
      canTransfer: true,
      canFillInfo: true,
      nextStage: 5,
      requiredInfo: ['designer', 'designDate']
    },
    5: { // Customer
      canTransfer: true,
      canFillInfo: true,
      nextStage: 5,
      requiredInfo: ['name', 'purchaseDate']
    }
  };

  const currentRole = computed(() => {
    const roles = [
      "Mining Company",
      "Cutting Company",
      "Grading Lab",
      "Jewelry Maker",
      "Designer",
      "Customer"
    ];
    return currentPosition.value >= 5 ? "Customer" : roles[currentPosition.value];
  });

  function canPerformAction(position, action, userAddress, ownerAddress) {
    if (!userAddress || !ownerAddress) return false;
    
    // 检查是否是 NFT 所有者
    if (userAddress.toLowerCase() !== ownerAddress.toLowerCase()) return false;
    
    // 获取该位置的权限
    const permissions = rolePermissions[position];
    if (!permissions) return false;
    
    return permissions[action] || false;
  }

  function getRequiredFields(position) {
    return rolePermissions[position]?.requiredInfo || [];
  }

  function getNextStage(position) {
    return rolePermissions[position]?.nextStage || position;
  }

  return {
    currentPosition,
    currentRole,
    canPerformAction,
    getRequiredFields,
    getNextStage,
    rolePermissions
  };
} 