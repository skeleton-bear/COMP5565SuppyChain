<template>
  <div class="role-actions">
    <template v-if="isOwner">
      <div class="current-role">
        Current Role: {{ getCurrentRole }}
      </div>
      
      <!-- 根据 position 显示对应的操作按钮 -->
      <div class="action-buttons">
        <template v-if="position === 0">
          <button @click="$emit('showTransfer')" class="transfer-btn">
            Transfer to Cutting Company
          </button>
        </template>
        
        <template v-if="position === 1">
          <button @click="$emit('showCutting')" class="action-btn">
            Fill Cutting Info
          </button>
          <button @click="$emit('showTransfer')" class="transfer-btn">
            Transfer to Grading Company
          </button>
        </template>
        
        <template v-if="position === 2">
          <button @click="$emit('showGrading')" class="action-btn">
            Fill Grading Info
          </button>
          <button @click="$emit('showTransfer')" class="transfer-btn">
            Transfer to Jewelry Company
          </button>
        </template>
        
        <template v-if="position === 3">
          <button @click="$emit('showJewelry')" class="action-btn">
            Fill Jewelry Info
          </button>
          <button @click="$emit('showTransfer')" class="transfer-btn">
            Transfer to Designer
          </button>
        </template>
        
        <template v-if="position === 4">
          <button @click="$emit('showDesigner')" class="action-btn">
            Fill Designer Info
          </button>
          <button @click="$emit('showTransfer')" class="transfer-btn">
            Transfer to Customer
          </button>
        </template>
        
        <template v-if="position >= 5">
          <button @click="$emit('showCustomer')" class="action-btn">
            Fill Customer Info
          </button>
          <button @click="$emit('showTransfer')" class="transfer-btn">
            Transfer to Next Owner
          </button>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'RoleActions',
  props: {
    tokenId: {
      type: [String, Number],
      required: true
    },
    position: {
      type: Number,
      required: true
    },
    owner: {
      type: String,
      required: true
    },
    currentAccount: {
      type: String,
      required: true
    }
  },
  emits: [
    'showTransfer',
    'showCutting',
    'showGrading',
    'showJewelry',
    'showDesigner',
    'showCustomer'
  ],
  computed: {
    isOwner() {
      return this.owner.toLowerCase() === this.currentAccount.toLowerCase();
    },
    getCurrentRole() {
      const roles = [
        "Mining Company",
        "Cutting Company",
        "Grading Lab",
        "Jewelry Maker",
        "Designer",
        "Customer"
      ];
      return this.position >= 5 ? "Customer" : roles[this.position] || "Unknown";
    }
  }
}
</script>

<style scoped>
.role-actions {
  margin: 20px 0;
  padding: 15px;
  border-radius: 8px;
  background-color: #f5f5f5;
}

.current-role {
  font-size: 1.1em;
  font-weight: bold;
  margin-bottom: 15px;
  color: #2c3e50;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.action-btn, .transfer-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.action-btn {
  background-color: #4CAF50;
  color: white;
}

.transfer-btn {
  background-color: #2196F3;
  color: white;
}

.action-btn:hover {
  background-color: #45a049;
}

.transfer-btn:hover {
  background-color: #1976D2;
}
</style> 