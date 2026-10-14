import { Spinner } from '@/components/ui';
import { useImporterTask } from '@/hooks';
import { ImporterTaskStates, type InvenioTask } from '@/types';
import React, { useEffect, useState } from 'react';
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
  const { getStatus, isGettingStatus, runBulkImport, isBulkImporting, error } =
    useImporterTask(taskId, { onStatusChangeSuccess: setTask });

  useEffect(() => {
    getStatus();
  }, [getStatus]);

  // Keep the status current while the backend is still working on the task.
  const status = task?.status;
  useEffect(() => {
    if (!status || !IN_PROGRESS_STATES.includes(status)) {
      return;
    }
    const timer = setTimeout(() => {
      getStatus();
    }, STATUS_POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [status, getStatus]);

  // Only the first load replaces the page; later refreshes update it in place.
  if ((isGettingStatus && !task) || isBulkImporting) {
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
    <TaskDetailsProvider taskId={taskId}>
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
          isRunningTask={isBulkImporting}
          onRefresh={() => getStatus()}
          onRunTask={async () => {
            await runBulkImport();
            await getStatus();
          }}
        />

        <TaskConfiguration task={task} />
      </Container>
      <TaskDetailsRecords />
    </TaskDetailsProvider>
  );
};
