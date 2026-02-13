// 导出所有 stores
export { userStore, onboardingStage, isExploring, isConfirmed, isCommitted, pureTarget, explorationData, explorationAverage, constitutionStreak, constitutionBest } from './userStore';
export { goalStore, activeGoal, goals, activeGoalProgress, activeGoalRemaining, gridStore, currentPageGrid, totalPages } from './goalStore';
export { recordStore, todayRemaining, constitutionKeptToday, todayProgress, timerStore } from './recordStore';
export { quoteStore, dailyQuote, allQuotes, favoriteQuotes } from './quoteStore';

// 导出类型
export { UserMode, TimeSlot, RecordType } from '../lib/types';
