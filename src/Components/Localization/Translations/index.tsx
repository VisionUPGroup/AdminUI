import React, { Fragment, useEffect, useState } from "react";
import {
  FaStore,
  FaSearch,
  FaPlus,
  FaMapMarkerAlt,
  FaChartLine,
  FaUsers,
  FaPen,
  FaTrash,
  FaFilter,
  FaArrowUp,
} from "react-icons/fa";
import { useKioskService } from "../../../../Api/kioskService";
import KioskModal from "./KioskModal";
import KioskUpdateModal from "./UpdateModal";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "./KioskStyle.scss";
interface KioskDataType {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  openingHours: string;
  status: boolean;
}
const Kiosk: React.FC = () => {
  const { fetchAllKiosk, deleteKiosk } = useKioskService();
  const [kioskData, setKioskData] = useState<KioskDataType[]>([]);
  const [filteredData, setFilteredData] = useState<KioskDataType[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedKiosk, setSelectedKiosk] = useState<KioskDataType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [isLoading, setIsLoading] = useState(true);

  // Stats calculations
  const totalKiosks = kioskData.length;
  const activeKiosks = kioskData.filter(k => k.status).length;
  const uniqueLocations = new Set(kioskData.map(k => k.address)).size;

  useEffect(() => {
    fetchKioskData();
  }, []);

  const fetchKioskData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAllKiosk();
      setKioskData(data);
      setFilteredData(data);
    } catch (error) {
      toast.error("Failed to fetch kiosk data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilter = (status: "all" | "active" | "inactive") => {
    setFilterStatus(status);
  };

  useEffect(() => {
    let filtered = kioskData;
    
    if (searchTerm) {
      filtered = filtered.filter(kiosk => 
        kiosk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kiosk.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(kiosk => 
        kiosk.status === (filterStatus === "active")
      );
    }

    setFilteredData(filtered);
  }, [searchTerm, filterStatus, kioskData]);

  const handleDelete = async (id: number) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "This action cannot be undone",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#c79816',
        cancelButtonColor: '#000000',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await deleteKiosk(id);
        setKioskData(prev => prev.filter(kiosk => kiosk.id !== id));
        toast.success("Kiosk deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete kiosk");
    }
  };

  return (
    <div className="kiosk-dashboard">
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="title-wrapper">
              <h1>Kiosk Management</h1>
              <p>Manage and monitor your kiosk locations</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="create-btn" onClick={() => setCreateModalOpen(true)}>
              <FaPlus className="btn-icon" />
              Add New Kiosk
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">{totalKiosks}</div>
              <div className="stat-label">Total Kiosks</div>
              <div className="stat-change">
                <FaArrowUp />
                12% from last month
              </div>
            </div>
            <FaStore className="stat-icon" />
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">{activeKiosks}</div>
              <div className="stat-label">Active Kiosks</div>
              <div className="stat-change">
                <FaArrowUp />
                8% from last month
              </div>
            </div>
            <FaUsers className="stat-icon" />
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-value">{uniqueLocations}</div>
              <div className="stat-label">Unique Locations</div>
              <div className="stat-change">
                <FaArrowUp />
                5% from last month
              </div>
            </div>
            <FaChartLine className="stat-icon" />
          </div>
        </div>

        {/* Main Content Section */}
        <div className="content-section">
          <div className="content-header">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search kiosks..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="filters">
              <button
                className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => handleFilter('all')}
              >
                All Kiosks
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

          <div className="table-container">
            {isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading kiosks...</p>
              </div>
            ) : filteredData.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Kiosk Information</th>
                    <th>Contact Details</th>
                    <th>Opening Hours</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((kiosk) => (
                    <tr key={kiosk.id}>
                      <td>
                        <div className="kiosk-info">
                          <div className="kiosk-icon">
                            <FaStore />
                          </div>
                          <div className="kiosk-details">
                            <div className="name">{kiosk.name}</div>
                            <div className="location">
                              <FaMapMarkerAlt />
                              {kiosk.address}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="contact-info">
                          <div>{kiosk.email}</div>
                          <div>{kiosk.phoneNumber}</div>
                        </div>
                      </td>
                      <td>{kiosk.openingHours}</td>
                      <td>
                        <span className={`status-badge ${kiosk.status ? 'active' : 'inactive'}`}>
                          {kiosk.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            className="edit-btn"
                            onClick={() => {
                              setSelectedKiosk(kiosk);
                              setUpdateModalOpen(true);
                            }}
                          >
                            <FaPen />
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(kiosk.id)}
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
              <div className="empty-state">
                <FaStore className="empty-icon" />
                <h3>No Kiosks Found</h3>
                <p>{searchTerm ? "No kiosks match your search criteria" : "Start by adding your first kiosk"}</p>
                <button className="create-btn" onClick={() => setCreateModalOpen(true)}>
                  <FaPlus className="btn-icon" />
                  Create First Kiosk
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <KioskModal
        isOpen={createModalOpen}
        toggle={() => setCreateModalOpen(false)}
        onSave={async (data) => {
          await fetchKioskData();
          setCreateModalOpen(false);
          toast.success("Kiosk created successfully");
        }}
      />

      <KioskUpdateModal
        isOpen={updateModalOpen}
        toggle={() => setUpdateModalOpen(false)}
        kioskData={selectedKiosk}
        onSave={async (data) => {
          await fetchKioskData();
          setUpdateModalOpen(false);
          toast.success("Kiosk updated successfully");
        }}
      />
    </div>
  );
};

export default Kiosk;