<template>
  <div class="search-section">
    <div class="search-input">
      <input
        v-model="tokenId"
        type="number"
        placeholder="Enter Token ID"
        @keyup.enter="handleSearch"
      />
      <button @click="handleSearch" :disabled="!isConnected">Search</button>
    </div>
    <div v-if="!isConnected" class="warning-message">
      Please connect your wallet first
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'SearchForm',
  props: {
    isConnected: {
      type: Boolean,
      required: true
    }
  },
  emits: ['search'],
  setup(props, { emit }) {
    const tokenId = ref('');

    async function handleSearch() {
      if (!props.isConnected) {
        alert("Please connect your wallet first!");
        return;
      }

      if (tokenId.value === "" || isNaN(tokenId.value) || tokenId.value < 0) {
        alert("Please enter a valid Token ID");
        return;
      }

      emit('search', tokenId.value);
    }

    return {
      tokenId,
      handleSearch
    };
  }
}
</script>

<style scoped>
.search-section {
  margin: 20px 0;
}

.search-input {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

input {
  padding: 10px;
  font-size: 16px;
  width: 200px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.warning-message {
  color: #ff4444;
  margin-top: 10px;
  font-size: 14px;
}
</style> 