<script lang="ts">
  import { onboardingStage, isExploring, activeGoal } from './stores';
  import Welcome from './components/onboarding/Welcome.svelte';
  import Exploration from './components/onboarding/Exploration.svelte';
  import SetPureTarget from './components/onboarding/SetPureTarget.svelte';
  import Constitution from './components/onboarding/Constitution.svelte';
  import Dashboard from './components/Dashboard.svelte';
  import Loading from './components/common/Loading.svelte';

  // 引导阶段判断
  $: stage = $onboardingStage;

  // 判断是否显示欢迎页（新用户或刚选择模式但还未开始探索）
  $: showWelcome = stage === 'new' || stage === undefined;

  // 判断是否显示探索页
  $: showExploration = stage === 'exploring';

  // 判断是否显示设定目标页
  $: showSetTarget = stage === 'confirmed';

  // 判断是否显示宪法承诺页（已确认目标但未承诺）
  // 注意：从 SetPureTarget 进入时需要先经过 Constitution
  $: showConstitution = stage === 'confirmed';

  // 判断是否显示主页面（已完成所有引导或有活跃目标）
  $: showDashboard = stage === 'committed';
</script>

<div class="app">
  {#if showWelcome}
    <Welcome />
  {:else if showExploration}
    <Exploration />
  {:else if showSetTarget}
    <SetPureTarget />
  {:else if showConstitution}
    <!-- 从 SetPureTarget 点击确认后，会跳过 Constitution 直接进入 Dashboard -->
    <!-- 如果想显示 Constitution 页面，需要修改 SetPureTarget 的逻辑 -->
    <Dashboard />
  {:else if showDashboard}
    <Dashboard />
  {:else}
    <Loading />
  {/if}
</div>

<style>
  .app { min-height: 100vh; width: 100%; }
</style>
