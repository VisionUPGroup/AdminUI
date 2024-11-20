import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Label, FormGroup, FormFeedback } from "reactstrap";
import { Package, MapPin, Home, FileText, Hash, AlertTriangle } from "react-feather";
import "./ExchangeRequestModalStyles.scss";

interface AddExchangeRequestModalProps {
  isOpen: boolean;
  toggle: () => void;
  onSubmit: (data: {
    productGlassID: number | null;
    receiverAddress: string;
    kioskID: number | null;
    reason: string;
    quantity: number;
  }) => void;
}

const AddExchangeRequestModal: React.FC<AddExchangeRequestModalProps> = ({
  isOpen,
  toggle,
  onSubmit,
}) => {
  const initialFormData = {
    productGlassID: null,
    receiverAddress: "",
    kioskID: null,
    reason: "",
    quantity: 1,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setIsSubmitting(false);
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
      [name]:
        name === "quantity" || name === "kioskID" || name === "productGlassID"
          ? value
            ? parseInt(value)
            : null
          : value,
      ...(name === "kioskID" && parseInt(value) > 0
        ? { receiverAddress: "" }
        : name === "receiverAddress" && value
        ? { kioskID: null }
        : {}),
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (formData.productGlassID === null)
      newErrors.productGlassID = "Product Glass ID is required";
    if (!formData.receiverAddress && formData.kioskID === null)
      newErrors.receiverAddress = "Either Receiver Address or Kiosk ID is required";
    if (!formData.reason) newErrors.reason = "Reason is required";
    if (formData.quantity <= 0)
      newErrors.quantity = "Quantity must be greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await onSubmit(formData);
        toggle();
        resetForm();
      } catch (error) {
        console.error("Submit error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="exchange-request-modal">
      <ModalHeader toggle={toggle}>Create Exchange Request</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label for="productGlassID">
            <Package size={16} /> Product Glass ID
          </Label>
          <div className="input-group">
            <Input
              type="number"
              name="productGlassID"
              id="productGlassID"
              value={formData.productGlassID ?? ""}
              onChange={handleChange}
              invalid={!!errors.productGlassID}
              placeholder="Enter Product Glass ID"
            />
            <Hash className="input-icon" size={18} />
          </div>
          {errors.productGlassID && (
            <FormFeedback className="d-flex">
              <AlertTriangle size={14} className="mr-1" /> {errors.productGlassID}
            </FormFeedback>
          )}
        </FormGroup>

        <FormGroup>
          <Label for="receiverAddress">
            <MapPin size={16} /> Receiver Address
          </Label>
          <div className="input-group">
            <Input
              type="text"
              name="receiverAddress"
              id="receiverAddress"
              value={formData.receiverAddress}
              onChange={handleChange}
              disabled={!!formData.kioskID}
              invalid={!!errors.receiverAddress}
              placeholder="Enter delivery address"
            />
            <MapPin className="input-icon" size={18} />
          </div>
          {errors.receiverAddress && (
            <FormFeedback className="d-flex">
              <AlertTriangle size={14} className="mr-1" /> {errors.receiverAddress}
            </FormFeedback>
          )}
        </FormGroup>

        <FormGroup>
          <Label for="kioskID">
            <Home size={16} /> Kiosk ID
          </Label>
          <div className="input-group">
            <Input
              type="number"
              name="kioskID"
              id="kioskID"
              value={formData.kioskID ?? ""}
              onChange={handleChange}
              disabled={!!formData.receiverAddress}
              invalid={!!errors.kioskID}
              placeholder="Enter Kiosk ID"
            />
            <Hash className="input-icon" size={18} />
          </div>
          {errors.kioskID && (
            <FormFeedback className="d-flex">
              <AlertTriangle size={14} className="mr-1" /> {errors.kioskID}
            </FormFeedback>
          )}
        </FormGroup>

        <FormGroup>
          <Label for="reason">
            <FileText size={16} /> Reason
          </Label>
          <div className="input-group">
            <Input
              type="textarea"
              name="reason"
              id="reason"
              value={formData.reason}
              onChange={handleChange}
              invalid={!!errors.reason}
              placeholder="Please provide reason for exchange"
              rows={3}
            />
          </div>
          {errors.reason && (
            <FormFeedback className="d-flex">
              <AlertTriangle size={14} className="mr-1" /> {errors.reason}
            </FormFeedback>
          )}
        </FormGroup>

        <FormGroup>
          <Label for="quantity">
            <Package size={16} /> Quantity
          </Label>
          <div className="input-group">
            <Input
              type="number"
              name="quantity"
              id="quantity"
              value={formData.quantity}
              onChange={handleChange}
              invalid={!!errors.quantity}
              placeholder="Enter quantity"
              min="1"
            />
            <Hash className="input-icon" size={18} />
          </div>
          {errors.quantity && (
            <FormFeedback className="d-flex">
              <AlertTriangle size={14} className="mr-1" /> {errors.quantity}
            </FormFeedback>
          )}
        </FormGroup>
      </ModalBody>
      
      <ModalFooter>
        <Button
          color="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
        <Button
          color="secondary"
          onClick={() => {
            toggle();
            resetForm();
          }}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddExchangeRequestModal;