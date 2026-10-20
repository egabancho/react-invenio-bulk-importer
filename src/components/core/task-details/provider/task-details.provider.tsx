import React, { createContext, useContext } from 'react';
import { styles } from './task-details.provider.styles';

interface TaskDetailsContextProps {
  taskId: string;
  /** Changes whenever the task's records should be searched again. */
  recordsRefreshSignal?: number;
}

const TaskDetailsContext = createContext<TaskDetailsContextProps | undefined>(
  undefined
);

export const TaskDetailsProvider: React.FC<TaskDetailsContextProps> = ({
  taskId,
  recordsRefreshSignal,
  children
}) => {
  return (
    <TaskDetailsContext.Provider value={{ taskId, recordsRefreshSignal }}>
      <div className={styles.container}>{children}</div>
    </TaskDetailsContext.Provider>
  );
};

export const useTaskDetails = (): TaskDetailsContextProps => {
  const context = useContext(TaskDetailsContext);
  if (!context) {
    throw new Error('useTaskDetails must be used within a TaskDetailsProvider');
  }
  return context;
};
