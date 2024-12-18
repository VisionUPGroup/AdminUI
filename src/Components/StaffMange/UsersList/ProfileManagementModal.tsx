import React, { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { FaTimes, FaCalendar, FaUpload, FaImage, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import './ProfileManagementModalStyle.scss';
import Swal from 'sweetalert2';

// Interfaces
interface CreateProfileRequest {
  accountID: number;
  fullName: string;
  phoneNumber: string;
  address: string;
  urlImage: string;
  birthday: string;
}

interface UpdateProfileRequest {
  id: number;
  fullName: string;
  phoneNumber: string;
  address: string;
  urlImage: string;
  birthday: string;
  status: boolean;
}

interface Profile {
  id: number;
  accountID: number;
  fullName: string;
  phoneNumber?: string;
  address: string;
  urlImage: string;
  birthday: string;
  status: boolean;
}

interface ProfileFormData {
  fullName: string;
  phoneNumber: string;
  address: string;
  birthday: string;
  status: boolean;
}

interface ProfileManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileData: CreateProfileRequest | UpdateProfileRequest | FormData) => Promise<void>;
  editingProfile: Profile | null | undefined;
  accountId: number;
}

const ProfileManagementModal: React.FC<ProfileManagementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingProfile,
  accountId
}) => {
  // States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialFormData: ProfileFormData = {
    fullName: '',
    phoneNumber: '',
    address: '',
    birthday: '',
    status: true,
  };

  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);

  // Effects
  useEffect(() => {
    if (editingProfile) {
      setFormData({
        fullName: editingProfile.fullName,
        phoneNumber: editingProfile.phoneNumber || '',
        address: editingProfile.address,
        birthday: editingProfile.birthday ? new Date(editingProfile.birthday).toISOString().split('T')[0] : '',
        status: editingProfile.status,
      });
      setImagePreview(editingProfile.urlImage || '');
    } else {
      setFormData(initialFormData);
      setImagePreview('');
    }
  }, [editingProfile]);

  // Handlers
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleStatusToggle = (): void => {
    setFormData((prev) => ({
      ...prev,
      status: !prev.status
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Full Name Validation
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    } else if (formData.fullName.trim().length > 50) {
      errors.fullName = 'Full name cannot exceed 50 characters';
    }
    
    // Phone Number Validation
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10,11}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Phone number must be 10-11 digits';
    } else if (!/(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Invalid Vietnamese phone number format';
    }
    
    // Address Validation
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    } else if (formData.address.trim().length < 5) {
      errors.address = 'Address must be at least 5 characters';
    } else if (formData.address.trim().length > 200) {
      errors.address = 'Address cannot exceed 200 characters';
    }
    
    // Birthday Validation - only check required and future date
    if (!formData.birthday) {
      errors.birthday = 'Birthday is required';
    } else {
      const birthdayDate = new Date(formData.birthday);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (birthdayDate > today) {
        errors.birthday = 'Birthday cannot be in the future';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      const errorMessages = Object.values(formErrors).join('\n');
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        html: `Please fix the following errors:<br/><br/>${errorMessages.split('\n').join('<br/>')}`,
        confirmButtonColor: '#c79816'
      });
      return;
    }
  
    setIsLoading(true); // Bắt đầu loading
  
    try {
      const isUpdate = Boolean(editingProfile);
  
      if (isUpdate) {
        const updateData: UpdateProfileRequest = {
          id: editingProfile!.id,
          fullName: formData.fullName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          address: formData.address.trim(),
          urlImage: editingProfile!.urlImage,
          birthday: new Date(formData.birthday).toISOString(),
          status: formData.status
        };
  
        await onSave(updateData);
      } else {
        const createData: CreateProfileRequest = {
          accountID: accountId,
          fullName: formData.fullName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          address: formData.address.trim(),
          urlImage: 'default-avatar.png',
          birthday: new Date(formData.birthday).toISOString()
        };
  
        await onSave(createData);
      }
    } catch (error) {
      console.error(`Error ${editingProfile ? 'updating' : 'creating'} profile:`, error);
      throw error;
    } finally {
      setIsLoading(false); // Luôn đảm bảo tắt loading dù thành công hay thất bại
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="profile-modal">
        <div className="modal-header">
          <h2>{editingProfile ? 'Edit Profile' : 'Create New Profile'}</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Full Name <span className="required">*</span></label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter full name"
              className={formErrors.fullName ? 'error' : ''}
              maxLength={50}
            />
            {formErrors.fullName && (
              <span className="error-message">{formErrors.fullName}</span>
            )}
          </div>

          <div className="form-group">
            <label>Phone Number <span className="required">*</span></label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              className={formErrors.phoneNumber ? 'error' : ''}
              maxLength={11}
            />
            {formErrors.phoneNumber && (
              <span className="error-message">{formErrors.phoneNumber}</span>
            )}
          </div>

          <div className="form-group">
            <label>Address <span className="required">*</span></label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter address"
              className={formErrors.address ? 'error' : ''}
              maxLength={200}
            />
            {formErrors.address && (
              <span className="error-message">{formErrors.address}</span>
            )}
          </div>

          <div className="form-group">
            <label>Birthday <span className="required">*</span></label>
            <div className="date-input-wrapper">
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleInputChange}
                className={formErrors.birthday ? 'error' : ''}
                max={new Date().toISOString().split('T')[0]}
              />
              <FaCalendar className="calendar-icon" />
            </div>
            {formErrors.birthday && (
              <span className="error-message">{formErrors.birthday}</span>
            )}
          </div>

          {editingProfile && (
            <div className="form-group status-toggle">
              <label>Status</label>
              <button 
                type="button" 
                className={`toggle-btn ${formData.status ? 'active' : ''}`}
                onClick={handleStatusToggle}
              >
                {formData.status ? <FaToggleOn /> : <FaToggleOff />}
                <span>{formData.status ? 'Active' : 'Inactive'}</span>
              </button>
            </div>
          )}

          <div className="modal-footer">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`submit-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  <span>{editingProfile ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                editingProfile ? 'Update Profile' : 'Create Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileManagementModal;