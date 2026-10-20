import type { InvenioImporterRecord } from '@/types';
import React from 'react';
import { Table } from 'semantic-ui-react';
import { styles } from './source-data-tab.styles';

interface SourceDataTabProps {
  record: InvenioImporterRecord;
}

/**
 * Whether a source value has nothing worth showing.
 * CSV rows hold strings only; ONIX entries also hold numbers, lists and objects.
 */
const isEmptyValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  return false;
};

/** Renders scalars as text and structured values as indented JSON. */
const renderValue = (value: unknown) =>
  typeof value === 'object' ? (
    <pre className={styles.structuredValue}>
      {JSON.stringify(value, null, 2)}
    </pre>
  ) : (
    String(value)
  );

export const SourceDataTab: React.FC<SourceDataTabProps> = ({ record }) => {
  return (
    <Table celled striped>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Field</Table.HeaderCell>
          <Table.HeaderCell>Value</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {Object.entries(record.src_data ?? {})
          .filter(([_, value]) => !isEmptyValue(value))
          .map(([key, value]) => (
            <Table.Row key={key}>
              <Table.Cell>
                <strong>{key}</strong>
              </Table.Cell>
              <Table.Cell className={styles.valueCell}>
                {renderValue(value)}
              </Table.Cell>
            </Table.Row>
          ))}
      </Table.Body>
    </Table>
  );
};
