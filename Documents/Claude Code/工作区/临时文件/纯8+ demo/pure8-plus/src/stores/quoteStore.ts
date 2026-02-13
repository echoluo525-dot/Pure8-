import { writable, derived, get } from 'svelte/store';
import type { Quote } from '../lib/types';
import { quoteStore as dbQuoteStore } from '../lib/db';

// ============================================
// Quote Store
// ============================================

interface QuoteState {
  daily: Quote | null;
  all: Quote[];
  favorites: Quote[];
  loading: boolean;
  error: string | null;
}

const createQuoteStore = () => {
  const { subscribe, set, update } = writable<QuoteState>({
    daily: null,
    all: [],
    favorites: [],
    loading: true,
    error: null
  });

  return {
    subscribe,

    // 加载金句
    async load() {
      update(s => ({ ...s, loading: true, error: null }));

      try {
        const [daily, all] = await Promise.all([
          dbQuoteStore.getDaily(),
          dbQuoteStore.getAll()
        ]);

        set({
          daily,
          all,
          favorites: all.filter(q => q.userFavorite),
          loading: false,
          error: null
        });
      } catch (e) {
        set({
          daily: null,
          all: [],
          favorites: [],
          loading: false,
          error: (e as Error).message
        });
      }
    },

    // 刷新每日金句
    async refreshDaily() {
      const daily = await dbQuoteStore.getDaily();
      update(s => ({ ...s, daily }));
    },

    // 添加自定义金句
    async addCustom(quote: Omit<Quote, 'id' | 'createdAt' | 'displayCount'>) {
      await dbQuoteStore.addCustom(quote);
      await this.load();
    },

    // 切换收藏状态
    toggleFavorite(quoteId: string) {
      update(s => {
        const newAll = s.all.map(q => {
          if (q.id === quoteId) {
            return { ...q, userFavorite: !q.userFavorite };
          }
          return q;
        });

        const newFavorites = newAll.filter(q => q.userFavorite);

        return {
          ...s,
          all: newAll,
          favorites: newFavorites
        };
      });
    }
  };
};

export const quoteStore = createQuoteStore();

// ============================================
// Derived Stores
// ============================================

// 今日金句
export const dailyQuote = derived(quoteStore, ($quote) => $quote.daily);

// 所有金句
export const allQuotes = derived(quoteStore, ($quote) => $quote.all);

// 收藏的金句
export const favoriteQuotes = derived(quoteStore, ($quote) => $quote.favorites);
