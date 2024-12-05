import React, { Fragment, useCallback, useEffect, useState } from "react";
import ProfileManagementModal from "./ProfileManagementModal";
import {
  FaPlus,
  FaSearch,
  FaArrowUp,
  FaUsers,
  FaRegUserCircle,
  FaPen,
  FaTrash,
  FaIdCard,
  FaTimes,
  FaPhone,
  FaBirthdayCake,
  FaMapMarkerAlt,
  FaClinicMedical,
} from "react-icons/fa";
import { useAccountService } from "../../../../Api/accountService";
import { useAuthService } from "../../../../Api/authService";
import UserModal from "./UserModal";
import Pagination from "./Pagination";
import Swal from "sweetalert2";
import "./UserStyle.scss";
import "./SplitViewStyle.scss";
import "./ProfileCardStyle.scss";
import { useProfileService } from "../../../../Api/profileService";
import ExpandableUserRow from "./ExpandableUserRow";
import RefractionModal from "./RefractionRecordsModal";
import UserUpdateModal from "./UserUpdateModal";
import EnhancedSearch from "./EnhancedSearch";
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

interface ApiResponse {
  items: UserData[];
  totalItems: number;
  currentPage: number;
}
interface Profile {
  id: number;
  accountID: number;
  fullName: string;
  phoneNumber: string;
  address: string;
  urlImage: string;
  birthday: string;
  status: boolean;
}

const UsersList: React.FC = () => {
  const { fetchAccountByRole, deleteAccount } = useAccountService();
  const { register } = useAuthService();
  const {
    fetchProfilesByAccountId,
    createProfiles,
    deleteProfile,
    updateProfile,
  } = useProfileService();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [userData, setUserData] = useState<UserData[]>([]);
  const [userProfiles, setUserProfiles] = useState<Profile[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(
    null
  );
  const [isRefractionPanelOpen, setIsRefractionPanelOpen] = useState(false);
  const [selectedProfileForRefraction, setSelectedProfileForRefraction] =
    useState<{ id: number; name: string } | null>(null);
  const itemsPerPage = 10;
  const [profileCurrentPage, setProfileCurrentPage] = useState(1);
  const [profileTotalPages, setProfileTotalPages] = useState(1);
  const [profileItemsPerPage] = useState(6); // Số profiles trên mỗi trang

  const getUserData = async (
    page: number,
    searchTerm: string,
    status?: "all" | "active" | "inactive"
  ) => {
    setIsLoading(true);
    try {
      let apiStatus;
      if (status === "active") apiStatus = true;
      else if (status === "inactive") apiStatus = false;

      const response = await fetchAccountByRole(
        1,
        searchTerm || undefined,
        page,
        apiStatus,
        undefined
      );

      if (response?.items) {
        setUserData(response.items);
        setTotalItems(response.totalItems);
        setTotalPages(Math.ceil(response.totalItems / itemsPerPage));
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
      setUserData([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };
  const handleCreateProfile = () => {
    setEditingProfile(null);
    setIsProfileModalOpen(true);
  };
  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setIsProfileModalOpen(true);
  };
  const handleProfileClick = (profileId: number) => {
    setSelectedProfileId(profileId);
    setIsRefractionPanelOpen(true);
  };
  const handleViewRefractionRecords = (
    profile: Profile,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra profile card
    setSelectedProfileForRefraction({
      id: profile.id,
      name: profile.fullName,
    });
  };
  const handleProfilePageChange = async (page: number) => {
    if (!selectedUser) return;

    try {
      setIsLoadingProfiles(true);
      const response = await fetchProfilesByAccountId(
        selectedUser.id,
        page,
        profileItemsPerPage
      );

      setUserProfiles(
        Array.isArray(response.items) ? response.items : [response.items]
      );
      setProfileCurrentPage(page);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load profiles. Please try again.",
      });
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  const handleDeleteProfile = async (profileId: number) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#c79816",
        cancelButtonColor: "#000000",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await deleteProfile(profileId);
        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Profile has been deleted.",
          confirmButtonColor: "#c79816",
        });

        // Refresh profiles sau khi xóa
        if (selectedUser) {
          const response = await fetchProfilesByAccountId(
            selectedUser.id,
            profileCurrentPage,
            profileItemsPerPage
          );

          // Cập nhật lại danh sách profiles
          setUserProfiles(
            Array.isArray(response.items) ? response.items : [response.items]
          );

          // Nếu page hiện tại không còn profiles nào, chuyển về page trước đó
          if (response.items.length === 0 && profileCurrentPage > 1) {
            handleProfilePageChange(profileCurrentPage - 1);
          }

          // Cập nhật tổng số trang
          setProfileTotalPages(
            Math.ceil(response.totalItems / profileItemsPerPage)
          );
        }
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete profile. Please try again.",
        confirmButtonColor: "#c79816",
      });
    }
  };
  const handleSaveProfile = async (profileData: any) => {
    try {
      if (editingProfile) {
        await updateProfile({
          ...profileData,
        });
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Profile has been updated successfully!",
          confirmButtonColor: "#c79816",
        });
      } else {
        await createProfiles(profileData);
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Profile has been created successfully!",
          confirmButtonColor: "#c79816",
        });
      }
      // Refresh profiles với trang hiện tại
      if (selectedUser) {
        const response = await fetchProfilesByAccountId(
          selectedUser.id,
          profileCurrentPage,
          profileItemsPerPage
        );
        setUserProfiles(
          Array.isArray(response.items) ? response.items : [response.items]
        );
        setProfileTotalPages(
          Math.ceil(response.totalItems / profileItemsPerPage)
        );
      }
      setIsProfileModalOpen(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save profile. Please try again.",
        confirmButtonColor: "#c79816",
      });
    }
  };
  const handleUserSelect = async (user: UserData) => {
    setSelectedUser(user);
    setSelectedUserId(user.id);
    try {
      setIsLoadingProfiles(true);
      const response = await fetchProfilesByAccountId(
        user.id,
        profileCurrentPage,
        profileItemsPerPage
      );

      setUserProfiles(
        Array.isArray(response.items) ? response.items : [response.items]
      );
      setProfileTotalPages(
        Math.ceil(response.totalItems / profileItemsPerPage)
      );
    } catch (error) {
      console.error("Error fetching profiles:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load user profiles. Please try again.",
      });
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  const handleCloseProfiles = () => {
    setSelectedUser(null);
    setSelectedUserId(null);
    setUserProfiles([]);
  };

  // useEffect(() => {
  //   getUserData(currentPage, searchTerm);
  // }, [currentPage, searchTerm, filterStatus]);

  useEffect(() => {
    getUserData(currentPage, searchTerm, filterStatus);
  }, [currentPage]);
  const handleCreateUser = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const handleEdit = (user: UserData) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleSaveUser = async (userData: {
    username: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) => {
    try {
      const response = await register(
        userData.username,
        userData.password,
        userData.email,
        userData.phoneNumber
      );

      if (response) {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "User has been registered successfully!",
          confirmButtonText: "OK",
        });
        getUserData(currentPage, searchTerm);
      }
    } catch (error) {
      console.error("Error registering user:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to register user. Please try again.",
      });
    }
    toggleModal();
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setCurrentPage(1);
      getUserData(1, searchTerm, filterStatus);
    }
  };
  const handleSearchSubmit = () => {
    setCurrentPage(1); // Reset về trang 1 khi search
    getUserData(1, searchTerm, filterStatus);
  };
 

  const handleFilter = (status: "all" | "active" | "inactive") => {
    setFilterStatus(status);
    setCurrentPage(1);
    getUserData(1, searchTerm, status);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleUserDelete = async (userId: number) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#c79816",
        cancelButtonColor: "#000000",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await deleteAccount(userId);
        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "User has been deleted successfully.",
          confirmButtonColor: "#c79816",
        });
        getUserData(currentPage, searchTerm, filterStatus);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete user. Please try again.",
        confirmButtonColor: "#c79816",
      });
    }
  };

  return (
    <div className="user-management split-view">
      <div className="left-panel">
        <div className="management-container">
          {/* Header Section */}
          <div className="management-header">
            <div className="header-content">
              <div className="title-wrapper">
                <h1>User Management</h1>
                <p>Manage and monitor your user accounts</p>
              </div>
            </div>
            <div className="header-actions">
              <button className="create-btn" onClick={handleCreateUser}>
                <FaPlus className="btn-icon" />
                Create User
              </button>
            </div>
          </div>
        </div>
        {/* Stats Section */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">{totalItems}</div>
              <div className="stat-label">Total Users</div>
              <div className="stat-change">
                <FaArrowUp />
                12% from last month
              </div>
            </div>
            <FaUsers className="stat-icon" />
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">
                {userData.filter((user) => user.status).length}
              </div>
              <div className="stat-label">Active Users</div>
              <div className="stat-change">
                <FaArrowUp />
                8% from last month
              </div>
            </div>
            <FaRegUserCircle className="stat-icon" />
          </div>
        </div>

        {/* Main Content Section */}
        <div className="content-section">
          <div className="content-header">
          <EnhancedSearch
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        onKeyPress={handleKeyPress}
        placeholderText="Search by username, email, phone..."
      />
            <div className="filters">
              <button
                className={`filter-btn ${
                  filterStatus === "all" ? "active" : ""
                }`}
                onClick={() => handleFilter("all")}
              >
                All Users
              </button>
              <button
                className={`filter-btn ${
                  filterStatus === "active" ? "active" : ""
                }`}
                onClick={() => handleFilter("active")}
              >
                Active
              </button>
              <button
                className={`filter-btn ${
                  filterStatus === "inactive" ? "active" : ""
                }`}
                onClick={() => handleFilter("inactive")}
              >
                Inactive
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-spinner">Loading...</div>
          ) : (
            <>
              <div className="table-wrapper">
                {" "}
                <div className="table-container">
                  {userData.length > 0 ? (
                    <table>
                      <thead>
                        <tr>
                          <th>User Information</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userData.map((user) => (
                          <tr
                            key={user.id}
                            className={`user-row ${
                              selectedUserId === user.id ? "selected" : ""
                            }`}
                          >
                            <td>
                              <div className="user-info">
                                <div className="user-icon">
                                  <FaRegUserCircle />
                                </div>
                                <div className="user-details">
                                <div className="name">ID: {user.id}</div>
                                  <div className="name">{user.username}</div>
                                  <div className="email">{user.email}</div>
                                  <div className="phone">
                                    {user.phoneNumber}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>{user.role.name}</td>
                            <td>
                              <span
                                className={`status-badge ${
                                  user.status ? "active" : "inactive"
                                }`}
                              >
                                {user.status ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td>
                              <div className="actions">
                                <button
                                  className="view-btn"
                                  onClick={() => handleUserSelect(user)}
                                >
                                  <FaIdCard />
                                </button>
                                <button
                                  className="edit-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingUser(user);
                                    setUpdateModalOpen(true);
                                  }}
                                >
                                  <FaPen />
                                </button>
                                <button
                                  className="delete-btn"
                                  onClick={() => handleUserDelete(user.id)}
                                  disabled={!user.status}
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="not-found">
                      <FaSearch className="not-found-icon" />
                      <h3>No Results Found</h3>
                      <p>We couldn't find any users matching your search</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pagination-wrapper">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </div>
      </div>
      <div className={`right-panel ${selectedUser ? "active" : ""}`}>
        {selectedUser ? (
          <div className="profiles-container">
            <div className="profiles-header">
              <div className="header-content">
                <h2>User Profiles</h2>
                <p>{selectedUser.username}'s profiles</p>
              </div>
              <button className="close-btn" onClick={handleCloseProfiles}>
                <FaTimes />
              </button>
            </div>

            <div className="profiles-content">
              <button
                className={`add-profile-btn ${
                  !selectedUser.status ? "disabled-btn" : ""
                }`} // Thay đổi tên class
                onClick={handleCreateProfile}
                disabled={!selectedUser.status}
              >
                <FaPlus /> Add New Profile
                {!selectedUser.status && (
                  <div className="tooltip-container">
                    User inactive can't create new profile
                  </div>
                )}
              </button>

              {isLoadingProfiles ? (
                <div className="profiles-loading">
                  <div className="loading-spinner-container">
                    <div className="spinner-ring"></div>
                    <div className="loading-text">Loading profiles...</div>
                  </div>
                </div>
              ) : !userProfiles || userProfiles.length === 0 ? (
                <div className="no-profiles">
                  <div className="empty-state">
                    <FaRegUserCircle className="empty-icon" />
                    <h3>No profiles found</h3>
                    <p>Create a new profile to get started</p>
                    {/* <button
        className="create-first-profile-btn"
        onClick={handleCreateProfile}
      >
        <FaPlus /> Create First Profile
      </button> */}
                  </div>
                </div>
              ) : (
                <>
                  <div className="profiles-grid">
                    {userProfiles.map((profile) => (
                      <div
                        key={profile.id}
                        className="profile-card"
                        onClick={() => handleProfileClick(profile.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="profile-header">
                          <span
                            className={`status-badge ${
                              profile.status ? "active" : "inactive"
                            }`}
                          >
                            {profile.status ? "Active" : "Inactive"}
                          </span>
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
                            <div className="info-icon">
                              <FaPhone />
                            </div>
                            <div className="info-content">
                              <label>Phone Number</label>
                              <span>{profile.phoneNumber}</span>
                            </div>
                          </div>

                          <div className="info-item">
                            <div className="info-icon">
                              <FaBirthdayCake />
                            </div>
                            <div className="info-content">
                              <label>Birthday</label>
                              <span>
                                {profile.birthday
                                  ? new Date(
                                      profile.birthday
                                    ).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "N/A"}
                              </span>
                            </div>
                          </div>

                          <div className="info-item">
                            <div className="info-icon">
                              <FaMapMarkerAlt />
                            </div>
                            <div className="info-content">
                              <label>Address</label>
                              <span>{profile.address || "N/A"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="profile-actions">
                          <button
                            className={`view-records-btn ${
                              !profile.status ? "disabled" : ""
                            }`}
                            onClick={(e) =>
                              handleViewRefractionRecords(profile, e)
                            }
                            disabled={!profile.status}
                            title={
                              !profile.status
                                ? "Cannot view inactive profile"
                                : "View records"
                            }
                          >
                            <FaClinicMedical />
                          </button>
                          <button
                            className="edit-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditProfile(profile);
                            }}
                          >
                            <FaPen />
                          </button>
                          <button
                            className={`delete-btn ${
                              !profile.status ? "disabled" : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProfile(profile.id);
                            }}
                            disabled={!profile.status}
                            title={
                              !profile.status
                                ? "Cannot delete inactive profile"
                                : "Delete profile"
                            }
                          >
                            <FaTrash />
                          </button>
                        </div>

                        {/* Thêm thông báo cho profile không active */}
                        {!profile.status && (
                          <div className="inactive-profile-notice">
                            {/* <span>
                              Profile is inactive. View and delete actions are
                              disabled.
                            </span> */}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="profiles-pagination">
                    <Pagination
                      currentPage={profileCurrentPage}
                      totalPages={profileTotalPages}
                      onPageChange={handleProfilePageChange}
                    />
                  </div>
                </>
              )}
            </div>

            <ProfileManagementModal
              isOpen={isProfileModalOpen}
              onClose={() => setIsProfileModalOpen(false)}
              onSave={handleSaveProfile}
              editingProfile={editingProfile}
              accountId={selectedUser?.id || 0}
            />
          </div>
        ) : (
          <div className="no-selection">
            <FaRegUserCircle className="icon" />
            <h3>Select a user to view profiles</h3>
            <p>Click on any user from the list to view their profiles</p>
          </div>
        )}
      </div>

      <UserModal
        isOpen={modalOpen}
        toggle={toggleModal}
        onSave={handleSaveUser}
        // editingUser={editingUser}
      />
      {selectedProfileForRefraction && (
        <RefractionModal
          profileId={selectedProfileForRefraction.id}
          profileName={selectedProfileForRefraction.name}
          isOpen={!!selectedProfileForRefraction}
          onClose={() => setSelectedProfileForRefraction(null)}
        />
      )}
      <UserUpdateModal
        isOpen={updateModalOpen}
        toggle={() => setUpdateModalOpen(false)}
        onSave={() => {
          getUserData(currentPage, searchTerm);
          setUpdateModalOpen(false);
        }}
        editingUser={editingUser}
      />
    </div>

  );
};

export default UsersList;
