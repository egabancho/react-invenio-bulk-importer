import { apiClient } from '@/api';

export const BULK_CSV_ACCEPT_HEADER = 'application/vnd.inveniordm.v1.bulk+csv';
export const FULL_CSV_ACCEPT_HEADER = 'application/vnd.inveniordm.v1.full+csv';
export const SIMPLE_CSV_ACCEPT_HEADER =
  'application/vnd.inveniordm.v1.simple+csv';

/** Options shared by single-record and search-result CSV export requests. */
export interface RecordsExportApiOptions {
  /** Primary Accept header or ordered list of Accept headers to try first. */
  accept?: string | string[];
  /** Additional Accept headers to retry when the API rejects a media type. */
  fallbackAccepts?: string[];
  /** Download filename to use when the API does not provide one. */
  filename?: string;
  /** Additional request headers to send with the export request. */
  headers?: Record<string, string>;
  /** Records API URL used as the export endpoint. */
  url?: string;
}

/** Options for exporting records matching a search query. */
export interface RecordsSearchExportOptions extends RecordsExportApiOptions {
  /** Whether to include the current page and page size in the export request. */
  includePagination?: boolean;
  /** React-SearchKit query state to serialize into the export request. */
  queryState?: Record<string, unknown>;
}

const DEFAULT_RECORDS_API_URL = '/api/records';
const DEFAULT_SEARCH_EXPORT_FILENAME = 'records-export.csv';
const DEFAULT_FALLBACK_ACCEPT_HEADERS = [
  FULL_CSV_ACCEPT_HEADER,
  SIMPLE_CSV_ACCEPT_HEADER
];
const FILENAME_PATTERN = /filename="?([^";]+)"?/i;
const TRAILING_SLASH_PATTERN = /\/$/;
const UTF8_FILENAME_PATTERN = /filename\*=UTF-8''([^;]+)/i;

/** Returns whether a value is a non-empty string. */
const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.length > 0;
};

/** Extracts an HTTP status code from an Axios-like error object. */
const getErrorStatus = (error: unknown) => {
  if (!error || typeof error !== 'object' || !('response' in error)) {
    return null;
  }

  const response = (error as { response?: { status?: unknown } }).response;
  return typeof response?.status === 'number' ? response.status : null;
};

/** Returns a displayable error message for an unknown thrown value. */
const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Unknown error';
};

/** Builds the ordered list of unique Accept headers to try for CSV export. */
const getAcceptHeaders = (
  accept: string | string[] = BULK_CSV_ACCEPT_HEADER,
  fallbackAccepts = DEFAULT_FALLBACK_ACCEPT_HEADERS
) => {
  const primaryAccepts = Array.isArray(accept) ? accept : [accept];
  return Array.from(
    new Set([...primaryAccepts, ...fallbackAccepts].filter(isNonEmptyString))
  );
};

/** Retries an export request with fallback Accept headers after 406 responses. */
const requestWithAcceptFallback = async (
  acceptHeaders: string[],
  request: (accept: string) => Promise<{ blob: Blob; filename: string }>
) => {
  let lastError: unknown = null;

  for (const accept of acceptHeaders) {
    try {
      return await request(accept);
    } catch (error) {
      lastError = error;

      // Only media-type negotiation errors should move to the next CSV format.
      if (getErrorStatus(error) !== 406) {
        break;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Export failed');
};

/** Appends a single React-SearchKit filter tuple to URL search params. */
const appendSearchFilter = (searchParams: URLSearchParams, filter: unknown) => {
  if (!Array.isArray(filter) || filter.length < 2) {
    return;
  }

  const [key, value, child] = filter;

  if (!isNonEmptyString(key) || typeof value !== 'string') {
    return;
  }

  // Child aggregation filters use the same "parent::child" shape as SearchKit.
  if (Array.isArray(child) && typeof child[1] === 'string') {
    searchParams.append(key, `${value}::${child[1]}`);
    return;
  }

  searchParams.append(key, value);
};

/** Appends every filter tuple from a React-SearchKit filter collection. */
const appendSearchFilters = (
  searchParams: URLSearchParams,
  filters: unknown
) => {
  if (!Array.isArray(filters)) {
    return;
  }

  filters.forEach(filter => appendSearchFilter(searchParams, filter));
};

/** Serializes React-SearchKit query state into Invenio records query params. */
export const serializeRecordsSearchParams = (
  queryState: Record<string, unknown> = {},
  includePagination = false
) => {
  const searchParams = new URLSearchParams();
  const { queryString, sortBy, sortOrder, page, size, hiddenParams, filters } =
    queryState;

  // Keep parity with InvenioRecordsResourcesRequestSerializer for search terms.
  if (typeof queryString === 'string') {
    searchParams.set('q', queryString);
  }

  // Invenio marks descending sort by prefixing the sort key with "-".
  if (isNonEmptyString(sortBy)) {
    searchParams.set('sort', sortOrder === 'desc' ? `-${sortBy}` : sortBy);
  }

  // Search export should usually include all matches, so pagination is opt-in.
  if (includePagination) {
    if (typeof page === 'number' && page > 0) {
      searchParams.set('page', String(page));
    }

    if (typeof size === 'number' && size > 0) {
      searchParams.set('size', String(size));
    }
  }

  appendSearchFilters(searchParams, hiddenParams);
  appendSearchFilters(searchParams, filters);

  return searchParams.toString();
};

/** Extracts a filename from a Content-Disposition response header. */
const getFilenameFromContentDisposition = (headerValue?: string) => {
  if (!headerValue) {
    return null;
  }

  const utf8FilenameMatch = headerValue.match(UTF8_FILENAME_PATTERN);

  if (utf8FilenameMatch?.[1]) {
    return decodeURIComponent(utf8FilenameMatch[1].trim());
  }

  const filenameMatch = headerValue.match(FILENAME_PATTERN);
  return filenameMatch?.[1]?.trim() || null;
};

/** Resolves a download filename from response headers or a fallback name. */
const getResponseFilename = (
  headers: Record<string, unknown>,
  fallback: string
) => {
  const contentDisposition = headers['content-disposition'];

  if (typeof contentDisposition !== 'string') {
    return fallback;
  }

  return getFilenameFromContentDisposition(contentDisposition) || fallback;
};

/** Exports a single Invenio record as CSV. */
export const exportRecord = async (
  recordId: string,
  options: RecordsExportApiOptions = {}
) => {
  const {
    accept = BULK_CSV_ACCEPT_HEADER,
    fallbackAccepts,
    filename = `${recordId}.csv`,
    headers = {},
    url = DEFAULT_RECORDS_API_URL
  } = options;

  try {
    const recordUrl = `${url.replace(
      TRAILING_SLASH_PATTERN,
      ''
    )}/${encodeURIComponent(recordId)}`;

    // Try the configured export media type first, then compatible CSV fallbacks.
    return await requestWithAcceptFallback(
      getAcceptHeaders(accept, fallbackAccepts),
      async acceptHeader => {
        const response = await apiClient.get<Blob>(recordUrl, {
          headers: {
            ...headers,
            Accept: acceptHeader
          },
          responseType: 'blob'
        });

        return {
          blob: response.data,
          filename: getResponseFilename(response.headers, filename)
        };
      }
    );
  } catch (error) {
    throw new Error(`Error exporting record: ${getErrorMessage(error)}`);
  }
};

/** Exports records matching a React-SearchKit query as CSV. */
export const exportRecordsSearch = async (
  options: RecordsSearchExportOptions = {}
) => {
  const {
    accept = BULK_CSV_ACCEPT_HEADER,
    fallbackAccepts,
    filename = DEFAULT_SEARCH_EXPORT_FILENAME,
    headers = {},
    includePagination = false,
    queryState = {},
    url = DEFAULT_RECORDS_API_URL
  } = options;

  try {
    // The query state is serialized at request time so each retry is identical.
    return await requestWithAcceptFallback(
      getAcceptHeaders(accept, fallbackAccepts),
      async acceptHeader => {
        const response = await apiClient.get<Blob>(url, {
          headers: {
            ...headers,
            Accept: acceptHeader
          },
          params: queryState,
          paramsSerializer: {
            serialize: params =>
              serializeRecordsSearchParams(
                params as Record<string, unknown>,
                includePagination
              )
          },
          responseType: 'blob'
        });

        return {
          blob: response.data,
          filename: getResponseFilename(response.headers, filename)
        };
      }
    );
  } catch (error) {
    throw new Error(
      `Error exporting records search: ${getErrorMessage(error)}`
    );
  }
};
