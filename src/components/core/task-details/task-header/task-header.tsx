import { StatusLabel } from '@/components/ui';
import type { InvenioTask } from '@/types';
import {
  capitalizeFirstLetter,
  formatOptionLabel,
  getTaskOptionEntries
} from '@/utils';
import React from 'react';
import { Button, Header, Icon, Label, Popup } from 'semantic-ui-react';
import { ImportStatusCards } from '../import-status-cards';
import { UploadMetadataModal } from '../upload-metadata-modal';
import { styles } from './task-header.styles';

interface TaskHeaderProps {
  task: InvenioTask;
  totalRecords: number;
  validatedRecords: number;
  errorRecords: number;
  successRecords: number;
  isRefreshing: boolean;
  isRunningTask: boolean;
  onRefresh: () => void;
  onRunTask: () => Promise<void>;
}

const getOptionDescription = (optionKey: string, isEnabled: boolean) => {
  const label = formatOptionLabel(optionKey);
  return `${label} is ${isEnabled ? 'active' : 'not active'}.`;
};

export const TaskHeader: React.FC<TaskHeaderProps> = ({
  task,
  totalRecords,
  validatedRecords,
  errorRecords,
  successRecords,
  isRefreshing,
  isRunningTask,
  onRefresh,
  onRunTask
}) => {
  const optionEntries = getTaskOptionEntries(task.options);

  return (
    <div className={styles.heroSection}>
      <div className={styles.heroLayout}>
        <div className={styles.heroIntro}>
          <div className={styles.headerContent}>
            <div className={styles.kicker}>Importer task</div>
            <Header as='h1' className={styles.heroTitle}>
              {task.title}
            </Header>
            <div className={styles.statusRow}>
              {task.status && (
                <StatusLabel size='large' status={task.status}>
                  {capitalizeFirstLetter(task.status)}
                </StatusLabel>
              )}
              <Label className={styles.metaPill}>
                <Icon name='database' />
                {totalRecords} records
              </Label>
            </div>
            {task.description && (
              <p className={styles.heroDescription}>{task.description}</p>
            )}
            {optionEntries.length > 0 && (
              <div className={styles.optionPills}>
                {optionEntries.map(([optionKey, isEnabled]) => (
                  <Popup
                    key={optionKey}
                    content={getOptionDescription(optionKey, isEnabled)}
                    position='left center'
                    size='small'
                    trigger={
                      <Label
                        className={
                          isEnabled
                            ? styles.optionPillActive
                            : styles.optionPillInactive
                        }
                      >
                        <Icon name={isEnabled ? 'check circle' : 'ban'} />
                        {formatOptionLabel(optionKey)}
                      </Label>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.actionsContainer}>
          <div className={styles.actionsHeader}>Actions</div>
          <div className={styles.actionButtons}>
            <Popup
              content='Fetch the latest task status and record counts.'
              position='left center'
              size='small'
              trigger={
                <Button
                  size='small'
                  color='blue'
                  icon='refresh'
                  content='Refresh'
                  onClick={onRefresh}
                  loading={isRefreshing}
                />
              }
            />
            <UploadMetadataModal serializer={task.serializer} />
            <Popup
              content='Start the import workflow for this task.'
              position='left center'
              size='small'
              trigger={
                <Button
                  size='small'
                  color='green'
                  icon='play'
                  onClick={onRunTask}
                  loading={isRunningTask}
                  content='Run Task'
                />
              }
            />
          </div>
        </div>
      </div>

      <ImportStatusCards
        totalRecords={totalRecords}
        validatedRecords={validatedRecords}
        errorRecords={errorRecords}
        successRecords={successRecords}
        showWhenEmpty
        className={styles.statusCardsSection}
      />
    </div>
  );
};
