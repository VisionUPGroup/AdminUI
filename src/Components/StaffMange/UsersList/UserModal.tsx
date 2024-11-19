import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from "reactstrap";
import { FaEye, FaEyeSlash, FaUserPlus, FaEnvelope, FaPhone, FaLock } from "react-icons/fa";
import "./UserModal.scss";

interface UserModalProps {
  isOpen: boolean;
  toggle: () => void;
  onSave: (data: { username: string; email: string; roleID: number; phoneNumber: string; password: string }) => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, toggle, onSave }) => {
  const [apiError, setApiError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  });

  const [touched, setTouched] = useState({
    username: false,
    email: false,
    phoneNumber: false,
    password: false,
    confirmPassword: false
  });

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

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
        
      case "password":
        if (!value) {
          errorMessage = "Password is required";
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/.test(value)) {
          errorMessage = "Password must be at least 12 characters with uppercase, lowercase, number and special character";
        }
        break;
        
      case "confirmPassword":
        if (!value) {
          errorMessage = "Please confirm your password";
        } else if (value !== formData.password) {
          errorMessage = "Passwords do not match";
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
    setApiError(null); // Reset api error
    
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
          roleID: 1,
          phoneNumber: formData.phoneNumber,
          password: formData.password
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

          <FormGroup>
            <div className="input-wrapper">
              <Label for="password">Password</Label>
              <div className="input-container">
                <FaLock className="field-icon" />
                <Input
                  type={showPassword.password ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  className={touched.password && errors.password ? 'is-invalid' : ''}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => togglePasswordVisibility('password')}
                >
                  {showPassword.password ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {touched.password && errors.password && (
                <div className="error-message">{errors.password}</div>
              )}
            </div>
          </FormGroup>

          <FormGroup>
            <div className="input-wrapper">
              <Label for="confirmPassword">Confirm Password</Label>
              <div className="input-container">
                <FaLock className="field-icon" />
                <Input
                  type={showPassword.confirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                >
                  {showPassword.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <div className="error-message">{errors.confirmPassword}</div>
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