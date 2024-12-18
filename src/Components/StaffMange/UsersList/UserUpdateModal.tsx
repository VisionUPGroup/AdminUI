import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from "reactstrap";
import { FaUserEdit, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAccountService } from "../../../../Api/accountService";
import Swal from "sweetalert2";
import "./UserModal.scss";

interface UserUpdateModalProps {
  isOpen: boolean;
  toggle: () => void;
  onSave: (userData: any) => void;
  editingUser: {
    id: number;
    username: string;
    email: string;
    phoneNumber: string;
    status: boolean;
  } | null;
}

interface FormDataType {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  status: boolean;
  password: string;
  confirmPassword: string;
}

interface UpdateAccountData {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  status: boolean;
  password?: string;
}
interface EditingUser {
  id: number;
  username: string;
  email: string;
  phoneNumber: string; // Đảm bảo tên property này đúng
  status: boolean;
}

const UserUpdateModal: React.FC<UserUpdateModalProps> = ({ 
  isOpen, 
  toggle,
  onSave,
  editingUser
}) => {
  const { updateAccount } = useAccountService();
  const [apiError, setApiError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id: 0,
    username: "",
    email: "",
    phoneNumber: "",
    status: false,
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });

  const [touched, setTouched] = useState({
    email: false,
    phoneNumber: false,
    password: false,
    confirmPassword: false
  });

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  });

  // Load dữ liệu cũ khi modal mở và editingUser thay đổi
  useEffect(() => {
    if (editingUser) {
      console.log('EditingUser data:', editingUser); // Kiểm tra dữ liệu nhận được
      setFormData({
        id: editingUser.id,
        username: editingUser.username,
        email: editingUser.email,
        phoneNumber: editingUser.phoneNumber || "", // Thêm fallback
        status: editingUser.status,
        password: "",
        confirmPassword: ""
      });
      
      setTouched({
        email: false,
        phoneNumber: false,
        password: false,
        confirmPassword: false
      });
      
      setErrors({
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: ""
      });
    }
  }, [editingUser, isOpen]);


  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    validateField(name, type === 'checkbox' ? checked : value);
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    validateField(field, formData[field as keyof FormDataType]);
  };

  const validateField = (field: string, value: any) => {
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
        if (value) {
          if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/.test(value)) {
            errorMessage = "Password must be at least 12 characters with uppercase, lowercase, number and special character";
          }
        }
        break;
        
      case "confirmPassword":
        if (formData.password && !value) {
          errorMessage = "Please confirm your password";
        } else if (value && value !== formData.password) {
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
    setApiError(null);
    
    const fieldsToValidate = ['email', 'phoneNumber'];
    if (formData.password) {
      fieldsToValidate.push('password', 'confirmPassword');
    }

    fieldsToValidate.forEach(field => {
      validateField(field, formData[field as keyof FormDataType]);
      setTouched(prev => ({
        ...prev,
        [field]: true
      }));
    });

    const hasErrors = fieldsToValidate.some(field => errors[field as keyof typeof errors] !== "");

    if (!hasErrors) {
      try {
        const updateData: UpdateAccountData = {
          id: formData.id,
          username: formData.username,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          status: formData.status
        };

        if (formData.password) {
          updateData.password = formData.password;
        }

        const response = await updateAccount(updateData);

        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "User information has been updated successfully!",
          confirmButtonColor: "#c79816",
        });

        onSave(response);
        toggle();
        
      } catch (error: any) {
        console.error("Error updating user:", error);
        setApiError(error.response?.data?.message || "Failed to update user");
        
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response.data[0] || "Failed to update user",
          confirmButtonColor: "#c79816",
        });
      }
    }
  };


  return (
    <Modal isOpen={isOpen} toggle={toggle} className="user-modal">
      <ModalHeader toggle={toggle}>
        <FaUserEdit className="modal-icon" /> Update User Information
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
                <Input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  disabled
                  className="disabled-input"
                />
              </div>
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
                  type={showPassword.password ? "text" : "password"}
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

          {formData.password && (
            <FormGroup>
              <div className="input-wrapper">
                <Label for="confirmPassword">Confirm New Password</Label>
                <div className="input-container">
                  <FaLock className="field-icon" />
                  <Input
                    type={showPassword.confirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm your new password"
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
          )}

          <FormGroup>
            <div className="status-wrapper">
              <span className="status-label">Status</span>
              <label className="toggle-switch">
                <Input
                  type="checkbox"
                  name="status"
                  checked={formData.status}
                  onChange={handleChange}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className={`status-text ${formData.status ? 'active' : 'inactive'}`}>
                {formData.status ? 'Active' : 'Inactive'}
              </span>
            </div>
          </FormGroup>
        </Form>
      </ModalBody>

      <ModalFooter>
        <button className="btn-cancel" onClick={toggle}>
          Cancel
        </button>
        <button className="btn-save" onClick={handleSubmit}>
          Update User
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default UserUpdateModal;