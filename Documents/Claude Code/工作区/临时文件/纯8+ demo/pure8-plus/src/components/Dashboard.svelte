<script lang="ts">
  import { onMount } from 'svelte';
  import {
    activeGoal,
    activeGoalProgress,
    activeGoalRemaining,
    pureTarget,
    constitutionStreak,
    dailyQuote,
    todayProgress,
    todayRemaining,
    recordStore,
    gridStore
  } from '../stores';
  import RecordModal from './record/RecordModal.svelte';
  import CreateGoalModal from './goal/CreateGoalModal.svelte';
  import QuoteCard from './common/QuoteCard.svelte';
  import ConstitutionStreak from './common/ConstitutionStreak.svelte';
  import GridPreview from './grid/GridPreview.svelte';
  import MilestoneProgress from './common/MilestoneProgress.svelte';

  let showRecordModal = false;
  let showCreateGoalModal = false;

  onMount(async () => {
    if ($activeGoal) {
      await gridStore.load($activeGoal.id);
    }
  });

  $: goal = $activeGoal;
  $: progress = $activeGoalProgress;
  $: remaining = $activeGoalRemaining;
  $: target = $pureTarget;
  $: streak = $constitutionStreak;
  $: quote = $dailyQuote;
  $: todayProg = $todayProgress;
  $: todayRem = $todayRemaining;

  function handleGoalCreated() {
    // 目标创建后刷新
  }
</script>

<div class="dashboard">
  <!-- Top Nav -->
  <nav class="nav">
    <div class="logo">
      <span class="icon">⏱</span>
      <span>Pure8+</span>
    </div>
  </nav>

  {#if goal}
    <!-- Goal Card -->
    <section class="goal-card">
      <div class="goal-header">
        <span class="goal-icon">{goal.icon}</span>
        <div class="goal-info">
          <h1>{goal.name}</h1>
          <span class="goal-target">Pure{goal.dailyPureTarget} ✓</span>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill" style="width: {progress}%"></div>
        </div>
        <div class="progress-info">
          <span class="current">{goal.currentHours}h</span>
          <span class="target">/ {goal.targetHours}h</span>
          <span class="percent">{progress}%</span>
        </div>
      </div>

      <!-- Today Progress -->
      <div class="today-section">
        <div class="today-header">
          <span>Today</span>
          <span class="today-target">Target: {target}h</span>
        </div>
        <div class="today-progress">
          <div class="today-bar">
            <div class="today-fill" style="width: {todayProg}%"></div>
          </div>
          <div class="today-info">
            <span class="done">{todayProg}%</span>
            <span class="remain">{todayRem}h left</span>
          </div>
        </div>
      </div>

      <!-- Record Button -->
      <div class="actions">
        <button class="btn-record" on:click={() => showRecordModal = true}>
          <span>+</span> Record Time
        </button>
      </div>
    </section>

    <!-- Milestone Progress -->
    <MilestoneProgress goal={goal} />

    <!-- Constitution Streak -->
    <ConstitutionStreak days={streak} />

    <!-- Grid Preview -->
    <GridPreview />

    <!-- Daily Quote -->
    <QuoteCard quote={quote} />
  {:else}
    <!-- No Goal State -->
    <section class="no-goal">
      <div class="no-goal-content">
        <span class="icon">🎯</span>
        <h2>还没有目标</h2>
        <p>创建你的第一个10000小时目标！</p>
        <button class="btn-create" on:click={() => showCreateGoalModal = true}>
          创建目标
        </button>
      </div>
    </section>
  {/if}

  <!-- Record Modal -->
  {#if showRecordModal}
    <RecordModal onClose={() => showRecordModal = false} />
  {/if}

  <!-- Create Goal Modal -->
  {#if showCreateGoalModal}
    <CreateGoalModal
      onClose={() => showCreateGoalModal = false}
      on:created={handleGoalCreated}
    />
  {/if}
</div>

<style>
  .dashboard {
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
  }

  .nav {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
  }

  .logo .icon {
    font-size: 1.75rem;
  }

  .goal-card {
    background: white;
    border-radius: 1.5rem;
    padding: 1.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
  }

  .goal-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .goal-icon {
    font-size: 2.5rem;
  }

  .goal-info h1 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.25rem;
  }

  .goal-target {
    font-size: 0.875rem;
    color: #3b82f6;
    background: #eff6ff;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
  }

  .progress-section {
    margin-bottom: 1.5rem;
  }

  .progress-bar {
    height: 12px;
    background: #e5e7eb;
    border-radius: 999px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
    border-radius: 999px;
    transition: width 0.5s ease-out;
  }

  .progress-info {
    display: flex;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .current {
    font-weight: 600;
    color: #1f2937;
  }

  .target {
    color: #6b7280;
  }

  .percent {
    margin-left: auto;
    font-weight: 600;
    color: #3b82f6;
  }

  .today-section {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #fef3c7;
    border-radius: 0.75rem;
  }

  .today-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
  }

  .today-target {
    color: #d97706;
    font-weight: 600;
  }

  .today-bar {
    height: 8px;
    background: #fee2e2;
    border-radius: 999px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .today-fill {
    height: 100%;
    background: #22c55e;
    border-radius: 999px;
    transition: width 0.3s ease-out;
  }

  .today-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
  }

  .done {
    color: #16a34a;
    font-weight: 600;
  }

  .remain {
    color: #6b7280;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
  }

  .btn-record {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
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

  .btn-record:hover {
    background: #2563eb;
  }

  .btn-record span {
    font-size: 1.25rem;
  }

  .no-goal {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
  }

  .no-goal-content {
    text-align: center;
  }

  .no-goal .icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .no-goal h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }

  .no-goal p {
    color: #6b7280;
    margin-bottom: 1.5rem;
  }

  .btn-create {
    padding: 0.75rem 2rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.75rem;
    font-weight: 600;
    cursor: pointer;
  }
</style>
