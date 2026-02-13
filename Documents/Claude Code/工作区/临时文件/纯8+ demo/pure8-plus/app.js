/**
 * Pure8+ - Main App Logic
 */

const app = {
  currentPage: 'onboarding',
  currentGridPage: 0,

  init() {
    if (db.config.isOnboardingComplete()) {
      this.currentPage = 'dashboard';
      this.currentGridPage = db.progress.getCurrentGridPage();
    }
    this.render();
    this.bindEvents();
  },

  render() {
    const appEl = document.getElementById('app');
    switch (this.currentPage) {
      case 'onboarding':
        appEl.innerHTML = this.renderOnboarding();
        break;
      case 'dashboard':
        appEl.innerHTML = this.renderDashboard();
        this.bindDashboardEvents();
        this.animateGridFill();
        break;
    }
  },

  renderOnboarding() {
    return `<div class="page active">
        <div class="card onboarding-card">
          <div class="onboarding-header">
            <h1 class="onboarding-title">Welcome to Pure8+</h1>
            <p class="onboarding-subtitle">Track your 10,000 hours</p>
          </div>
          <div class="onboarding-section">
            <label class="input-label">Your Goal</label>
            <input type="text" id="goal-name" placeholder="Learning..." value="Learning">
            <label class="input-label">Target Hours</label>
            <select id="target-hours">
              <option value="1000">1000 hours</option>
              <option value="5000">5000 hours</option>
              <option value="10000" selected>10000 hours</option>
            </select>
            <label class="input-label">Daily Target</label>
            <select id="daily-target">
              <option value="4">4 hours</option>
              <option value="6">6 hours</option>
              <option value="8" selected>8 hours</option>
              <option value="10">10 hours</option>
            </select>
          </div>
          <div class="onboarding-info">
            <p class="info-text">Pure time = focused work/study time only</p>
            <p class="info-text">1 grid = 1 hour, 100 grids = 100 hours</p>
          </div>
          <button class="btn-primary start-btn" id="start-btn">Start Tracking</button>
        </div>
        <div class="quote-card">
          <p class="quote-content">"${db.quote.getToday().content}"</p>
          <p class="quote-author">—— ${db.quote.getToday().author}</p>
        </div>
      </div>`;
  },

  bindEvents() {
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.handleStart());
    }
  },

  handleStart() {
    const name = document.getElementById('goal-name').value.trim();
    const targetHours = parseInt(document.getElementById('target-hours').value);
    const dailyTarget = parseInt(document.getElementById('daily-target').value);
    if (!name) {
      alert('Please enter a goal name');
      return;
    }
    db.goal.create(name, targetHours, dailyTarget);
    this.currentPage = 'dashboard';
    this.currentGridPage = db.progress.getCurrentGridPage();
    this.render();
    this.bindDashboardEvents();
  },

  renderDashboard() {
    const goal = db.goal.getCurrent();
    const progress = db.progress.getInfo();
    const quote = db.quote.getToday();
    const todayTotal = db.record.getTodayTotal();
    const gridData = db.progress.getGridData(this.currentGridPage);
    const totalPages = db.progress.getTotalPages();

    return `<div class="page active dashboard-page">
        <header class="dashboard-header">
          <div class="header-left">
            <h1 class="goal-title">${goal.name}</h1>
            <span class="target-badge">${goal.targetHours}h goal</span>
          </div>
          <button class="btn-ghost" id="settings-btn">Settings</button>
        </header>
        <div class="quote-card">
          <p class="quote-content">"${quote.content}"</p>
          <p class="quote-author">—— ${quote.author}</p>
        </div>
        <div class="card progress-card">
          <div class="progress-header">
            <div class="progress-info">
              <span class="progress-label">Total Progress</span>
              <span class="progress-value">${progress.currentHours.toFixed(1)} / ${progress.targetHours}h</span>
            </div>
            <span class="progress-percent">${progress.percentage.toFixed(1)}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress.percentage}%"></div>
          </div>
          ${progress.nextMilestone ? `
            <div class="milestone-info">
              <span class="milestone-label">Next milestone: ${progress.nextMilestone}h</span>
              <div class="milestone-progress">
                <div class="milestone-bar">
                  <div class="milestone-fill" style="width: ${progress.milestoneProgress}%"></div>
                </div>
              </div>
            </div>
          ` : `
            <div class="milestone-complete">Achieved ${progress.currentMilestone}h milestone!</div>
          `}
        </div>
        <div class="card today-card">
          <div class="today-header">
            <h3>Today</h3>
            <span class="today-total">${todayTotal.toFixed(1)}h</span>
          </div>
          <p class="today-daily-target">Daily target: ${goal.dailyTarget}h</p>
        </div>
        <div class="card grid-card">
          <div class="grid-header">
            <h3>Grid Progress</h3>
            ${totalPages > 1 ? `
              <div class="page-controls">
                <button class="page-btn ${this.currentGridPage === 0 ? 'disabled' : ''}" data-action="prev">←</button>
                <span class="page-label">${gridData.startHour + 1}-${gridData.endHour + 1}h</span>
                <button class="page-btn ${this.currentGridPage >= totalPages - 1 ? 'disabled' : ''}" data-action="next">→</button>
              </div>
            ` : `<span class="page-label">1-${goal.targetHours}h</span>`}
          </div>
          <div class="grid-container" id="grid-container">
            ${gridData.cells.map(cell => `
              <div class="grid-cell" data-index="${cell.index}" data-hour="${cell.absoluteHour}" data-filled="${cell.filled}" title="Hour ${cell.gridNumber}"></div>
            `).join('')}
          </div>
          <div class="grid-footer">
            <span class="grid-info" id="grid-info">Filled ${gridData.filledCount} / 100</span>
            ${gridData.isCompleted ? '<span class="grid-complete">Complete!</span>' : ''}
          </div>
        </div>
        <button class="btn-icon record-btn" id="record-btn">+</button>
        <div class="modal-overlay hidden" id="settings-modal">
          <div class="modal-content">
            <h3>Settings</h3>
            <div class="settings-actions">
              <button class="btn-secondary" id="export-btn">Export Data</button>
              <button class="btn-secondary" id="reset-btn" style="color: #ef4444;">Reset All Data</button>
              <button class="btn-ghost" id="close-settings">Close</button>
            </div>
          </div>
        </div>
        <div class="modal-overlay hidden" id="record-modal">
          <div class="modal-content">
            <h3>Record Pure Time</h3>
            <div class="time-inputs">
              <div class="time-input-group">
                <label>Hours</label>
                <input type="number" id="record-hours" min="0" max="23" value="1">
              </div>
              <div class="time-input-group">
                <label>Minutes</label>
                <input type="number" id="record-minutes" min="0" max="59" value="0">
              </div>
            </div>
            <div class="time-preview">
              Total: <span id="total-preview">1.0</span> hours
            </div>
            <textarea id="record-note" placeholder="Note (optional)" rows="2"></textarea>
            <div class="modal-actions">
              <button class="btn-secondary" id="cancel-record">Cancel</button>
              <button class="btn-primary" id="confirm-record">Confirm</button>
            </div>
          </div>
        </div>
      </div>`;
  },

  bindDashboardEvents() {
    const recordBtn = document.getElementById('record-btn');
    if (recordBtn) recordBtn.addEventListener('click', () => this.openRecordModal());

    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) settingsBtn.addEventListener('click', () => this.openSettingsModal());

    document.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'prev' && this.currentGridPage > 0) {
          this.currentGridPage--;
          this.render();
          this.bindDashboardEvents();
        } else if (action === 'next' && this.currentGridPage < db.progress.getTotalPages() - 1) {
          this.currentGridPage++;
          this.render();
          this.bindDashboardEvents();
        }
      });
    });

    const hoursInput = document.getElementById('record-hours');
    const minutesInput = document.getElementById('record-minutes');
    const totalPreview = document.getElementById('total-preview');
    if (hoursInput && minutesInput) {
      const updatePreview = () => {
        const h = parseInt(hoursInput.value) || 0;
        const m = parseInt(minutesInput.value) || 0;
        totalPreview.textContent = (h + m / 60).toFixed(1);
      };
      hoursInput.addEventListener('input', updatePreview);
      minutesInput.addEventListener('input', updatePreview);
    }

    const confirmBtn = document.getElementById('confirm-record');
    if (confirmBtn) confirmBtn.addEventListener('click', () => this.confirmRecord());

    const cancelBtn = document.getElementById('cancel-record');
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeRecordModal());

    const closeSettingsBtn = document.getElementById('close-settings');
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', () => this.closeSettingsModal());

    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', () => {
      if (confirm('Reset all data? This cannot be undone!')) db.config.reset();
    });

    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) exportBtn.addEventListener('click', () => this.exportData());

    [document.getElementById('record-modal'), document.getElementById('settings-modal')].forEach(modal => {
      if (modal) modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });
    });
  },

  animateGridFill() {
    const cells = document.querySelectorAll('.grid-cell');
    let delay = 0;
    cells.forEach((cell) => {
      const isFilled = cell.dataset.filled === 'true';
      if (isFilled) {
        setTimeout(() => cell.classList.add('filled'), delay);
        delay += 50;
      }
    });
  },

  openRecordModal() {
    const modal = document.getElementById('record-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.getElementById('record-hours').focus();
    }
  },

  closeRecordModal() {
    const modal = document.getElementById('record-modal');
    if (modal) modal.classList.add('hidden');
  },

  confirmRecord() {
    const hours = parseInt(document.getElementById('record-hours').value) || 0;
    const minutes = parseInt(document.getElementById('record-minutes').value) || 0;
    const note = document.getElementById('record-note').value.trim();
    if (hours === 0 && minutes === 0) {
      alert('Please enter time to record');
      return;
    }
    db.record.add(hours, minutes, note);
    this.closeRecordModal();
    this.render();
    this.bindDashboardEvents();
  },

  openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.remove('hidden');
  },

  closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.add('hidden');
  },

  exportData() {
    const data = { goal: db.goal.getCurrent(), records: db.record.getAll(), exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pure8plus_backup_' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());
