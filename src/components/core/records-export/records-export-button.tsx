import {
  exportRecord,
  exportRecordsSearch,
  type RecordsExportApiOptions
} from '@/services';
import { downloadBlob } from '@/utils';
import React, { useState } from 'react';
import { Button, Icon, Popup } from 'semantic-ui-react';

/** Shared visual options for CSV export buttons. */
interface RecordsExportButtonBaseProps extends RecordsExportApiOptions {
  /** Whether the Semantic UI button should use basic styling. */
  basic?: boolean;
  /** Additional CSS class name applied to the button. */
  className?: string;
  /** Whether the Semantic UI button should use compact spacing. */
  compact?: boolean;
  /** Visible button label shown when iconOnly is false. */
  content?: string;
  /** Whether the export button is disabled. */
  disabled?: boolean;
  /** Whether to render only the export icon. */
  iconOnly?: boolean;
  /** Whether search exports should include current pagination params. */
  includePagination?: boolean;
  /** React-SearchKit query state used by search-result export. */
  queryState?: Record<string, unknown>;
  /** Semantic UI button size. */
  size?: 'mini' | 'tiny' | 'small' | 'medium' | 'large';
  /** Tooltip text shown when the export button has no error. */
  title?: string;
}

/** Props for rendering a single-record CSV export button. */
export interface ExportRecordButtonProps extends RecordsExportButtonBaseProps {
  /** Invenio record ID to export. */
  recordId?: string | null;
}

/** Props for rendering a search-results CSV export button. */
export interface ExportSearchResultsButtonProps
  extends RecordsExportButtonBaseProps {}

/** Renders a stateful CSV export button for a supplied export operation. */
const RecordsExportButton: React.FC<
  RecordsExportButtonBaseProps & {
    /** Callback that returns the CSV blob and download filename. */
    onExport: () => Promise<{ blob: Blob; filename: string }>;
  }
> = ({
  basic = true,
  className,
  compact,
  content = 'Export CSV',
  disabled,
  iconOnly = false,
  onExport,
  size = 'small',
  title = 'Download CSV export.'
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /** Runs the export operation and downloads the returned CSV blob. */
  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      // Keep browser download behavior in the shared utility used by row actions.
      const { blob, filename } = await onExport();
      downloadBlob(blob, filename);
    } catch (exportError) {
      setError(
        exportError instanceof Error ? exportError : new Error('Export failed')
      );
    } finally {
      setIsExporting(false);
    }
  };

  const button = (
    <Button
      basic={basic}
      className={className}
      compact={compact}
      disabled={disabled || isExporting}
      icon={iconOnly}
      labelPosition={iconOnly ? undefined : 'left'}
      loading={isExporting}
      negative={!!error}
      onClick={handleExport}
      size={size}
      type='button'
    >
      <Icon name={error ? 'exclamation triangle' : 'download'} />
      {!iconOnly && content}
    </Button>
  );

  return (
    <Popup
      content={error?.message || title}
      position='top center'
      size='small'
      trigger={button}
    />
  );
};

/** Renders a button that exports a single Invenio record as CSV. */
export const ExportRecordButton: React.FC<ExportRecordButtonProps> = ({
  accept,
  fallbackAccepts,
  filename,
  headers,
  recordId,
  url,
  ...buttonProps
}) => {
  return (
    <RecordsExportButton
      {...buttonProps}
      disabled={buttonProps.disabled || !recordId}
      onExport={() =>
        exportRecord(recordId || '', {
          accept,
          fallbackAccepts,
          filename,
          headers,
          url
        })
      }
      title={
        recordId
          ? (buttonProps.title ?? 'Download this record as CSV.')
          : 'No exported record is available yet.'
      }
    />
  );
};

/** Renders a button that exports the current records search as CSV. */
export const ExportSearchResultsButton: React.FC<
  ExportSearchResultsButtonProps
> = ({
  accept,
  fallbackAccepts,
  filename,
  headers,
  includePagination,
  queryState,
  url,
  ...buttonProps
}) => {
  return (
    <RecordsExportButton
      {...buttonProps}
      onExport={() =>
        exportRecordsSearch({
          accept,
          fallbackAccepts,
          filename,
          headers,
          includePagination,
          queryState,
          url
        })
      }
      title={buttonProps.title ?? 'Download matching records as CSV.'}
    />
  );
};
