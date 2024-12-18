import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from "reactstrap";
import { FaUserEdit, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAccountService } from "../../../../Api/accountService";
import Swal from "sweetalert2";
import "./ShipperStyle.scss"

interface StaffUpdateModalProps {
  isOpen: boolean;
  toggle: () => void;
  onSuccess: () => void;
  staffData: {
    id: number;
    username: string;
    email: string;
    phoneNumber: string;
    status: boolean;
    roleID: number;
  } | null;
}

interface FormData {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  status: boolean;
  roleID: number;
}

const StaffUpdateModal: React.FC<StaffUpdateModalProps> = ({ 
  isOpen, 
  toggle,
  onSuccess,
  staffData
}) => {
  const { updateAccount } = useAccountService();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormData: FormData = {
    id: 0,
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    status: true,
    roleID: 0
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    phoneNumber: "",
    password: ""
  });

  const [touched, setTouched] = useState({
    email: false,
    phoneNumber: false,
    password: false
  });

  useEffect(() => {
    if (staffData) {
      setFormData({
        id: staffData.id,
        username: staffData.username,
        email: staffData.email,
        phoneNumber: staffData.phoneNumber,
        password: "",
        status: Boolean(staffData.status),
        roleID: staffData.roleID
      });
      
      setTouched({
        email: false,
        phoneNumber: false,
        password: false
      });
      
      setErrors({
        email: "",
        phoneNumber: "",
        password: ""
      });
    }
  }, [staffData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'email' || name === 'phoneNumber' || name === 'password') {
      validateField(name, value);
    }
  };

  const handleStatusChange = () => {
    setFormData(prev => ({
      ...prev,
      status: !prev.status
    }));
  };

  const togglePasswordVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  const handleBlur = (field: keyof typeof errors) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    validateField(field, formData[field]);
  };

  const validateField = (field: 'email' | 'phoneNumber' | 'password', value: string) => {
    let errorMessage = "";
    
    switch (field) {
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
        if (value && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/.test(value)) {
          errorMessage = "Password must be at least 12 characters with uppercase, lowercase, number and special character";
        }
        break;
    }

    setErrors(prev => ({
      ...prev,
      [field]: errorMessage
    }));
  };

  const validateForm = () => {
    const fieldsToValidate: Array<'email' | 'phoneNumber' | 'password'> = ['email', 'phoneNumber'];
    if (formData.password) {
        fieldsToValidate.push('password');
    }

    fieldsToValidate.forEach(field => {
      validateField(field, formData[field]);
      setTouched(prev => ({
        ...prev,
        [field]: true
      }));
    });

    return !fieldsToValidate.some(field => errors[field] !== "");
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setApiError(null);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const updateData = {
        id: formData.id,
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password || undefined,
        status: formData.status,
        roleID: formData.roleID
      };

      await updateAccount(updateData);

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Staff information has been updated successfully!",
        confirmButtonColor: "#c79816",
      });

      onSuccess();
      toggle();
      
    } catch (error: any) {
      console.error("Error updating staff:", error);
      setApiError(error.response?.data?.message || "Failed to update staff");
      
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to update staff",
        confirmButtonColor: "#c79816",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="user-modal">
      <ModalHeader toggle={toggle}>
        <FaUserEdit className="modal-icon" /> Update Shipper Information
      </ModalHeader>
      
      <ModalBody>
        <Form onSubmit={e => e.preventDefault()}>
          {apiError && (
            <div className="api-error-message">
              {apiError}
            </div>
          )}

          <FormGroup>
            <div className="input-wrapper">
              <Label for="username">Username</Label>
              <Input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                disabled
                className="disabled-input"
              />
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
              <Label for="password">New Password (Optional)</Label>
              <div className="input-container">
                <FaLock className="field-icon" />
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  className={touched.password && errors.password ? 'is-invalid' : ''}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {touched.password && errors.password && (
                <div className="error-message">{errors.password}</div>
              )}
            </div>
          </FormGroup>

          <FormGroup>
  <div className="input-wrapper">
    <Label>Status</Label>
    <div className="status-wrapper">
      <span className="status-label">Status</span>
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={formData.status}
          onChange={handleStatusChange}
        />
        <span className="toggle-slider"></span>
      </label>
      <span className={`status-text ${formData.status ? 'active' : 'inactive'}`}>
        {formData.status ? 'Active' : 'Inactive'}
      </span>
    </div>
  </div>
</FormGroup>
        </Form>
      </ModalBody>

      <ModalFooter>
        <button className="btn-cancel" onClick={toggle} disabled={isSubmitting}>
          Cancel
        </button>
        <button 
          className="btn-save" 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Updating...' : 'Update Staff'}
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default StaffUpdateModal;