<script lang="ts">
  import type { Goal } from '../../lib/types';

  export let goal: Goal;

  const milestones = [100, 500, 1000, 5000, 10000];

  $: currentMilestoneIndex = milestones.indexOf(goal.currentMilestone);
  $: completedMilestones = milestones.filter(m => goal.currentHours >= m);
  $: nextMilestone = milestones.find(m => goal.currentHours < m);
</script>

<div class="milestone-progress">
  <h3>里程碑进度</h3>
  <div class="milestones">
    {#each milestones as milestone, index}
      {@const completed = goal.currentHours >= milestone}
      {@const isCurrent = milestone === goal.currentMilestone}
      <div
        class="milestone"
        class:completed
        class:current={isCurrent}
      >
        <span class="milestone-dot"></span>
        <span class="milestone-label">{milestone}h</span>
      </div>
    {/each}
  </div>

  {#if nextMilestone}
    <div class="next-milestone">
      <span>距离 {nextMilestone}h 还需</span>
      <span class="highlight">{Math.round((nextMilestone - goal.currentHours) * 10) / 10}h</span>
    </div>
  {:else}
    <div class="all-completed">
      🎉 恭喜！已完成所有里程碑
    </div>
  {/if}
</div>

<style>
  .milestone-progress {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 1rem;
  }

  .milestone-progress h3 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 1rem;
  }

  .milestones {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .milestone {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
  }

  .milestone-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #e5e7eb;
    border: 2px solid #d1d5db;
  }

  .milestone.completed .milestone-dot {
    background: #3b82f6;
    border-color: #3b82f6;
  }

  .milestone.current .milestone-dot {
    background: #3b82f6;
    border-color: #93c5fd;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
  }

  .milestone-label {
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .milestone.completed .milestone-label {
    color: #3b82f6;
  }

  .milestone.current .milestone-label {
    color: #1e40af;
    font-weight: 600;
  }

  .next-milestone {
    text-align: center;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .next-milestone .highlight {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: #3b82f6;
    margin-top: 0.25rem;
  }

  .all-completed {
    text-align: center;
    font-size: 0.875rem;
    color: #059669;
    font-weight: 500;
  }
</style>
