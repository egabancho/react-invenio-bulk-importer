import type {
  OverridableComponents,
  RecordsExportApiConfig,
  SearchApiConfig,
  SearchConfig
} from '@/types';

/** Search API config override accepted by the Search component. */
type SearchApiConfigOverride = Partial<Omit<SearchApiConfig, 'axios'>> & {
  /** Partial Axios config merged with the default SearchKit Axios config. */
  axios?: Partial<SearchApiConfig['axios']>;
};

/** Partial search config accepted by the Search component. */
export type SearchConfigOverride = Partial<
  Omit<SearchConfig, 'exportApi' | 'searchApi'>
> & {
  /** Partial CSV export config merged with the default export config. */
  exportApi?: Partial<RecordsExportApiConfig>;
  /** Partial search API config merged with the default search API config. */
  searchApi?: SearchApiConfigOverride;
};

/** Props for rendering the reusable Search component. */
export interface SearchProps {
  /** Optional search configuration overrides. */
  config?: SearchConfigOverride;
  /** Optional component override registry for react-overridable. */
  overriddenComponents?: OverridableComponents;
  /**
   * Re-runs the current search, filters and page kept, whenever this value
   * changes. Lets a parent refresh the results without remounting them.
   */
  refreshSignal?: number;
}
