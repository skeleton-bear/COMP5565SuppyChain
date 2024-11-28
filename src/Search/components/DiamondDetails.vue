<template>
  <div v-if="diamond && isValidDiamondData(diamond)">
    <section v-for="stage in stages" :key="stage.name" class="stage-section">
      <h2>{{ stage.title }}</h2>
      <ul>
        <li v-for="field in stage.fields" :key="field.key">
          <strong>{{ field.label }}:</strong>
          {{ getFieldValue(diamond, stage.name, field.key) }}
        </li>
        <li>
          <strong>Stage Status:</strong>
          {{ getStageStatus(diamond.position, stage.position, diamond) }}
        </li>
      </ul>
    </section>

    <h2>Ownership Information</h2>
    <ul>
      <li><strong>Current Stage:</strong> {{ getPosition(diamond.position) }}</li>
      <li><strong>Current Owner:</strong> {{ diamond.owner }}</li>
    </ul>
  </div>
  <div v-else-if="diamond && !isValidDiamondData(diamond)" class="error-message">
    <p>Token ID {{ tokenId }} does not exist</p>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import { useContract } from '../composables/useContract';

export default {
  name: 'DiamondDetails',
  props: {
    diamond: {
      type: Object,
      required: true
    },
    tokenId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      stages: [
        {
          name: 'Mining',
          title: 'Mining Stage',
          position: 0,
          fields: [
            { key: 'diamondID', label: 'Diamond ID' },
            { key: 'miningCompany', label: 'Mining Company' },
            { key: 'miningAddress', label: 'Mining Company Address' },
            { key: 'location', label: 'Location' },
            { key: 'minedDate', label: 'Mined Date', isDate: true }
          ]
        },
        {
          name: 'Cutting',
          title: 'Cutting Stage',
          position: 1,
          fields: [
            { key: 'cuttingCompany', label: 'Cutting Company' },
            { key: 'cuttingAddress', label: 'Cutting Company Address' },
            { key: 'cutDate', label: 'Cut Date', isDate: true },
            { key: 'cutGrade', label: 'Cut Grade' }
          ]
        },
        // ... 其他阶段的配置
      ]
    }
  },
  setup() {
    const { bytesToString } = useContract();
    
    return {
      bytesToString
    };
  },
  methods: {
    getFieldValue(diamond, stageName, fieldKey) {
      const stage = diamond[stageName];
      if (!stage) return 'N/A';
      
      const value = stage[fieldKey];
      if (this.isDateField(stageName, fieldKey)) {
        return this.formatDate(value);
      }
      return value || 'N/A';
    },
    isDateField(stageName, fieldKey) {
      const stage = this.stages.find(s => s.name === stageName);
      if (!stage) return false;
      const field = stage.fields.find(f => f.key === fieldKey);
      return field && field.isDate;
    },
    formatDate(timestamp) {
      if (!timestamp || timestamp === 0) return 'N/A';
      try {
        return new Date(timestamp * 1000).toLocaleDateString();
      } catch (error) {
        console.warn('Error formatting date:', error);
        return 'N/A';
      }
    },
    getPosition(position) {
      const stages = ["Mining", "Cutting", "Grading", "Jewelry Making", "Design", "Customer"];
      return position >= 5 ? "Customer" : stages[position] || "Unknown";
    },
    isValidDiamondData(data) {
      return data && 
             data.Mining && 
             (data.Mining.miningCompany !== 'N/A' || 
              data.Mining.location !== 'N/A' || 
              data.Mining.minedDate !== 0);
    },
    getStageStatus(position, stage, data) {
      if (!data) return 'Unknown';
      
      if (stage === 5 && position >= 5) {
        return 'In Progress';
      }
      
      if (position < stage) {
        return 'Not Started';
      }
      
      if (position > stage) {
        return 'Completed';
      }
      
      return 'In Progress';
    }
  }
}
</script>

<style scoped>
.stage-section {
  margin-bottom: 2rem;
}

.error-message {
  color: #ff4444;
  margin: 20px 0;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
}

ul {
  list-style: none;
  padding: 0;
  margin: 15px 0;
}

li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

li strong {
  color: #2c3e50;
  margin-right: 10px;
}
</style> 