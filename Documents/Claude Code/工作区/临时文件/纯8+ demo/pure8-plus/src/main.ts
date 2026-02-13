import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { initializeDatabase } from './lib/db';
import { userStore } from './stores/userStore';
import { goalStore } from './stores/goalStore';
import { quoteStore } from './stores/quoteStore';

// 初始化数据库和stores
async function init() {
  try {
    await initializeDatabase();
    await userStore.init();
    await goalStore.load();
    await quoteStore.load();

    // 挂载应用
    const app = mount(App, {
      target: document.getElementById('app')!
    });

    return app;
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
}

init();

export default init;
