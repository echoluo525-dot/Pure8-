/**
 * Pure8+ - State Management
 */

const STORAGE_KEY = 'pure8plus_data';

const DEFAULT_QUOTES = [
  { content: 'Pure 6 is pure 6, not a single minute of water.', author: 'Bai Shishi', source: 'Knowledge Planet' },
  { content: 'Without special reason, never break faith with yourself.', author: 'Bai Shishi', source: 'Knowledge Planet' },
  { content: 'Waking up a few hours earlier gives you more time to learn.', author: 'Bai Shishi', source: 'Knowledge Planet' },
  { content: 'At 1000 hours, I believe I can reach 2000... 10000 hours is uncertain but possible.', author: 'Bai Shishi', source: 'Knowledge Planet' },
  { content: 'It is a different world. Only those who experience it understand.', author: 'Bai Shishi', source: 'Knowledge Planet' },
  { content: '3.5 is what belongs to you. Respect the factual data.', author: 'Bai Shishi', source: 'Knowledge Planet' },
  { content: 'I am maintaining my constitution. Low motivation must also complete.', author: 'Bai Shishi', source: 'Knowledge Planet' },
  { content: 'Pure 8 is more useful than Pure 6.', author: 'Bai Shishi', source: 'Knowledge Planet' },
  { content: 'Millions recommend, few practice.', author: 'Bai Shishi', source: 'Knowledge Planet' },
  { content: 'Stopping does not mean not working, but adjusting and recovering.', author: 'Bai Shishi', source: 'Knowledge Planet' }
];

const MILESTONES = [100, 500, 1000, 5000, 10000];

class Store {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load data:', e);
    }
    return this.getDefaultData();
  }

  getDefaultData() {
    return {
      onboardingComplete: false,
      currentGoal: null,
      records: [],
      quotes: DEFAULT_QUOTES,
      createdAt: Date.now()
    };
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  getTodayQuote() {
    const today = new Date().toDateString();
    const index = this.hashCode(today) % this.data.quotes.length;
    return this.data.quotes[Math.abs(index)];
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return hash;
  }

  completeOnboarding(goalData) {
    this.data.onboardingComplete = true;
    this.data.currentGoal = {
      id: 'goal_' + Date.now(),
      name: goalData.name,
      targetHours: goalData.targetHours,
      dailyTarget: goalData.dailyTarget || 8,
      currentHours: 0,
      createdAt: Date.now(),
      lastUpdated: Date.now()
    };
    this.save();
    return this.data.currentGoal;
  }

  addRecord(hours, minutes, note) {
    if (!this.data.currentGoal) return null;

    const record = {
      id: 'rec_' + Date.now(),
      goalId: this.data.currentGoal.id,
      hours: hours,
      minutes: minutes,
      totalMinutes: hours * 60 + minutes,
      note: note,
      date: Date.now()
    };

    this.data.records.push(record);
    this.data.currentGoal.currentHours += (hours + minutes / 60);
    this.data.currentGoal.lastUpdated = Date.now();
    this.save();
    return record;
  }

  getTodayRecords() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    return this.data.records.filter(r => r.date >= todayStart);
  }

  getTodayTotal() {
    const todayRecords = this.getTodayRecords();
    return todayRecords.reduce((sum, r) => sum + r.totalMinutes, 0) / 60;
  }

  getGridData(pageIndex) {
    if (!this.data.currentGoal) return null;

    const startHour = (pageIndex || 0) * 100;
    const totalHours = Math.floor(this.data.currentGoal.currentHours);

    const cells = [];
    for (let i = 0; i < 100; i++) {
      const absoluteHour = startHour + i;
      const gridNumber = absoluteHour + 1;
      const filled = absoluteHour < totalHours;

      cells.push({
        index: i,
        absoluteHour: absoluteHour,
        gridNumber: gridNumber,
        filled: filled
      });
    }

    const filledInPage = cells.filter(c => c.filled).length;
    const totalPages = Math.ceil(this.data.currentGoal.targetHours / 100);
    const endHour = startHour + 99;
    const isCompleted = filledInPage === 100;

    return {
      pageIndex: pageIndex || 0,
      startHour: startHour,
      endHour: endHour,
      cells: cells,
      filledCount: filledInPage,
      isCompleted: isCompleted,
      totalPages: totalPages
    };
  }

  getCurrentGridPage() {
    if (!this.data.currentGoal) return 0;
    return Math.floor(this.data.currentGoal.currentHours / 100);
  }

  getTotalPages() {
    if (!this.data.currentGoal) return 1;
    return Math.ceil(this.data.currentGoal.targetHours / 100);
  }

  getProgressInfo() {
    if (!this.data.currentGoal) return null;

    const goal = this.data.currentGoal;
    const percentage = Math.min(100, (goal.currentHours / goal.targetHours) * 100);

    let currentMilestone = MILESTONES[0];
    for (const m of MILESTONES) {
      if (goal.currentHours >= m) {
        currentMilestone = m;
      }
    }

    let nextMilestone = null;
    for (const m of MILESTONES) {
      if (goal.currentHours < m) {
        nextMilestone = m;
        break;
      }
    }

    let milestoneProgress = 0;
    if (nextMilestone && currentMilestone) {
      milestoneProgress = ((goal.currentHours - currentMilestone) / (nextMilestone - currentMilestone)) * 100;
    }

    return {
      currentHours: goal.currentHours,
      targetHours: goal.targetHours,
      percentage: percentage,
      currentMilestone: currentMilestone,
      nextMilestone: nextMilestone,
      milestoneProgress: milestoneProgress
    };
  }

  getLastAddedGridCount() {
    const recentRecords = this.data.records.slice(-5);
    let lastRecordHours = 0;
    if (recentRecords.length > 0) {
      const lastRecord = recentRecords[recentRecords.length - 1];
      lastRecordHours = lastRecord.hours;
    }
    return lastRecordHours;
  }
}

const store = new Store();
