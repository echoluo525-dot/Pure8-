<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { goalStore, pureTarget } from '../../stores';
  import { COMMON_ICONS } from '../../lib/types';

  export let onClose: () => void;

  const dispatch = createEventDispatcher();

  let goalName = '';
  let selectedIcon = '🎯';
  let targetHours = 10000;

  $: dailyTarget = $pureTarget;

  const iconOptions = COMMON_ICONS;

  async function handleCreate() {
    if (!goalName.trim()) return;

    const goalData = {
      name: goalName.trim(),
      icon: selectedIcon,
      targetHours,
      dailyPureTarget: dailyTarget,
      color: '#3B82F6'
    };

    await goalStore.create(goalData);
    onClose();
    dispatch('created');
  }

  function handleQuickSelect(hours: number) {
    targetHours = hours;
  }
</script>

<div class="modal-overlay" on:click={onClose}>
  <div class="modal" on:click|stopPropagation>
    <!-- 头部 -->
    <header class="header">
      <h2>创建目标</h2>
      <button class="btn-close" on:click={onClose}>✕</button>
    </header>

    <!-- 内容 -->
    <div class="content">
      <!-- 目标名称 -->
      <section class="section">
        <label class="label">目标名称</label>
        <input
          type="text"
          bind:value={goalName}
          placeholder="例如：学习编程、练习写作..."
          class="input"
        />
      </section>

      <!-- 选择图标 -->
      <section class="section">
        <label class="label">选择图标</label>
        <div class="icons-grid">
          {#each iconOptions as icon}
            <button
              class="icon-btn"
              class:active={selectedIcon === icon}
              on:click={() => selectedIcon = icon}
            >
              {icon}
            </button>
          {/each}
        </div>
      </section>

      <!-- 目标小时数 -->
      <section class="section">
        <label class="label">总目标小时数</label>
        <div class="quick-select">
          <button
            class="select-btn"
            class:active={targetHours === 1000}
            on:click={() => handleQuickSelect(1000)}
          >
            1000h
          </button>
          <button
            class="select-btn"
            class:active={targetHours === 5000}
            on:click={() => handleQuickSelect(5000)}
          >
            5000h
          </button>
          <button
            class="select-btn"
            class:active={targetHours === 10000}
            on:click={() => handleQuickSelect(10000)}
          >
            10000h
          </button>
        </div>
        <div class="custom-input">
          <input
            type="number"
            bind:value={targetHours}
            min="100"
            max="100000"
            step="100"
            class="input"
          />
          <span>小时</span>
        </div>
      </section>

      <!-- 每日目标 -->
      <section class="section">
        <div class="daily-target">
          <span class="label">每日纯时间目标</span>
          <span class="target-value">纯{dailyTarget}</span>
        </div>
        <p class="hint">
          基于你的探索期数据设定，可在设置中修改
        </p>
      </section>

      <!-- 说明 -->
      <div class="info-box">
        <p>
          💡 <strong>10000小时理论</strong>：马尔科姆·格拉德威尔在《异类》中提出，
          要成为某个领域的专家，需要约10000小时的刻意练习。
        </p>
      </div>
    </div>

    <!-- 底部按钮 -->
    <footer class="footer">
      <button class="btn-cancel" on:click={onClose}>取消</button>
      <button
        class="btn-submit"
        class:disabled={!goalName.trim()}
        on:click={handleCreate}
      >
        创建目标
      </button>
    </footer>
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

  .content {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }

  .section {
    margin-bottom: 1.5rem;
  }

  .label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.75rem;
  }

  .input {
    width: 100%;
    padding: 0.875rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.75rem;
    font-size: 1rem;
    color: #1f2937;
    outline: none;
    transition: border-color 0.2s;
  }

  .input:focus {
    border-color: #3b82f6;
  }

  .icons-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 0.5rem;
  }

  .icon-btn {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .icon-btn:hover {
    border-color: #93c5fd;
    background: #f0f9ff;
  }

  .icon-btn.active {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .quick-select {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .select-btn {
    flex: 1;
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

  .select-btn:hover {
    border-color: #93c5fd;
    background: #f0f9ff;
  }

  .select-btn.active {
    border-color: #3b82f6;
    background: #eff6ff;
    color: #3b82f6;
  }

  .custom-input {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.75rem;
  }

  .custom-input .input {
    border: none;
    padding: 0;
    flex: 1;
  }

  .custom-input span {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .daily-target {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #eff6ff;
    border-radius: 0.75rem;
  }

  .target-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: #3b82f6;
  }

  .hint {
    font-size: 0.75rem;
    color: #9ca3af;
    margin-top: 0.5rem;
  }

  .info-box {
    padding: 1rem;
    background: #fef3c7;
    border-radius: 0.75rem;
  }

  .info-box p {
    font-size: 0.875rem;
    color: #92400e;
    line-height: 1.6;
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
