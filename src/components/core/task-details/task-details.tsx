import { Spinner } from '@/components/ui';
import { useImporterTask } from '@/hooks';
import { ImporterTaskStates, type InvenioTask } from '@/types';
import React, { useEffect, useRef, useState } from 'react';
import { Container, Icon, Message } from 'semantic-ui-react';
import { TaskDetailsProvider } from './provider';
import { TaskConfiguration } from './task-configuration';
import { styles } from './task-details.styles';
import { TaskDetailsRecords } from './task-details-records';
import { TaskHeader } from './task-header';

export interface TaskDetailsProps {
  taskId: string;
}

const STATUS_POLL_INTERVAL_MS = 3000;

const IN_PROGRESS_STATES: string[] = [
  ImporterTaskStates.VALIDATING,
  ImporterTaskStates.IMPORTING
];

export const TaskDetails: React.FC<TaskDetailsProps> = ({ taskId }) => {
  const [task, setTask] = useState<InvenioTask | null>(null);
  const [recordsRefreshSignal, setRecordsRefreshSignal] = useState(0);
  const refreshRecords = () => setRecordsRefreshSignal(signal => signal + 1);
  const { getStatus, isGettingStatus, runBulkImport, isBulkImporting, error } =
    useImporterTask(taskId, { onStatusChangeSuccess: setTask });

  useEffect(() => {
    getStatus();
  }, [getStatus]);

  // Keep the status current while the backend is still working on the task.
  // Keyed on the task, a new object per fetch, so an unchanged status polls
  // again.
  useEffect(() => {
    if (!task || !IN_PROGRESS_STATES.includes(task.status)) {
      return;
    }
    const timer = setTimeout(() => {
      // The hook already shows the error.
      getStatus().catch(() => undefined);
    }, STATUS_POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [task, getStatus]);

  // The records change while the task runs, so reload them once it finishes.
  const status = task?.status;
  const previousStatus = useRef(status);
  useEffect(() => {
    const wasRunning =
      !!previousStatus.current &&
      IN_PROGRESS_STATES.includes(previousStatus.current);
    previousStatus.current = status;
    if (wasRunning && status && !IN_PROGRESS_STATES.includes(status)) {
      setRecordsRefreshSignal(signal => signal + 1);
    }
  }, [status]);

  // Only the first load replaces the page; later refreshes update it in place.
  if (isGettingStatus && !task) {
    return <Spinner />;
  }

  if (!task) {
    return (
      <Message warning icon>
        <Icon name='search' />
        <Message.Content>
          <Message.Header>Task Not Found</Message.Header>
          The requested task could not be found.
        </Message.Content>
      </Message>
    );
  }

  const totalRecords = task.records_status?.total_records || 0;
  const validatedRecords = task.records_status?.validated || 0;
  const successRecords = task.records_status?.success || 0;
  const errorRecords =
    (task.records_status?.['import failed'] || 0) +
    (task.records_status?.['validation failed'] || 0) +
    (task.records_status?.['serializer validation failed'] || 0);

  return (
    <TaskDetailsProvider
      taskId={taskId}
      recordsRefreshSignal={recordsRefreshSignal}
    >
      <Container fluid className={styles.page}>
        {error && (
          <Message negative icon>
            <Icon name='exclamation triangle' />
            <Message.Content>
              <Message.Header>Error</Message.Header>
              {error?.message || 'An unknown error occurred'}
            </Message.Content>
          </Message>
        )}

        <TaskHeader
          task={task}
          totalRecords={totalRecords}
          validatedRecords={validatedRecords}
          errorRecords={errorRecords}
          successRecords={successRecords}
          isRefreshing={isGettingStatus}
          isRunningTask={
            isBulkImporting || IN_PROGRESS_STATES.includes(task.status)
          }
          onRefresh={() => {
            getStatus();
            refreshRecords();
          }}
          onRunTask={async () => {
            await runBulkImport();
            await getStatus();
            refreshRecords();
          }}
        />

        <TaskConfiguration task={task} />
      </Container>
      <TaskDetailsRecords />
    </TaskDetailsProvider>
  );
};
