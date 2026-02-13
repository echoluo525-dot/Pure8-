<script lang="ts">
  import { userStore, explorationData, explorationAverage } from '../../stores';

  let hours = 0;
  let minutes = 0;
  let notes = '';

  $: currentDay = $explorationData.length + 1;
  $: progress = ($explorationData.length / 14) * 100;
  $: average = $explorationAverage;

  async function handleSubmit() {
    if (hours === 0 && minutes === 0) return;

    await userStore.addExplorationDay(hours + minutes / 60, notes || undefined);

    // 重置表单
    hours = 0;
    minutes = 0;
    notes = '';

    // 检查是否完成探索期
    if ($explorationData.length >= 14) {
      await userStore.completeExploration();
    }
  }

  function handleQuickAdd(amount: number) {
    hours = amount;
  }
</script>

<div class="exploration">
  <div class="container">
    <!-- 头部 -->
    <header class="header">
      <div class="progress-bar">
        <div class="progress-fill" style="width: {progress}%"></div>
      </div>
      <p class="day-label">探索期 · 第 {currentDay} / 14 天</p>
    </header>

    <!-- 主要内容 -->
    <main class="main">
      <section class="intro">
        <h2>今天投入了多少纯时间？</h2>
        <p>记录你今天真正专注学习/工作的小时数</p>
      </section>

      <!-- 快速选择 -->
      <section class="quick-add">
        <p class="label">快速选择</p>
        <div class="quick-buttons">
          <button on:click={() => handleQuickAdd(1)}>1小时</button>
          <button on:click={() => handleQuickAdd(2)}>2小时</button>
          <button on:click={() => handleQuickAdd(3)}>3小时</button>
          <button on:click={() => handleQuickAdd(4)}>4小时</button>
          <button on:click={() => handleQuickAdd(5)}>5小时</button>
          <button on:click={() => handleQuickAdd(6)}>6小时</button>
          <button on:click={() => handleQuickAdd(8)}>8小时</button>
        </div>
      </section>

      <!-- 精确输入 -->
      <section class="input-section">
        <p class="label">或精确输入</p>
        <div class="time-input">
          <div class="input-group">
            <input
              type="number"
              min="0"
              max="16"
              bind:value={hours}
              placeholder="0"
            />
            <span>小时</span>
          </div>
          <div class="input-group">
            <input
              type="number"
              min="0"
              max="59"
              bind:value={minutes}
              placeholder="0"
            />
            <span>分钟</span>
          </div>
        </div>
        <textarea
          bind:value={notes}
          placeholder="备注（可选）"
          rows="2"
        ></textarea>
      </section>

      <!-- 当前数据展示 -->
      {#if $explorationData.length > 0}
        <section class="current-data">
          <h3>探索期数据</h3>
          <div class="stats">
            <div class="stat">
              <span class="stat-label">当前平均</span>
              <span class="stat-value">{average}小时</span>
            </div>
            <div class="stat">
              <span class="stat-label">已记录</span>
              <span class="stat-value">{$explorationData.length}天</span>
            </div>
          </div>
          <div class="days-list">
            {#each $explorationData.slice(-5).reverse() as day}
              <div class="day-item">
                <span class="day-number">第{day.day}天</span>
                <span class="day-hours">{day.hours}小时</span>
              </div>
            {/each}
          </div>
        </section>
      {/if}

      <!-- 提交按钮 -->
      <button class="btn-submit" on:click={handleSubmit}>
        {currentDay === 14 ? '完成探索期' : '记录并继续'}
      </button>

      <p class="hint">
        💡 提示：纯时间是指真正专注的有效时间，不包括休息、走神、刷手机
      </p>
    </main>
  </div>
</div>

<style>
  .exploration {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .container {
    max-width: 500px;
    width: 100%;
  }

  .header {
    margin-bottom: 2rem;
  }

  .progress-bar {
    height: 8px;
    background: #e5e7eb;
    border-radius: 999px;
    overflow: hidden;
    margin-bottom: 0.75rem;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
    border-radius: 999px;
    transition: width 0.5s ease-out;
  }

  .day-label {
    text-align: center;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .main {
    background: white;
    border-radius: 1.5rem;
    padding: 2rem;
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
  }

  .intro {
    text-align: center;
    margin-bottom: 2rem;
  }

  .intro h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }

  .intro p {
    color: #6b7280;
  }

  .label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.75rem;
  }

  .quick-add {
    margin-bottom: 1.5rem;
  }

  .quick-buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }

  .quick-buttons button {
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    background: white;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
  }

  .quick-buttons button:hover {
    border-color: #93c5fd;
    background: #f0f9ff;
  }

  .input-section {
    margin-bottom: 1.5rem;
  }

  .time-input {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .input-group {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.75rem;
  }

  .input-group input {
    width: 100%;
    border: none;
    font-size: 1.125rem;
    font-weight: 600;
    text-align: center;
    outline: none;
  }

  .input-group span {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .input-group:focus-within {
    border-color: #3b82f6;
  }

  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    color: #374151;
    resize: none;
    outline: none;
  }

  textarea:focus {
    border-color: #3b82f6;
  }

  .current-data {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 0.75rem;
  }

  .current-data h3 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.75rem;
  }

  .stats {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }

  .stat {
    flex: 1;
    text-align: center;
  }

  .stat-label {
    display: block;
    font-size: 0.75rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
  }

  .stat-value {
    display: block;
    font-size: 1.25rem;
    font-weight: 700;
    color: #3b82f6;
  }

  .days-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .day-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    background: white;
    border-radius: 0.5rem;
    font-size: 0.875rem;
  }

  .day-number {
    color: #6b7280;
  }

  .day-hours {
    font-weight: 600;
    color: #3b82f6;
  }

  .btn-submit {
    width: 100%;
    padding: 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.75rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    margin-bottom: 1rem;
  }

  .btn-submit:hover {
    background: #2563eb;
  }

  .hint {
    text-align: center;
    font-size: 0.875rem;
    color: #9ca3af;
  }
</style>
