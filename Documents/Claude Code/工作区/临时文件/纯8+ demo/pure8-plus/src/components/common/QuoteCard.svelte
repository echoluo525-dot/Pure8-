<script lang="ts">
  import type { Quote } from '../../lib/types';

  export let quote: Quote | null = null;

  // 默认金句（如果没有加载）
  const defaultQuote = {
    content: '纯6就是纯6，没有一分钟的水分。',
    author: '白诗诗',
    source: '知识星球'
  };

  $: displayQuote = quote || defaultQuote;
</script>

<div class="quote-card">
  <div class="quote-icon">💡</div>
  <p class="quote-content">{displayQuote.content}</p>
  <p class="quote-author">
    —— {displayQuote.author}
    {#if displayQuote.source}
      <span class="quote-source"> | {displayQuote.source}</span>
    {/if}
  </p>
</div>

<style>
  .quote-card {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 1rem;
  }

  .quote-icon {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
  }

  .quote-content {
    font-size: 0.925rem;
    color: #92400e;
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .quote-author {
    font-size: 0.875rem;
    color: #b45309;
  }

  .quote-source {
    color: #78350f;
  }
</style>
