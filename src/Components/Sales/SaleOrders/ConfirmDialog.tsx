//ConfirmDialog.tsx
import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { FaExclamationTriangle } from 'react-icons/fa';

interface ConfirmDialogProps {
  isOpen: boolean;
  toggle: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  toggle,
  onConfirm,
  title,
  message
}) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} className="delete-confirm-modal">
      <ModalHeader toggle={toggle} className="border-bottom-0">
        <span className="text-danger d-flex align-items-center gap-2">
          <FaExclamationTriangle /> {title}
        </span>
      </ModalHeader>
      <ModalBody>
        <p>{message}</p>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
        <Button
          color="danger"
          onClick={() => {
            onConfirm();
            toggle();
          }}
        >
          Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmDialog;