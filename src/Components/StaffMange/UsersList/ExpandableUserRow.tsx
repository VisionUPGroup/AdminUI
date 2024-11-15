import React from 'react';
import { FaChevronDown, FaChevronUp, FaPen, FaTrash, FaPlus, FaRegUserCircle } from 'react-icons/fa';
import "./ExpandableUserRowStyle.scss"
interface Role {
  id: number;
  name: string;
  description: string;
  status: boolean;
}

interface UserData {
  id: number;
  username: string;
  email: string;
  status: boolean;
  roleID: number;
  phoneNumber: string;
  role: Role;
}

interface Profile {
  accountID: number;
  fullName: string;
  phoneNumber: string;
  address: string;
  urlImage: string;
  birthday: string;
}

interface ExpandableUserRowProps {
  user: UserData;
  profiles: Profile[];
  isExpanded: boolean;
  onToggle: (userId: number) => void;
  onEdit: (user: UserData) => void;
  onDelete: (userId: number) => void;
  isLoadingProfiles: boolean;
}

const ExpandableUserRow: React.FC<ExpandableUserRowProps> = ({ 
  user, 
  profiles, 
  isExpanded, 
  onToggle,
  onEdit,
  onDelete,
  isLoadingProfiles 
}) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <>
      <tr 
        onClick={() => onToggle(user.id)}
        className={`user-row ${isExpanded ? 'expanded' : ''}`}
      >
        <td>
          <div className="user-info">
            <div className="user-icon">
              <FaRegUserCircle />
            </div>
            <div className="user-details">
              <div className="name">{user.username}</div>
              <div className="email">{user.email}</div>
            </div>
          </div>
        </td>
        <td>{user.role.name}</td>
        <td>
          <span className={`status-badge ${user.status ? 'active' : 'inactive'}`}>
            {user.status ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>
          <div className="actions">
            <button 
              className="edit-btn"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onEdit(user);
              }}
            >
              <FaPen />
            </button>
            <button 
              className="delete-btn"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onDelete(user.id);
              }}
            >
              <FaTrash />
            </button>
            <button 
              className="expand-btn"
              onClick={() => onToggle(user.id)}
            >
              {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="expanded-content">
          <td colSpan={4}>
            <div className="profiles-section">
              <div className="profiles-header">
                <h3>User Profiles</h3>
                <button className="add-profile-btn">
                  <FaPlus /> Add New Profile
                </button>
              </div>
              
              {isLoadingProfiles ? (
                <div className="loading-profiles">
                  <div className="spinner"></div>
                  <p>Loading profiles...</p>
                </div>
              ) : !profiles || profiles.length === 0 ? (
                <div className="no-profiles">
                  <p>No profiles found for this user</p>
                  <button className="create-first-profile-btn">
                    <FaPlus /> Create First Profile
                  </button>
                </div>
              ) : (
                <div className="profiles-grid">
                  {profiles.map((profile: Profile) => (
                    <div key={profile.accountID} className="profile-card">
                      <div className="profile-header">
                        <div className="profile-avatar">
                          {profile.urlImage ? (
                            <img 
                              src={profile.urlImage} 
                              alt={profile.fullName} 
                              className="avatar-image"
                            />
                          ) : (
                            <div className="avatar-placeholder">
                              <FaRegUserCircle />
                            </div>
                          )}
                        </div>
                        <h4>{profile.fullName}</h4>
                      </div>
                      
                      <div className="profile-info">
                        <div className="info-item">
                          <i className="fa fa-phone info-icon"></i>
                          <div className="info-content">
                            <label>Phone</label>
                            <span>{profile.phoneNumber || 'N/A'}</span>
                          </div>
                        </div>
                        
                        <div className="info-item">
                          <i className="fa fa-birthday-cake info-icon"></i>
                          <div className="info-content">
                            <label>Birthday</label>
                            <span>
                              {profile.birthday ? formatDate(profile.birthday) : 'N/A'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="info-item">
                          <i className="fa fa-map-marker info-icon"></i>
                          <div className="info-content">
                            <label>Address</label>
                            <span>{profile.address || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="profile-actions">
                        <button className="edit-btn">
                          <FaPen />
                        </button>
                        <button className="delete-btn">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default ExpandableUserRow;