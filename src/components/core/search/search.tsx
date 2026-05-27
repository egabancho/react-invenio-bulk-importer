import type { SearchConfig } from '@/types';
import React from 'react';
import { OverridableContext } from 'react-overridable';
import {
  EmptyResults,
  InvenioSearchApi,
  ReactSearchKit,
  ResultsList,
  ResultsLoader
} from 'react-searchkit';
import {
  AggregationBucket,
  AggregationBucketValues
} from './aggregation-bucket';
import { SearchProvider } from './provider';
import { ResultItem } from './result-item';
import { ResultsTable } from './results-table';
import { ResultsToolbar } from './results-toolbar';
import { defaultSearchConfig } from './search.config';
import { styles } from './search.styles';
import type { SearchProps } from './search.types';
import { SearchBarRow } from './search-bar-row';
import { SearchFacets } from './search-facets';
import { SearchFooter } from './search-footer';

/** Renders the reusable SearchKit-powered importer search UI. */
export const Search: React.FC<SearchProps> = ({
  config: userConfig = {},
  overriddenComponents: userOverrides = {}
}) => {
  const exportApi = {
    ...defaultSearchConfig.exportApi,
    ...userConfig.exportApi,
    headers: {
      ...defaultSearchConfig.exportApi.headers,
      ...userConfig.exportApi?.headers
    }
  };
  const searchApiConfig = {
    ...defaultSearchConfig.searchApi,
    ...userConfig.searchApi,
    axios: {
      ...defaultSearchConfig.searchApi.axios,
      ...userConfig.searchApi?.axios,
      headers: {
        ...defaultSearchConfig.searchApi.axios.headers,
        ...userConfig.searchApi?.axios?.headers
      }
    },
    invenio: {
      ...defaultSearchConfig.searchApi.invenio,
      ...userConfig.searchApi?.invenio
    }
  };
  const isRecordsApiSearch = searchApiConfig.axios.url === exportApi.url;

  // Merge nested config objects explicitly so partial user overrides do not
  // erase required defaults such as headers, export fallbacks, or pagination.
  const config: SearchConfig = {
    ...defaultSearchConfig,
    ...userConfig,
    exportApi,
    initialQueryState: {
      ...defaultSearchConfig.initialQueryState,
      ...userConfig.initialQueryState
    },
    layoutOptions: {
      ...defaultSearchConfig.layoutOptions,
      ...userConfig.layoutOptions
    },
    paginationOptions: {
      ...defaultSearchConfig.paginationOptions,
      ...userConfig.paginationOptions,
      resultsPerPage:
        userConfig.paginationOptions?.resultsPerPage ||
        defaultSearchConfig.paginationOptions.resultsPerPage
    },
    searchApi: searchApiConfig,
    showExportButton:
      userConfig.showExportButton ??
      // Record searches can export by default; embedded importer-record searches opt out.
      (defaultSearchConfig.showExportButton || isRecordsApiSearch),
    showFacets: userConfig.showFacets ?? defaultSearchConfig.showFacets ?? true,
    showImportModal:
      userConfig.showImportModal ?? defaultSearchConfig.showImportModal ?? true,
    showSearchFooter:
      userConfig.showSearchFooter ??
      defaultSearchConfig.showSearchFooter ??
      true
  };

  const searchApi = new InvenioSearchApi(config.searchApi);

  const overriddenComponents = {
    [`${config.appId}.ResultsList.item`]: ResultItem,
    [`${config.appId}.ResultsList.container`]: ResultsTable,
    [`${config.appId}.BucketAggregation.element`]: AggregationBucket,
    [`${config.appId}.BucketAggregationValues.element`]:
      AggregationBucketValues,
    ...userOverrides
  };

  return (
    <OverridableContext.Provider value={overriddenComponents}>
      <ReactSearchKit
        appName={config.appId}
        searchApi={searchApi}
        initialQueryState={config.initialQueryState}
      >
        <SearchProvider config={config}>
          <div className={styles.searchLayout}>
            <SearchFacets />
            <div className={styles.searchContent}>
              <SearchBarRow appId={config.appId} />
              <ResultsToolbar />
              <ResultsLoader>
                <EmptyResults />
                <ResultsList />
              </ResultsLoader>
              {config.showSearchFooter && <SearchFooter />}
            </div>
          </div>
        </SearchProvider>
      </ReactSearchKit>
    </OverridableContext.Provider>
  );
};
