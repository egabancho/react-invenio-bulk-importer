import { getRecordTypes, getSerializers } from '@/services';
import type { ImporterTaskConfig } from '@/types';
import { sanitizeTaskOptions } from '@/utils';
import { useFormikContext } from 'formik';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ImportFormValues } from '../../import-form.types';

/**
 * Custom hook to manage form content for the import modal.
 *
 * @returns An object containing the current form values, submission function, loading state, and validation state.
 */
export const useFormContent = () => {
  const [configs, setConfigs] = useState<Record<string, ImporterTaskConfig>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const previousRecordTypeRef = useRef('');
  const previousSerializerRef = useRef('');
  const { values, submitForm, isSubmitting, isValid, setFieldValue } =
    useFormikContext<ImportFormValues>();

  /**
   * Fetches available record types and their corresponding serializer configurations.
   *
   * This function retrieves all record types from the API, then for each type,
   * fetches its associated serializer configuration. The configurations are stored
   * in a record mapping type names to their ImporterTaskConfig objects.
   *
   * @async
   * @returns A promise that resolves when all record types and configurations have been fetched
   * @throws Will log errors to console if fetching record types or serializers fails
   */
  const fetchRecordTypes = useCallback(async () => {
    try {
      const types = await getRecordTypes();
      const newConfigs: Record<string, ImporterTaskConfig> = {};

      for (const type of types) {
        const serializer = await getSerializers(type);
        if (serializer) {
          newConfigs[type] = serializer;
        }
      }

      setConfigs(newConfigs);
    } catch (error) {
      console.error('Error fetching record types:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handles changes to the metadata file input field.
   *
   * This function updates the form state with the selected file.
   *
   * @param event - The change event from the file input element.
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFieldValue('metadata', file);
  };

  /**
   * Handles changes to the files input field.
   *
   * This function updates the form state with the selected files.
   *
   * @param files - An array of File objects representing the selected files.
   */
  const handleFilesChange = (files: File[]) => {
    setFieldValue('files', files);
  };

  // Fetch record types on component mount
  useEffect(() => {
    fetchRecordTypes();
  }, [fetchRecordTypes]);

  useEffect(() => {
    const currentRecordType = values.task.recordType;

    if (currentRecordType === previousRecordTypeRef.current) {
      return;
    }

    previousRecordTypeRef.current = currentRecordType;
    setFieldValue('task.serializer', '');

    if (!currentRecordType) {
      setFieldValue('task.options', {});
      return;
    }

    setFieldValue(
      'task.options',
      sanitizeTaskOptions(configs[currentRecordType]?.options)
    );
  }, [configs, setFieldValue, values.task.recordType]);

  // A file chosen for another serializer is in the wrong format for this one.
  useEffect(() => {
    const currentSerializer = values.task.serializer;

    if (currentSerializer === previousSerializerRef.current) {
      return;
    }

    previousSerializerRef.current = currentSerializer;
    setFieldValue('metadata', null);
  }, [setFieldValue, values.task.serializer]);

  return {
    configs,
    isLoading,
    values,
    submitForm,
    setFieldValue,
    handleFileChange,
    handleFilesChange,
    isSubmitting,
    isValid
  };
};
