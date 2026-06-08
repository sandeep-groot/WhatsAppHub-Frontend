/**
 * Zustand filters store for managing filter state
 */

import { create } from "zustand";

interface FiltersState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dateRange: { from: Date; to: Date } | null;
  setDateRange: (range: { from: Date; to: Date } | null) => void;
  reset: () => void;
}

export const useFiltersStore = create<FiltersState>((set) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  dateRange: null,
  setDateRange: (range) => set({ dateRange: range }),
  reset: () => set({ searchQuery: "", dateRange: null }),
}));
