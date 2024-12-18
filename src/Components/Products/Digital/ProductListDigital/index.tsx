"use client";
import React, { useState, useEffect } from "react";
import {
  Eye,
  Edit2,
  Trash2,
  Plus,
  Search,
  Filter,
  Settings,
} from "react-feather";
import {
  Card,
  CardBody,
  Container,
  Row,
  Col,
  Button,
  Input,
  Badge,
  Progress,
} from "reactstrap";
import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import { useRouter } from "next/navigation";
import DataTable from "@/CommonComponents/DataTable";
import CustomTable from "./CustomTable";
import Pagination from "../Helper/Pagination"
import styles from "./ProductListDigital.module.scss";
import ProductFilter from "./ProductFilter";
import { FilterParams } from "./ProductFilter";
import { useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { useEyeGlassService } from "../../../../../Api/eyeGlassService"; // Import useEyeGlassService
import EyeGlassTypeManagement from "../../EyeGlassType";

interface EyeGlassType {
  id: number;
  glassType: string;
  status: boolean;
}

interface EyeGlassImage {
  id: number;
  eyeGlassID: number;
  angleView: number;
  url: string;
}

interface EyeGlass {
  id: number;
  eyeGlassTypeID: number;
  name: string;
  price: number;
  rate: number;
  rateCount: number;
  quantity: number;
  material: string;
  color: string;
  lensWidth: number;
  lensHeight: number;
  bridgeWidth: number;
  templeLength: number;
  frameWidth: number;
  style: string;
  weight: number;
  design: string;
  status: boolean;
  isDeleted: boolean; // Thêm field này
  eyeGlassTypes: EyeGlassType;
  eyeGlassImages: EyeGlassImage[];
}

const EyeGlassList: React.FC = () => {
  // const [searchTerm, setSearchTerm] = useState<string>('');
  // const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [eyeGlasses, setEyeGlasses] = useState<EyeGlass[]>([]); // State to hold eye glasses data
  const [isEyeGlassTypeModalOpen, setIsEyeGlassTypeModalOpen] = useState(false);
  const { fetchEyeGlasses, fetchEyeGlassTypes, deleteEyeGlass, updateEyeGlass } = useEyeGlassService(); // Destructure fetchEyeGlasses from useEyeGlassService
  const [eyeGlassTypes, setEyeGlassTypes] = useState<EyeGlassType[]>([]);
  const [filterParams, setFilterParams] = useState<FilterParams>({
    PageIndex: 1,
    PageSize: 10,
    Descending: true,
    isDeleted: false,
    status: true // Thêm điều kiện status mặc định là true
  });
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    const params = {
      PageIndex: 1,
      PageSize: 10,
      isDeleted: false,
      status: activeTab === 'active', // Thêm status dựa vào tab
      Descending: true,
    };

    fetchEyeGlasses(params).then((data) => {
      console.log("Eye Glasses:", data);
      if (Array.isArray(data.data)) {
        setEyeGlasses(data.data);
        setTotalItems(data.totalCount || 0);
      } else {
        console.error("Expected data to be an array, but got:", data);
      }
    });

    fetchEyeGlassTypes().then((data) => {
      console.log("Eye Glass Types:", data);
      if (Array.isArray(data)) {
        setEyeGlassTypes(data);
      } else {
        console.error("Expected data to be an array, but got:", data);
      }
    });
  }, []);

  const fetchData = async (params: FilterParams) => {
    setIsLoading(true);
    try {
      const response = await fetchEyeGlasses(params);
      if (response?.data) {
        setEyeGlasses(response.data);
        setTotalItems(response.totalCount || 0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(filterParams);
  }, []);

  const defaultParams = {
    PageIndex: 1,
    PageSize: 10,
    Descending: true,
    status: true,
    isDeleted: false
  };

  const sortEyeGlasses = (glasses: EyeGlass[]) => {
    // Lọc theo isDeleted và status của tab hiện tại
    return glasses.filter(glass =>
      !glass.isDeleted &&
      glass.status === (activeTab === 'active')
    );
  };

  const handlePageChange = (page: number) => {
    const updatedParams = {
      ...filterParams,
      PageIndex: page,
    };
    setFilterParams(updatedParams);
    fetchData(updatedParams);
  };

  const handleChangeRowsPerPage = (
    currentRowsPerPage: number,
    currentPage: number
  ) => {
    const updatedParams = {
      ...filterParams,
      PageSize: currentRowsPerPage,
      PageIndex: currentPage,
    };
    setFilterParams(updatedParams);
    fetchData(updatedParams);
  };

  const handleSort = (column: any, sortDirection: string) => {
    const updatedParams = {
      ...filterParams,
      SortBy: column.sortField || column.name,
      Descending: sortDirection === "desc",
      PageIndex: 1, // Reset về trang đầu khi sắp xếp
    };
    setFilterParams(updatedParams);
    fetchData(updatedParams);
  };

  // Handler cho filter change
  const handleFilterChange = (newParams: FilterParams) => {
    const isClearAll = Object.keys(newParams).length === 2 &&
      'PageIndex' in newParams &&
      'PageSize' in newParams;

    let updatedParams;
    if (isClearAll) {
      updatedParams = {
        ...defaultParams,
        PageSize: newParams.PageSize,
        status: activeTab === 'active', // Giữ lại status từ activeTab
        isDeleted: false
      };
    } else {
      updatedParams = {
        ...filterParams,
        ...newParams,
        status: activeTab === 'active',
        isDeleted: false,
        PageIndex: newParams.PageIndex || 1
      };
    }

    setFilterParams(updatedParams);
    fetchData(updatedParams);
  };

  const handleDelete = async (product: EyeGlass) => {
    if (product.isDeleted) return;
    try {
      const result = await Swal.fire({
        title: "Confirm Delete?",
        text: `Are you sure you want to delete "${product.name}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            const response = await deleteEyeGlass(product.id);
            if (response === true) {
              return response;
            }
            throw new Error("Failed to delete product");
          } catch (error) {
            Swal.showValidationMessage(`Error: ${error.message}`);
            throw error;
          }
        },
        allowOutsideClick: () => !Swal.isLoading(),
      });

      if (result.isConfirmed) {
        // Update local state first
        setEyeGlasses((prevGlasses) =>
          prevGlasses.filter((glass) => glass.id !== product.id)
        );
        setTotalItems((prev) => prev - 1);

        // Show success message
        await Swal.fire({
          title: "Deleted!",
          text: "Product has been deleted successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        // Fetch updated data from server
        try {
          await fetchData(filterParams);
        } catch (error) {
          console.error("Error refreshing data:", error);
          // Use Swal instead of toast
          Swal.fire({
            title: "Note",
            text: "Successfully deleted but unable to fetch latest list",
            icon: "warning",
            confirmButtonText: "Close",
          });
        }
      }
    } catch (error) {
      console.error("Error in delete process:", error);
      Swal.fire({
        title: "Error!",
        text:
          error.message || "Unable to delete product. Please try again later.",
        icon: "error",
        confirmButtonColor: "#dc3545",
      });
    }
  };

  // const handleEdit = (product: EyeGlass) => {
  //   if (!product.isDeleted) {
  //     router.push(`/en/products/eyeglass/${product.id}/editedit`);
  //   }
  // };

  const handleUpdateStatus = async (product: EyeGlass) => {
    try {
      // Tạo data để update với status ngược lại
      const updateData = {
        id: product.id,
        status: !product.status
      };

      const result = await Swal.fire({
        title: "Confirm Status Update?",
        text: `Are you sure you want to ${product.status ? "deactivate" : "activate"} "${product.name}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: product.status ? "#dc3545" : "#28a745",
        cancelButtonColor: "#6c757d",
        confirmButtonText: product.status ? "Deactivate" : "Activate",
        cancelButtonText: "Cancel",
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            console.log("updateData", updateData)
            const response = await updateEyeGlass(updateData);
            if (response) {
              return response;
            }
            throw new Error("Failed to update product status");
          } catch (error) {
            Swal.showValidationMessage(`Error: ${error.message}`);
            throw error;
          }
        },
        allowOutsideClick: () => !Swal.isLoading(),
      });

      if (result.isConfirmed) {
        // Update local state
        setEyeGlasses((prevGlasses) =>
          prevGlasses.map((glass) =>
            glass.id === product.id ? { ...glass, status: !glass.status } : glass
          )
        );

        // Show success message
        await Swal.fire({
          title: "Updated!",
          text: `Product has been ${product.status ? "deactivated" : "activated"} successfully.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        // Fetch updated data
        try {
          await fetchData(filterParams);
        } catch (error) {
          console.error("Error refreshing data:", error);
          Swal.fire({
            title: "Note",
            text: "Status updated but unable to fetch latest list",
            icon: "warning",
            confirmButtonText: "Close",
          });
        }
      }
    } catch (error) {
      console.error("Error in update process:", error);
      Swal.fire({
        title: "Error!",
        text: error.message || "Unable to update product status. Please try again later.",
        icon: "error",
        confirmButtonColor: "#dc3545",
      });
    }
  };

  const handleView = (product: EyeGlass) => {
    if (!product.isDeleted) {
      router.push(`/en/products/eyeglass/${product.id}`);
    }
  };

  const renderStars = (rate: number) => {
    return [...Array(5)].map((_, index) => (
      <i
        key={index}
        className={`fa fa-star ${index < rate ? styles.starFilled : styles.starEmpty
          }`}
      />
    ));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };


  const renderContent = () => {
    if (isLoading && !eyeGlasses.length) {
      return (
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner}></div>
        </div>
      );
    }

    const totalPages = Math.ceil(totalItems / filterParams.PageSize);

    return (
      <>
        <div className={styles.resultSummary}>
          <span>{totalItems} products found</span>
        </div>

        {viewMode === "table" ? (
          <div className={`${styles.tableWrapper} ${isLoading ? styles.loadingOverlay : ""}`}>
            <CustomTable
              columns={memoizedTableColumns}
              data={eyeGlasses}
              pagination={false}
              progressPending={isLoading}
              className={styles.productTable}
            />
          </div>
        ) : (
          <div className={isLoading ? styles.loadingOverlay : ""}>
            {renderGridView()}
          </div>
        )}

        <Pagination
          currentPage={filterParams.PageIndex}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          maxPagesToShow={5}
          showNavigationText
        />
      </>
    );
  };
  const renderTabs = () => (
    <div className={styles.tabsContainer}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'active' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('active');
            const newParams = {
              ...filterParams,
              status: true,
              PageIndex: 1
            };
            setFilterParams(newParams);
            fetchData(newParams);
          }}
        >
          <span className={styles.tabContent}>
            <i className="fa fa-check-circle" />
            Active Products
          </span>
          {activeTab === 'active' && <span className={styles.activeCount}>{totalItems}</span>}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'inactive' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('inactive');
            const newParams = {
              ...filterParams,
              status: false,
              PageIndex: 1
            };
            setFilterParams(newParams);
            fetchData(newParams);
          }}
        >
          <span className={styles.tabContent}>
            <i className="fa fa-times-circle" />
            Inactive Products
          </span>
          {activeTab === 'inactive' && <span className={styles.activeCount}>{totalItems}</span>}
        </button>
      </div>
    </div>
  );
  const renderGridView = () => {
    if (isLoading) {
      return (
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner} />
        </div>
      );
    }

    const sortedGlasses = sortEyeGlasses(eyeGlasses);

    return (
      <Row className={styles.productsGrid}>
        {sortedGlasses.map((product) => (
          <Col key={product.id} lg={3} md={4} sm={6} xs={12}>
            <Card
              className={`${styles.productCard} ${!product.status ? styles.inactive : ""
                }`}
            >
              <div className={styles.imageWrapper}>
                <div className={styles.productId}>#{product.id}</div>
                <img
                  src={product.eyeGlassImages[0]?.url}
                  alt={product.name}
                  className={styles.productImage}
                />
                {!product.status && (
                  <div className={styles.inactiveOverlay}>
                    <span>INACTIVE</span>
                  </div>
                )}
              </div>
              <CardBody className={styles.productDetails}>
                <div className={styles.productHeader}>
                  <h5 className={styles.productName}>{product.name}</h5>
                  <Badge
                    color={product.status ? "success" : "danger"}
                    className={styles.statusBadge}
                  >
                    {product.status ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className={styles.productSpecs}>
                  <span className={styles.specItem}>{product.style}</span>
                  <span className={styles.specDivider}>•</span>
                  <span className={styles.specItem}>{product.design}</span>
                </div>

                <div className={styles.typeAndRating}>
                  <span
                    className={`${styles.typeTag} ${styles[product.eyeGlassTypes.glassType.toLowerCase()]
                      }`}
                  >
                    {product.eyeGlassTypes.glassType}
                  </span>
                  <div className={styles.rating}>
                    {renderStars(product.rate)}
                    <span className={styles.rateCount}>
                      ({product.rateCount})
                    </span>
                  </div>
                </div>

                <div className={styles.priceAndActions}>
                  <h4 className={styles.price}>
                    {formatCurrency(product.price)}
                  </h4>
                  <div className={styles.actionButtons}>
                    <Button
                      color="info"
                      size="sm"
                      title={
                        product.status ? "View Details" : "Product Inactive"
                      }
                      onClick={() => !product.isDeleted && handleView(product)}
                      disabled={product.isDeleted}
                      className={product.isDeleted ? styles.disabledButton : ""}
                    >
                      <Eye size={14} />
                    </Button>
                    {/* <Button
                      color="primary"
                      size="sm"
                      title={
                        product.status ? "Edit Product" : "Product Inactive"
                      }
                      onClick={() => product.status && handleEdit(product)}
                      disabled={!product.status}
                      className={!product.status ? styles.disabledButton : ""}
                    >
                      <Edit2 size={14} />
                    </Button> */}

                    <Button
                      color={product.status ? "warning" : "success"}
                      size="sm"
                      title={product.status ? "Deactivate Product" : "Activate Product"}
                      onClick={() => handleUpdateStatus(product)}
                      disabled={product.isDeleted}
                      className={product.isDeleted ? styles.disabledButton : ""}
                    >
                      <i className={`fa fa-${product.status ? 'toggle-on' : 'toggle-off'}`} style={{ fontSize: '14px' }} />
                    </Button>

                    <Button
                      color="danger"
                      size="sm"
                      title={product.isDeleted ? "Product deleted" : product.status ? "View Details" : "Product Inactive"}
                      onClick={() => !product.isDeleted && handleDelete(product)}
                      disabled={product.isDeleted }
                      className={product.isDeleted ? styles.disabledButton : ""}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const tableColumns = [
    {
      name: "ID",
      selector: (row: EyeGlass) => row.id,
      sortable: true,
      sortField: "ID",
      width: "80px",
    },
    {
      name: "Image",
      cell: (row: EyeGlass) => (
        <img
          src={row.eyeGlassImages?.[0]?.url || "/placeholder-image.jpg"}
          alt={row.name}
          className={styles.tableImage}
        />
      ),
      width: "100px",
    },
    {
      name: "Name",
      selector: (row: EyeGlass) => row.name,
      sortable: true,
      sortField: "Name",
      cell: (row: EyeGlass) => (
        <div className={styles.productNameCell}>
          <p className={styles.name}>{row.name}</p>
          <small className={styles.specs}>
            {row.style} - {row.design}
          </small>
        </div>
      ),
    },
    {
      name: "Type",
      selector: (row: EyeGlass) => row.eyeGlassTypes?.glassType,
      sortable: true,
      cell: (row: EyeGlass) => (
        <span
          className={`${styles.typeTag} ${styles[row.eyeGlassTypes?.glassType?.toLowerCase()]
            }`}
        >
          {row.eyeGlassTypes?.glassType}
        </span>
      ),
    },
    {
      name: "Price",
      selector: (row: EyeGlass) => row.price,
      sortable: true,
      cell: (row: EyeGlass) => (
        <div className={styles.priceCell}>
          <span className={styles.amount}>{formatCurrency(row.price)}</span>
        </div>
      ),
    },
    {
      name: "Status",
      cell: (row: EyeGlass) => (
        <div className={styles.statusCell}>
          <Badge
            color={row.status ? "success" : "danger"}
            className={styles.statusBadge}
          >
            {row.status ? "Active" : "Inactive"}
          </Badge>
          <div className={styles.ratingInfo}>
            {renderStars(row.rate)}
            <span className={styles.rateCount}>({row.rateCount})</span>
          </div>
        </div>
      ),
    },
    {
      name: "Actions",
      cell: (row: EyeGlass) => (
        <div className={styles.actionCell}>
          <Button
            color="info"
            size="sm"
            className={styles.actionBtn}
            title="View Details"
            onClick={() => handleView(row)}
          >
            <Eye size={14} />
          </Button>
          {/* <Button
            color="primary"
            size="sm"
            className={styles.actionBtn}
            title="Edit Product"
            onClick={() => handleEdit(row)}
          >
            <Edit2 size={14} />
          </Button> */}
          <Button
            color="danger"
            size="sm"
            className={styles.actionBtn}
            title="Delete Product"
            onClick={() => handleDelete(row)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
      width: "150px",
      right: true,
    },
  ];

  const memoizedTableColumns = useMemo(() => tableColumns, []);

  const handleAddNewProduct = () => {
    router.push("/en/products/eyeglass/new");
  };

  return (
    <div className={styles.productListPage}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <CommonBreadcrumb parent="Digital" title="Product List" />
      <Container fluid>
        <Row>
          <Col lg={12}>
            <div className={styles.pageHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.headerActions}>
                  <Button
                    color="primary"
                    className={styles.addButton}
                    onClick={handleAddNewProduct}
                  >
                    <Plus size={16} />
                    Add New Product
                  </Button>
                  <Button
                    color="secondary"
                    className={styles.configButton}
                    onClick={() => setIsEyeGlassTypeModalOpen(true)}
                  >
                    <Settings size={16} />
                    Manage Eyeglass Types
                  </Button>
                </div>
              </div>
              <div className={styles.headerRight}>
                <div className={styles.viewToggle}>
                  <Button
                    color={viewMode === "grid" ? "primary" : "light"}
                    onClick={() => setViewMode("grid")}
                  >
                    <i className="fa fa-th-large" />
                  </Button>
                  {/* <Button
                    color={viewMode === "table" ? "primary" : "light"}
                    onClick={() => setViewMode("table")}
                  >
                    <i className="fa fa-list" />
                  </Button> */}
                </div>
              </div>
            </div>
            {renderTabs()}
            <div className={styles.filterWrapper}>
              <ProductFilter
                onFilterChange={handleFilterChange}
                eyeGlassTypes={eyeGlassTypes}
                initialParams={filterParams}
                activeTab={activeTab}
                totalItems={totalItems}
              />
            </div>
            <EyeGlassTypeManagement
              isOpen={isEyeGlassTypeModalOpen}
              onClose={() => setIsEyeGlassTypeModalOpen(false)}
            />

            {renderContent()}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EyeGlassList;
