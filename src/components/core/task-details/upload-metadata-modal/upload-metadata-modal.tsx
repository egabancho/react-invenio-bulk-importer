import { FileUploader } from '@/components/core/file-uploader';
import { ProgressLoading } from '@/components/ui';
import { executeTaskWorkflow, updateTaskContent } from '@/services';
import type { OrchestrationSteps } from '@/types';
import { getMetadataFileFormat } from '@/utils';
import React, { useState } from 'react';
import { Button, Form, Header, Icon, Modal, Popup } from 'semantic-ui-react';
import { useTaskDetails } from '../provider';
import { styles } from './upload-metadata-modal.styles';

interface UploadMetadataModalProps {
  serializer?: string;
}

export const UploadMetadataModal: React.FC<UploadMetadataModalProps> = ({
  serializer
}) => {
  const { taskId } = useTaskDetails();
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [progress, setProgress] = useState<Record<
    OrchestrationSteps,
    number
  > | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setUploadFile(file);
    } else {
      setUploadFile(null);
    }
  };

  const handleFilesChange = (files: File[]) => {
    setUploadFiles(files);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setUploadFile(null);
    setUploadFiles([]);
    setProgress(null);
  };

  const handleUpload = async () => {
    if (!uploadFile && uploadFiles.length === 0) {
      return;
    }

    try {
      // Update task with new metadata and/or files
      await updateTaskContent(
        taskId,
        uploadFile,
        uploadFiles.length > 0 ? uploadFiles : undefined,
        {
          onProgress: (step, progress) =>
            setProgress({
              [step]: progress
            } as Record<OrchestrationSteps, number>),
          onError: (error, step) => {
            console.error(`Error during ${step}:`, error);
          }
        }
      );

      // Execute the validation and import workflow only if metadata was uploaded
      if (uploadFile) {
        await executeTaskWorkflow(taskId, {
          autoExecute: true, // Auto-execute import after validation
          onProgress: (step, progress) =>
            setProgress({
              [step]: progress
            } as Record<OrchestrationSteps, number>),
          onError: (error, step) => {
            console.error(`Error during ${step}:`, error);
          }
        });
      }

      setOpenModal(false);
      setUploadFile(null);
      setUploadFiles([]);
    } catch (error) {
      console.error('Error uploading content:', error);
    }
  };

  return (
    <React.Fragment>
      <Popup
        content='Upload metadata or supporting files for this task.'
        position='left center'
        size='small'
        trigger={
          <Button
            icon='upload'
            size='tiny'
            content='Upload Content'
            onClick={() => setOpenModal(true)}
          />
        }
      />
      <Modal open={openModal} onClose={handleCloseModal} size='small' closeIcon>
        <Header icon>
          <Icon name='upload' />
          Upload Metadata & Files
        </Header>

        <Modal.Content>
          <Form onSubmit={handleUpload}>
            <Form.Field>
              <label htmlFor='fileInput'>Select Metadata File (Optional)</label>
              <input
                id={'fileInput'}
                type='file'
                onChange={handleFileChange}
                accept={getMetadataFileFormat(serializer).accept}
              />
              {uploadFile && (
                <div className={styles.selectedFileInfo}>
                  Selected: {uploadFile.name}
                </div>
              )}
            </Form.Field>

            <Form.Field>
              <div className={styles.fieldLabel}>
                Additional Files (Optional)
              </div>
              <FileUploader
                value={uploadFiles}
                onChange={handleFilesChange}
                accept='*'
                maxTotalSize={10 * 1024 * 1024 * 1024}
                maxFiles={100}
              />
            </Form.Field>
          </Form>
        </Modal.Content>

        <Modal.Actions>
          <div className={styles.actionsContainer}>
            {progress && <ProgressLoading progress={progress} />}
            <Button
              onClick={handleCloseModal}
              color='grey'
              disabled={!!progress}
            >
              <Icon name='cancel' />
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              color='blue'
              loading={!!progress}
              disabled={!uploadFile && uploadFiles.length === 0}
            >
              <Icon name='upload' />
              Upload
            </Button>
          </div>
        </Modal.Actions>
      </Modal>
    </React.Fragment>
  );
};
