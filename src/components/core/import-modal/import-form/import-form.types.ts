import type { InvenioNewImportTask, InvenioTask } from '@/types';

export interface ImportFormProps {
  onSubmit?: (task: InvenioTask) => void;
}

export interface ImportFormValues {
  task: InvenioNewImportTask;
  metadata: File | null;
  files: File[];
}
