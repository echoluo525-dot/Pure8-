<script lang="ts">
  import { userStore } from '../../stores';
  import { UserMode, DEFAULT_PURE_TARGETS, TIME_SLOT_CONFIG } from '../../lib/types';

  let selectedMode: UserMode = UserMode.CUSTOM;
  let selectedTimeSlot = TIME_SLOT_CONFIG.morning;

  const modes = [
    {
      value: UserMode.FULLTIME,
      icon: '🎓',
      title: '全职学习',
      desc: '学生/转行/备考/自由业，全天专注学习',
      target: '纯8'
    },
    {
      value: UserMode.CAREER,
      icon: '💼',
      title: '职场进修',
      desc: '上班+自学，利用业余时间成长',
      target: '精力截流'
    },
    {
      value: UserMode.HABIT,
      icon: '🌱',
      title: '习惯养成',
      desc: '小步慢跑，培养兴趣',
      target: '纯4'
    },
    {
      value: UserMode.CUSTOM,
      icon: '⚡',
      title: '自定义',
      desc: '设定你自己的纯X目标',
      target: '自定义'
    }
  ];

  const timeSlots = Object.values(TIME_SLOT_CONFIG);

  async function handleStart() {
    await userStore.setUserMode(selectedMode);
    await userStore.setTimeSlotPreference(selectedTimeSlot.timeSlot);
    await userStore.setOnboardingStage('exploring');
  }

  function getRecommendedHours(mode: UserMode): number {
    return DEFAULT_PURE_TARGETS[mode];
  }
</script>

<div class="welcome">
  <div class="container">
    <!-- 头部 -->
    <header class="header">
      <div class="logo">
        <span class="icon">⏱️</span>
        <h1>纯8+</h1>
      </div>
      <p class="tagline">记录纯时间，看见复利的力量</p>
    </header>

    <!-- 主要内容 -->
    <main class="main">
      <section class="intro">
        <h2>找到属于你的纯X</h2>
        <p>
          纯6/纯8不是标准答案，而是通过实践找到属于自己的数字。
          在接下来的14天里，我们帮你找到可以长期坚持的纯时间目标。
        </p>
      </section>

      <!-- 选择模式 -->
      <section class="mode-selection">
        <h3>选择你的学习模式</h3>
        <div class="modes">
          {#each modes as mode}
            <button
              class="mode-card"
              class:active={selectedMode === mode.value}
              on:click={() => selectedMode = mode.value}
            >
              <span class="mode-icon">{mode.icon}</span>
              <div class="mode-info">
                <span class="mode-title">{mode.title}</span>
                <span class="mode-desc">{mode.desc}</span>
              </div>
              <span class="mode-target">{mode.target}</span>
            </button>
          {/each}
        </div>
      </section>

      <!-- 时间段偏好（职场模式显示） -->
      {#if selectedMode === UserMode.CAREER}
        <section class="time-slot">
          <h3>你更喜欢在哪个时间段学习？</h3>
          <div class="slots">
            {#each timeSlots as slot}
              {#if slot.timeSlot !== 'afternoon' && slot.timeSlot !== 'night'}
                <button
                  class="slot-card"
                  class:active={selectedTimeSlot.timeSlot === slot.timeSlot}
                  on:click={() => selectedTimeSlot = slot}
                >
                  <span class="slot-icon">{slot.icon}</span>
                  <span class="slot-label">{slot.label}</span>
                </button>
              {/if}
            {/each}
          </div>
          <p class="hint">
            💡 推荐早晨学习 — 这是"精力截流"的核心，先把自己养肥，再喂给公司
          </p>
        </section>
      {/if}

      <!-- 开始按钮 -->
      <button class="btn-start" on:click={handleStart}>
        开始探索期 (14天)
      </button>

      <!-- 说明 -->
      <p class="note">
        在探索期，你只需要每天记录你的纯时间，不需要有压力。
        14天结束后，我们将基于你的实际数据，推荐适合你的纯X目标。
      </p>
    </main>
  </div>
</div>

<style>
  .welcome {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .container {
    max-width: 600px;
    width: 100%;
  }

  .header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .logo {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .logo .icon {
    font-size: 2.5rem;
  }

  .logo h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
  }

  .tagline {
    color: #6b7280;
    font-size: 0.875rem;
  }

  .main {
    background: white;
    border-radius: 1.5rem;
    padding: 2rem;
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
  }

  .intro {
    margin-bottom: 2rem;
    text-align: center;
  }

  .intro h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }

  .intro p {
    color: #6b7280;
    line-height: 1.6;
  }

  .mode-selection,
  .time-slot {
    margin-bottom: 2rem;
  }

  .mode-selection h3,
  .time-slot h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 1rem;
  }

  .modes {
    display: grid;
    gap: 0.75rem;
  }

  .mode-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.75rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .mode-card:hover {
    border-color: #93c5fd;
    background: #f0f9ff;
  }

  .mode-card.active {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .mode-icon {
    font-size: 2rem;
  }

  .mode-info {
    flex: 1;
    text-align: left;
  }

  .mode-title {
    display: block;
    font-weight: 600;
    color: #1f2937;
  }

  .mode-desc {
    display: block;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .mode-target {
    font-size: 0.875rem;
    font-weight: 600;
    color: #3b82f6;
  }

  .slots {
    display: flex;
    gap: 0.75rem;
  }

  .slot-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .slot-card:hover {
    border-color: #93c5fd;
    background: #f0f9ff;
  }

  .slot-card.active {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .slot-icon {
    font-size: 1.5rem;
  }

  .slot-label {
    font-size: 0.875rem;
    color: #374151;
  }

  .hint {
    margin-top: 0.75rem;
    font-size: 0.875rem;
    color: #6b7280;
    text-align: center;
  }

  .btn-start {
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
  }

  .btn-start:hover {
    background: #2563eb;
  }

  .note {
    margin-top: 1rem;
    font-size: 0.875rem;
    color: #9ca3af;
    text-align: center;
    line-height: 1.5;
  }
</style>
