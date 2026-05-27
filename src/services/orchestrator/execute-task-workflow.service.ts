import type { InvenioTask, TaskOrchestrationOptions } from '@/types';
import {
  executeBulkImport,
  getTaskStatus,
  validateImporterTask
} from '../tasks';

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 60;

/** Waits for the requested number of milliseconds. */
const sleep = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

/** Polls task status until a completion predicate matches or the poll times out. */
const waitForTaskStatus = async (
  taskId: string,
  isComplete: (task: InvenioTask) => boolean,
  onProgress?: TaskOrchestrationOptions['onProgress'],
  step: 'Validating' | 'Executing' = 'Validating'
): Promise<InvenioTask> => {
  let taskStatus = await getTaskStatus(taskId);

  for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt += 1) {
    // Return as soon as the API reports a terminal state for the current step.
    if (isComplete(taskStatus)) {
      return taskStatus;
    }

    // Keep progress below 100 until the terminal status has been observed.
    const progress = Math.min(
      95,
      Math.round((attempt / MAX_POLL_ATTEMPTS) * 100)
    );
    onProgress?.(step, progress);
    await sleep(POLL_INTERVAL_MS);
    taskStatus = await getTaskStatus(taskId);
  }

  if (isComplete(taskStatus)) {
    return taskStatus;
  }

  throw new Error(
    `Timed out while waiting for task ${taskId} to finish ${step.toLowerCase()}.`
  );
};

/**
 * Executes the validation and optional import workflow
 */
export const executeTaskWorkflow = async (
  taskId: string,
  options: TaskOrchestrationOptions = {}
): Promise<InvenioTask> => {
  const { autoExecute = false, onProgress, onError } = options;

  try {
    // Start validation process
    onProgress?.('Validating', 0);
    await validateImporterTask(taskId);

    const validationComplete = (task: InvenioTask) =>
      task.status === 'validated' ||
      task.status === 'validated with failures' ||
      task.status === 'damaged';
    let taskStatus = await waitForTaskStatus(
      taskId,
      validationComplete,
      onProgress,
      'Validating'
    );
    onProgress?.('Validating', 100);

    // Auto-execute if requested and validation passed
    if (
      autoExecute &&
      (taskStatus.status === 'validated' ||
        taskStatus.status === 'validated with failures')
    ) {
      onProgress?.('Executing', 0);
      await executeBulkImport(taskId);

      const importComplete = (task: InvenioTask) =>
        task.status === 'success' ||
        task.status === 'imported with failures' ||
        task.status === 'damaged';
      taskStatus = await waitForTaskStatus(
        taskId,
        importComplete,
        onProgress,
        'Executing'
      );
      onProgress?.('Executing', 100);
    }

    return taskStatus;
  } catch (error) {
    const err =
      error instanceof Error
        ? error
        : new Error('Unknown error during workflow execution');
    onError?.(err, 'Executing');
    throw err;
  }
};
