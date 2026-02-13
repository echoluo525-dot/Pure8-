import { writable, derived, get } from 'svelte/store';
import type { TimeRecord, TimeSlot, RecordType } from '../lib/types';
import { recordStore as dbRecordStore } from '../lib/db';
import { activeGoal } from './goalStore';
import { userStore } from './userStore';

// ============================================
// Record Store
// ============================================

interface RecordState {
  records: TimeRecord[];
  todayRecords: TimeRecord[];
  todayTotal: number;
  loading: boolean;
  error: string | null;
}

const createRecordStore = () => {
  const { subscribe, set, update } = writable<RecordState>({
    records: [],
    todayRecords: [],
    todayTotal: 0,
    loading: false,
    error: null
  });

  return {
    subscribe,

    // 加载记录
    async load(goalId: string) {
      update(s => ({ ...s, loading: true, error: null }));

      try {
        const [records, todayRecords, todayTotal] = await Promise.all([
          dbRecordStore.getByGoal(goalId),
          dbRecordStore.getToday(goalId),
          dbRecordStore.getTodayTotal(goalId)
        ]);

        set({ records, todayRecords, todayTotal, loading: false, error: null });
      } catch (e) {
        set({ records: [], todayRecords: [], todayTotal: 0, loading: false, error: (e as Error).message });
      }
    },

    // 添加记录
    async add(data: {
      hours: number;
      minutes: number;
      timeSlot: TimeSlot;
      energyLevel?: number;
      notes?: string;
    }) {
      const goal = get(activeGoal);
      if (!goal) return;

      const record: Omit<TimeRecord, 'id' | 'createdAt' | 'updatedAt' | 'totalMinutes'> = {
        goalId: goal.id,
        userId: goal.userId,
        date: Date.now(),
        hours: data.hours,
        minutes: data.minutes,
        timeSlot: data.timeSlot,
        energyLevel: data.energyLevel,
        type: 'manual',
        constitutionKept: false,
        notes: data.notes
      };

      await dbRecordStore.create(record);

      // 检查宪法达成
      const newTotal = get(this).todayTotal + data.hours + data.minutes / 60;
      const target = get(userStore).config?.customPureTarget || 6;

      if (newTotal >= target) {
        await userStore.updateConstitutionStreak(true);
        record.constitutionKept = true;
      }

      // 重新加载
      await this.load(goal.id);
    },

    // 删除记录
    async remove(recordId: string) {
      await dbRecordStore.delete(recordId);

      const goal = get(activeGoal);
      if (goal) {
        await this.load(goal.id);
      }
    },

    // 重置
    reset() {
      set({ records: [], todayRecords: [], todayTotal: 0, loading: false, error: null });
    }
  };
};

export const recordStore = createRecordStore();

// ============================================
// Derived Stores
// ============================================

// 今日剩余需完成
export const todayRemaining = derived(
  [recordStore, userStore],
  ([$record, $user]) => {
    const target = $user.config?.customPureTarget || 6;
    const remaining = target - $record.todayTotal;
    return Math.max(0, Math.round(remaining * 10) / 10);
  }
);

// 今日宪法是否达成
export const constitutionKeptToday = derived(
  [recordStore, userStore],
  ([$record, $user]) => {
    const target = $user.config?.customPureTarget || 6;
    return $record.todayTotal >= target;
  }
);

// 今日进度百分比
export const todayProgress = derived(
  [recordStore, userStore],
  ([$record, $user]) => {
    const target = $user.config?.customPureTarget || 6;
    if (target === 0) return 0;
    return Math.min(100, Math.round(($record.todayTotal / target) * 100));
  }
);

// ============================================
// Timer Store (计时器状态)
// ============================================

interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  startTime: number | null;
  elapsedPaused: number; // 累计暂停时长（毫秒）
  lastPauseStart: number | null;
}

const createTimerStore = () => {
  const { subscribe, set, update } = writable<TimerState>({
    isRunning: false,
    isPaused: false,
    startTime: null,
    elapsedPaused: 0,
    lastPauseStart: null
  });

  let intervalId: number | null = null;

  return {
    subscribe,

    // 开始计时
    start() {
      const now = Date.now();
      update(s => ({
        ...s,
        isRunning: true,
        isPaused: false,
        startTime: now,
        elapsedPaused: 0,
        lastPauseStart: null
      }));
    },

    // 暂停
    pause() {
      update(s => ({
        ...s,
        isPaused: true,
        lastPauseStart: Date.now()
      }));
    },

    // 继续
    resume() {
      update(s => {
        if (s.lastPauseStart) {
          const now = Date.now();
          const pauseDuration = now - s.lastPauseStart;
          return {
            ...s,
            isPaused: false,
            elapsedPaused: s.elapsedPaused + pauseDuration,
            lastPauseStart: null
          };
        }
        return s;
      });
    },

    // 停止并返回时长（分钟）
    stop(): number {
      let finalElapsed = 0;
      update(s => {
        const now = Date.now();
        const totalElapsed = s.startTime ? now - s.startTime : 0;
        finalElapsed = totalElapsed - s.elapsedPaused;
        return {
          isRunning: false,
          isPaused: false,
          startTime: null,
          elapsedPaused: 0,
          lastPauseStart: null
        };
      });

      // 清除定时器
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      return Math.round(finalElapsed / 1000 / 60); // 返回分钟
    },

    // 获取当前纯时长（分钟）
    getElapsed(): number {
      const state = get(this);
      if (!state.isRunning) return 0;

      const now = Date.now();
      const totalElapsed = state.startTime ? now - state.startTime : 0;
      const currentElapsed = totalElapsed - state.elapsedPaused;

      if (state.isPaused && state.lastPauseStart) {
        return Math.round((currentElapsed - (now - state.lastPauseStart)) / 1000 / 60);
      }

      return Math.max(0, Math.round(currentElapsed / 1000 / 60));
    },

    // 格式化显示
    getFormatted(): string {
      const minutes = this.getElapsed();
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
  };
};

export const timerStore = createTimerStore();
