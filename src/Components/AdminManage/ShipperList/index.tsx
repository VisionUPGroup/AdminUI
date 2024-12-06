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
import { useAuthService } from "../../../../Api/authService";
import Pagination from "./Pagination"; // Import Pagination component
import "./ShipperStyle.scss";
import Swal from "sweetalert2";
import ShipperUpdateModal from "./ShipperUpdateModal";
import ShipperModal from "./ShipperModal";

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

const ShipperList: React.FC = () => {
  const { fetchAccountByRole, deleteAccount, createShipper } =
    useAccountService();

  const [staffData, setStaffData] = useState<StaffData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffData | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Main function to fetch staff data
  const fetchStaffData = async (
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
        4, // roleID for staff
        search || undefined,
        page,
        apiStatus,
        undefined
      );

      setStaffData(response.items);
      setTotalItems(response.totalItems);
      setTotalPages(Math.ceil(response.totalItems / itemsPerPage));
    } catch (error) {
      console.error("Failed to load staff data:", error);
      setStaffData([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateSuccess = () => {
    fetchStaffData(currentPage, searchTerm, filterStatus);
  };
  // Search handler with debounce
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
  };
  const handleOpenUpdateModal = (staff: StaffData) => {
    setSelectedStaff(staff);
    setIsUpdateModalOpen(true);
  };
  const handleUpdateSuccess = () => {
    fetchStaffData(currentPage, searchTerm, filterStatus);
  };

  // Handle Enter key press for search
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setCurrentPage(1);
      fetchStaffData(1, searchTerm, filterStatus);
    }
  };

  // Filter handler
  const handleFilter = (status: "all" | "active" | "inactive") => {
    setFilterStatus(status);
    setCurrentPage(1);
    fetchStaffData(1, searchTerm, status);
  };

  // Pagination handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Delete handler
  const handleDelete = async (staff: StaffData) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `Do you want to delete staff "${staff.username}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#c79816",
        cancelButtonColor: "black",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        await deleteAccount(staff.id);
        await Swal.fire({
          title: "Deleted!",
          text: "Staff has been deleted successfully.",
          icon: "success",
          confirmButtonColor: "#c79816",
        });
        fetchStaffData(currentPage, searchTerm, filterStatus);
      }
    } catch (error) {
      console.error("Failed to delete staff:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to delete staff. Please try again.",
        icon: "error",
        confirmButtonColor: "#c79816",
      });
    }
  };

  // Effect for page changes
  useEffect(() => {
    fetchStaffData(currentPage, searchTerm, filterStatus);
  }, [currentPage]);

  return (
    <div className="staff-management">
      <div className="management-container">
        {/* Header Section */}
        <div className="management-header">
          <div className="header-content">
            <div className="title-wrapper">
              <h1>Shipper Management</h1>
              <p>Manage and monitor your shipper accounts</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="create-btn" onClick={handleOpenCreateModal}>
              <FaPlus className="btn-icon" />
              Add New Shipper
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">{totalItems}</div>
              <div className="stat-label">Total Shipper</div>
              <div className="stat-change">
                <FaArrowUp />
                All shipper include
              </div>
            </div>
            <FaUsers className="stat-icon" />
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">
                {staffData.filter((staff) => staff.status).length}
              </div>
              <div className="stat-label">Active Shipper</div>
              <div className="stat-change">
                <FaArrowUp />
                All shipper with status active
              </div>
            </div>
            <FaRegUserCircle className="stat-icon" />
          </div>
        </div>

        {/* Main Content Section */}
        <div className="content-section">
          <div className="content-header">
            {/* Search Box */}
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search shipper..."
                value={searchTerm}
                onChange={handleSearch}
                onKeyPress={handleKeyPress}
              />
            </div>

            {/* Filter Buttons */}
            <div className="filters">
              <button
                className={`filter-btn ${
                  filterStatus === "all" ? "active" : ""
                }`}
                onClick={() => handleFilter("all")}
              >
                All Shipper
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

          {/* Table Content */}
          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="loading-text">Loading...</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <div className="table-container">
                {staffData.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Shipper Information</th>
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
                                <div className="name">ID: {staff.id}</div>
                                <div className="name">{staff.username}</div>
                                <div className="email">{staff.email}</div>
                                <div className="phone">{staff.phoneNumber}</div>
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
                              <button
                                className="edit-btn"
                                onClick={() => handleOpenUpdateModal(staff)}
                              >
                                <FaPen />
                              </button>
                              <button
                                className={`delete-btn ${
                                  !staff.status ? "disabled" : ""
                                }`}
                                disabled={!staff.status}
                                onClick={() =>
                                  staff.status && handleDelete(staff)
                                }
                                title={
                                  !staff.status
                                    ? "Cannot delete inactive staff"
                                    : "Delete staff"
                                }
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
                    <p>
                      We couldn't find any staff matching your search criteria
                    </p>
                  </div>
                )}
              </div>

              {staffData.length > 0 && (
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
      <ShipperModal
  isOpen={isCreateModalOpen}
  toggle={() => setIsCreateModalOpen(false)}
  onSave={async (data) => {
    try {
      const result = await createShipper(data);
      
      setIsCreateModalOpen(false);
      handleCreateSuccess();
      await Swal.fire({
        title: "Success!",
        text: "Shipper has been created successfully.",
        icon: "success",
        confirmButtonColor: "#c79816",
      });
    } catch (error: any) {
      console.error("Error creating shipper:", error);
      await Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to create shipper. Please try again.",
        icon: "error",
        confirmButtonColor: "#c79816",
      });
      throw error; // Re-throw để modal có thể xử lý error messaging
    }
  }}
/>
      <ShipperUpdateModal
        isOpen={isUpdateModalOpen}
        toggle={() => setIsUpdateModalOpen(false)}
        onSuccess={handleUpdateSuccess}
        staffData={selectedStaff}
      />
    </div>
  );
};

export default ShipperList;
