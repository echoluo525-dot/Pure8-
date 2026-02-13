<script lang="ts">
  import { currentPageGrid, gridStore, activeGoal, totalPages } from '../../stores';
  import { onMount } from 'svelte';
  import type { GridPage } from '../../lib/types';

  let currentPage = 0;

  onMount(async () => {
    if ($activeGoal) {
      await gridStore.load($activeGoal.id);
      // 默认显示最后一页（最新的格子）
      currentPage = Math.max(0, $totalPages - 1);
    }
  });

  $: grid = $currentPageGrid;
  $: canGoPrev = currentPage > 0;
  $: canGoNext = currentPage < $totalPages - 1;

  function handlePrevPage() {
    if (canGoPrev) {
      gridStore.setPage(currentPage - 1);
      currentPage = currentPage - 1;
    }
  }

  function handleNextPage() {
    if (canGoNext) {
      gridStore.setPage(currentPage + 1);
      currentPage = currentPage + 1;
    }
  }

  function handleGridClick(cellIndex: number) {
    // 点击格子时的处理（未来可添加详情查看功能）
    console.log('Cell clicked:', cellIndex);
  }
</script>

<div class="grid-preview">
  <div class="grid-header">
    <h3>格子进度</h3>
    {#if grid}
      <div class="header-actions">
        <button
          class="page-btn"
          class:disabled={!canGoPrev}
          on:click={handlePrevPage}
        >
          ←
        </button>
        <span class="page-label">{grid.startHour + 1}-{grid.endHour}小时</span>
        <button
          class="page-btn"
          class:disabled={!canGoNext}
          on:click={handleNextPage}
        >
          →
        </button>
      </div>
    {/if}
  </div>

  {#if grid}
    <div class="grid-container">
      {#each grid.cells as cell}
        <div
          class="cell"
          class:filled={cell.filled}
          on:click={() => handleGridClick(cell.index)}
          title="第{cell.hour}小时"
        ></div>
      {/each}
    </div>

    <div class="grid-footer">
      <span class="grid-info">
        已完成 {grid.cells.filter(c => c.filled).length} / 100 格
      </span>
      {#if grid.isCompleted}
        <span class="grid-complete">✓ 已完成</span>
      {/if}
    </div>
  {:else}
    <div class="grid-empty">
      <p>还没有记录，开始第一次记录吧！</p>
    </div>
  {/if}
</div>

<style>
  .grid-preview {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 1rem;
  }

  .grid-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .grid-header h3 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .page-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    background: white;
    color: #6b7280;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .page-btn:hover:not(.disabled) {
    border-color: #3b82f6;
    color: #3b82f6;
  }

  .page-btn.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .page-label {
    font-size: 0.75rem;
    color: #6b7280;
    padding: 0 0.5rem;
  }

  .grid-container {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 4px;
  }

  .cell {
    aspect-ratio: 1;
    border-radius: 3px;
    background: #e5e7eb;
    transition: all 0.2s;
    cursor: pointer;
  }

  .cell:hover {
    transform: scale(1.1);
    z-index: 1;
  }

  .cell.filled {
    background: #3b82f6;
    box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3);
  }

  .grid-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
  }

  .grid-info {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .grid-complete {
    font-size: 0.75rem;
    color: #059669;
    font-weight: 600;
  }

  .grid-empty {
    text-align: center;
    padding: 2rem 1rem;
  }

  .grid-empty p {
    font-size: 0.875rem;
    color: #9ca3af;
  }
</style>
