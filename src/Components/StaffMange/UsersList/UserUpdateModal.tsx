import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input } from "reactstrap";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaToggleOn } from "react-icons/fa";

interface UserUpdateModalProps {
  isOpen: boolean;
  toggle: () => void;
  onSave: (data: { 
    username: string; 
    email: string; 
    roleID: number; 
    phoneNumber: string; 
    password: string;
    status: boolean;
  }) => void;
  editingUser: {
    username: string;
    email: string;
    roleID: number;
    phoneNumber: string;
    status: boolean;
  } | null;
}

const UserUpdateModal: React.FC<UserUpdateModalProps> = ({ isOpen, toggle, onSave, editingUser }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [roleID, setRoleID] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState(true);
  
  // Error states
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  
  // Show/Hide password states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load editing user data when available
  useEffect(() => {
    if (editingUser) {
      setUsername(editingUser.username);
      setEmail(editingUser.email);
      setRoleID(editingUser.roleID);
      setPhoneNumber(editingUser.phoneNumber);
      setStatus(editingUser.status);
      // Reset password fields as they shouldn't be pre-filled
      setPassword("");
      setConfirmPassword("");
    }
  }, [editingUser]);

  // Validation functions
  const isValidPhoneNumber = (number: string) => /^(?:\+84|0)(?:[1-9][0-9]{8})$/.test(number);
  const isValidPassword = (pass: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/.test(pass);
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidUsername = (username: string) => /^[A-Za-z0-9]{6,30}$/.test(username);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    // Clear previous error messages
    setUsernameError("");
    setEmailError("");
    setPhoneError("");
    setPasswordError("");
    setConfirmPasswordError("");

    // Username validation
    if (username.trim() === "") {
      setUsernameError("Username is required.");
      hasError = true;
    } else if (!isValidUsername(username)) {
      setUsernameError("Username must be 6-30 characters long and contain only alphanumeric characters.");
      hasError = true;
    }

    // Email validation
    if (email.trim() === "") {
      setEmailError("Email is required.");
      hasError = true;
    } else if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address.");
      hasError = true;
    }

    // Phone validation
    if (phoneNumber.trim() === "") {
      setPhoneError("Phone number is required.");
      hasError = true;
    } else if (!isValidPhoneNumber(phoneNumber)) {
      setPhoneError("Phone number must start with +84 or 0 followed by 8 digits.");
      hasError = true;
    }

    // Password validation (only if provided)
    if (password) {
      if (!isValidPassword(password)) {
        setPasswordError("Password must be at least 12 characters long and include uppercase, lowercase, number, and special character.");
        hasError = true;
      }

      if (password !== confirmPassword) {
        setConfirmPasswordError("Passwords do not match.");
        hasError = true;
      }
    }

    if (hasError) return;

    // Call onSave with validated data
    onSave({ 
      username, 
      email, 
      roleID, 
      phoneNumber, 
      password,
      status
    });
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="user-modal">
    <ModalHeader toggle={toggle}>
      <div className="modal-title">
        <FaUser className="modal-icon" />
        Update User
      </div>
    </ModalHeader>
    <ModalBody>
      <Form onSubmit={handleSave}>
        <FormGroup className="input-wrapper">
          <Label for="username">Username:</Label>
          <div className="input-container">
            <FaUser className="field-icon" />
            <Input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={usernameError ? "is-invalid" : ""}
              required
            />
          </div>
          {usernameError && <div className="error-message">{usernameError}</div>}
        </FormGroup>

        <FormGroup className="input-wrapper">
          <Label for="email">Email:</Label>
          <div className="input-container">
            <FaEnvelope className="field-icon" />
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={emailError ? "is-invalid" : ""}
              required
            />
          </div>
          {emailError && <div className="error-message">{emailError}</div>}
        </FormGroup>

        <FormGroup className="input-wrapper">
          <Label for="phoneNumber">Phone Number:</Label>
          <div className="input-container">
            <FaPhone className="field-icon" />
            <Input
              type="text"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={phoneError ? "is-invalid" : ""}
              required
            />
          </div>
          {phoneError && <div className="error-message">{phoneError}</div>}
        </FormGroup>

        <FormGroup className="input-wrapper">
          <Label for="password">New Password (Optional):</Label>
          <div className="input-container">
            <FaLock className="field-icon" />
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={passwordError ? "is-invalid" : ""}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {passwordError && <div className="error-message">{passwordError}</div>}
        </FormGroup>

        <FormGroup className="input-wrapper">
          <Label for="confirmPassword">Confirm New Password:</Label>
          <div className="input-container">
            <FaLock className="field-icon" />
            <Input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={confirmPasswordError ? "is-invalid" : ""}
              disabled={!password}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {confirmPasswordError && <div className="error-message">{confirmPasswordError}</div>}
        </FormGroup>

        <FormGroup className="input-wrapper">
          <div className="status-wrapper">
            <span className="status-label">Status:</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={status}
                onChange={(e) => setStatus(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className={`status-text ${status ? 'active' : 'inactive'}`}>
              {status ? 'Active' : 'Inactive'}
            </span>
          </div>
        </FormGroup>
      </Form>
    </ModalBody>
    <ModalFooter>
      <Button className="btn-save" onClick={handleSave}>
        Update
      </Button>
      <Button className="btn-cancel" onClick={toggle}>
        Cancel
      </Button>
    </ModalFooter>
  </Modal>
);
};


export default UserUpdateModal;