import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Label, FormGroup, FormFeedback } from "reactstrap";
import { AlertTriangle } from "react-feather";
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

type InputType = "text" | "textarea" | "number" | "password" | "email" | "select" | "file" | "radio" | "checkbox" | "hidden";

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
    
    if ((name === 'productGlassID' || name === 'kioskID') && value.startsWith('-')) {
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]:
        name === "quantity" || name === "kioskID" || name === "productGlassID"
          ? value
            ? Math.max(0, parseInt(value))
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
    if (formData.productGlassID === null || formData.productGlassID < 0)
      newErrors.productGlassID = "Product Glass ID must be a positive number";
    if (!formData.receiverAddress && formData.kioskID === null)
      newErrors.receiverAddress = "Either Receiver Address or Kiosk ID is required";
    if (formData.kioskID !== null && formData.kioskID < 0)
      newErrors.kioskID = "Kiosk ID must be a positive number";
    if (!formData.reason) 
      newErrors.reason = "Reason is required";
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

  const renderFormGroup = (
    label: string,
    name: string,
    inputType: InputType,
    placeholder: string,
    disabled: boolean = false,
    min?: string
  ) => (
    <FormGroup>
      <Label for={name} className="form-label">
        {label}
      </Label>
      <div className="input-wrapper">
        <Input
          type={inputType}
          name={name}
          id={name}
          value={formData[name as keyof typeof formData] ?? ""}
          onChange={handleChange}
          disabled={disabled}
          invalid={!!errors[name]}
          placeholder={placeholder}
          min={min}
          className="custom-input"
        />
        {errors[name] && (
          <FormFeedback className="error-feedback">
            <AlertTriangle size={14} /> {errors[name]}
          </FormFeedback>
        )}
      </div>
    </FormGroup>
  );

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="exchange-request-modal">
      <ModalHeader toggle={toggle}>
        Create Exchange Request
      </ModalHeader>
      <ModalBody>
        {renderFormGroup(
          "Product Glass ID",
          "productGlassID",
          "number",
          "Enter Product Glass ID",
          false,
          "0"
        )}

        {renderFormGroup(
          "Receiver Address",
          "receiverAddress",
          "text",
          "Enter delivery address",
          !!formData.kioskID
        )}

        {renderFormGroup(
          "Kiosk ID",
          "kioskID",
          "number",
          "Enter Kiosk ID",
          !!formData.receiverAddress,
          "0"
        )}

        <FormGroup>
          <Label for="reason" className="form-label">
            Reason
          </Label>
          <div className="input-wrapper">
            <Input
              type="textarea"
              name="reason"
              id="reason"
              value={formData.reason}
              onChange={handleChange}
              invalid={!!errors.reason}
              placeholder="Please provide reason for exchange"
              rows={3}
              className="custom-textarea"
            />
            {errors.reason && (
              <FormFeedback className="error-feedback">
                <AlertTriangle size={14} /> {errors.reason}
              </FormFeedback>
            )}
          </div>
        </FormGroup>

        {renderFormGroup(
          "Quantity",
          "quantity",
          "number",
          "Enter quantity",
          false,
          "1"
        )}
      </ModalBody>
      
      <ModalFooter>
        <Button
          color="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
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
          className="cancel-btn"
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddExchangeRequestModal;