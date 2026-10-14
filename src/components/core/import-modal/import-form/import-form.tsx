import { createCompleteTask } from '@/services';
import type { OrchestrationSteps } from '@/types';
import React, { useState } from 'react';
import { BaseForm } from 'react-invenio-forms';
import { FormContent } from './form-content';
import {
  FORM_VALIDATION_SCHEMA,
  INITIAL_FORM_VALUES
} from './import-form.consts';
import type { ImportFormProps, ImportFormValues } from './import-form.types';

export const ImportForm: React.FC<ImportFormProps> = ({ onSubmit }) => {
  const [progress, setProgress] = useState<
    Record<OrchestrationSteps, number> | undefined
  >(undefined);
  /**
   * Handles form submission for the import task.
   * @param values The form values submitted by the user.
   */
  const handleSubmit = async (values: ImportFormValues) => {
    try {
      const task = await createCompleteTask(
        values.task,
        values.metadata,
        values.files,
        {
          autoValidate: !!values.metadata,
          onProgress(step, progress) {
            setProgress({
              [step]: progress
            } as Record<OrchestrationSteps, number>);
          }
        }
      );
      onSubmit?.(task);
    } catch (error) {
      console.error('Error creating import task:', error);
      throw error;
    }
  };

  return (
    <BaseForm
      formik={{
        initialValues: INITIAL_FORM_VALUES,
        validationSchema: FORM_VALIDATION_SCHEMA,
        onSubmit: handleSubmit
      }}
    >
      <FormContent progress={progress} />
    </BaseForm>
  );
};
