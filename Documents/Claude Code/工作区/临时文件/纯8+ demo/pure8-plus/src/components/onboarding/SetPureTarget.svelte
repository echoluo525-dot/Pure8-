<script lang="ts">
  import { userStore, explorationData, explorationAverage } from '../../stores';

  let customTarget = $explorationAverage;
  let useCustom = false;

  $: average = $explorationAverage;
  $: displayTarget = useCustom ? customTarget : Math.round(average * 10) / 10;

  const presets = [2, 3, 3.5, 4, 5, 6, 8];

  async function handleConfirm() {
    await userStore.setPureTarget(displayTarget);
    await userStore.activateConstitution();
  }

  function setTarget(value: number) {
    customTarget = value;
    useCustom = true;
  }
</script>

<div class="set-target">
  <div class="container">
    <!-- 头部 -->
    <header class="header">
      <div class="success-icon">🎉</div>
      <h1>探索期完成！</h1>
      <p>基于你的14天数据，我们找到了属于你的纯X</p>
    </header>

    <!-- 主要内容 -->
    <main class="main">
      <section class="result">
        <h2>你的平均纯时间</h2>
        <div class="average-display">
          <span class="number">{average}</span>
          <span class="unit">小时/天</span>
        </div>
        <p class="description">
          这就是属于你的数字，尊重它。<br />
          不要因为不理想就假装成6小时。
        </p>
      </section>

      <!-- 调整目标 -->
      <section class="adjust">
        <h3>是否需要调整目标？</h3>
        <p class="hint">
          你可以选择基于平均值，或者根据实际情况微调
        </p>

        <!-- 预设值 -->
        <div class="presets">
          {#each presets as preset}
            <button
              class="preset-btn"
              class:active={displayTarget === preset}
              on:click={() => setTarget(preset)}
            >
              纯{preset}
            </button>
          {/each}
        </div>

        <!-- 自定义输入 -->
        <div class="custom-input">
          <label>自定义</label>
          <div class="input-wrapper">
            <input
              type="number"
              min="0.5"
              max="16"
              step="0.5"
              bind:value={customTarget}
              on:focus={() => useCustom = true}
            />
            <span>小时</span>
          </div>
        </div>
      </section>

      <!-- 当前目标 -->
      <section class="current-target">
        <h3>你的纯X目标</h3>
        <div class="target-display">
          <span class="target-number">{displayTarget}</span>
          <span class="target-label">小时/天</span>
        </div>
      </section>

      <!-- 说明 -->
      <section class="info">
        <div class="info-item">
          <span class="icon">📊</span>
          <div class="info-content">
            <strong>尊重事实数据</strong>
            <p>{displayTarget}小时就是{displayTarget}小时，不是{displayTarget + 1}小时</p>
          </div>
        </div>
        <div class="info-item">
          <span class="icon">⚖️</span>
          <div class="info-content">
            <strong>目标不宜过高</strong>
            <p>目标过高容易放弃，目标过低缺乏挑战</p>
          </div>
        </div>
        <div class="info-item">
          <span class="icon">📈</span>
          <div class="info-content">
            <strong>可以随时调整</strong>
            <p>随着状态变化，你可以在设置中调整目标</p>
          </div>
        </div>
      </section>

      <!-- 确认按钮 -->
      <button class="btn-confirm" on:click={handleConfirm}>
        确认并设定自我宪法
      </button>
    </main>
  </div>
</div>

<style>
  .set-target {
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
    text-align: center;
    margin-bottom: 2rem;
  }

  .success-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .header h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }

  .header p {
    color: #6b7280;
  }

  .main {
    background: white;
    border-radius: 1.5rem;
    padding: 2rem;
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
  }

  .result {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .result h2 {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 1rem;
  }

  .average-display {
    display: inline-flex;
    align-items: baseline;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .number {
    font-size: 4rem;
    font-weight: 700;
    color: #3b82f6;
    line-height: 1;
  }

  .unit {
    font-size: 1.25rem;
    color: #6b7280;
  }

  .description {
    font-size: 0.875rem;
    color: #6b7280;
    line-height: 1.6;
  }

  .adjust {
    margin-bottom: 2rem;
  }

  .adjust h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  .hint {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 1rem;
  }

  .presets {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .preset-btn {
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

  .preset-btn:hover {
    border-color: #93c5fd;
    background: #f0f9ff;
  }

  .preset-btn.active {
    border-color: #3b82f6;
    background: #eff6ff;
    color: #3b82f6;
  }

  .custom-input {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .custom-input label {
    font-size: 0.875rem;
    color: #374151;
  }

  .input-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
  }

  .input-wrapper:focus-within {
    border-color: #3b82f6;
  }

  .input-wrapper input {
    flex: 1;
    border: none;
    font-size: 1rem;
    font-weight: 600;
    text-align: center;
    outline: none;
  }

  .input-wrapper span {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .current-target {
    text-align: center;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: #f0f9ff;
    border-radius: 0.75rem;
  }

  .current-target h3 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.75rem;
  }

  .target-display {
    display: inline-flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .target-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: #3b82f6;
  }

  .target-label {
    font-size: 1rem;
    color: #6b7280;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .info-item {
    display: flex;
    gap: 0.75rem;
  }

  .icon {
    font-size: 1.5rem;
  }

  .info-content strong {
    display: block;
    font-size: 0.875rem;
    color: #374151;
    margin-bottom: 0.25rem;
  }

  .info-content p {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .btn-confirm {
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

  .btn-confirm:hover {
    background: #2563eb;
  }
</style>
