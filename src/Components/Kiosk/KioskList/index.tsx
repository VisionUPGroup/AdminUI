import React, { Fragment, use, useEffect, useState } from "react";
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
  FaExchangeAlt,
  FaExclamationCircle,
  FaList,
} from "react-icons/fa";
import { useKioskService } from "../../../../Api/kioskService";
import KioskModal from "./KioskModal";
import KioskUpdateModal from "./UpdateModal";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "./KioskStyle.scss";
import Pagination from "./Pagination";
import MoveOrderModal from "./MoveOrderModal";
import OrderListModal from "./OrderListModal";
interface KioskDataType {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  openingHours: string;
  status: boolean;
  hasOrders: boolean; // Thêm trường này để kiểm tra kiosk có orders không
}
const Kiosk: React.FC = () => {
  const { fetchAllKiosk, deleteKiosk, moveOrderKiosk, updateKiosk } =
    useKioskService();
  const [kioskData, setKioskData] = useState<KioskDataType[]>([]);
  const [filteredData, setFilteredData] = useState<KioskDataType[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedKiosk, setSelectedKiosk] = useState<KioskDataType | null>(
    null
  );
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);
  const [selectedKioskForOrders, setSelectedKioskForOrders] =
    useState<KioskDataType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(filteredData.length);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [selectedMoveKiosk, setSelectedMoveKiosk] =
    useState<KioskDataType | null>(null);
  // Stats calculations
  const totalKiosks = kioskData.length;
  const activeKiosks = kioskData.filter((k) => k.status).length;
  const uniqueLocations = new Set(kioskData.map((k) => k.address)).size;

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
  const handleMoveOrders = async (data: {
    currentKioskID: number;
    targetKioskID: number;
  }) => {
    try {
      await moveOrderKiosk(data);

      // Cập nhật trạng thái hasOrders sau khi move
      setKioskData((prev) =>
        prev.map((kiosk) => {
          if (kiosk.id === data.currentKioskID) {
            return { ...kiosk, hasOrders: false };
          }
          return kiosk;
        })
      );

      toast.success("Orders moved successfully");
      setMoveModalOpen(false);
    } catch (error) {
      toast.error("Failed to move orders");
      console.error("Error moving orders:", error);
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
      filtered = filtered.filter(
        (kiosk) =>
          kiosk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          kiosk.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (kiosk) => kiosk.status === (filterStatus === "active")
      );
    }

    setFilteredData(filtered);
  }, [searchTerm, filterStatus, kioskData]);

  const handleDelete = async (kiosk: KioskDataType) => {
    // Kiểm tra kiosk inactive
    if (!kiosk.status) {
      Swal.fire({
        title: "Unable to Delete",
        text: "This kiosk is currently inactive. Please activate the kiosk before deleting.",
        icon: "warning",
        confirmButtonColor: "#c79816",
        confirmButtonText: "OK",
      });
      return;
    }

    // Kiểm tra có orders
    if (kiosk.hasOrders) {
      Swal.fire({
        title: "Unable to Delete",
        text: "This kiosk has active orders. Please move all orders to another kiosk before deleting.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#c79816",
        cancelButtonColor: "#000000",
        confirmButtonText: "Move Orders",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          setSelectedMoveKiosk(kiosk);
          setMoveModalOpen(true);
        }
      });
      return;
    }

    // Nếu kiosk active và không có orders, cho phép xóa
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This action cannot be undone",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#c79816",
        cancelButtonColor: "#000000",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await deleteKiosk(kiosk.id);
        setKioskData((prev) => prev.filter((k) => k.id !== kiosk.id));
        setFilteredData((prev) => prev.filter((k) => k.id !== kiosk.id));
        toast.success("Kiosk deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete kiosk");
      console.error("Error deleting kiosk:", error);
    }
  };
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Tính tổng số trang
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
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
            <button
              className="create-btn"
              onClick={() => setCreateModalOpen(true)}
            >
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
                className={`filter-btn ${
                  filterStatus === "all" ? "active" : ""
                }`}
                onClick={() => handleFilter("all")}
              >
                All Kiosks
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

          <div className="table-container">
            {isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading kiosks...</p>
              </div>
            ) : filteredData.length > 0 ? (
              <>
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
                    {currentItems.map((kiosk) => (
                      <tr key={kiosk.id}>
                        <td>
                          <div className="kiosk-info">
                            <div
                              className={`kiosk-icon ${
                                kiosk.hasOrders ? "has-orders" : ""
                              }`}
                            >
                              <FaStore />
                              {kiosk.hasOrders && (
                                <span
                                  className="orders-badge"
                                  title="Has active orders"
                                >
                                  <FaExclamationCircle />
                                </span>
                              )}
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
                          <span
                            className={`status-badge ${
                              kiosk.status ? "active" : "inactive"
                            }`}
                          >
                            {kiosk.status ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <button
                              className="view-orders-btn"
                              onClick={() => {
                                setSelectedKioskForOrders(kiosk);
                                setOrderModalOpen(true);
                              }}
                              title="View Orders"
                            >
                              <FaList />
                            </button>
                            <button
                              className="move-btn"
                              onClick={() => {
                                setSelectedMoveKiosk(kiosk);
                                setMoveModalOpen(true);
                              }}
                            >
                              <FaExchangeAlt />
                            </button>
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
                              className={`delete-btn ${
                                !kiosk.status || kiosk.hasOrders
                                  ? "disabled"
                                  : ""
                              }`}
                              onClick={() => handleDelete(kiosk)}
                              disabled={!kiosk.status || kiosk.hasOrders}
                              title={
                                !kiosk.status
                                  ? "Cannot delete inactive kiosk"
                                  : kiosk.hasOrders
                                  ? "Move orders before deleting"
                                  : "Delete kiosk"
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
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            ) : (
              <div className="empty-state">
                <FaStore className="empty-icon" />
                <h3>No Kiosks Found</h3>
                <p>
                  {searchTerm
                    ? "No kiosks match your search criteria"
                    : "Start by adding your first kiosk"}
                </p>
                <button
                  className="create-btn"
                  onClick={() => setCreateModalOpen(true)}
                >
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
          toast.success("Kiosk created successfully");
          await fetchKioskData();
          setCreateModalOpen(false);
          
        }}
      />

      <KioskUpdateModal
        isOpen={updateModalOpen}
        toggle={() => setUpdateModalOpen(false)}
        kioskData={selectedKiosk}
        onSave={async (data) => {
          try {
            await updateKiosk(data);
            await fetchKioskData();
            setUpdateModalOpen(false);
            toast.success("Kiosk updated successfully");
          } catch (error) {
            toast.error("Failed to update kiosk");
          }
        }}
      />
      <OrderListModal
        isOpen={orderModalOpen}
        toggle={() => setOrderModalOpen(false)}
        kioskId={selectedKioskForOrders?.id || null}
        kioskName={selectedKioskForOrders?.name || null}
      />
      <MoveOrderModal
        isOpen={moveModalOpen}
        toggle={() => setMoveModalOpen(false)}
        currentKiosk={selectedMoveKiosk}
        kioskList={kioskData}
        onMove={handleMoveOrders}
      />
    </div>
  );
};

export default Kiosk;
