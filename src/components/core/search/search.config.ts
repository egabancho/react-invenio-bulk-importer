import type { SearchConfig } from '@/types';

export const defaultSearchConfig: SearchConfig = {
  aggs: [],
  appId: 'search',
  defaultSortingOnEmptyQueryString: [
    {
      sortBy: 'newest'
    }
  ],
  initialQueryState: {
    filters: [],
    hiddenParams: null,
    layout: 'list',
    page: 1,
    size: 10,
    sortBy: 'newest'
  },
  layoutOptions: {
    gridView: false,
    listView: true
  },
  paginationOptions: {
    defaultValue: 10,
    maxTotalResults: 10000,
    resultsPerPage: [
      {
        text: '10',
        value: 10
      },
      {
        text: '20',
        value: 20
      },
      {
        text: '50',
        value: 50
      }
    ]
  },
  exportApi: {
    accept: 'application/vnd.inveniordm.v1.bulk+csv',
    fallbackAccepts: [
      'application/vnd.inveniordm.v1.full+csv',
      'application/vnd.inveniordm.v1.simple+csv'
    ],
    filename: 'records-export.csv',
    includePagination: false,
    url: '/api/records'
  },
  searchApi: {
    axios: {
      headers: {
        Accept: 'application/vnd.inveniordm.v1+json'
      },
      url: '/api/importer-tasks',
      withCredentials: true
    },
    invenio: {
      requestSerializer: 'InvenioRecordsResourcesRequestSerializer'
    }
  },
  sortOptions: [
    {
      sortBy: 'newest',
      text: 'Newest'
    },
    {
      sortBy: 'oldest',
      text: 'Oldest'
    }
  ],
  sortOrderDisabled: true,
  showExportButton: false,
  resultPath: '/administration/importer-tasks'
};
