import { FileUploader } from '@/components/core';
import { ProgressLoading, Spinner } from '@/components/ui';
import type { OrchestrationSteps } from '@/types';
import {
  formatOptionLabel,
  getMetadataFileFormat,
  getTaskOptionEntries
} from '@/utils';
import React, { Fragment } from 'react';
import {
  BooleanField,
  SelectField,
  TextAreaField,
  TextField
} from 'react-invenio-forms';
import { Button, Form } from 'semantic-ui-react';
import { styles } from './form-content.styles';
import { useFormContent } from './hooks';

interface FormContentProps {
  progress?: Record<OrchestrationSteps, number>;
}

export const FormContent: React.FC<FormContentProps> = ({ progress }) => {
  const {
    configs,
    isLoading,
    submitForm,
    handleFileChange,
    handleFilesChange,
    values,
    isSubmitting,
    isValid
  } = useFormContent();
  const selectedOptions = values.task.recordType
    ? configs[values.task.recordType]?.options || {}
    : {};
  const selectedOptionEntries = getTaskOptionEntries(selectedOptions);

  if (isLoading) {
    return <Spinner />;
  }

  if (!configs || Object.keys(configs).length === 0) {
    return <p>No record types available.</p>;
  }

  const metadataFormat = getMetadataFileFormat(values.task.serializer);

  return (
    <Fragment>
      <TextField
        fieldPath='task.title'
        label='Title'
        placeholder='Enter a title for the import task'
        required
      />

      <Form.Group widths='equal'>
        <SelectField
          fieldPath='task.recordType'
          label='Record Type'
          options={Object.keys(configs).map(type => ({
            key: type,
            value: type,
            text: type
          }))}
          placeholder='Select Record Type'
          required
        />

        <SelectField
          fieldPath='task.serializer'
          label='Serializer'
          options={
            values.task.recordType && configs[values.task.recordType]
              ? configs[values.task.recordType].serializers.map(serializer => ({
                  key: serializer,
                  value: serializer,
                  text: serializer
                }))
              : []
          }
          placeholder='Select Serializer'
          disabled={!values.task.recordType}
          required
        />

        <SelectField
          fieldPath='task.mode'
          label='Mode'
          options={[
            { key: 'import', value: 'import', text: 'Import' },
            { key: 'delete', value: 'delete', text: 'Delete' }
          ]}
          placeholder='Select Mode'
          disabled={!values.task.recordType || !values.task.serializer}
          required
        />
      </Form.Group>

      {selectedOptionEntries.length > 0 && (
        <Form.Field as='fieldset' className={styles.optionsSection}>
          <legend className={styles.optionsLegend}>Options</legend>
          {selectedOptionEntries.map(([optionKey]) => (
            <BooleanField
              key={optionKey}
              fieldPath={`task.options.${optionKey}`}
              label={formatOptionLabel(optionKey)}
            />
          ))}
        </Form.Field>
      )}

      <Form.Field>
        <label htmlFor={'file-input'}>Metadata File</label>
        <input
          id={'file-input'}
          type='file'
          accept={metadataFormat.accept}
          onChange={handleFileChange}
          className={styles.fileInput}
        />
        {values.metadata && (
          <p className={styles.helpText}>Selected: {values.metadata.name}</p>
        )}
        <p className={styles.helpText}>
          Upload a {metadataFormat.label} file containing the records metadata
          to be imported or deleted.
        </p>
      </Form.Field>

      <Form.Field>
        <FileUploader
          value={values.files || []}
          onChange={handleFilesChange}
          accept='*'
          skipEmptyFiles
          maxTotalSize={10 * 1024 * 1024 * 1024} // 10 GB
          maxFiles={100}
        />
        <p className={styles.helpText}>
          Upload files related to the records. You can upload multiple files,
          and they will be associated with the import task.
        </p>
      </Form.Field>

      <TextAreaField
        fieldPath='task.description'
        label='Notes'
        placeholder='Enter a description for the import task'
        rows={3}
      />

      <div className={styles.buttonContainer}>
        {progress && <ProgressLoading progress={progress} />}
        <Button
          type='button'
          primary
          onClick={submitForm}
          disabled={!isValid || isSubmitting}
          loading={isSubmitting}
        >
          Submit
        </Button>
      </div>
    </Fragment>
  );
};
