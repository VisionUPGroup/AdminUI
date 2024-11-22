import { Fragment, useEffect, useState } from "react";
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
import Pagination from "./Pagination"; // Import Pagination component
import "./StaffStyle.scss";
import Swal from "sweetalert2";

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
  const { fetchAccountByRole, deleteAccount } = useAccountService();
  const [staffData, setStaffData] = useState<StaffData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [filteredStaffData, setFilteredStaffData] = useState<StaffData[]>([]);
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
    let filtered = [...staffData];

    // Filter theo status
    if (filterStatus !== "all") {
      filtered = filtered.filter((staff) =>
        filterStatus === "active" ? staff.status : !staff.status
      );
    }

    setFilteredStaffData(filtered);
  }, [staffData, filterStatus]);

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
  const handleDelete = async (staff: StaffData) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to delete staff "${staff.username}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#c79816',
        cancelButtonColor: 'black',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {


        await deleteAccount(staff.id);
        
        // Show success message
        await Swal.fire({
          title: 'Deleted!',
          text: 'Staff has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#c79816',
        });

        // Refresh data
        fetchStaffData(currentPage, searchTerm);
      }
    } catch (error) {
      console.error("Failed to delete staff:", error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete staff. Please try again.',
        icon: 'error'
      });
    }
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
          {/* <div className="header-actions">
            <button className="create-btn">
              <FaPlus className="btn-icon" />
              Add New Staff
            </button>
          </div> */}
        </div>

        {/* Stats Section */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">{totalItems}</div>
              <div className="stat-label">Total Staff</div>
              <div className="stat-change">
                <FaArrowUp />
                All staff include
              </div>
            </div>
            <FaUsers className="stat-icon" />
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">
                {staffData.filter((staff) => staff.status).length}
              </div>
              <div className="stat-label">Active Staff</div>
              <div className="stat-change">
                <FaArrowUp />
                All staff with status active
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
                className={`filter-btn ${
                  filterStatus === "all" ? "active" : ""
                }`}
                onClick={() => handleFilter("all")}
              >
                All Staff
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
                    {filteredStaffData.map((staff) => (
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
                          <span
                            className={`status-badge ${
                              staff.status ? "active" : "inactive"
                            }`}
                          >
                            {staff.status ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <button className="edit-btn">
                              <FaPen />
                            </button>
                            <button 
                  className={`delete-btn ${!staff.status ? 'disabled' : ''}`}
                  disabled={!staff.status}
                  onClick={() => staff.status && handleDelete(staff)}
                  title={!staff.status ? "Cannot delete inactive staff" : "Delete staff"}
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
    </div>
  );
};

export default StaffsList;
