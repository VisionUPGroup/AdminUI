import React, { useEffect, useState } from "react";
import { useKioskService } from "../../../../Api/kioskService";
import { useShipperService } from "../../../../Api/shipperService";
import {
  FaStore,
  FaTimesCircle,
  FaCalendar,
  FaMoneyBill,
  FaExclamationTriangle,
  FaTruck,
  FaSearch,
} from "react-icons/fa";
import "./FilterStyle.scss";

interface Kiosk {
  id: number;
  name: string;
  status: boolean;
}

interface Shipper {
  id: number;
  name: string;
  status: boolean;
}

interface FilterSelectsProps {
  onFilterChange: (filters: {
    kioskId?: string;
    placedByKioskId?: string;
    shipperId?: string;
    fromDate?: string;
    toDate?: string;
    isDeposit?: boolean | null;
    issueType?: string;
    orderId?: string;
  }) => void;
  selectedKiosk: string;
  onReset: () => void;
}

const FilterSelects: React.FC<FilterSelectsProps> = ({
  onFilterChange,
  selectedKiosk,
  onReset,
}) => {
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [shippers, setShippers] = useState<Shipper[]>([]);
  const [isLoadingKiosks, setIsLoadingKiosks] = useState(false);
  const [isLoadingShippers, setIsLoadingShippers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    kioskId: selectedKiosk || "",
    placedByKioskId: "",
    shipperId: "",
    fromDate: "",
    toDate: "",
    isDeposit: null as boolean | null,
    issueType: "",
    orderId: "",
  });

  const { fetchAllKiosk } = useKioskService();
  const { fetchAllShipper } = useShipperService();

  useEffect(() => {
    loadKiosks();
    loadShippers();
  }, []);

  const loadKiosks = async () => {
    setIsLoadingKiosks(true);
    setError(null);
    try {
      const response = await fetchAllKiosk();
      const activeKiosks = response.filter(
        (kiosk: Kiosk) => kiosk.status === true
      );
      setKiosks(activeKiosks || []);
    } catch (error) {
      console.error("Error loading kiosks:", error);
      setError("Failed to load kiosks");
    } finally {
      setIsLoadingKiosks(false);
    }
  };
  const formatDateToYYYYMMDD = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const loadShippers = async () => {
    setIsLoadingShippers(true);
    try {
      const response = await fetchAllShipper();
      const activeShippers = response.filter(
        (shipper: Shipper) => shipper.status === true
      );
      setShippers(activeShippers || []);
    } catch (error) {
      console.error("Error loading shippers:", error);
    } finally {
      setIsLoadingShippers(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    let formattedValue = value;

    if (key === "fromDate" || key === "toDate") {
      formattedValue = value ? formatDateToYYYYMMDD(value) : "";
    } else if (key === "shipperId") {
      formattedValue = value === "" ? undefined : value;
    } else if (key === "isDeposit") {
      formattedValue = value === "all" ? null : value === "true";
    } else if (key === "orderId") {
      // Chỉ cho phép nhập số
      formattedValue = value.replace(/\D/g, "");
    }

    const newFilters = { ...filters, [key]: formattedValue };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      kioskId: "",
      placedByKioskId: "",
      shipperId: "",
      fromDate: "",
      toDate: "",
      isDeposit: null,
      issueType: "",
      orderId: "",
    };
    setFilters(resetFilters);
    onReset();
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "" && value !== null
  );

  return (
    <div className="filter-selects-horizontal">
      <div className="filters-container">
        <div className="filter-item">
          <div className="filter-label">
            <FaSearch />
            <span>Order ID</span>
          </div>
          <input
            type="text"
            placeholder="Enter Order ID"
            value={filters.orderId}
            onChange={(e) => handleFilterChange("orderId", e.target.value)}
            className="order-id-input"
          />
        </div>
        {/* Kiosk Filter */}
        <div className="filter-item">
          <div className="filter-label">
            <FaStore />
            <span>Kiosk</span>
          </div>
          <select
            value={filters.kioskId}
            onChange={(e) => handleFilterChange("kioskId", e.target.value)}
            disabled={isLoadingKiosks}
          >
            <option value="">All Kiosks</option>
            {kiosks.map((kiosk) => (
              <option key={kiosk.id} value={kiosk.id}>
                {kiosk.name}
              </option>
            ))}
          </select>
        </div>

        {/* Placed by Kiosk Filter */}
        <div className="filter-item">
          <div className="filter-label">
            <FaStore />
            <span>Placed by Kiosk</span>
          </div>
          <select
            value={filters.placedByKioskId}
            onChange={(e) =>
              handleFilterChange("placedByKioskId", e.target.value)
            }
            disabled={isLoadingKiosks}
          >
            <option value="">All Placing Kiosks</option>
            {kiosks.map((kiosk) => (
              <option key={kiosk.id} value={kiosk.id}>
                {kiosk.name}
              </option>
            ))}
          </select>
        </div>

        {/* Shipper Filter */}
        <div className="filter-item">
          <div className="filter-label">
            <FaTruck />
            <span>Shipper</span>
          </div>
          <select
            value={filters.shipperId}
            onChange={(e) => handleFilterChange("shipperId", e.target.value)}
            disabled={isLoadingShippers}
          >
            <option value="">All Shippers</option>
            {shippers.map((shipper) => (
              <option key={shipper.id} value={shipper.id}>
                {shipper.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filters */}
        <div className="filter-item">
          <div className="filter-label">
            <FaCalendar />
            <span>From</span>
          </div>
          <input
            type="date"
            value={filters.fromDate ? filters.fromDate.split("T")[0] : ""}
            onChange={(e) => handleFilterChange("fromDate", e.target.value)}
          />
        </div>

        <div className="filter-item">
          <div className="filter-label">
            <FaCalendar />
            <span>To</span>
          </div>
          <input
            type="date"
            value={filters.toDate ? filters.toDate.split("T")[0] : ""}
            onChange={(e) => handleFilterChange("toDate", e.target.value)}
            min={filters.fromDate ? filters.fromDate.split("T")[0] : ""}
          />
        </div>

        {/* Deposit Filter */}
        <div className="filter-item">
          <div className="filter-label">
            <FaMoneyBill />
            <span>Deposit</span>
          </div>
          <select
            value={
              filters.isDeposit === null ? "all" : filters.isDeposit.toString()
            }
            onChange={(e) => handleFilterChange("isDeposit", e.target.value)}
          >
            <option value="all">All Orders</option>
            <option value="true">Deposited</option>
            <option value="false">Not Deposited</option>
          </select>
        </div>

        {/* Issue Type Filter */}
        <div className="filter-item">
          <div className="filter-label">
            <FaExclamationTriangle />
            <span>Issue</span>
          </div>
          <select
            value={filters.issueType}
            onChange={(e) => handleFilterChange("issueType", e.target.value)}
          >
            <option value="">All Issues</option>
            <option value="0">Damaged</option>
            <option value="1">Delayed</option>
            <option value="2">Wrong Item</option>
            <option value="3">Quality Issue</option>
            <option value="4">Other Issues</option>
          </select>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button className="reset-button" onClick={handleReset}>
            <FaTimesCircle />
            <span>Reset</span>
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default FilterSelects;
