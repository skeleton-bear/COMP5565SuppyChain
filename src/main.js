// main.js
import { createApp } from 'vue';  // 从 Vue 3 导入 createApp
import App from './App.vue';      // 导入根组件
import router from './router'

// 创建并挂载 Vue 应用
createApp(App).use(router).use(router).mount('#app');
