import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from "reactstrap";
import { FaEye, FaEyeSlash, FaUserPlus, FaEnvelope, FaPhone } from "react-icons/fa";
import "./UserModal.scss";

interface UserModalProps {
  isOpen: boolean;
  toggle: () => void;
  onSave: (data: { username: string; email: string; phoneNumber: string }) => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, toggle, onSave }) => {
  const [apiError, setApiError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    phoneNumber: "",
  });

  const [touched, setTouched] = useState({
    username: false,
    email: false,
    phoneNumber: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    validateField(name, value);
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    validateField(field, formData[field as keyof typeof formData]);
  };

  const validateField = (field: string, value: string) => {
    let errorMessage = "";
    
    switch (field) {
      case "username":
        if (!value) {
          errorMessage = "Username is required";
        } else if (!/^[A-Za-z0-9]{6,30}$/.test(value)) {
          errorMessage = "Username must be 6-30 alphanumeric characters";
        }
        break;
        
      case "email":
        if (!value) {
          errorMessage = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorMessage = "Please enter a valid email";
        }
        break;
        
      case "phoneNumber":
        if (!value) {
          errorMessage = "Phone number is required";
        } else if (!/^(?:\+84|0)(?:[1-9][0-9]{8})$/.test(value)) {
          errorMessage = "Please enter a valid phone number (start with +84 or 0)";
        }
        break;
    }

    setErrors(prev => ({
      ...prev,
      [field]: errorMessage
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    
    // Validate all fields
    Object.keys(formData).forEach(field => {
      validateField(field, formData[field as keyof typeof formData]);
      setTouched(prev => ({
        ...prev,
        [field]: true
      }));
    });

    // Check if there are any errors
    const hasErrors = Object.values(errors).some(error => error !== "");
    if (!hasErrors) {
      try {
        await onSave({
          username: formData.username,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
        });
        // Reset form after successful submission
        setFormData({
          username: "",
          email: "",
          phoneNumber: "",
        });
      } catch (error: any) {
        if (error.response?.status === 400) {
          setApiError(error.response.data.message);
        }
      }
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="user-modal">
      <ModalHeader toggle={toggle}>
        <FaUserPlus className="modal-icon" /> Create New User
      </ModalHeader>
      
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          {apiError && (
            <div className="api-error-message">
              {apiError}
            </div>
          )}
          <FormGroup>
            <div className="input-wrapper">
              <Label for="username">Username</Label>
              <div className="input-container">
                <FaUserPlus className="field-icon" />
                <Input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={() => handleBlur('username')}
                  className={touched.username && errors.username ? 'is-invalid' : ''}
                />
              </div>
              {touched.username && errors.username && (
                <div className="error-message">{errors.username}</div>
              )}
            </div>
          </FormGroup>

          <FormGroup>
            <div className="input-wrapper">
              <Label for="email">Email</Label>
              <div className="input-container">
                <FaEnvelope className="field-icon" />
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  className={touched.email && errors.email ? 'is-invalid' : ''}
                />
              </div>
              {touched.email && errors.email && (
                <div className="error-message">{errors.email}</div>
              )}
            </div>
          </FormGroup>

          <FormGroup>
            <div className="input-wrapper">
              <Label for="phoneNumber">Phone Number</Label>
              <div className="input-container">
                <FaPhone className="field-icon" />
                <Input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  onBlur={() => handleBlur('phoneNumber')}
                  className={touched.phoneNumber && errors.phoneNumber ? 'is-invalid' : ''}
                />
              </div>
              {touched.phoneNumber && errors.phoneNumber && (
                <div className="error-message">{errors.phoneNumber}</div>
              )}
            </div>
          </FormGroup>
        </Form>
      </ModalBody>

      <ModalFooter>
        <button className="btn-cancel" onClick={toggle}>
          Cancel
        </button>
        <button className="btn-save" onClick={handleSubmit}>
          Create User
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default UserModal;