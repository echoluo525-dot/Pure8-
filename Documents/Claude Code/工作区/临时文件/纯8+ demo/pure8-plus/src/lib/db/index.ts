import Dexie, { type Table } from 'dexie';
import type {
  UserConfig,
  Goal,
  TimeRecord,
  Quote,
  ConstitutionMiss,
  ExplorationDay
} from '../types';

/**
 * 纯8+ 数据库
 * 使用 IndexedDB + Dexie.js
 */
export class Pure8Database extends Dexie {
  // 表定义
  userConfig!: Table<UserConfig, string>;
  goals!: Table<Goal, string>;
  records!: Table<TimeRecord, string>;
  quotes!: Table<Quote, string>;

  constructor() {
    super('Pure8PlusDB');

    // 定义数据库版本和表结构
    this.version(1).stores({
      userConfig: 'userId, onboardingStage, updatedAt',
      goals: 'id, userId, isActive, isArchived, createdAt, updatedAt',
      records: 'id, goalId, userId, date, createdAt',
      quotes: 'id, category, isCustom, userId, createdAt'
    });
  }
}

// 创建数据库实例
export const db = new Pure8Database();

// ============================================
// 数据库操作助手
// ============================================

/**
 * 用户配置操作
 */
export const userConfigStore = {
  // 获取或创建用户配置
  async getOrCreate(userId: string = 'default'): Promise<UserConfig> {
    const config = await db.userConfig.get(userId);
    if (config) {
      return config;
    }

    // 创建默认配置
    const newConfig: UserConfig = {
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      onboardingStage: 'new',
      explorationDays: 0,
      explorationData: [],
      customPureTarget: 6,
      constitutionActive: false,
      constitutionStreak: 0,
      constitutionBest: 0,
      constitutionMisses: [],
      userMode: 'custom',
      totalGoals: 0,
      totalRecords: 0,
      theme: 'auto'
    };

    await db.userConfig.add(newConfig);
    return newConfig;
  },

  // 更新用户配置
  async update(userId: string, updates: Partial<UserConfig>): Promise<void> {
    await db.userConfig.update(userId, {
      ...updates,
      updatedAt: Date.now()
    });
  },

  // 添加探索期数据
  async addExplorationDay(userId: string, day: number, hours: number, notes?: string): Promise<void> {
    const config = await this.getOrCreate(userId);
    const explorationDay: ExplorationDay = {
      day,
      hours,
      date: Date.now(),
      notes
    };

    const explorationData = [...config.explorationData, explorationDay];
    await this.update(userId, {
      explorationDays: config.explorationDays + 1,
      explorationData
    });
  },

  // 计算探索期平均纯时间
  async calculateExplorationAverage(userId: string): Promise<number> {
    const config = await this.getOrCreate(userId);
    if (config.explorationData.length === 0) return 0;

    const total = config.explorationData.reduce((sum, day) => sum + day.hours, 0);
    return Math.round((total / config.explorationData.length) * 10) / 10;
  },

  // 更新宪法连续天数
  async updateConstitutionStreak(userId: string, kept: boolean): Promise<void> {
    const config = await this.getOrCreate(userId);

    if (kept) {
      await this.update(userId, {
        constitutionStreak: config.constitutionStreak + 1,
        constitutionBest: Math.max(config.constitutionBest, config.constitutionStreak + 1)
      });
    } else {
      const miss: ConstitutionMiss = {
        date: Date.now(),
        hours: 0
      };
      await this.update(userId, {
        constitutionStreak: 0,
        constitutionMisses: [...config.constitutionMisses, miss]
      });
    }
  }
};

/**
 * 目标操作
 */
export const goalStore = {
  // 获取所有目标
  async getAll(userId: string): Promise<Goal[]> {
    return await db.goals
      .where('userId')
      .equals(userId)
      .and(goal => !goal.isArchived)
      .reverse()
      .sortBy('createdAt');
  },

  // 获取活跃目标
  async getActive(userId: string): Promise<Goal[]> {
    return await db.goals
      .where('userId')
      .equals(userId)
      .and(goal => goal.isActive && !goal.isArchived)
      .reverse()
      .sortBy('createdAt');
  },

  // 获取单个目标
  async get(goalId: string): Promise<Goal | undefined> {
    return await db.goals.get(goalId);
  },

  // 创建目标
  async create(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newGoal: Goal = {
      ...goal,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await db.goals.add(newGoal);
    return id;
  },

  // 更新目标
  async update(goalId: string, updates: Partial<Goal>): Promise<void> {
    await db.goals.update(goalId, {
      ...updates,
      updatedAt: Date.now()
    });
  },

  // 删除目标（软删除）
  async archive(goalId: string): Promise<void> {
    await this.update(goalId, { isArchived: true, isActive: false });
  },

  // 更目标进度
  async updateProgress(goalId: string, hoursToAdd: number): Promise<void> {
    const goal = await this.get(goalId);
    if (!goal) return;

    const newHours = goal.currentHours + hoursToAdd;

    // 检查里程碑
    const milestones: Array<number> = [100, 500, 1000, 5000, 10000];
    const currentMilestone = milestones.reduce((prev, curr) =>
      newHours >= curr ? curr : prev
    , 100);

    await this.update(goalId, {
      currentHours: newHours,
      currentMilestone: currentMilestone as any
    });
  }
};

/**
 * 记录操作
 */
export const recordStore = {
  // 获取目标的所有记录
  async getByGoal(goalId: string): Promise<TimeRecord[]> {
    return await db.records
      .where('goalId')
      .equals(goalId)
      .reverse()
      .sortBy('date');
  },

  // 获取今日记录
  async getToday(goalId: string): Promise<TimeRecord[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = tomorrow.getTime();

    return await db.records
      .where('goalId')
      .equals(goalId)
      .and(record => record.date >= todayStart && record.date < tomorrowStart)
      .reverse()
      .sortBy('date');
  },

  // 获取今日总时长
  async getTodayTotal(goalId: string): Promise<number> {
    const records = await this.getToday(goalId);
    return records.reduce((sum, r) => sum + r.hours + r.minutes / 60, 0);
  },

  // 创建记录
  async create(record: Omit<TimeRecord, 'id' | 'createdAt' | 'updatedAt' | 'totalMinutes'>): Promise<string> {
    const id = `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    const totalMinutes = record.hours * 60 + record.minutes;

    const newRecord: TimeRecord = {
      ...record,
      id,
      totalMinutes,
      createdAt: now,
      updatedAt: now
    };

    await db.records.add(newRecord);

    // 更新目标进度
    await goalStore.updateProgress(record.goalId, record.hours + record.minutes / 60);

    return id;
  },

  // 删除记录
  async delete(recordId: string): Promise<void> {
    const record = await db.records.get(recordId);
    if (record) {
      await db.records.delete(recordId);
      // 反向更新目标进度
      await goalStore.updateProgress(record.goalId, -(record.hours + record.minutes / 60));
    }
  }
};

/**
 * 金句操作
 */
export const quoteStore = {
  // 获取今日金句
  async getDaily(): Promise<Quote> {
    const today = new Date().toDateString();
    const quotes = await this.getAll();
    const index = this.hashString(today) % quotes.length;
    return quotes[index] || quotes[0];
  },

  // 简单哈希函数
  hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  },

  // 获取所有金句
  async getAll(): Promise<Quote[]> {
    return await db.quotes.toArray();
  },

  // 按分类获取
  async getByCategory(category: string): Promise<Quote[]> {
    return await db.quotes
      .where('category')
      .equals(category)
      .toArray();
  },

  // 添加自定义金句
  async addCustom(quote: Omit<Quote, 'id' | 'createdAt' | 'displayCount'>): Promise<string> {
    const id = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newQuote: Quote = {
      ...quote,
      id,
      createdAt: Date.now(),
      displayCount: 0
    };

    await db.quotes.add(newQuote);
    return id;
  },

  // 初始化默认金句
  async initializeDefaults(): Promise<void> {
    const count = await db.quotes.count();
    if (count > 0) return; // 已初始化

    const defaultQuotes: Omit<Quote, 'id' | 'createdAt' | 'displayCount'>[] = [
      {
        content: '纯6就是纯6，没有一分钟的水分。',
        author: '白诗诗',
        source: '知识星球',
        category: 'truth' as const,
        tags: ['纯时间', '诚实']
      },
      {
        content: '没有特殊的原因，千万不能对自己失信，因为失信这种事情，有了第一次就会有第二次。',
        author: '白诗诗',
        source: '知识星球',
        category: 'persistence' as const,
        tags: ['宪法', '坚持']
      },
      {
        content: '你能比平时早起几个小时，你就能多利用几个小时，是这个早起的时间允许你在一个拥有精力的情况下让自己去学点什么。',
        author: '白诗诗',
        source: '知识星球',
        category: 'energy' as const,
        tags: ['精力截流', '早起']
      },
      {
        content: '做到1000小时，我认为接下来我还可以达到2000小时……10000小时不敢去保证，但我觉得，当我做到累计纯时间达到1000小时的时候，我觉得我还是有机会去奢望的。',
        author: '白诗诗',
        source: '知识星球',
        category: 'milestone' as const,
        tags: ['里程碑', '1000小时']
      },
      {
        content: '原来它是不一样的世界，只有体会了才知道。连续遵守能形成生态，产生动力，甚至变成享受。',
        author: '白诗诗',
        source: '知识星球',
        category: 'growth' as const,
        tags: ['享受', '生态']
      },
      {
        content: '3.5才是属于你的，也是你长期可以守护得住的。尊重事实数据。',
        author: '白诗诗',
        source: '知识星球',
        category: 'truth' as const,
        tags: ['尊重事实', '纯X']
      },
      {
        content: '我在维护自身的"宪法"，我不能对自己失信。低意愿也要完成，这是对宪法保持敬畏。',
        author: '白诗诗',
        source: '知识星球',
        category: 'persistence' as const,
        tags: ['宪法', '低意愿']
      },
      {
        content: '纯8比纯6有用的多。纯6有闲暇容易沉浸其他事，纯8让你只能沉浸于一件事——就是纯8本身。',
        author: '白诗诗',
        source: '知识星球',
        category: 'learning' as const,
        tags: ['纯8', '专注']
      },
      {
        content: '推荐者万万众，实践者几几人。',
        author: '白诗诗',
        source: '知识星球',
        category: 'persistence' as const,
        tags: ['实践', '坚持']
      },
      {
        content: '停下来不是表示不干活了，而仅仅是代表着我有了比学习更为重要的事情，那就是——调整自己的状态、恢复自己的状态。',
        author: '白诗诗',
        source: '知识星球',
        category: 'energy' as const,
        tags: ['休息', '状态']
      }
    ];

    await db.quotes.bulkAdd(
      defaultQuotes.map(q => ({
        ...q,
        id: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
        displayCount: 0
      }))
    );
  }
};

// 初始化数据库
export async function initializeDatabase(): Promise<void> {
  await db.open();
  await quoteStore.initializeDefaults();
}
