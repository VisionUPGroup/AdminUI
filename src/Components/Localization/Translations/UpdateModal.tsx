import React, { useState, useEffect } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from "reactstrap";

interface KioskUpdateModalProps {
  isOpen: boolean;
  toggle: () => void;
  onSave: (data: {
    id: number;
    name: string;
    address: string;
    phoneNumber: string;
    email: string;
    openingHours: string;
    createdAt: string; // Keep existing createdAt
    updatedAt: string; // Update to current time
    status: boolean; // Ensure status is boolean
  }) => void;
  kioskData: {
    id: number;
    name: string;
    address: string;
    phoneNumber: string;
    email: string;
    openingHours: string;
    createdAt: string; // Existing createdAt
    status: boolean; // Ensure status is boolean
  } | null;
}

const KioskUpdateModal: React.FC<KioskUpdateModalProps> = ({
  isOpen,
  toggle,
  onSave,
  kioskData,
}) => {
  const [formData, setFormData] = useState<{
    name: string;
    address: string;
    phoneNumber: string;
    email: string;
    openingHours: string;
    status: boolean; // Keep status as boolean
  }>({
    name: "",
    address: "",
    phoneNumber: "",
    email: "",
    openingHours: "",
    status: false, // Default status
  });

  const [alertVisible, setAlertVisible] = useState(false);

  useEffect(() => {
    if (kioskData) {
      setFormData({
        name: kioskData.name,
        address: kioskData.address,
        phoneNumber: kioskData.phoneNumber,
        email: kioskData.email,
        openingHours: kioskData.openingHours,
        status: kioskData.status,

      });
    }
  }, [kioskData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Convert value to boolean for status
    if (name === "status") {
      setFormData({ ...formData, [name]: value === "true" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = () => {
    // Simple validation example
    if (!formData.name || !formData.address || !formData.phoneNumber || !formData.email || !formData.openingHours) {
      alert("Please fill in all required fields.");
      return;
    }

    const updatedData = {
      ...formData,
      id: kioskData?.id || 0,
      createdAt: kioskData?.createdAt || new Date().toISOString(), // Keep existing createdAt
      updatedAt: new Date().toISOString(), // Set updatedAt to current time
    };

    console.log("Updated Kiosk Data:", updatedData); // Log the updated data to the console

    onSave(updatedData);
    setAlertVisible(true); // Show alert after saving
    toggle(); // Close the modal
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Update Kiosk</ModalHeader>
      <ModalBody>
        {alertVisible && (
          <Alert color="success" toggle={() => setAlertVisible(false)}>
            Kiosk updated successfully!
          </Alert>
        )}
        <form>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              className="form-control"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              className="form-control"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Opening Hours</label>
            <input
              type="text"
              name="openingHours"
              className="form-control"
              value={formData.openingHours}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              className="form-control"
              value={formData.status.toString()} // Convert boolean to string for select
              onChange={handleInputChange}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleSave}>
          Save Changes
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default KioskUpdateModal;
