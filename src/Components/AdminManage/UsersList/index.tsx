import React, { Fragment, useEffect, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaArrowUp,
  FaUsers,
  FaRegUserCircle,
  FaPen,
  FaTrash,
} from "react-icons/fa";
import { useAccountService } from "../../../../Api/accountService";
import { useAuthService } from "../../../../Api/authService";

import Pagination from "./Pagination";
import Swal from "sweetalert2";
import "./UserStyle.scss";
import UserUpdateModal from "./UserUpdateModal";

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

const UsersList: React.FC = () => {
  const { fetchAccountByRole, deleteAccount } = useAccountService();
  const { register } = useAuthService();
  const [userData, setUserData] = useState<UserData[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;

  const getUserData = async (
    page: number,
    search: string,
    status: "all" | "active" | "inactive"
  ) => {
    setIsLoading(true);
    try {
      let apiStatus;
      if (status === "active") apiStatus = true;
      else if (status === "inactive") apiStatus = false;

      const response = await fetchAccountByRole(
        1,
        search || undefined,
        page,
        apiStatus,
        undefined
      );

      if (response) {
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

  // Effect for fetching data
  useEffect(() => {
    getUserData(currentPage, searchTerm, filterStatus);
  }, [currentPage]);

  // Search handlers
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

  // Filter handler
  const handleFilter = (status: "all" | "active" | "inactive") => {
    setFilterStatus(status);
    setCurrentPage(1);
    getUserData(1, searchTerm, status);
  };

  // Pagination handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Delete handler
  const handleDelete = async (userId: number) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to delete this user?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#c79816",
        cancelButtonColor: "black",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        setIsLoading(true);
        await deleteAccount(userId);
        
        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "User has been deleted successfully.",
          confirmButtonColor: "#c79816",
        });
        
        getUserData(currentPage, searchTerm, filterStatus);
      }
    } catch (error: any) {
      console.error("Error deleting user:", error);
      const errorMessage = error.response?.data?.message || 
        "Failed to delete user. Please try again.";
      
      Swal.fire({
        icon: "error",
        title: "Delete Error",
        text: errorMessage,
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="user-management">
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
            {/* <button className="create-btn" onClick={handleCreateUser}>
              <FaPlus className="btn-icon" />
              Create User
            </button> */}
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
                all user include
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
                all user with status active
              </div>
            </div>
            <FaRegUserCircle className="stat-icon" />
          </div>
        </div>

        {/* Main Content Section */}
        <div className="content-section">
          <div className="content-header">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearch}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="filters">
              <button
                className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
                onClick={() => handleFilter("all")}
              >
                All Users
              </button>
              <button
                className={`filter-btn ${filterStatus === "active" ? "active" : ""}`}
                onClick={() => handleFilter("active")}
              >
                Active
              </button>
              <button
                className={`filter-btn ${filterStatus === "inactive" ? "active" : ""}`}
                onClick={() => handleFilter("inactive")}
              >
                Inactive
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="loading-text">Loading...</div>
            </div>
          ) : (
            <div className="table-wrapper">
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
                        <tr key={user.id}>
                          <td>
                            <div className="user-info">
                              <div className="user-icon">
                                <FaRegUserCircle />
                              </div>
                              <div className="user-details">
                                <div className="name">{user.username}</div>
                                <div className="email">{user.email}</div>
                                <div className="phone">{user.phoneNumber}</div>
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
                                className="edit-btn"
                                onClick={() => {
                                  setEditingUser(user);
                                  setUpdateModalOpen(true);
                                }}
                              >
                                <FaPen />
                              </button>
                              <button
                                className={`delete-btn ${!user.status ? "disabled" : ""}`}
                                onClick={() => user.status && handleDelete(user.id)}
                                disabled={!user.status}
                                title={!user.status ? "Cannot delete inactive user" : "Delete user"}
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
                    <p>We couldn't find any users matching your search criteria</p>
                  </div>
                )}
              </div>

              {userData.length > 0 && (
                <div className="pagination-wrapper">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <UserUpdateModal
        isOpen={updateModalOpen}
        toggle={() => setUpdateModalOpen(false)}
        onSave={() => {
          getUserData(currentPage, searchTerm, filterStatus);
          setUpdateModalOpen(false);
        }}
        editingUser={editingUser}
      />
    </div>
  );
};

export default UsersList;
