<template>
  <div class="modal">
    <div class="modal-content">
      <span class="close" @click="$emit('close')">&times;</span>
      <h2>{{ title }}</h2>
      <form @submit.prevent="handleSubmit">
        <slot></slot>
        <button type="submit">{{ submitButtonText }}</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseForm',
  props: {
    title: {
      type: String,
      required: true
    },
    submitButtonText: {
      type: String,
      default: 'Submit'
    }
  },
  emits: ['close', 'submit'],
  methods: {
    handleSubmit() {
      this.$emit('submit');
    }
  }
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
  padding: 20px 0;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  position: relative;
  margin: 20px auto;
  max-height: 90vh;
  overflow-y: auto;
}

.close {
  position: absolute;
  right: 15px;
  top: 10px;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.form-group {
  margin: 15px 0;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #2c3e50;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 15px;
}

button:hover {
  background-color: #45a049;
}
</style> 