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
  const { fetchAccountByRole,deleteAccount } = useAccountService();
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
      
      // Lọc dữ liệu theo trạng thái (active/inactive)
      let filteredData = response.items;
      if (filterStatus === 'active') {
        filteredData = response.items.filter((user: { status: any; }) => user.status);
      } else if (filterStatus === 'inactive') {
        filteredData = response.items.filter((user: { status: any; }) => !user.status);
      }

      setUserData(filteredData);
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
  }, [currentPage, searchTerm, filterStatus]);

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
      setIsLoading(true);
      const response = await register(
        userData.username, 
        userData.password, 
        userData.email, 
        userData.phoneNumber
      );
      
      if (response) {
        const newUser: UserData = {
          ...response,
          createdAt: new Date(),
          status: true
        };

        setUserData(prevData => [newUser, ...prevData]);

        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'User has been registered successfully!',
          confirmButtonText: 'OK'
        });
        toggleModal();
      }
    } catch (error: any) {
      console.error("Error registering user:", error);
      
      // Xử lý error response từ API
      if (error.response?.status === 400) {
        // Lấy error message từ API response
        let errorMessage = error.response.data?.message;
        
        // Nếu có validation errors chi tiết
        if (error.response.data?.errors) {
          errorMessage = Object.values(error.response.data.errors)
            .flat()
            .join('\n');
        }

        // Hiển thị error với Swal
        await Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          html: errorMessage.replace(/\n/g, '<br>'),
          confirmButtonColor: '#d33'
        });
      } else {
        // Xử lý các lỗi khác
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to register user. Please try again.',
          confirmButtonColor: '#d33'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
  }

  const handleFilter = (status: "all" | "active" | "inactive") => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = async (userId: number) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to delete user ?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#c79816',
        cancelButtonColor: 'Black',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        setIsLoading(true);
        
        // Gọi API delete account
        await deleteAccount(userId);
        
        // Cập nhật lại danh sách sau khi xóa
        await getUserData(currentPage, searchTerm);
        
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'User has been deleted successfully.',
          confirmButtonColor: '#c79816'
        });
      }
    } catch (error: any) {
      console.error("Error deleting user:", error);
      // Hiển thị error message từ API
      const errorMessage = error.response?.data?.message || 'Failed to delete user. Please try again.';
      Swal.fire({
        icon: 'error',
        title: 'Delete Error',
        text: errorMessage,
        confirmButtonColor: '#d33'
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
                all user include
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
                      className={`delete-btn ${!user.status ? 'disabled' : ''}`}
                      onClick={() => handleDelete(user.id)}
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