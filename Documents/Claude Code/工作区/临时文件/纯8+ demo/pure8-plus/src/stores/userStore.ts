import { writable, derived, get } from 'svelte/store';
import type { UserConfig, OnboardingStage, UserMode, TimeSlot } from '../lib/types';
import { userConfigStore as dbUserConfig } from '../lib/db';
import { DEFAULT_PURE_TARGETS } from '../lib/types';

// ============================================
// User Store
// ============================================

interface UserState {
  config: UserConfig | null;
  loading: boolean;
  error: string | null;
}

const createUserStore = () => {
  const { subscribe, set, update } = writable<UserState>({
    config: null,
    loading: true,
    error: null
  });

  let userId = 'default';

  return {
    subscribe,

    // 初始化
    async init(id?: string) {
      update(s => ({ ...s, loading: true, error: null }));
      userId = id || 'default';

      try {
        const config = await dbUserConfig.getOrCreate(userId);
        set({ config, loading: false, error: null });
      } catch (e) {
        set({ config: null, loading: false, error: (e as Error).message });
      }
    },

    // 更新配置
    async updateConfig(updates: Partial<UserConfig>) {
      const state = get(this);
      if (!state.config) return;

      try {
        await dbUserConfig.update(userId, updates);
        update(s => ({
          ...s,
          config: { ...s.config!, ...updates }
        }));
      } catch (e) {
        update(s => ({ ...s, error: (e as Error).message }));
      }
    },

    // 设置引导阶段
    async setOnboardingStage(stage: OnboardingStage) {
      await this.updateConfig({ onboardingStage: stage });
    },

    // 添加探索期数据
    async addExplorationDay(hours: number, notes?: string) {
      const state = get(this);
      if (!state.config) return;

      const day = state.config.explorationDays + 1;
      await dbUserConfig.addExplorationDay(userId, day, hours, notes);

      await this.init(userId); // 重新加载
    },

    // 完成探索期
    async completeExploration() {
      const average = await dbUserConfig.calculateExplorationAverage(userId);
      await this.updateConfig({
        onboardingStage: 'confirmed',
        customPureTarget: Math.round(average * 10) / 10
      });
    },

    // 设置纯X目标
    async setPureTarget(target: number) {
      await this.updateConfig({ customPureTarget: target });
    },

    // 激活宪法模式
    async activateConstitution() {
      await this.updateConfig({ constitutionActive: true, onboardingStage: 'committed' });
    },

    // 更新宪法连续天数
    async updateConstitutionStreak(kept: boolean) {
      await dbUserConfig.updateConstitutionStreak(userId, kept);
      await this.init(userId);
    },

    // 设置用户模式
    async setUserMode(mode: UserMode) {
      const defaultTarget = DEFAULT_PURE_TARGETS[mode];
      await this.updateConfig({
        userMode: mode,
        customPureTarget: defaultTarget
      });
    },

    // 设置时间段偏好
    async setTimeSlotPreference(slot: TimeSlot) {
      await this.updateConfig({ timeSlotPreference: slot });
    }
  };
};

export const userStore = createUserStore();

// ============================================
// Derived Stores
// ============================================

// 当前引导阶段
export const onboardingStage = derived(userStore, ($user) => $user.config?.onboardingStage);

// 是否在探索期
export const isExploring = derived(onboardingStage, ($stage) => $stage === 'exploring');

// 是否已确认目标
export const isConfirmed = derived(onboardingStage, ($stage) =>
  $stage === 'confirmed' || $stage === 'committed'
);

// 是否已承诺宪法
export const isCommitted = derived(onboardingStage, ($stage) => $stage === 'committed');

// 用户纯X目标
export const pureTarget = derived(userStore, ($user) => $user.config?.customPureTarget ?? 6);

// 探索期数据
export const explorationData = derived(userStore, ($user) => $user.config?.explorationData ?? []);

// 探索期平均
export const explorationAverage = derived(explorationData, ($data) => {
  if ($data.length === 0) return 0;
  const total = $data.reduce((sum, day) => sum + day.hours, 0);
  return Math.round((total / $data.length) * 10) / 10;
});

// 宪法连续天数
export const constitutionStreak = derived(userStore, ($user) => $user.config?.constitutionStreak ?? 0);

// 宪法最佳记录
export const constitutionBest = derived(userStore, ($user) => $user.config?.constitutionBest ?? 0);
