/**
 * Pure8+ - 数据库操作层
 * 提供统一的数据访问接口
 */

// 数据库操作接口
const db = {
  // 初始化
  init() {
    // 数据已在 stores.js 中初始化
    return Promise.resolve();
  },

  // 目标相关
  goal: {
    getCurrent() {
      return store.data.currentGoal;
    },

    create(name, targetHours, dailyTarget = 8) {
      return store.completeOnboarding({ name, targetHours, dailyTarget });
    },

    getCurrentHours() {
      return store.data.currentGoal?.currentHours || 0;
    }
  },

  // 记录相关
  record: {
    add(hours, minutes, note) {
      return store.addRecord(hours, minutes, note);
    },

    getTodayRecords() {
      return store.getTodayRecords();
    },

    getTodayTotal() {
      return store.getTodayTotal();
    },

    getAll() {
      return store.data.records || [];
    }
  },

  // 进度相关
  progress: {
    getInfo() {
      return store.getProgressInfo();
    },

    getGridData(pageIndex) {
      return store.getGridData(pageIndex);
    },

    getCurrentGridPage() {
      return store.getCurrentGridPage();
    },

    getTotalPages() {
      return store.getTotalPages();
    }
  },

  // 金句相关
  quote: {
    getToday() {
      return store.getTodayQuote();
    },

    getAll() {
      return store.data.quotes || [];
    }
  },

  // 用户配置
  config: {
    isOnboardingComplete() {
      return store.data.onboardingComplete;
    },

    reset() {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  }
};
