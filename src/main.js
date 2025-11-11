import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import './assets/index.css';
import router from './routers/index.js';

const app = createApp(App);
const store = createPinia();
app.use(store);

// 在路由挂载前，恢复动态路由（刷新页面时）
async function initializeApp() {
  // 检查是否有 token
  const token = localStorage.getItem('token');
  if (token) {
    try {
      // 动态导入工具函数避免循环依赖
      const { validateToken, getUserInfoFromToken } = await import(
        './utils/jwt.js'
      );

      if (validateToken(token)) {
        // 获取用户信息
        let userInfo = getUserInfoFromToken(token);

        // 尝试从 localStorage 补全信息（优先使用 localStorage 中的完整信息）
        const savedUserInfo = localStorage.getItem('userInfo');
        if (savedUserInfo) {
          try {
            const parsed = JSON.parse(savedUserInfo);
            // 如果 localStorage 有完整的用户信息，优先使用
            if (parsed && parsed.role) {
              console.log('[main.js] 从 localStorage 恢复用户信息:', parsed);
              userInfo = { ...userInfo, ...parsed };
            }
          } catch (e) {
            console.warn('解析 userInfo 失败:', e);
          }
        }

        // 如果还是没有 role，才使用默认值（正常情况不应该发生）
        if (userInfo && !userInfo.role) {
          console.warn('[main.js] 用户信息缺少 role，使用默认值"买家"');
          userInfo.role = '买家';
        }

        if (userInfo) {
          console.log('[main.js] 最终用户信息:', userInfo);
          // 导入 store 并初始化用户信息和路由
          const { default: useStore } = await import('./store/index.js');
          const indexStore = useStore();

          console.log('[main.js] 应用初始化：恢复用户信息和动态路由');
          indexStore.setIsLogin(true);
          indexStore.setUserInfo(userInfo);

          // 等待路由注册完成
          await new Promise((resolve) => setTimeout(resolve, 200));
          console.log('[main.js] 动态路由恢复完成');
        }
      }
    } catch (error) {
      console.error('[main.js] 初始化动态路由失败:', error);
    }
  }

  // 挂载路由和应用
  app.use(router);
  app.use(ElementPlus);
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }
  app.mount('#app');
}

// 启动应用
initializeApp();
