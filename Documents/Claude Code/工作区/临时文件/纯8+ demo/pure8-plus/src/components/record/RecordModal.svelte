<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { activeGoal, recordStore, timerStore } from '../../stores';
  import { TimeSlot } from '../../lib/types';
  import Timer from './Timer.svelte';

  export let onClose: () => void;

  const dispatch = createEventDispatcher();

  let mode: 'manual' | 'timer' = 'manual';
  let hours = 0;
  let minutes = 0;
  let selectedSlot: TimeSlot = TimeSlot.MORNING;
  let energyLevel = 3;
  let notes = '';

  $: goal = $activeGoal;
  $: totalMinutes = hours * 60 + minutes;

  const timeSlots = [
    { value: TimeSlot.MORNING, label: '早晨', icon: '🌅' },
    { value: TimeSlot.AFTERNOON, label: '下午', icon: '☀️' },
    { value: TimeSlot.EVENING, label: '晚上', icon: '🌙' },
    { value: TimeSlot.NIGHT, label: '深夜', icon: '🌃' },
    { value: TimeSlot.WEEKEND, label: '周末', icon: '📅' }
  ];

  async function handleSubmit() {
    if (totalMinutes === 0) return;

    await recordStore.add({
      hours,
      minutes,
      timeSlot: selectedSlot,
      energyLevel,
      notes: notes || undefined
    });

    // 重置表单
    hours = 0;
    minutes = 0;
    energyLevel = 3;
    notes = '';
    onClose();
  }

  function handleQuickAdd(amount: number) {
    hours = amount;
  }

  function handleTimerComplete(minutes: number) {
    hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    mode = 'manual';
  }
</script>

<div class="modal-overlay" on:click={onClose}>
  <div class="modal" on:click|stopPropagation>
    <!-- 头部 -->
    <header class="header">
      <h2>记录纯时间</h2>
      <button class="btn-close" on:click={onClose}>✕</button>
    </header>

    <!-- 模式切换 -->
    <div class="mode-tabs">
      <button
        class="tab"
        class:active={mode === 'manual'}
        on:click={() => mode = 'manual'}
      >
        手动输入
      </button>
      <button
        class="tab"
        class:active={mode === 'timer'}
        on:click={() => mode = 'timer'}
      >
        计时器
      </button>
    </div>

    {#if mode === 'manual'}
      <!-- 手动输入模式 -->
      <div class="content">
        <!-- 目标 -->
        {#if goal}
          <div class="goal-info">
            <span class="goal-icon">{goal.icon}</span>
            <span class="goal-name">{goal.name}</span>
          </div>
        {/if}

        <!-- 快速选择 -->
        <section class="quick-add">
          <p class="label">快速选择</p>
          <div class="quick-buttons">
            <button on:click={() => handleQuickAdd(1)}>1h</button>
            <button on:click={() => handleQuickAdd(2)}>2h</button>
            <button on:click={() => handleQuickAdd(3)}>3h</button>
            <button on:click={() => handleQuickAdd(4)}>4h</button>
            <button on:click={() => handleQuickAdd(5)}>5h</button>
            <button on:click={() => handleQuickAdd(6)}>6h</button>
            <button on:click={() => handleQuickAdd(8)}>8h</button>
          </div>
        </section>

        <!-- 精确输入 -->
        <section class="input-section">
          <p class="label">精确输入</p>
          <div class="time-input">
            <div class="input-group">
              <input type="number" min="0" max="16" bind:value={hours} />
              <span>小时</span>
            </div>
            <div class="input-group">
              <input type="number" min="0" max="59" bind:value={minutes} />
              <span>分钟</span>
            </div>
          </div>
        </section>

        <!-- 时间段 -->
        <section class="slot-section">
          <p class="label">时间段</p>
          <div class="slots">
            {#each timeSlots as slot}
              <button
                class="slot-btn"
                class:active={selectedSlot === slot.value}
                on:click={() => selectedSlot = slot.value}
              >
                <span>{slot.icon}</span>
                <span>{slot.label}</span>
              </button>
            {/each}
          </div>
        </section>

        <!-- 精力状态 -->
        <section class="energy-section">
          <p class="label">精力状态</p>
          <div class="energy-levels">
            {#each [1, 2, 3, 4, 5] as level}
              <button
                class="energy-btn"
                class:active={energyLevel === level}
                on:click={() => energyLevel = level}
              >
                {'⭐'.repeat(level)}
              </button>
            {/each}
          </div>
        </section>

        <!-- 备注 -->
        <section class="notes-section">
          <textarea
            bind:value={notes}
            placeholder="备注（可选）"
            rows="2"
          ></textarea>
        </section>

        <!-- 提示 -->
        <p class="hint">
          💡 精确到分钟，不掺水。对自己完全诚实，才能带来力量。
        </p>
      </div>
    {:else}
      <!-- 计时器模式 -->
      <Timer onComplete={handleTimerComplete} />
    {/if}

    <!-- 底部按钮 -->
    {#if mode === 'manual'}
      <footer class="footer">
        <button class="btn-cancel" on:click={onClose}>取消</button>
        <button
          class="btn-submit"
          class:disabled={totalMinutes === 0}
          on:click={handleSubmit}
        >
          确认记录 {totalMinutes > 0 ? `(${totalMinutes}分钟)` : ''}
        </button>
      </footer>
    {/if}
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal {
    background: white;
    border-radius: 1.5rem;
    width: 100%;
    max-width: 450px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .header h2 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
  }

  .btn-close {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f3f4f6;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    color: #6b7280;
    cursor: pointer;
  }

  .mode-tabs {
    display: flex;
    border-bottom: 1px solid #e5e7eb;
  }

  .tab {
    flex: 1;
    padding: 1rem;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tab:hover {
    color: #3b82f6;
  }

  .tab.active {
    color: #3b82f6;
    border-bottom-color: #3b82f6;
  }

  .content {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }

  .goal-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #f0f9ff;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .goal-icon {
    font-size: 1.5rem;
  }

  .goal-name {
    font-weight: 500;
    color: #1e40af;
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

  .input-group:focus-within {
    border-color: #3b82f6;
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

  .slot-section {
    margin-bottom: 1.5rem;
  }

  .slots {
    display: flex;
    gap: 0.5rem;
  }

  .slot-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.75rem 0.5rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .slot-btn:hover {
    border-color: #93c5fd;
    background: #f0f9ff;
  }

  .slot-btn.active {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .slot-btn span:first-child {
    font-size: 1.25rem;
  }

  .slot-btn span:last-child {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .energy-section {
    margin-bottom: 1.5rem;
  }

  .energy-levels {
    display: flex;
    gap: 0.5rem;
  }

  .energy-btn {
    flex: 1;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .energy-btn:hover {
    border-color: #fcd34d;
    background: #fefce8;
  }

  .energy-btn.active {
    border-color: #f59e0b;
    background: #fef3c7;
  }

  .notes-section {
    margin-bottom: 1rem;
  }

  .notes-section textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    color: #374151;
    resize: none;
    outline: none;
  }

  .notes-section textarea:focus {
    border-color: #3b82f6;
  }

  .hint {
    font-size: 0.75rem;
    color: #9ca3af;
    text-align: center;
  }

  .footer {
    display: flex;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid #e5e7eb;
  }

  .btn-cancel {
    flex: 1;
    padding: 0.75rem;
    background: #f3f4f6;
    color: #374151;
    border: none;
    border-radius: 0.75rem;
    font-weight: 500;
    cursor: pointer;
  }

  .btn-submit {
    flex: 2;
    padding: 0.75rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.75rem;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-submit.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
