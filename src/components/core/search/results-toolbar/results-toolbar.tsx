import { ExportSearchResultsButton } from '@/components/core/records-export';
import React from 'react';
import { SortBy } from 'react-searchkit';
import { useSearch } from '../provider';
import { ResultsCount } from '../results-count';
import { SORT_BY_OPTIONS } from './results-toolbar.consts';
import { styles } from './results-toolbar.styles';

/** Renders result count, optional CSV export, and sorting controls. */
export const ResultsToolbar = () => {
  const { config, currentQueryState } = useSearch();

  return (
    <div className={styles.container}>
      <ResultsCount />
      <div className={styles.sortByContainer}>
        {/* Search-level export is only valid for record searches. */}
        {config.showExportButton && (
          <ExportSearchResultsButton
            accept={config.exportApi.accept}
            fallbackAccepts={config.exportApi.fallbackAccepts}
            filename={config.exportApi.filename}
            headers={config.exportApi.headers}
            includePagination={config.exportApi.includePagination}
            queryState={currentQueryState}
            url={config.exportApi.url}
          />
        )}
        <SortBy values={SORT_BY_OPTIONS} />
      </div>
    </div>
  );
};
