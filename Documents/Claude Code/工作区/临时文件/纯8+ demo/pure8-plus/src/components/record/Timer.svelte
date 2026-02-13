<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { timerStore } from '../../stores';

  export let onComplete: (minutes: number) => void;

  let interval: number;
  let displayTime = '00:00';

  onMount(() => {
    interval = window.setInterval(() => {
      displayTime = timerStore.getFormatted();
    }, 1000);
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });

  function handleStart() {
    timerStore.start();
  }

  function handlePause() {
    timerStore.pause();
  }

  function handleResume() {
    timerStore.resume();
  }

  function handleStop() {
    const minutes = timerStore.stop();
    onComplete(minutes);
  }
</script>

<div class="timer">
  <!-- 时间显示 -->
  <div class="timer-display">
    {displayTime}
  </div>

  <!-- 状态提示 -->
  <div class="timer-status">
    {#if $timerStore.isPaused}
      <span class="paused">已暂停</span>
    {:else if $timerStore.isRunning}
      <span class="running">正在计时</span>
    {:else}
      <span class="idle">准备就绪</span>
    {/if}
  </div>

  <!-- 控制按钮 -->
  <div class="timer-controls">
    {#if !$timerStore.isRunning}
      <button class="btn-start" on:click={handleStart}>
        <span>▶</span> 开始
      </button>
    {:else if $timerStore.isPaused}
      <button class="btn-resume" on:click={handleResume}>
        <span>▶</span> 继续
      </button>
      <button class="btn-stop" on:click={handleStop}>
        <span>⏹</span> 完成
      </button>
    {:else}
      <button class="btn-pause" on:click={handlePause}>
        <span>⏸</span> 暂停
      </button>
      <button class="btn-stop" on:click={handleStop}>
        <span>⏹</span> 完成
      </button>
    {/if}
  </div>

  <!-- 说明 -->
  <p class="hint">
    💡 暂停时间不会计入纯时间
  </p>
</div>

<style>
  .timer {
    padding: 1.5rem;
    text-align: center;
  }

  .timer-display {
    font-size: 3rem;
    font-weight: 700;
    color: #1f2937;
    font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
    margin-bottom: 0.5rem;
  }

  .timer-status {
    margin-bottom: 2rem;
  }

  .timer-status span {
    font-size: 0.875rem;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
  }

  .idle {
    background: #f3f4f6;
    color: #6b7280;
  }

  .running {
    background: #d1fae5;
    color: #059669;
  }

  .paused {
    background: #fef3c7;
    color: #d97706;
  }

  .timer-controls {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
  }

  .timer-controls button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.75rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-start,
  .btn-resume {
    background: #3b82f6;
    color: white;
  }

  .btn-start:hover,
  .btn-resume:hover {
    background: #2563eb;
  }

  .btn-pause {
    background: #f59e0b;
    color: white;
  }

  .btn-pause:hover {
    background: #d97706;
  }

  .btn-stop {
    background: #10b981;
    color: white;
  }

  .btn-stop:hover {
    background: #059669;
  }

  .hint {
    margin-top: 1.5rem;
    font-size: 0.875rem;
    color: #9ca3af;
  }
</style>
