import React, { Fragment, useEffect, useState } from "react";
import { 
  FaPlus, 
  FaSearch, 
  FaArrowUp, 
  FaUsers, 
  FaRegUserCircle, 
  FaPen, 
  FaTrash 
} from "react-icons/fa";
import { useAccountService } from "../../../../Api/accountService";
import { useAuthService } from "../../../../Api/authService";
import UserModal from "./UserModal";
import Pagination from "./Pagination";
import Swal from "sweetalert2";
import "./UserStyle.scss";

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
  const { fetchAccountByRole } = useAccountService();
  const { register } = useAuthService();
  const [userData, setUserData] = useState<UserData[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;

  const getUserData = async (page: number, search: string) => {
    setIsLoading(true);
    try {
      const response = await fetchAccountByRole(1, search, page);
      setUserData(response.items);
      setTotalItems(response.totalItems);
      setTotalPages(Math.ceil(response.totalItems / itemsPerPage));
    } catch (error) {
      console.error("Failed to load user data:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load user data. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUserData(currentPage, searchTerm);
  }, [currentPage, searchTerm]); // Reload when page or search changes

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
    password: string 
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
          icon: 'success',
          title: 'Success',
          text: 'User has been registered successfully!',
          confirmButtonText: 'OK'
        });
        getUserData(currentPage, searchTerm);
      }
    } catch (error) {
      console.error("Error registering user:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to register user. Please try again.',
      });
    }
    toggleModal();
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilter = (status: "all" | "active" | "inactive") => {
    setFilterStatus(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = async (userId: number) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        // Add your delete API call here
        // await deleteAccount(userId);
        
        await Swal.fire(
          'Deleted!',
          'User has been deleted.',
          'success'
        );
        getUserData(currentPage, searchTerm);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete user. Please try again.',
      });
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
            <button className="create-btn" onClick={handleCreateUser}>
              <FaPlus className="btn-icon" />
              Create User
            </button>
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
                {userData.filter(user => user.status).length}
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
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="filters">
              <button
                className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => handleFilter('all')}
              >
                All Users
              </button>
              <button
                className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
                onClick={() => handleFilter('active')}
              >
                Active
              </button>
              <button
                className={`filter-btn ${filterStatus === 'inactive' ? 'active' : ''}`}
                onClick={() => handleFilter('inactive')}
              >
                Inactive
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-spinner">Loading...</div>
          ) : (
            <>
              <div className="table-container">
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
                              onClick={() => handleEdit(user)}
                            >
                              <FaPen />
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={() => handleDelete(user.id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

      <UserModal 
        isOpen={modalOpen} 
        toggle={toggleModal} 
        onSave={handleSaveUser}
        // editingUser={editingUser}
      />
    </div>
  );
};

export default UsersList;