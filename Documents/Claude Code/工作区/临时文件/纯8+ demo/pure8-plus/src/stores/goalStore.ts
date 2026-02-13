import { writable, derived, get } from 'svelte/store';
import type { Goal, CreateGoalInput, GridPage, GridCell } from '../lib/types';
import { goalStore as dbGoalStore, recordStore as dbRecordStore } from '../lib/db';
import { userStore } from './userStore';

// ============================================
// Goal Store
// ============================================

interface GoalState {
  goals: Goal[];
  activeGoal: Goal | null;
  loading: boolean;
  error: string | null;
}

const createGoalStore = () => {
  const { subscribe, set, update } = writable<GoalState>({
    goals: [],
    activeGoal: null,
    loading: true,
    error: null
  });

  return {
    subscribe,

    // 加载所有目标
    async load() {
      update(s => ({ ...s, loading: true, error: null }));

      try {
        const userId = get(userStore).config?.userId || 'default';
        const goals = await dbGoalStore.getAll(userId);
        const activeGoals = await dbGoalStore.getActive(userId);

        set({
          goals,
          activeGoal: activeGoals[0] || null,
          loading: false,
          error: null
        });
      } catch (e) {
        set({
          goals: [],
          activeGoal: null,
          loading: false,
          error: (e as Error).message
        });
      }
    },

    // 创建目标
    async create(input: CreateGoalInput) {
      const userId = get(userStore).config?.userId || 'default';
      const userMode = get(userStore).config?.userMode || 'custom';

      const goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'> = {
        userId,
        name: input.name,
        icon: input.icon,
        description: input.description,
        color: input.color || '#3B82F6',
        startDate: input.startDate || Date.now(),
        targetHours: input.targetHours,
        dailyPureTarget: input.dailyPureTarget || get(userStore).config?.customPureTarget || 6,
        constitutionMode: true,
        currentHours: 0,
        currentMilestone: 100,
        isActive: true,
        isArchived: false
      };

      const id = await dbGoalStore.create(goal);
      await this.load(); // 重新加载

      // 如果是第一个目标，自动设为活跃
      if (get(this).goals.length === 1) {
        await this.setActive(id);
      }

      return id;
    },

    // 更新目标
    async update(goalId: string, updates: Partial<Goal>) {
      await dbGoalStore.update(goalId, updates);
      await this.load();
    },

    // 设置活跃目标
    async setActive(goalId: string) {
      // 先取消所有目标的活跃状态
      const state = get(this);
      for (const goal of state.goals) {
        if (goal.isActive) {
          await dbGoalStore.update(goal.id, { isActive: false });
        }
      }

      await dbGoalStore.update(goalId, { isActive: true });
      await this.load();
    },

    // 归档目标
    async archive(goalId: string) {
      await dbGoalStore.archive(goalId);
      await this.load();
    }
  };
};

export const goalStore = createGoalStore();

// ============================================
// Derived Stores
// ============================================

// 当前活跃目标
export const activeGoal = derived(goalStore, ($goal) => $goal.activeGoal);

// 所有目标
export const goals = derived(goalStore, ($goal) => $goal.goals);

// 当前目标进度百分比
export const activeGoalProgress = derived(activeGoal, ($goal) => {
  if (!$goal) return 0;
  return Math.round(($goal.currentHours / $goal.targetHours) * 100);
});

// 当前目标剩余小时数
export const activeGoalRemaining = derived(activeGoal, ($goal) => {
  if (!$goal) return 0;
  return Math.round(($goal.targetHours - $goal.currentHours) * 10) / 10;
});

// ============================================
// 格子系统
// ============================================

interface GridState {
  currentPage: number;
  pages: GridPage[];
}

const createGridStore = () => {
  const { subscribe, set, update } = writable<GridState>({
    currentPage: 0,
    pages: []
  });

  return {
    subscribe,

    // 加载格子数据
    async load(goalId: string) {
      const records = await dbRecordStore.getByGoal(goalId);
      const totalHours = Math.floor(records.reduce((sum, r) => sum + r.hours + r.minutes / 60, 0));

      // 每100小时一页
      const pageCount = Math.ceil(totalHours / 100) + 1;
      const pages: GridPage[] = [];

      for (let i = 0; i < pageCount; i++) {
        const startHour = i * 100;
        const endHour = Math.min((i + 1) * 100, totalHours);

        // 获取这个100小时范围内的记录
        const pageRecords = records.filter(r => {
          const h = r.hours + r.minutes / 60;
          return h >= startHour && h < endHour;
        });

        // 生成100个格子
        const cells: GridCell[] = [];
        for (let j = 0; j < 100; j++) {
          const hour = startHour + j + 1;
          const filled = hour <= totalHours;
          cells.push({
            index: j,
            hour,
            filled,
            filledAt: filled ? records.find(r => {
              const h = r.hours + r.minutes / 60;
              return Math.abs(h - hour) < 0.5;
            })?.createdAt : undefined
          });
        }

        pages.push({
          startHour,
          endHour,
          cells,
          isCompleted: i < pageCount - 1,
          completedAt: i < pageCount - 1 ? records.find(r => {
            const h = r.hours + r.minutes / 60;
            return Math.abs(h - endHour) < 0.5;
          })?.createdAt : undefined
        });
      }

      set({
        currentPage: pageCount - 1, // 默认显示最新页
        pages
      });
    },

    // 切换页面
    setPage(pageIndex: number) {
      update(s => {
        const validPage = Math.max(0, Math.min(pageIndex, s.pages.length - 1));
        return { ...s, currentPage: validPage };
      });
    },

    // 填充格子
    fillCell(cellIndex: number) {
      update(s => {
        const newPages = [...s.pages];
        const pageIndex = Math.floor(cellIndex / 100);
        const localIndex = cellIndex % 100;

        if (newPages[pageIndex] && newPages[pageIndex].cells[localIndex]) {
          newPages[pageIndex].cells[localIndex].filled = true;
          newPages[pageIndex].cells[localIndex].filledAt = Date.now();
        }

        return { ...s, pages: newPages };
      });
    },

    // 重置
    reset() {
      set({ currentPage: 0, pages: [] });
    }
  };
};

export const gridStore = createGridStore();

// 当前页格子
export const currentPageGrid = derived(gridStore, ($grid) => $grid.pages[$grid.currentPage] || null);

// 总页数
export const totalPages = derived(gridStore, ($grid) => $grid.pages.length);
