"use client";
import React, { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2, Plus, Search, Filter } from 'react-feather';
import { Card, CardBody, Container, Row, Col, Button, Input, Badge, Progress } from 'reactstrap';
import CommonBreadcrumb from '@/CommonComponents/CommonBreadcrumb';
import { useRouter } from 'next/navigation';
import DataTable from "@/CommonComponents/DataTable";
import CustomTable from './CustomTable';
import styles from './ProductListDigital.module.scss';
import ProductFilter from './ProductFilter';
import { FilterParams } from './ProductFilter';
import { useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { useEyeGlassService } from '../../../../../Api/eyeGlassService'; // Import useEyeGlassService

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
  eyeGlassTypes: EyeGlassType;
  eyeGlassImages: EyeGlassImage[];
}

const EyeGlassList: React.FC = () => {
  // const [searchTerm, setSearchTerm] = useState<string>('');
  // const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [eyeGlasses, setEyeGlasses] = useState<EyeGlass[]>([]); // State to hold eye glasses data

  const { fetchEyeGlasses, fetchEyeGlassTypes, deleteEyeGlass } = useEyeGlassService(); // Destructure fetchEyeGlasses from useEyeGlassService
  const [eyeGlassTypes, setEyeGlassTypes] = useState<EyeGlassType[]>([]);
  const [filterParams, setFilterParams] = useState<FilterParams>({
    PageIndex: 1,
    PageSize: 10,
    SortBy: 'ID',
    Descending: true
  });
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = {
      // Name: 'C',
      // EyeGlassTypeID: 5,
      // Rate: 4,
      // MinPrice: 1000,
      // MaxPrice: 10000000,
      PageIndex: 1,
      PageSize: 10,
      SortBy: 'ID',
      // SortBy: 'Price',
      Descending: true
    };

    fetchEyeGlasses(params).then(data => {
      console.log('Eye Glasses:', data);
      if (Array.isArray(data.data)) {
        setEyeGlasses(data.data);
        setTotalItems(data.totalCount || 0);
      } else {
        console.error('Expected data to be an array, but got:', data);
      }
    });

    fetchEyeGlassTypes().then(data => {
      console.log('Eye Glass Types:', data);
      if (Array.isArray(data)) {
        setEyeGlassTypes(data);
      } else {
        console.error('Expected data to be an array, but got:', data);
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
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(filterParams);
  }, []);


  const handlePageChange = (page: number) => {
    const updatedParams = {
      ...filterParams,
      PageIndex: page
    };
    setFilterParams(updatedParams);
    fetchData(updatedParams);
  };

  const handleChangeRowsPerPage = (currentRowsPerPage: number, currentPage: number) => {
    const updatedParams = {
      ...filterParams,
      PageSize: currentRowsPerPage,
      PageIndex: currentPage
    };
    setFilterParams(updatedParams);
    fetchData(updatedParams);
  };

  const handleSort = (column: any, sortDirection: string) => {
    const updatedParams = {
      ...filterParams,
      SortBy: column.sortField || column.name,
      Descending: sortDirection === 'desc',
      PageIndex: 1 // Reset về trang đầu khi sắp xếp
    };
    setFilterParams(updatedParams);
    fetchData(updatedParams);
  };

  // Handler cho filter change
  const handleFilterChange = (newParams: FilterParams) => {
    // Kiểm tra nếu là clear all (chỉ có PageIndex và PageSize)
    const isClearAll = Object.keys(newParams).length === 2 && 
                      'PageIndex' in newParams && 
                      'PageSize' in newParams;
  
    let updatedParams;
    if (isClearAll) {
      // Nếu là clear all, sử dụng params mới hoàn toàn
      updatedParams = { ...newParams };
    } else {
      // Nếu không, merge với params hiện tại
      updatedParams = {
        ...filterParams,
        ...newParams,
        PageIndex: newParams.PageIndex || 1
      };
    }
  
    setFilterParams(updatedParams);
    fetchData(updatedParams);
  };

  const handleDelete = async (product: EyeGlass) => {
    try {
      const result = await Swal.fire({
        title: 'Xác nhận xóa?',
        text: `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            const response = await deleteEyeGlass(product.id);
            if (response === true) {
              return response;
            }
            throw new Error('Xóa sản phẩm thất bại');
          } catch (error) {
            Swal.showValidationMessage(`Lỗi: ${error.message}`);
            throw error;
          }
        },
        allowOutsideClick: () => !Swal.isLoading()
      });
  
      if (result.isConfirmed) {
        // Cập nhật state local trước
        setEyeGlasses(prevGlasses => 
          prevGlasses.filter(glass => glass.id !== product.id)
        );
        setTotalItems(prev => prev - 1);
  
        // Hiển thị thông báo thành công
        await Swal.fire({
          title: 'Đã xóa!',
          text: 'Sản phẩm đã được xóa thành công.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
  
        // Fetch lại data từ server
        try {
          await fetchData(filterParams);
        } catch (error) {
          console.error('Error refreshing data:', error);
          // Sử dụng Swal thay vì toast
          Swal.fire({
            title: 'Lưu ý',
            text: 'Đã xóa thành công nhưng không thể cập nhật danh sách mới nhất',
            icon: 'warning',
            confirmButtonText: 'Đóng'
          });
        }
      }
    } catch (error) {
      console.error('Error in delete process:', error);
      Swal.fire({
        title: 'Lỗi!',
        text: error.message || 'Không thể xóa sản phẩm. Vui lòng thử lại sau.',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
    }
  };

  const handleEdit = (id: number) => {
    console.log('Edit item:', id);
    // Implement edit logic here
  };

  const handleView = (id: number) => {
    router.push(`/en/products/eyeglass/${id}`);
  };

  const renderStars = (rate: number) => {
    return [...Array(5)].map((_, index) => (
      <i
        key={index}
        className={`fa fa-star ${index < rate ? styles.starFilled : styles.starEmpty}`}
      />
    ));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };


  // const renderContent = () => {
  //   if (isLoading) {
  //     return (
  //       <div className={styles.loadingWrapper}>
  //         <div className={styles.spinner}></div>
  //       </div>
  //     );
  //   }
  //   if (!eyeGlasses.length) {
  //     return (
  //       <div className={styles.loadingWrapper}>
  //         <p>No products found</p>
  //       </div>
  //     );
  //   }
  const renderContent = () => {
    if (isLoading && !eyeGlasses.length) {
      return (
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner}></div>
        </div>
      );
    }

    return (
      <>
        <div className={styles.resultSummary}>
          <span>{totalItems} products found</span>
        </div>

        {viewMode === 'table' ? (
          <div className={`${styles.tableWrapper} ${isLoading ? styles.loadingOverlay : ''}`}>
            <CustomTable
              columns={memoizedTableColumns}
              data={eyeGlasses}
              pagination
              paginationServer
              paginationTotalRows={totalItems}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handleChangeRowsPerPage}
              onSort={handleSort}
              progressPending={isLoading}
              className={styles.productTable}
              currentPage={filterParams.PageIndex}
              pageSize={filterParams.PageSize}
            />
          </div>
        ) : (
          <div className={isLoading ? styles.loadingOverlay : ''}>
            {renderGridView()}
          </div>
        )}
      </>
    );
  };
  const renderGridView = () => {
    if (isLoading) {
      return <div className={styles.loadingWrapper}><div className={styles.spinner} /></div>;
    }

    return (
      <Row className={styles.productsGrid}>
        {eyeGlasses.map((product) => (
        <Col key={product.id} lg={3} md={4} sm={6} xs={12}>
          <Card className={`${styles.productCard} ${!product.status ? styles.inactive : ''}`}>
            <div className={styles.imageWrapper}>
              <div className={styles.productId}>#{product.id}</div>
              <img
                src={product.eyeGlassImages[0]?.url}
                alt={product.name}
                className={styles.productImage}
              />
            </div>
            <CardBody className={styles.productDetails}>
              <div className={styles.productHeader}>
                <h5 className={styles.productName}>{product.name}</h5>
                <Badge color={product.status ? 'success' : 'danger'}>
                  {product.status ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className={styles.productSpecs}>
                <span className={styles.specItem}>{product.style}</span>
                <span className={styles.specDivider}>•</span>
                <span className={styles.specItem}>{product.design}</span>
              </div>

              <div className={styles.typeAndRating}>
                <span className={`${styles.typeTag} ${styles[product.eyeGlassTypes.glassType.toLowerCase()]}`}>
                  {product.eyeGlassTypes.glassType}
                </span>
                <div className={styles.rating}>
                  {renderStars(product.rate)}
                  <span className={styles.rateCount}>({product.rateCount})</span>
                </div>
              </div>

              <div className={styles.priceAndActions}>
                <h4 className={styles.price}>{formatCurrency(product.price)}</h4>
                <div className={styles.actionButtons}>
                  <Button
                    color="info"
                    size="sm"
                    title="View Details"
                    onClick={() => handleView(product.id)}
                  >
                    <Eye size={14} />
                  </Button>
                  <Button
                    color="primary"
                    size="sm"
                    title="Edit Product"
                    onClick={() => handleEdit(product.id)}
                  >
                    <Edit2 size={14} />
                  </Button>
                  <Button
                    color="danger"
                    size="sm"
                    title="Delete Product"
                    onClick={() => handleDelete(product)}
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
      name: 'ID',
      selector: (row: EyeGlass) => row.id,
      sortable: true,
      sortField: 'ID',
      width: '80px',
    },
    {
      name: 'Image',
      cell: (row: EyeGlass) => (
        <img
          src={row.eyeGlassImages?.[0]?.url || '/placeholder-image.jpg'}
          alt={row.name}
          className={styles.tableImage}
        />
      ),
      width: '100px',
    },
    {
      name: 'Name',
      selector: (row: EyeGlass) => row.name,
      sortable: true,
      sortField: 'Name',
      cell: (row: EyeGlass) => (
        <div className={styles.productNameCell}>
          <p className={styles.name}>{row.name}</p>
          <small className={styles.specs}>{row.style} - {row.design}</small>
        </div>
      )
    },
    {
      name: 'Type',
      selector: (row: EyeGlass) => row.eyeGlassTypes?.glassType,
      sortable: true,
      cell: (row: EyeGlass) => (
        <span className={`${styles.typeTag} ${styles[row.eyeGlassTypes?.glassType?.toLowerCase()]}`}>
          {row.eyeGlassTypes?.glassType}
        </span>
      )
    },
    {
      name: 'Price',
      selector: (row: EyeGlass) => row.price,
      sortable: true,
      cell: (row: EyeGlass) => (
        <div className={styles.priceCell}>
          <span className={styles.amount}>{formatCurrency(row.price)}</span>
        </div>
      )
    },
    {
      name: 'Status',
      cell: (row: EyeGlass) => (
        <div className={styles.statusCell}>
          <Badge
            color={row.status ? 'success' : 'danger'}
            className={styles.statusBadge}
          >
            {row.status ? 'Active' : 'Inactive'}
          </Badge>
          <div className={styles.ratingInfo}>
            {renderStars(row.rate)}
            <span className={styles.rateCount}>({row.rateCount})</span>
          </div>
        </div>
      ),
    },
    {
      name: 'Actions',
      cell: (row: EyeGlass) => (
        <div className={styles.actionCell}>
          <Button
            color="info"
            size="sm"
            className={styles.actionBtn}
            title="View Details"
            onClick={() => handleView(row.id)}
          >
            <Eye size={14} />
          </Button>
          <Button
            color="primary"
            size="sm"
            className={styles.actionBtn}
            title="Edit Product"
            onClick={() => handleEdit(row.id)}
          >
            <Edit2 size={14} />
          </Button>
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
      width: '150px',
      right: true,
    },
  ];

  const memoizedTableColumns = useMemo(() => tableColumns, []);

  const handleAddNewProduct = () => {
    router.push('/en/products/eyeglass/new');
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
                <Button color="primary" className={styles.addButton} onClick={handleAddNewProduct}>
                  <Plus size={14} className="me-1" /> Add New Product
                </Button>
              </div>
              <div className={styles.headerRight}>
                <div className={styles.viewToggle}>
                  <Button
                    color={viewMode === 'grid' ? 'primary' : 'light'}
                    onClick={() => setViewMode('grid')}
                  >
                    <i className="fa fa-th-large" />
                  </Button>
                  <Button
                    color={viewMode === 'table' ? 'primary' : 'light'}
                    onClick={() => setViewMode('table')}
                  >
                    <i className="fa fa-list" />
                  </Button>
                </div>
              </div>
            </div>

            <div className={styles.filterWrapper}>
              <ProductFilter
                onFilterChange={handleFilterChange}
                eyeGlassTypes={eyeGlassTypes}
                initialParams={filterParams}
              />
            </div>

            {renderContent()}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EyeGlassList;