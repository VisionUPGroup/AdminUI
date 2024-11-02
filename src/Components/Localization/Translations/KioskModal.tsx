// KioskModal.tsx
import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from "reactstrap";

interface KioskModalProps {
  isOpen: boolean;
  toggle: () => void;
  onSave: (data: {
    name: string;
    address: string;
    phoneNumber: string;
    email: string;
    openingHours: string;
    createdAt: string;
    updatedAt: string;
    status: boolean;
  }) => void;
}

const KioskModal: React.FC<KioskModalProps> = ({ isOpen, toggle, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phoneNumber: "",
    email: "",
    openingHours: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    address: "",
    phoneNumber: "",
    email: "",
    openingHours: "",
  });
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: "",
      address: "",
      phoneNumber: "",
      email: "",
      openingHours: "",
    };

    if (!formData.name) {
      newErrors.name = "Name is required";
      valid = false;
    }
    if (!formData.address) {
      newErrors.address = "Address is required";
      valid = false;
    }
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone Number is required";
      valid = false;
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
      valid = false;
    }
    if (!formData.openingHours) {
      newErrors.openingHours = "Opening Hours is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const currentTime = new Date().toISOString();
    const dataToSave = {
      name: formData.name,
      address: formData.address,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      openingHours: formData.openingHours,
      createdAt: currentTime,
      updatedAt: currentTime,
      status: true,
    };
    console.log("Form data to save:", dataToSave);
    onSave(dataToSave);
    
    // Set success message and clear form
    setSuccessMessage("Kiosk created successfully!");
    setFormData({
      name: "",
      address: "",
      phoneNumber: "",
      email: "",
      openingHours: "",
    });

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000); // Hide the message after 3 seconds

    toggle(); // Close modal after saving
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Create Kiosk</ModalHeader>
      <ModalBody>
        {successMessage && <Alert color="success">{successMessage}</Alert>}
        <form>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Enter kiosk name"
              value={formData.name}
              onChange={handleInputChange}
            />
            {errors.name && <p className="text-danger">{errors.name}</p>}
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              className="form-control"
              placeholder="Enter kiosk address"
              value={formData.address}
              onChange={handleInputChange}
            />
            {errors.address && <p className="text-danger">{errors.address}</p>}
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              className="form-control"
              placeholder="Enter phone number"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
            {errors.phoneNumber && <p className="text-danger">{errors.phoneNumber}</p>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && <p className="text-danger">{errors.email}</p>}
          </div>
          <div className="form-group">
            <label>Opening Hours</label>
            <input
              type="text"
              name="openingHours"
              className="form-control"
              placeholder="Enter opening hours"
              value={formData.openingHours}
              onChange={handleInputChange}
            />
            {errors.openingHours && <p className="text-danger">{errors.openingHours}</p>}
          </div>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleSave}>
          Save
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default KioskModal;
