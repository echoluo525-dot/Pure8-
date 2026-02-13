// ============================================
// 枚举定义
// ============================================

/**
 * 用户模式
 */
export enum UserMode {
  FULLTIME = 'fulltime',    // 全职学习
  CAREER = 'career',        // 职场进修
  HABIT = 'habit',          // 习惯养成
  CUSTOM = 'custom'         // 自定义
}

/**
 * 引导阶段
 */
export enum OnboardingStage {
  NEW = 'new',              // 新用户
  EXPLORING = 'exploring',  // 探索期中
  CONFIRMED = 'confirmed',  // 已确认目标
  COMMITTED = 'committed'   // 已承诺宪法
}

/**
 * 时间段
 */
export enum TimeSlot {
  MORNING = 'morning',      // 早晨 (精力截流核心)
  AFTERNOON = 'afternoon',  // 下午
  EVENING = 'evening',      // 晚上
  NIGHT = 'night',          // 深夜
  WEEKEND = 'weekend'       // 周末
}

/**
 * 记录类型
 */
export enum RecordType {
  MANUAL = 'manual',        // 手动输入
  TIMER = 'timer',          // 计时器
  POMODORO = 'pomodoro'     // 番茄钟
}

/**
 * 金句分类
 */
export enum QuoteCategory {
  PERSISTENCE = 'persistence',  // 坚持
  GROWTH = 'growth',           // 成长
  LEARNING = 'learning',       // 学习
  TRUTH = 'truth',             // 真相/诚实
  ENERGY = 'energy',           // 精力管理
  BOUNDARY = 'boundary',       // 边界/说不
  MILESTONE = 'milestone'      // 里程碑
}

/**
 * 里程碑类型
 */
export type MilestoneType = 100 | 500 | 1000 | 5000 | 10000;

// ============================================
// 类型定义
// ============================================

/**
 * 探索期记录
 */
export interface ExplorationDay {
  day: number;              // 第几天 (1-14)
  hours: number;            // 纯时间（小时）
  date: number;             // 时间戳
  notes?: string;           // 可选备注
}

/**
 * 用户配置
 */
export interface UserConfig {
  // 基础信息
  userId: string;
  createdAt: number;
  updatedAt: number;

  // 引导状态
  onboardingStage: OnboardingStage;
  explorationDays: number;              // 当前探索期第几天
  explorationData: ExplorationDay[];    // 探索期数据

  // 宪法设定
  customPureTarget: number;             // 用户确定的纯X
  constitutionActive: boolean;          // 是否激活宪法模式
  constitutionStreak: number;           // 当前连续遵守天数
  constitutionBest: number;            // 历史最佳连续天数
  constitutionMisses: ConstitutionMiss[]; // 未达成记录

  // 用户偏好
  timeSlotPreference?: TimeSlot;       // 时间段偏好
  userMode: UserMode;                  // 用户模式

  // 统计
  totalGoals: number;                  // 总目标数
  totalRecords: number;                // 总记录数
  lastRecordDate?: number;             // 最后记录日期

  // 主题偏好
  theme: 'light' | 'dark' | 'auto';
}

/**
 * 宪法未达成记录
 */
export interface ConstitutionMiss {
  date: number;
  hours: number;                       // 实际完成小时数
  reason?: string;                     // 未达成原因（可选）
}

/**
 * 目标
 */
export interface Goal {
  // 基础信息
  id: string;
  userId: string;
  createdAt: number;
  updatedAt: number;

  // 目标详情
  name: string;                       // 目标名称
  icon: string;                       // 图标（emoji）
  description?: string;                // 描述
  color: string;                      // 主题色

  // 时间设定
  startDate: number;                  // 开始日期时间戳
  targetHours: number;                // 总目标小时数（如10000）
  dailyPureTarget: number;            // 每日纯X目标

  // 宪法模式
  constitutionMode: boolean;          // 是否启用宪法模式

  // 进度
  currentHours: number;               // 当前累计小时数
  currentMilestone: MilestoneType;     // 当前里程碑

  // 状态
  isActive: boolean;                  // 是否激活
  isArchived: boolean;                // 是否归档
  completedAt?: number;               // 完成日期时间戳
}

/**
 * 时间记录
 */
export interface TimeRecord {
  id: string;
  goalId: string;
  userId: string;

  // 时间数据
  date: number;                      // 日期时间戳
  hours: number;                      // 小时
  minutes: number;                    // 分钟（精确到分钟）
  totalMinutes: number;               // 总分钟数（方便计算）

  // 标签
  timeSlot: TimeSlot;                 // 时间段
  energyLevel?: number;               // 精力状态 1-5

  // 来源
  type: RecordType;                   // 记录类型

  // 宪法相关
  constitutionKept: boolean;           // 是否达成宪法
  notes?: string;                    // 备注

  // 元数据
  createdAt: number;
  updatedAt: number;
}

/**
 * 金句
 */
export interface Quote {
  id: string;
  content: string;                   // 金句内容
  author?: string;                    // 作者
  source?: string;                   // 来源

  category: QuoteCategory;
  tags: string[];

  // 统计
  displayCount: number;               // 展示次数

  // 用户相关
  isCustom?: boolean;                // 是否用户自定义
  userId?: string;                   // 创建者ID
  userFavorite?: boolean;            // 当前用户是否收藏

  createdAt: number;
}

/**
 * 统计数据
 */
export interface Statistics {
  goalId: string;
  userId: string;
  calculatedAt: number;

  // 时间统计
  totalHours: number;
  totalRecords: number;
  averageDaily: number;               // 近30天日均
  pureX: number;                     // 用户实际纯X

  // 时间段分布
  timeSlotDistribution: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
    weekend: number;
  };

  // 宪法统计
  constitutionKeptDays: number;
  constitutionTotalDays: number;
  constitutionRate: number;           // 达成率 0-1
  constitutionCurrentStreak: number;
  constitutionBestStreak: number;

  // 预测
  estimatedCompletionDate?: number;
  estimatedRemainingDays: number;
}

// ============================================
// 视图模型
// ============================================

/**
 * 目标卡片视图模型
 */
export interface GoalCardViewModel {
  goal: Goal;
  progress: number;                   // 百分比 0-100
  remainingHours: number;
  todayHours: number;
  todayConstitutionKept: boolean;
  currentStreak: number;
}

/**
 * 格子视图模型
 */
export interface GridViewModel {
  goalId: string;
  totalHours: number;
  currentPage: number;                // 当前第几个100小时
  totalPages: number;                 // 总页数
  grids: GridPage[];
}

/**
 * 单页格子（100格）
 */
export interface GridPage {
  startHour: number;                  // 起始小时
  endHour: number;                    // 结束小时
  cells: GridCell[];                 // 100个格子
  isCompleted: boolean;               // 是否已完成
  completedAt?: number;
}

/**
 * 单个格子
 */
export interface GridCell {
  index: number;                     // 0-99
  hour: number;                      // 对应小时数
  filled: boolean;                   // 是否填充
  filledAt?: number;                 // 填充时间戳
}

// ============================================
// 表单输入模型
// ============================================

/**
 * 创建目标输入
 */
export interface CreateGoalInput {
  name: string;
  icon: string;
  description?: string;
  targetHours: number;
  startDate?: number;
  dailyPureTarget?: number;
  color?: string;
}

/**
 * 记录时间输入
 */
export interface RecordTimeInput {
  hours: number;
  minutes: number;
  timeSlot: TimeSlot;
  energyLevel?: number;
  notes?: string;
}

// ============================================
// 常量
// ============================================

/**
 * 默认里程碑列表
 */
export const DEFAULT_MILESTONES: MilestoneType[] = [100, 500, 1000, 5000, 10000];

/**
 * 探索期天数
 */
export const EXPLORATION_DAYS = 14;

/**
 * 默认用户模式推荐纯X
 */
export const DEFAULT_PURE_TARGETS: Record<UserMode, number> = {
  [UserMode.FULLTIME]: 8,
  [UserMode.CAREER]: 4,
  [UserMode.HABIT]: 2,
  [UserMode.CUSTOM]: 6
};

/**
 * 时间段配置
 */
export const TIME_SLOT_CONFIG: Record<TimeSlot, { label: string; icon: string; color: string }> = {
  [TimeSlot.MORNING]: { label: '早晨', icon: '🌅', color: '#F59E0B' },
  [TimeSlot.AFTERNOON]: { label: '下午', icon: '☀️', color: '#FBBF24' },
  [TimeSlot.EVENING]: { label: '晚上', icon: '🌙', color: '#6366F1' },
  [TimeSlot.NIGHT]: { label: '深夜', icon: '🌃', color: '#4F46E5' },
  [TimeSlot.WEEKEND]: { label: '周末', icon: '📅', color: '#10B981' }
};

/**
 * 常用图标列表
 */
export const COMMON_ICONS = [
  '💻', '📚', '✍️', '🎨', '🎵', '🏃', '📖', '💡',
  '🎯', '🔥', '⭐', '🌟', '📝', '🚀', '💪', '🧠'
];
