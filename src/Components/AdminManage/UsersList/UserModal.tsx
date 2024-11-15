import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input } from "reactstrap";

interface UserModalProps {
  isOpen: boolean;
  toggle: () => void;
  onSave: (data: { username: string; email: string; roleID: number; phoneNumber: string; password: string }) => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, toggle, onSave }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [roleID, setRoleID] = useState(1); // Default role ID
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isValidPhoneNumber = (number: string) => /^(?:\+84|0)(?:[1-9][0-9]{8})$/.test(number);
  const isValidPassword = (pass: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/.test(pass);
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidUsername = (username: string) => /^[A-Za-z0-9]{6,30}$/.test(username);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    let hasError = false; // Flag to track if there are any errors

    // Clear previous error messages
    setUsernameError("");
    setEmailError("");
    setPhoneError("");
    setPasswordError("");
    setConfirmPasswordError("");

    // Validation checks
    if (username.trim() === "") {
      setUsernameError("Username is required.");
      hasError = true;
    } else if (!isValidUsername(username)) {
      setUsernameError("Username must be 6-30 characters long and contain only alphanumeric characters.");
      hasError = true;
    }

    if (email.trim() === "") {
      setEmailError("Email is required.");
      hasError = true;
    } else if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address.");
      hasError = true;
    }

    if (phoneNumber.trim() === "") {
      setPhoneError("Phone number is required.");
      hasError = true;
    } else if (!isValidPhoneNumber(phoneNumber)) {
      setPhoneError("Phone number must start with +84 or 0 followed by 8 digits.");
      hasError = true;
    }

    if (password.trim() === "") {
      setPasswordError("Password is required.");
      hasError = true;
    } else if (!isValidPassword(password)) {
      setPasswordError("Password must be at least 12 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.");
      hasError = true;
    }

    if (confirmPassword.trim() === "") {
      setConfirmPasswordError("Confirm Password is required.");
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      hasError = true;
    }

    if (hasError) return; // Stop execution if there are errors

    // Call onSave with validated data
    onSave({ username, email, roleID, phoneNumber, password });
    toggle(); // Close modal after save
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Create User</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSave}>
          <FormGroup>
            <Label for="username">Username:</Label>
            <Input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            {usernameError && <p style={{ color: 'red' }}>{usernameError}</p>} {/* Username error message */}
          </FormGroup>
          <FormGroup>
            <Label for="email">Email:</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {emailError && <p style={{ color: 'red' }}>{emailError}</p>} {/* Email error message */}
          </FormGroup>
          <FormGroup>
            <Label for="phoneNumber">Phone Number:</Label>
            <Input
              type="text"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            {phoneError && <p style={{ color: 'red' }}>{phoneError}</p>} {/* Phone number error message */}
          </FormGroup>
          <FormGroup>
            <Label for="password">Password:</Label>
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Label check>
              <Input
                type="checkbox"
                onChange={() => setShowPassword(!showPassword)}
              />
              Show Password
            </Label>
            {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>} {/* Password error message */}
          </FormGroup>
          <FormGroup>
            <Label for="confirmPassword">Confirm Password:</Label>
            <Input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Label check>
              <Input
                type="checkbox"
                onChange={() => setShowConfirmPassword(!showConfirmPassword)}
              />
              Show Confirm Password
            </Label>
            {confirmPasswordError && <p style={{ color: 'red' }}>{confirmPasswordError}</p>} {/* Confirm password error message */}
          </FormGroup>
        </Form>
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

export default UserModal;
