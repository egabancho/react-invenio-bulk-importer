import type { SearchConfig } from '@/types';
import React, { useCallback, useEffect, useRef } from 'react';
import { withState } from 'react-searchkit';

/** Context value exposed to search child components. */
export interface SearchContextProps {
  /** Resolved search configuration after defaults and overrides are merged. */
  config: SearchConfig;
  /** Current React-SearchKit query state. */
  currentQueryState: Record<string, unknown>;
  /** Function that refreshes results without changing the active query. */
  refreshSearch: () => void;
}

export const SearchContext = React.createContext<SearchContextProps | null>(
  null
);

/** Props injected into the search provider by React-SearchKit state. */
interface SearchProviderComponentProps {
  /** Resolved search configuration after defaults and overrides are merged. */
  config: SearchConfig;
  /** Search UI children rendered inside the provider. */
  children: React.ReactNode;
  /** React-SearchKit state updater for query changes. */
  updateQueryState: (queryState: Record<string, unknown>) => void;
  /** Current React-SearchKit query state. */
  currentQueryState: Record<string, unknown>;
  /** Re-runs the current search whenever it changes. */
  refreshSignal?: number;
}

const SearchProviderComponent: React.FC<SearchProviderComponentProps> = ({
  config,
  children,
  updateQueryState,
  currentQueryState,
  refreshSignal
}) => {
  /**
   * Refreshes the search results by updating the query state.
   * This function is used to trigger a new search with the current query string.
   */
  const refreshSearch = useCallback(() => {
    updateQueryState({
      ...currentQueryState,
      queryString: currentQueryState.queryString
    });
  }, [updateQueryState, currentQueryState]);

  // Refresh on a new signal only; the initial search already ran on mount.
  const lastSignal = useRef(refreshSignal);
  useEffect(() => {
    if (refreshSignal === lastSignal.current) {
      return;
    }
    lastSignal.current = refreshSignal;
    refreshSearch();
  }, [refreshSignal, refreshSearch]);

  return (
    <SearchContext.Provider
      value={{ config, currentQueryState, refreshSearch }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const SearchProvider = withState(SearchProviderComponent);

/** Returns the current search context value. */
export const useSearch = () => {
  const context = React.useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchConfig must be used within a SearchProvider');
  }
  return context;
};
