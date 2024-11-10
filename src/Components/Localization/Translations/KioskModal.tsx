// KioskModal.tsx
import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { FaStore, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import "./ModalStyle.scss"
interface KioskModalProps {
  isOpen: boolean;
  toggle: () => void;
  onSave: (data: {
    name: string;
    address: string;
    phoneNumber: string;
    email: string;
    openingHours: string;
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
    status: true
  });

  const [errors, setErrors] = useState({
    name: "",
    address: "",
    phoneNumber: "",
    email: "",
    openingHours: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^[0-9]{10,11}$/.test(phone);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: ""
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: "",
      address: "",
      phoneNumber: "",
      email: "",
      openingHours: ""
    };

    if (!formData.name.trim()) {
      newErrors.name = "Kiosk name is required";
      isValid = false;
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
      isValid = false;
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.openingHours.trim()) {
      newErrors.openingHours = "Opening hours is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please check all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(formData);
      toast.success("Kiosk created successfully!");
      handleClose();
    } catch (error) {
      toast.error("Failed to create kiosk. Please try again.");
      console.error("Error creating kiosk:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      address: "",
      phoneNumber: "",
      email: "",
      openingHours: "",
      status: true
    });
    setErrors({
      name: "",
      address: "",
      phoneNumber: "",
      email: "",
      openingHours: ""
    });
    toggle();
  };
  

  return (
    <Modal
    isOpen={isOpen}
    toggle={handleClose}
    className="upgraded-kiosk-modal-v4"
    size="lg"
  >
     <ModalHeader toggle={toggle} className="border-bottom-0">
        <div className="modal-header-content">
          <div className="modal-title-with-icon">
            <FaStore className="modal-title-icon" />
            <h4>Create New Kiosk</h4>
          </div>
          {/* <div className="close-btn-container">
            <button className="close-btn" onClick={handleClose}>
              <FaTimes />
            </button>
          </div> */}
        </div>
        <div className="modal-header-background"></div>
      </ModalHeader>

    <ModalBody>
      <div className="modal-form">
        <div className="form-group">
          <label>
            <FaStore className="field-icon" />
            Kiosk Name <span className="required">*</span>
          </label>
          <input
            type="text"
            name="name"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            placeholder="Enter kiosk name"
            value={formData.name}
            onChange={handleInputChange}
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label>
            <FaMapMarkerAlt className="field-icon" />
            Address <span className="required">*</span>
          </label>
          <textarea
            name="address"
            className={`form-control ${errors.address ? 'is-invalid' : ''}`}
            placeholder="Enter kiosk address"
            value={formData.address}
            onChange={handleInputChange}
            rows={3}
          />
          {errors.address && <div className="invalid-feedback">{errors.address}</div>}
        </div>

        <div className="form-row">
          <div className="form-group col-md-6">
            <label>
              <FaPhone className="field-icon" />
              Phone Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`}
              placeholder="Enter phone number"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
            {errors.phoneNumber && <div className="invalid-feedback">{errors.phoneNumber}</div>}
          </div>

          <div className="form-group col-md-6">
            <label>
              <FaEnvelope className="field-icon" />
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              name="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>
        </div>

        <div className="form-group">
          <label>
            <FaClock className="field-icon" />
            Opening Hours <span className="required">*</span>
          </label>
          <input
            type="text"
            name="openingHours"
            className={`form-control ${errors.openingHours ? 'is-invalid' : ''}`}
            placeholder="e.g., Mon-Fri: 9:00 AM - 6:00 PM"
            value={formData.openingHours}
            onChange={handleInputChange}
          />
          {errors.openingHours && <div className="invalid-feedback">{errors.openingHours}</div>}
        </div>
      </div>
    </ModalBody>

    <ModalFooter className="border-top-0">
      <button
        className="btn btn-outline-secondary"
        onClick={handleClose}
        disabled={isSubmitting}
      >
        <FaTimes className="button-icon" />
        Cancel
      </button>
      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" />
            Creating...
          </>
        ) : (
          <>
            <FaStore className="button-icon" />
            Create Kiosk
          </>
        )}
      </button>
    </ModalFooter>
  </Modal>
  );
};

export default KioskModal;