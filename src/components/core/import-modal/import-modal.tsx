import type { InvenioTask } from '@/types';
import React, { useCallback, useState } from 'react';
import {
  Button,
  Icon,
  Modal,
  ModalContent,
  ModalHeader
} from 'semantic-ui-react';
import { useSearch } from '../search/provider';
import { ImportForm } from './import-form';

export const ImportModal = () => {
  const [open, setOpen] = useState(false);
  const { config } = useSearch();

  // Callback to handle successful form submission
  // Closes the modal and opens the new task, where validation progress shows
  const handleSubmitSuccess = useCallback(
    (task: InvenioTask) => {
      setOpen(false);
      window.location.assign(`${config.resultPath}/${task.id}`);
    },
    [config.resultPath]
  );

  return (
    <Modal
      closeIcon
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={
        <Button color='green' icon labelPosition='left'>
          <Icon name='add' />
          New Import
        </Button>
      }
    >
      <ModalHeader>New Import Task</ModalHeader>
      <ModalContent>
        <ImportForm onSubmit={handleSubmitSuccess} />
      </ModalContent>
    </Modal>
  );
};
