<script lang="ts">
  export let days: number = 0;

  $: level = days >= 30 ? 'high' : days >= 7 ? 'medium' : 'low';
  $: message = days === 0
    ? '开始你的宪法之旅'
    : days < 7
      ? '保持住！'
      : days < 30
        ? '做得好！'
        : '太棒了！';
</script>

<div class="streak-card" class:level>
  <div class="streak-icon">
    {#if days >= 30}
      🔥
    {:else if days >= 7}
      ⚡
    {:else if days > 0}
      ✨
    {:else}
      📜
    {/if}
  </div>
  <div class="streak-info">
    <span class="streak-days">{days}</span>
    <span class="streak-label">天连续达成</span>
  </div>
  <div class="streak-message">{message}</div>
</div>

<style>
  .streak-card {
    background: white;
    border-radius: 1rem;
    padding: 1.25rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border-left: 4px solid #d1d5db;
  }

  .streak-card.level.low {
    border-left-color: #9ca3af;
  }

  .streak-card.level.medium {
    border-left-color: #3b82f6;
  }

  .streak-card.level.high {
    border-left-color: #f59e0b;
  }

  .streak-icon {
    font-size: 2rem;
  }

  .streak-info {
    flex: 1;
  }

  .streak-days {
    display: block;
    font-size: 1.75rem;
    font-weight: 700;
    color: #1f2937;
  }

  .streak-label {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .streak-message {
    font-size: 0.875rem;
    color: #3b82f6;
    font-weight: 500;
  }
</style>
