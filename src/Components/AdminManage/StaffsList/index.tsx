import { Fragment, useEffect, useState } from "react";
import { FaPlus, FaSearch, FaArrowUp, FaUsers, FaRegUserCircle, FaPen, FaTrash } from "react-icons/fa";
import { useAccountService } from "../../../../Api/accountService";
import Pagination from "./Pagination"; // Import Pagination component
import "./StaffStyle.scss";

interface Role {
  id: number;
  name: string;
  description: string;
  status: boolean;
}

interface StaffData {
  id: number;
  username: string;
  email: string;
  status: boolean;
  roleID: number;
  phoneNumber: string;
  role: Role;
}

interface ApiResponse {
  items: StaffData[];
  totalItems: number;
  currentPage: number;
}

const StaffsList: React.FC = () => {
  const { fetchAccountByRole } = useAccountService();
  const [staffData, setStaffData] = useState<StaffData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const fetchStaffData = async (page: number, search: string) => {
    setIsLoading(true);
    try {
      const response = await fetchAccountByRole(2, search, page);
      setStaffData(response.items);
      setTotalItems(response.totalItems);
      setTotalPages(Math.ceil(response.totalItems / itemsPerPage));
    } catch (error) {
      console.error("Failed to load staff data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset về trang 1 khi search
  };

  const handleFilter = (status: "all" | "active" | "inactive") => {
    setFilterStatus(status);
    setCurrentPage(1); // Reset về trang 1 khi filter
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="staff-management">
      <div className="management-container">
        {/* Header Section */}
        <div className="management-header">
          <div className="header-content">
            <div className="title-wrapper">
              <h1>Staff Management</h1>
              <p>Manage and monitor your staff accounts</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="create-btn">
              <FaPlus className="btn-icon" />
              Add New Staff
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">{totalItems}</div>
              <div className="stat-label">Total Staff</div>
              <div className="stat-change">
                <FaArrowUp />
                10% from last month
              </div>
            </div>
            <FaUsers className="stat-icon" />
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">
                {staffData.filter(staff => staff.status).length}
              </div>
              <div className="stat-label">Active Staff</div>
              <div className="stat-change">
                <FaArrowUp />
                5% from last month
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
                placeholder="Search staff..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="filters">
              <button
                className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => handleFilter('all')}
              >
                All Staff
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
                      <th>Staff Information</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffData.map((staff) => (
                      <tr key={staff.id}>
                        <td>
                          <div className="staff-info">
                            <div className="staff-icon">
                              <FaRegUserCircle />
                            </div>
                            <div className="staff-details">
                              <div className="name">{staff.username}</div>
                              <div className="email">{staff.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>{staff.role.name}</td>
                        <td>
                          <span className={`status-badge ${staff.status ? 'active' : 'inactive'}`}>
                            {staff.status ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <button className="edit-btn">
                              <FaPen />
                            </button>
                            <button className="delete-btn">
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
    </div>
  );
};

export default StaffsList;