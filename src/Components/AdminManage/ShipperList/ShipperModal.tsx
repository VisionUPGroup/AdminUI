import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from "reactstrap";
import { 
  FaUserPlus, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaUser, 
  FaBirthdayCake 
} from "react-icons/fa";
import axios from "axios";
import "./ShipperModal.scss";

interface District {
  code: number; // API trả về code dạng number
  name: string;
  division_type: string;
  codename: string;
  province_code: number;
}

interface Ward {
  code: number; // API trả về code dạng number
  name: string;
  division_type: string;
  codename: string;
  district_code: number;
}

interface ShipperModalProps {
  isOpen: boolean;
  toggle: () => void;
  onSave: (data: {
    username: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    address: string;
    birthday: string;
  }) => void;
}

const ShipperModal: React.FC<ShipperModalProps> = ({ isOpen, toggle, onSave }) => {
  const HCMC_CODE = "79";
  const [apiError, setApiError] = useState<string | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    fullName: "",
    district: "",
    ward: "",
    streetAddress: "",
    birthday: ""
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    fullName: "",
    district: "",
    ward: "",
    streetAddress: "",
    birthday: ""
  });

  const [touched, setTouched] = useState({
    username: false,
    email: false,
    phoneNumber: false,
    fullName: false,
    district: false,
    ward: false,
    streetAddress: false,
    birthday: false
  });

  // Load districts when component mounts
  useEffect(() => {
    const fetchDistricts = async () => {
      setIsLoadingDistricts(true);
      try {
        const response = await axios.get(
          `https://provinces.open-api.vn/api/p/${HCMC_CODE}?depth=2`
        );
        if (response.data && response.data.districts) {
          // Transform data to match our interface
          const transformedDistricts = response.data.districts.map((district: any) => ({
            code: district.code,
            name: district.name,
            division_type: district.division_type,
            codename: district.codename,
            province_code: district.province_code
          }));
          setDistricts(transformedDistricts);
        }
      } catch (error) {
        console.error("Failed to fetch districts:", error);
      } finally {
        setIsLoadingDistricts(false);
      }
    };
    
    if (isOpen) {
      fetchDistricts();
    }
  }, [isOpen]);

  // Load wards when district changes
  useEffect(() => {
    const fetchWards = async () => {
      if (formData.district) {
        setIsLoadingWards(true);
        try {
          const response = await axios.get(
            `https://provinces.open-api.vn/api/d/${formData.district}?depth=2`
          );
          if (response.data && response.data.wards) {
            // Transform data to match our interface
            const transformedWards = response.data.wards.map((ward: any) => ({
              code: ward.code,
              name: ward.name,
              division_type: ward.division_type,
              codename: ward.codename,
              district_code: ward.district_code
            }));
            setWards(transformedWards);
          }
        } catch (error) {
          console.error("Failed to fetch wards:", error);
        } finally {
          setIsLoadingWards(false);
        }
      } else {
        setWards([]);
      }
    };
  
    fetchWards();
  }, [formData.district]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'district' ? { ward: '' } : {})
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

      case "fullName":
        if (!value) {
          errorMessage = "Full name is required";
        } else if (value.length < 2) {
          errorMessage = "Full name must be at least 2 characters";
        }
        break;

      case "district":
        if (!value) {
          errorMessage = "District is required";
        }
        break;

      case "ward":
        if (!value) {
          errorMessage = "Ward is required";
        }
        break;

      case "streetAddress":
        if (!value) {
          errorMessage = "Street address is required";
        } else if (value.length < 5) {
          errorMessage = "Street address must be at least 5 characters";
        }
        break;

      case "birthday":
        if (!value) {
          errorMessage = "Birthday is required";
        }
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18) {
          errorMessage = "Shipper must be at least 18 years old";
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
  
    const hasErrors = Object.values(errors).some(error => error !== "");
    if (!hasErrors) {
      try {
        const { 
          district, 
          ward, 
          streetAddress, 
          ...otherData 
        } = formData;
        
        // Format full address - convert string to number for comparison
        const selectedDistrict = districts.find(d => d.code === Number(district));
        const selectedWard = wards.find(w => w.code === Number(ward));
        
        const fullAddress = [
          streetAddress,
          selectedWard?.name,
          selectedDistrict?.name,
          "TP. Hồ Chí Minh"
        ].filter(Boolean).join(", ");
  
        const submitData = {
          ...otherData,
          address: fullAddress,
          birthday: new Date(otherData.birthday).toISOString()
        };
  
        await onSave(submitData);
        
        // Reset form
        setFormData({
          username: "",
          email: "",
          phoneNumber: "",
          fullName: "",
          district: "",
          ward: "",
          streetAddress: "",
          birthday: ""
        });
        setTouched({
          username: false,
          email: false,
          phoneNumber: false,
          fullName: false,
          district: false,
          ward: false,
          streetAddress: false,
          birthday: false
        });
        
      } catch (error: any) {
        setApiError(error.message || "An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="user-modal">
      <ModalHeader toggle={toggle}>
        <FaUserPlus className="modal-icon" /> Create New Shipper
      </ModalHeader>
      
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          {apiError && (
            <div className="api-error-message">{apiError}</div>
          )}
          
          <FormGroup>
            <div className="input-wrapper">
              <Label for="fullName">Full Name</Label>
              <div className="input-container">
                <FaUser className="field-icon" />
                <Input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('fullName')}
                  className={touched.fullName && errors.fullName ? 'is-invalid' : ''}
                />
              </div>
              {touched.fullName && errors.fullName && (
                <div className="error-message">{errors.fullName}</div>
              )}
            </div>
          </FormGroup>

          {/* Username Field */}
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

          {/* Email Field */}
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

          {/* Phone Number Field */}
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

          {/* District Field */}
          <FormGroup>
            <div className="input-wrapper">
              <Label for="district">District</Label>
              <div className="input-container">
                <Input
                  type="select"
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  onBlur={() => handleBlur('district')}
                  className={touched.district && errors.district ? 'is-invalid' : ''}
                  disabled={isLoadingDistricts}
                >
                  <option value="">
                    {isLoadingDistricts ? "Loading districts..." : "Select District"}
                  </option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </Input>
              </div>
              {touched.district && errors.district && (
                <div className="error-message">{errors.district}</div>
              )}
            </div>
          </FormGroup>

          {/* Ward Field */}
          <FormGroup>
            <div className="input-wrapper">
              <Label for="ward">Ward</Label>
              <div className="input-container">
                <Input
                  type="select"
                  id="ward"
                  name="ward"
                  value={formData.ward}
                  onChange={handleChange}
                  onBlur={() => handleBlur('ward')}
                  className={touched.ward && errors.ward ? 'is-invalid' : ''}
                  disabled={!formData.district || isLoadingWards}
                >
                  <option value="">
                  {isLoadingWards ? "Loading wards..." : "Select Ward"}
                  </option>
                  {wards.map((ward) => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))}
                </Input>
              </div>
              {touched.ward && errors.ward && (
                <div className="error-message">{errors.ward}</div>
              )}
            </div>
          </FormGroup>

          {/* Street Address Field */}
          <FormGroup>
            <div className="input-wrapper">
              <Label for="streetAddress">Street Address</Label>
              <div className="input-container">
                <FaMapMarkerAlt className="field-icon" />
                <Input
                  type="text"
                  id="streetAddress"
                  name="streetAddress"
                  placeholder="Enter street address"
                  value={formData.streetAddress}
                  onChange={handleChange}
                  onBlur={() => handleBlur('streetAddress')}
                  className={touched.streetAddress && errors.streetAddress ? 'is-invalid' : ''}
                />
              </div>
              {touched.streetAddress && errors.streetAddress && (
                <div className="error-message">{errors.streetAddress}</div>
              )}
            </div>
          </FormGroup>

          {/* Birthday Field */}
          {/* Birthday Field */}
          <FormGroup>
            <div className="input-wrapper">
              <Label for="birthday">Birthday</Label>
              <div className="input-container">
                <FaBirthdayCake className="field-icon" />
                <Input
                  type="date"
                  id="birthday"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  onBlur={() => handleBlur('birthday')}
                  className={touched.birthday && errors.birthday ? 'is-invalid' : ''}
                />
              </div>
              {touched.birthday && errors.birthday && (
                <div className="error-message">{errors.birthday}</div>
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
          Create Shipper
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default ShipperModal;