<script lang="ts">
  import { userStore } from '../../stores';

  let agreed = false;
  let isAnimating = false;

  async function handleConfirm() {
    if (!agreed) return;

    isAnimating = true;
    await userStore.activateConstitution();
  }
</script>

<div class="constitution">
  <div class="container">
    <!-- 头部 -->
    <header class="header">
      <div class="icon">📜</div>
      <h1>自我宪法</h1>
      <p>确定目标后严格执行，就像遵守宪法一样神圣</p>
    </header>

    <!-- 主要内容 -->
    <main class="main">
      <section class="pledge">
        <div class="pledge-card">
          <p class="pledge-text">
            我承诺，每日纯时间不少于
            <span class="target">{$userStore.config?.customPureTarget || 6}</span>
            小时
          </p>
        </div>
      </section>

      <!-- 三原则 -->
      <section class="principles">
        <h2>宪法三原则</h2>
        <div class="principle-list">
          <div class="principle">
            <div class="principle-icon">📊</div>
            <div class="principle-content">
              <strong>尊重事实数据</strong>
              <p>平均3.5h就是3.5h，不假装是6h</p>
            </div>
          </div>
          <div class="principle">
            <div class="principle-icon">⚖️</div>
            <div class="principle-content">
              <strong>严格执行</strong>
              <p>低意愿也要完成，维护宪法神圣性</p>
            </div>
          </div>
          <div class="principle">
            <div class="principle-icon">💯</div>
            <div class="principle-content">
              <strong>对自己完全诚实</strong>
              <p>精确到分钟，不掺水</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 说明 -->
      <section class="explanation">
        <p>
          为什么叫"宪法"？因为一旦确定，就像宪法一样神圣，不可轻易违背。
          对自己失信，有了第一次就会有第二次。
        </p>
        <p>
          但是，这并不意味着你必须痛苦坚持。当你能达成宪法，形成生态后，
          甚至会变成享受。就像白诗诗说的："原来它是不一样的世界，只有体会了才知道。"
        </p>
      </section>

      <!-- 同意确认 -->
      <label class="agreement">
        <input type="checkbox" bind:checked={agreed} />
        <span>我理解并承诺遵守此宪法</span>
      </label>

      <!-- 确认按钮 -->
      <button
        class="btn-confirm"
        class:disabled={!agreed || isAnimating}
        on:click={handleConfirm}
      >
        {#if isAnimating}
          <span class="spinner"></span>
        {:else}
          确认并开始记录
        {/if}
      </button>

      <!-- 跳过 -->
      <button class="btn-skip" on:click={handleConfirm}>
        稍后设定（先体验一下）
      </button>
    </main>
  </div>
</div>

<style>
  .constitution {
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

  .header .icon {
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

  .pledge {
    margin-bottom: 2rem;
  }

  .pledge-card {
    text-align: center;
    padding: 2rem;
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    border-radius: 1rem;
    border: 2px solid #3b82f6;
  }

  .pledge-text {
    font-size: 1.125rem;
    color: #1e40af;
    line-height: 1.6;
  }

  .target {
    display: inline-block;
    font-size: 1.5rem;
    font-weight: 700;
    color: #3b82f6;
    padding: 0 0.25rem;
  }

  .principles {
    margin-bottom: 2rem;
  }

  .principles h2 {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 1rem;
  }

  .principle-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .principle {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 0.75rem;
  }

  .principle-icon {
    font-size: 1.5rem;
  }

  .principle-content strong {
    display: block;
    font-size: 0.875rem;
    color: #374151;
    margin-bottom: 0.25rem;
  }

  .principle-content p {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .explanation {
    margin-bottom: 2rem;
    padding: 1rem;
    background: #fef3c7;
    border-radius: 0.75rem;
  }

  .explanation p {
    font-size: 0.875rem;
    color: #92400e;
    line-height: 1.6;
    margin-bottom: 0.5rem;
  }

  .explanation p:last-child {
    margin-bottom: 0;
  }

  .agreement {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 0.75rem;
    cursor: pointer;
  }

  .agreement input[type="checkbox"] {
    width: 1.25rem;
    height: 1.25rem;
    accent-color: #3b82f6;
  }

  .agreement span {
    font-size: 0.875rem;
    color: #374151;
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
    margin-bottom: 0.75rem;
  }

  .btn-confirm:hover:not(.disabled) {
    background: #2563eb;
  }

  .btn-confirm.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid #ffffff;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .btn-skip {
    width: 100%;
    padding: 0.75rem;
    background: transparent;
    color: #6b7280;
    border: none;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    cursor: pointer;
  }

  .btn-skip:hover {
    color: #374151;
  }
</style>
