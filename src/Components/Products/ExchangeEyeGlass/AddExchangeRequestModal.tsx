import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Label, FormGroup, FormFeedback } from "reactstrap";

interface AddExchangeRequestModalProps {
  isOpen: boolean;
  toggle: () => void;
  onSubmit: (data: { productGlassID: number | null; receiverAddress: string; kioskID: number | null; reason: string; quantity: number }) => void;
}

const AddExchangeRequestModal: React.FC<AddExchangeRequestModalProps> = ({ isOpen, toggle, onSubmit }) => {
  const initialFormData = {
    productGlassID: null,
    receiverAddress: "",
    kioskID: null,
    reason: "",
    quantity: 0,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "quantity" || name === "kioskID" || name === "productGlassID" ? (value ? parseInt(value) : null) : value,
      ...(name === "kioskID" && parseInt(value) > 0
        ? { receiverAddress: "" }
        : name === "receiverAddress" && value
        ? { kioskID: null }
        : {}),
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" })); // Clear error for the field
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (formData.productGlassID === null) newErrors.productGlassID = "Product Glass ID is required.";
    if (!formData.receiverAddress && formData.kioskID === null) newErrors.receiverAddress = "Either Receiver Address or Kiosk ID is required.";
    if (!formData.reason) newErrors.reason = "Reason is required.";
    if (formData.quantity <= 0) newErrors.quantity = "Quantity must be greater than 0.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      toggle();
      resetForm();
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Create Exchange Request</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label for="productGlassID">Product Glass ID</Label>
          <Input
            type="number"
            name="productGlassID"
            value={formData.productGlassID ?? ""}
            onChange={handleChange}
            invalid={!!errors.productGlassID}
          />
          <FormFeedback>{errors.productGlassID}</FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label for="receiverAddress">Receiver Address</Label>
          <Input
            type="text"
            name="receiverAddress"
            value={formData.receiverAddress}
            onChange={handleChange}
            disabled={!!formData.kioskID}
            invalid={!!errors.receiverAddress}
          />
          <FormFeedback>{errors.receiverAddress}</FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label for="kioskID">Kiosk ID</Label>
          <Input
            type="number"
            name="kioskID"
            value={formData.kioskID ?? ""}
            onChange={handleChange}
            disabled={!!formData.receiverAddress}
            invalid={!!errors.kioskID}
          />
          <FormFeedback>{errors.kioskID}</FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label for="reason">Reason</Label>
          <Input
            type="text"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            invalid={!!errors.reason}
          />
          <FormFeedback>{errors.reason}</FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label for="quantity">Quantity</Label>
          <Input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            invalid={!!errors.quantity}
          />
          <FormFeedback>{errors.quantity}</FormFeedback>
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleSubmit}>
          Submit
        </Button>
        <Button color="secondary" onClick={() => { toggle(); resetForm(); }}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddExchangeRequestModal;
