/** Axios configuration used by the SearchKit API client. */
export interface SearchApiConfig {
  /** Axios request options for the search endpoint. */
  axios: {
    /** Headers sent with each search request. */
    headers?: Record<string, string>;
    /** Search endpoint URL. */
    url?: string;
    /** Whether requests should include browser credentials. */
    withCredentials?: boolean;
  };
  /** Invenio-specific SearchKit serializer configuration. */
  invenio?: {
    /** Name of the request serializer used by React-SearchKit. */
    requestSerializer?: string;
  };
}

/** Sort option shown in the search sort dropdown. */
export interface SortOption {
  /** Sort key sent to the API. */
  sortBy: string;
  /** Human-readable sort option label. */
  text: string;
}

/** Default sort option used when the query string is empty. */
export interface DefaultSortingOption {
  /** Sort key sent to the API. */
  sortBy: string;
}

/** Initial React-SearchKit query state. */
export interface InitialQueryState {
  /** Selected facet filters. */
  filters?: unknown[];
  /** Hidden filters always sent with the query. */
  hiddenParams?: unknown | null;
  /** Active result layout. */
  layout?: string;
  /** Active page number. */
  page?: number;
  /** Number of results per page. */
  size?: number;
  /** Active sort key. */
  sortBy?: string;
  /** Free-text search query. */
  queryString?: string;
}

/** Enabled search result layout modes. */
export interface LayoutOptions {
  /** Whether grid view is available. */
  gridView: boolean;
  /** Whether list view is available. */
  listView: boolean;
}

/** Results-per-page dropdown option. */
export interface ResultsPerPageOption {
  /** Human-readable option label. */
  text: string;
  /** Page size value sent to SearchKit. */
  value: number;
}

/** Pagination configuration for search results. */
export interface PaginationOptions {
  /** Default selected page size. */
  defaultValue: number;
  /** Maximum number of results SearchKit can page through. */
  maxTotalResults: number;
  /** Available page size options. */
  resultsPerPage: ResultsPerPageOption[];
}

/** CSV export API configuration for records search. */
export interface RecordsExportApiConfig {
  /** Primary Accept header or ordered headers for export requests. */
  accept: string | string[];
  /** Additional Accept headers retried after 406 responses. */
  fallbackAccepts?: string[];
  /** Download filename used when the API does not provide one. */
  filename: string;
  /** Additional headers sent with the export request. */
  headers?: Record<string, string>;
  /** Whether exports should include current pagination params. */
  includePagination: boolean;
  /** Records API URL used for search exports. */
  url: string;
}

/** Full configuration object for the reusable search UI. */
export interface SearchConfig {
  /** Facet aggregation configuration consumed by SearchKit. */
  aggs: unknown[];
  /** SearchKit application ID used for overridable component keys. */
  appId: string;
  /** Sort options used before the user enters a query. */
  defaultSortingOnEmptyQueryString: DefaultSortingOption[];
  /** Records CSV export configuration. */
  exportApi: RecordsExportApiConfig;
  /** Initial SearchKit query state. */
  initialQueryState: InitialQueryState;
  /** Enabled result layout modes. */
  layoutOptions: LayoutOptions;
  /** Pagination and page-size configuration. */
  paginationOptions: PaginationOptions;
  /** Base UI route used for task detail links. */
  resultPath: string;
  /** Search API configuration. */
  searchApi: SearchApiConfig;
  /** Sort dropdown options. */
  sortOptions: SortOption[];
  /** Whether manual sort direction controls are disabled. */
  sortOrderDisabled: boolean;
  /** Whether to render the search-level CSV export button. */
  showExportButton?: boolean;
  /** Whether to render facet filters. */
  showFacets?: boolean;
  /** Whether to render the new import modal trigger. */
  showImportModal?: boolean;
  /** Whether to render pagination and page-size controls. */
  showSearchFooter?: boolean;
}
