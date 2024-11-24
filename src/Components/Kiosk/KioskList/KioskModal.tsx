// KioskModal.tsx
import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { 
  FaStore, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaClock, 
  FaTimes,
  FaUser 
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./ModalStyle.scss"
import { useKioskService } from "../../../../Api/kioskService";

interface KioskModalProps {
  isOpen: boolean;
  toggle: () => void;
  onSave: (data: {
    name: string;
    username: string; // Thêm username
    address: string;
    phoneNumber: string;
    email: string;
    openingHours: string;
    status: boolean;
  }) => Promise<any>;
}

interface FormError {
  name?: string;
  username?: string; // Thêm username error
  address?: string;
  phoneNumber?: string;
  email?: string;
  openingHours?: string;
}

const KioskModal: React.FC<KioskModalProps> = ({ isOpen, toggle, onSave }) => {
  const { createKiosk } = useKioskService();
  const [formData, setFormData] = useState({
    name: "",
    username: "", // Thêm username state
    address: "",
    phoneNumber: "",
    email: "",
    openingHours: "",
    status: true
  });

  const [errors, setErrors] = useState<FormError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Các hàm validate hiện tại giữ nguyên
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^[0-9]{10,11}$/.test(phone);
  };

  const validateUsername = (username: string) => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({
      ...prev,
      [name]: ""
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: "",
      username: "", // Thêm username validation
      address: "",
      phoneNumber: "",
      email: "",
      openingHours: ""
    };

    if (!formData.name.trim()) {
      newErrors.name = "Kiosk name is required";
      isValid = false;
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    } else if (!validateUsername(formData.username)) {
      newErrors.username = "Username must be 3-20 characters and can only contain letters, numbers, and underscores";
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
      const result = await createKiosk(formData);
      
      if (!result) {
        throw new Error("Failed to create kiosk");
      }

      await onSave(formData);
      toast.success("Kiosk created successfully!");
      handleClose();
    } catch (error: any) {
      if (error.response?.data) {
        const apiErrors = error.response.data;
        if (apiErrors.errors) {
          const newErrors: FormError = {};
          Object.entries(apiErrors.errors).forEach(([key, messages]: [string, any]) => {
            newErrors[key.toLowerCase() as keyof FormError] = Array.isArray(messages) ? messages[0] : messages;
          });
          setErrors(newErrors);
        }
        toast.error(apiErrors.message || "Username, Name, Email or PhoneNumber is already exist");
      } else {
        toast.error(error.message || "Failed to create kiosk. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      username: "", // Reset username
      address: "",
      phoneNumber: "",
      email: "",
      openingHours: "",
      status: true
    });
    setErrors({});
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

          {/* Thêm field Username mới */}
          <div className="form-group">
            <label>
              <FaUser className="field-icon" />
              Username <span className="required">*</span>
            </label>
            <input
              type="text"
              name="username"
              className={`form-control ${errors.username ? 'is-invalid' : ''}`}
              placeholder="Enter username"
              value={formData.username}
              onChange={handleInputChange}
            />
            {errors.username && <div className="invalid-feedback">{errors.username}</div>}
          </div>

          {/* Các field còn lại giữ nguyên */}
          {/* ... Rest of the form fields ... */}

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