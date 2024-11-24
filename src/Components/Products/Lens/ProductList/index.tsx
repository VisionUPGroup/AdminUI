// LensList.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2, Plus } from 'react-feather';
import { Card, CardBody, Container, Row, Col, Button, Badge } from 'reactstrap';
import CommonBreadcrumb from '@/CommonComponents/CommonBreadcrumb';
import { useRouter } from 'next/navigation';
import CustomTable from '../../Digital/ProductListDigital/CustomTable';
// import styles from '../../Digital/ProductListDigital/ProductListDigital.module.scss';
import styles from '../styles/Lens.module.scss';
import LensFilter from './LensFilter';
import { FilterParams } from './LensFilter';
import { useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { useLensService } from '../../../../../Api/lensService';

interface EyeReflactive {
  id: number;
  reflactiveName: string;
  status: boolean;
}

interface LensType {
  id: number;
  description: string;
  status: boolean;
}

interface LensImage {
  id: number;
  lensID: number;
  angleView: number;
  url: string;
}

interface Lens {
  id: number;
  lensName: string;
  lensDescription: string;
  lensPrice: number;
  quantity: number;
  status: boolean;
  rate: number;
  rateCount: number;
  lensTypeID: number;
  eyeReflactiveID: number;
  eyeReflactive: EyeReflactive;
  lensType: LensType;
  lensImages: LensImage[];
}

const LensList: React.FC = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [lenses, setLenses] = useState<Lens[]>([]);
  const [lensTypes, setLensTypes] = useState<LensType[]>([]);
  const { fetchLenses, fetchLensTypes, deleteLens } = useLensService();
  const [filterParams, setFilterParams] = useState({
    PageIndex: 1,
    PageSize: 10,
  });
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = {
      PageIndex: 1,
      PageSize: 10,
    };

    fetchLenses(params).then(data => {
      if (Array.isArray(data.data)) {
        setLenses(data.data);
        setTotalItems(data.totalCount || 0);
      }
    });

    fetchLensTypes().then(data => {
      if (Array.isArray(data)) {
        setLensTypes(data);
      }
    });
  }, []);

  const fetchData = async (params: FilterParams) => {
    setIsLoading(true);
    try {
      const response = await fetchLenses(params);
      if (response?.data) {
        setLenses(response.data);
        setTotalItems(response.totalCount || 0);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newParams: FilterParams) => {
    const isClearAll = Object.keys(newParams).length === 2 && 
                      'PageIndex' in newParams && 
                      'PageSize' in newParams;
  
    let updatedParams;
    if (isClearAll) {
      updatedParams = { ...newParams };
    } else {
      updatedParams = {
        ...filterParams,
        ...newParams,
        PageIndex: newParams.PageIndex || 1
      };
    }
  
    setFilterParams(updatedParams);
    fetchData(updatedParams);
  };

  const handlePageChange = (pageIndex: number) => {
    const updatedParams = {
      ...filterParams,
      PageIndex: pageIndex
    };
    setFilterParams(updatedParams);
    fetchData(updatedParams);
  };

  const handleDelete = async (lens: Lens) => {
    try {
      const result = await Swal.fire({
        title: 'Xác nhận xóa?',
        text: `Bạn có chắc chắn muốn xóa lens "${lens.lensName}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            const response = await deleteLens(lens.id);
            if (response === true) {
              return response;
            }
            throw new Error('Xóa lens thất bại');
          } catch (error) {
            Swal.showValidationMessage(`Lỗi: ${error.message}`);
            throw error;
          }
        },
        allowOutsideClick: () => !Swal.isLoading()
      });

      if (result.isConfirmed) {
        setLenses(prevLenses => 
          prevLenses.filter(l => l.id !== lens.id)
        );
        setTotalItems(prev => prev - 1);

        await Swal.fire({
          title: 'Đã xóa!',
          text: 'Lens đã được xóa thành công.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });

        try {
          await fetchData(filterParams);
        } catch (error) {
          console.error('Error refreshing data:', error);
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
        text: 'Không thể xóa lens. Vui lòng thử lại sau.',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/en/products/lens/${id}`);
  };

  const handleView = (id: number) => {
    router.push(`/en/products/lens/${id}`);
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

  const tableColumns = [
    {
      name: 'ID',
      selector: (row: Lens) => `#${row.id}`,
      sortable: true,
      width: '80px',
    },
    {
      name: 'Image',
      cell: (row: Lens) => (
        <img
          src={row.lensImages?.[0]?.url || 'https://www.zeiss.com/content/dam/vis-b2c/reference-master/images/result-pages/your-eyes/focal-types_single_vision.jpg/_jcr_content/renditions/original.image_file.1920.1440.4,0,2732,2047.file/focal-types_single_vision.jpg'}
          alt={row.lensName}
          className={styles.tableImage}
        />
      ),
      width: '100px',
    },
    {
      name: 'Name',
      selector: (row: Lens) => row.lensName,
      sortable: true,
      cell: (row: Lens) => (
        <div className={styles.productNameCell}>
          <p className={styles.name}>{row.lensName}</p>
          <small className={styles.specs}>{row.lensDescription}</small>
        </div>
      )
    },
    {
      name: 'Type',
      selector: (row: Lens) => row.lensType?.description,
      sortable: true,
      cell: (row: Lens) => (
        <span className={`${styles.typeTag}`}>
          {row.lensType?.description}
        </span>
      )
    },
    {
      name: 'Price',
      selector: (row: Lens) => row.lensPrice,
      sortable: true,
      cell: (row: Lens) => (
        <div className={styles.priceCell}>
          <span className={styles.amount}>{formatCurrency(row.lensPrice)}</span>
        </div>
      )
    },
    {
      name: 'Status',
      cell: (row: Lens) => (
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
      cell: (row: Lens) => (
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

  const renderGridView = () => {
    if (isLoading) {
      return <div className={styles.loadingWrapper}><div className={styles.spinner} /></div>;
    }

    return (
      <Row className={styles.productsGrid}>
        {lenses.map((lens) => (
          <Col key={lens.id} lg={3} md={4} sm={6} xs={12}>
            <Card className={`${styles.productCard} ${!lens.status ? styles.inactive : ''}`}>
              <div className={styles.imageWrapper}>
                <div className={styles.productId}>#{lens.id}</div>
                <img
                  src={lens.lensImages[0]?.url || '/placeholder-image.jpg'}
                  alt={lens.lensName}
                  className={styles.productImage}
                />
              </div>
              <CardBody className={styles.productDetails}>
                <div className={styles.productHeader}>
                  <h5 className={styles.productName}>{lens.lensName}</h5>
                  <Badge color={lens.status ? 'success' : 'danger'}>
                    {lens.status ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className={styles.productSpecs}>
                  <span className={styles.specItem}>{lens.lensDescription}</span>
                </div>

                <div className={styles.typeAndRating}>
                  <span className={`${styles.typeTag} ${styles[lens.lensType?.description?.toLowerCase()]}`}>
                    {lens.lensType?.description}
                  </span>
                  <div className={styles.rating}>
                    {renderStars(lens.rate)}
                    <span className={styles.rateCount}>({lens.rateCount})</span>
                  </div>
                </div>

                <div className={styles.priceAndActions}>
                  <h4 className={styles.price}>{formatCurrency(lens.lensPrice)}</h4>
                  <div className={styles.actionButtons}>
                    <Button
                      color="info"
                      size="sm"
                      title="View Details"
                      onClick={() => handleView(lens.id)}
                    >
                      <Eye size={14} />
                    </Button>
                    <Button
                      color="primary"
                      size="sm"
                      title="Edit Product"
                      onClick={() => handleEdit(lens.id)}
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      title="Delete Product"
                      onClick={() => handleDelete(lens)}
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner}></div>
        </div>
      );
    }
    if (!lenses.length) {
      return (
        <div className={styles.loadingWrapper}>
          <p>No lenses found</p>
        </div>
      );
    }

    return (
      <>
        <div className={styles.resultSummary}>
          <span>{totalItems} lenses found</span>
        </div>

        {viewMode === 'table' ? (
          <div className={`${styles.tableWrapper} ${isLoading ? styles.loadingOverlay : ''}`}>
            <CustomTable
              columns={memoizedTableColumns}
              data={lenses}
              pagination
              paginationServer
              paginationTotalRows={totalItems}
              onChangePage={handlePageChange}
              progressPending={isLoading}
              className={styles.productTable}
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

  const handleAddNewProduct = () => {
    router.push('/en/products/lens/new');
  };

  // Tiếp tục phần return của LensList component

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
      <CommonBreadcrumb parent="Digital" title="Lens List" />
      <Container fluid>
        <Row>
          <Col lg={12}>
            <div className={styles.pageHeader}>
              <div className={styles.headerLeft}>
                <Button color="primary" className={styles.addButton} onClick={handleAddNewProduct}>
                  <Plus size={14} className="me-1" /> Add New Lens
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
              <LensFilter
                onFilterChange={handleFilterChange}
                lensTypes={lensTypes}
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

export default LensList;