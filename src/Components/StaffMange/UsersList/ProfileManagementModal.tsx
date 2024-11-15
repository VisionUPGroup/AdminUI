import React, { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { FaTimes, FaCalendar, FaUpload, FaImage, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import './ProfileManagementModalStyle.scss';
import Swal from 'sweetalert2';

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const initialFormData: ProfileFormData = {
    fullName: '',
    phoneNumber: '',
    address: '',
    birthday: '',
    status: true,
 
  };

  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);

  useEffect(() => {
    if (editingProfile) {
      console.log('Setting edit mode with profile:', editingProfile);
      
      setFormData({
        fullName: editingProfile.fullName,
        phoneNumber: editingProfile.phoneNumber || '',
        address: editingProfile.address,
        birthday: editingProfile.birthday ? new Date(editingProfile.birthday).toISOString().split('T')[0] : '',
        status: editingProfile.status,
       
      });
  
    } else {
      console.log('Setting create mode with accountId:', accountId);
      setFormData(initialFormData);
    
    }
  }, [editingProfile]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusToggle = (): void => {
    setFormData((prev) => ({
      ...prev,
      status: !prev.status
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10,11}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Phone number must be 10-11 digits';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (!formData.birthday) {
      errors.birthday = 'Birthday is required';
    } else {
      const birthdayDate = new Date(formData.birthday);
      const today = new Date();
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
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please check all required fields',
        confirmButtonColor: '#c79816'
      });
      return;
    }

    setIsLoading(true);

    try {
      const isUpdate = Boolean(editingProfile);
      console.log(`${isUpdate ? 'Updating' : 'Creating'} profile...`);

      if (isUpdate) {
        // Handle Update
        const updateData: UpdateProfileRequest = {
          id: editingProfile!.id,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          urlImage: editingProfile!.urlImage, // Giữ nguyên urlImage cũ
          birthday: new Date(formData.birthday).toISOString(),
          status: formData.status
        };

        console.log('Updating profile:', updateData);
        await onSave(updateData);
      } else {
        // Handle Create
        const createData: CreateProfileRequest = {
          accountID: accountId,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          urlImage: '', // Set empty string for new profiles
          birthday: new Date(formData.birthday).toISOString()
        };

        console.log('Creating profile:', createData);
        await onSave(createData);
      }

      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Profile ${isUpdate ? 'updated' : 'created'} successfully!`,
        confirmButtonColor: '#c79816'
      });

      onClose();
    } catch (error) {
      console.error(`Error ${editingProfile ? 'updating' : 'creating'} profile:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to ${editingProfile ? 'update' : 'create'} profile. Please try again.`,
        confirmButtonColor: '#c79816'
      });
    } finally {
      setIsLoading(false);
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
        {/* Form Fields */}
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter full name"
            className={formErrors.fullName ? 'error' : ''}
          />
          {formErrors.fullName && (
            <span className="error-message">{formErrors.fullName}</span>
          )}
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder="Enter phone number"
            className={formErrors.phoneNumber ? 'error' : ''}
          />
          {formErrors.phoneNumber && (
            <span className="error-message">{formErrors.phoneNumber}</span>
          )}
        </div>

        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter address"
            className={formErrors.address ? 'error' : ''}
          />
          {formErrors.address && (
            <span className="error-message">{formErrors.address}</span>
          )}
        </div>

        <div className="form-group">
          <label>Birthday</label>
          <div className="date-input-wrapper">
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleInputChange}
              className={formErrors.birthday ? 'error' : ''}
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