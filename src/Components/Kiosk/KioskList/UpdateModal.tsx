import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { FaStore, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaTimes, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './UpdateModalStyle.scss';
import axios from 'axios';

interface District {
  code: string;
  name: string;
}

interface Ward {
  code: string;
  name: string;
}

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
    status: boolean;
  }) => Promise<any>;
  kioskData: {
    id: number;
    name: string;
    address: string;
    phoneNumber: string;
    email: string;
    openingHours: string;
    status: boolean;
  } | null;
}

interface FormError {
  name?: string;
  district?: string;
  ward?: string;
  streetAddress?: string;
  phoneNumber?: string;
  email?: string;
  openingHours?: string;
}

const KioskUpdateModal: React.FC<KioskUpdateModalProps> = ({ isOpen, toggle, onSave, kioskData }) => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const HCMC_CODE = "79"; // Mã TP.HCM

  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    district: '',
    ward: '',
    streetAddress: '',
    phoneNumber: '',
    email: '',
    openingHours: '',
    status: true
  });

  const [errors, setErrors] = useState<FormError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  

  // Fetch districts when component mounts
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await axios.get(`https://provinces.open-api.vn/api/p/${HCMC_CODE}?depth=2`);
        if (response.data && response.data.districts) {
          setDistricts(response.data.districts);
        }
      } catch (error) {
        console.error("Failed to fetch districts:", error);
        toast.error("Failed to load districts");
      }
    };
    fetchDistricts();
  }, []);

  // Fetch wards when district changes
  useEffect(() => {
    const fetchWards = async () => {
      if (formData.district) {
        try {
          const response = await axios.get(`https://provinces.open-api.vn/api/d/${formData.district}?depth=2`);
          if (response.data && response.data.wards) {
            setWards(response.data.wards);
          }
        } catch (error) {
          console.error("Failed to fetch wards:", error);
          toast.error("Failed to load wards");
        }
      } else {
        setWards([]);
      }
    };
    fetchWards();
  }, [formData.district]);

  // Parse address and set initial form data when kioskData changes
  useEffect(() => {
    if (kioskData) {
      const parseAddress = (fullAddress: string) => {
        // Expected format: "street address, ward, district, TP. Hồ Chí Minh"
        const parts = fullAddress.split(',').map(part => part.trim());
        const districtPart = parts[parts.length - 2] || '';
        const wardPart = parts[parts.length - 3] || '';
        const streetPart = parts.slice(0, parts.length - 3).join(',').trim();

        return {
          streetAddress: streetPart,
          district: districts.find(d => d.name === districtPart)?.code || '',
          ward: '' // Will be set after wards are loaded
        };
      };

      const addressParts = parseAddress(kioskData.address);

      setFormData({
        ...kioskData,
        ...addressParts
      });
    }
  }, [kioskData, districts]);

  // Set ward after wards are loaded
  useEffect(() => {
    if (kioskData && wards.length > 0) {
      const addressParts = kioskData.address.split(',').map(part => part.trim());
      const wardPart = addressParts[addressParts.length - 3] || '';
      const wardCode = wards.find(w => w.name === wardPart)?.code || '';
      
      setFormData(prev => ({
        ...prev,
        ward: wardCode
      }));
    }
  }, [wards, kioskData]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^[0-9]{10,11}$/.test(phone);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newValue = name === 'status' ? value === 'true' : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Reset ward when district changes
    if (name === 'district') {
      setFormData(prev => ({
        ...prev,
        ward: ''
      }));
    }

    setHasChanges(true);
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors: FormError = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Kiosk name is required';
      isValid = false;
    }

    if (!formData.district) {
      newErrors.district = 'District is required';
      isValid = false;
    }

    if (!formData.ward) {
      newErrors.ward = 'Ward is required';
      isValid = false;
    }

    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = 'Street address is required';
      isValid = false;
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
      isValid = false;
    } else if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.openingHours.trim()) {
      newErrors.openingHours = 'Opening hours is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please check all required fields');
      return;
    }
  
    try {
      setIsSubmitting(true);
      
      const districtName = districts.find(d => d.code === formData.district)?.name || '';
      const wardName = wards.find(w => w.code === formData.ward)?.name || '';
      const fullAddress = `${formData.streetAddress}, ${wardName}, ${districtName}, TP. Hồ Chí Minh`;
  
      const submitData = {
        ...formData,
        address: fullAddress,
      };
  
      await onSave(submitData); // Chỉ cần await, không cần check response
      toast.success('Updated successfully!');
      setHasChanges(false);
      toggle();
  
    } catch (error: any) {
      // Xử lý error như cũ
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Modal isOpen={isOpen} toggle={toggle} className="upgraded-kiosk-modal" size="lg">
      <ModalHeader toggle={toggle} className="border-bottom-0">
        <div className="modal-title-with-icon">
          <FaStore className="modal-title-icon" />
          <h5>Update Kiosk</h5>
        </div>
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

          {/* Address Fields */}
          <div className="form-group">
            <label>
              <FaMapMarkerAlt className="field-icon" />
              Address <span className="required">*</span>
            </label>
            <div className="row">
              <div className="col-md-6 mb-3">
                <select
                  name="district"
                  className={`form-control ${errors.district ? 'is-invalid' : ''}`}
                  value={formData.district}
                  onChange={handleInputChange}
                >
                  <option value="">Select District</option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
                {errors.district && (
                  <div className="invalid-feedback">{errors.district}</div>
                )}
              </div>
              <div className="col-md-6 mb-3">
                <select
                  name="ward"
                  className={`form-control ${errors.ward ? 'is-invalid' : ''}`}
                  value={formData.ward}
                  onChange={handleInputChange}
                  disabled={!formData.district}
                >
                  <option value="">Select Ward</option>
                  {wards.map((ward) => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))}
                </select>
                {errors.ward && (
                  <div className="invalid-feedback">{errors.ward}</div>
                )}
              </div>
            </div>
            <input
              type="text"
              name="streetAddress"
              className={`form-control ${errors.streetAddress ? 'is-invalid' : ''}`}
              placeholder="Enter street address"
              value={formData.streetAddress}
              onChange={handleInputChange}
            />
            {errors.streetAddress && (
              <div className="invalid-feedback">{errors.streetAddress}</div>
            )}
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

          <div className="form-group">
            <label className="d-block">Status</label>
            <div className="status-toggle">
              <label className={`status-option ${formData.status ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="status"
                  value="true"
                  checked={formData.status}
                  onChange={handleInputChange}
                />
                <span className="status-label">
                  <span className="status-dot"></span>
                  Active
                </span>
              </label>
              <label className={`status-option ${!formData.status ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="status"
                  value="false"
                  checked={!formData.status}
                  onChange={handleInputChange}
                />
                <span className="status-label">
                  <span className="status-dot"></span>
                  Inactive
                </span>
              </label>
            </div>
          </div>
        </div>
        </ModalBody>

      <ModalFooter className="border-top-0">
        <div className="modal-actions">
          <button
            className="btn btn-outline-secondary"
            onClick={toggle}
            disabled={isSubmitting}
          >
            <FaTimes className="button-icon" />
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !hasChanges}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Updating...
              </>
            ) : (
              <>
                <FaSave className="button-icon" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default KioskUpdateModal;