"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Edit2, Trash2, Plus, Settings, Search, Grid } from 'react-feather';
import { Container, Row, Col, Button, Badge, Card, CardBody } from 'reactstrap';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';
import CommonBreadcrumb from '@/CommonComponents/CommonBreadcrumb';
import CustomTable from '../../Digital/ProductListDigital/CustomTable';
import LensFilter from './LensFilter';
import { useLensService } from '../../../../../Api/lensService';
import LensTypeManagement from '../../LensType';
import styles from '../styles/Lens.module.scss';
import { FilterParams } from './LensFilter';

interface EyeReflactive {
  id: number;
  reflactiveName: string;
  status: boolean;
}

interface LensType {
  id: number;
  name: string;
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
  const {
    fetchLenses,
    fetchLensTypes,
    deleteLens,
    fetchEyeReflactives
  } = useLensService();

  // States
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [lenses, setLenses] = useState<Lens[]>([]);
  const [lensTypes, setLensTypes] = useState<LensType[]>([]);
  const [eyeReflactives, setEyeReflactives] = useState<EyeReflactive[]>([]);
  const [filterParams, setFilterParams] = useState({
    PageIndex: 1,
    PageSize: 10,
  });
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLensTypeModalOpen, setIsLensTypeModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const sortLenses = (lenses: Lens[]) => {
    return [...lenses].sort((a, b) => {
      // Sort by status first (active first, then inactive)
      if (a.status !== b.status) {
        return a.status ? -1 : 1;
      }
      // If status is the same, maintain original order
      return 0;
    });
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const params = {
      PageIndex: 1,
      PageSize: 10,
      Descending: true,
    };

    try {
      const [lensData, typesData, reflactivesData] = await Promise.all([
        fetchLenses(params),
        fetchLensTypes(),
        fetchEyeReflactives() // Thêm fetch eyeReflactives
      ]);

      if (Array.isArray(lensData.data)) {
        setLenses(lensData.data);
        setTotalItems(lensData.totalCount || 0);
      }

      if (Array.isArray(typesData)) {
        setLensTypes(typesData);
      }

      if (Array.isArray(reflactivesData)) {
        setEyeReflactives(reflactivesData);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load data');
    }
  };

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
      toast.error('Failed to fetch data');
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

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== undefined) {
        const newParams = {
          ...filterParams,
          SearchTerm: searchTerm,
          PageIndex: 1
        };
        setFilterParams(newParams);
        fetchData(newParams);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleDelete = async (lens: Lens) => {
    try {
      const result = await Swal.fire({
        title: 'Confirm Delete?',
        text: `Are you sure you want to delete lens "${lens.lensName}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            const response = await deleteLens(lens.id);
            if (response === true) {
              return true;
            }
            throw new Error('Failed to delete lens');
          } catch (error) {
            Swal.showValidationMessage(`Error: ${error.message}`);
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
          title: 'Deleted!',
          text: 'Lens has been deleted successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });

        try {
          await fetchData(filterParams);
        } catch (error) {
          console.error('Error refreshing data:', error);
          Swal.fire({
            title: 'Note',
            text: 'Successfully deleted but unable to fetch latest list',
            icon: 'warning',
            confirmButtonText: 'Close'
          });
        }
      }
    } catch (error) {
      console.error('Error in delete process:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Unable to delete lens. Please try again later.',
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
      selector: (row: Lens) => row.lensType?.name,
      sortable: true,
      cell: (row: Lens) => (
        <span className={`${styles.typeTag}`}>
          {row.lensType?.name}
        </span>
      )
    },
    {
      name: 'Reflactive',
      selector: (row: Lens) => row.eyeReflactive?.reflactiveName,
      sortable: true,
      cell: (row: Lens) => (
        <span className={styles.reflactiveTag}>
          {row.eyeReflactive?.reflactiveName}
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
            className={`${styles.actionBtn} ${!row.status ? styles.disabledButton : ''}`}
            title={row.status ? "View Details" : "Lens Inactive"}
            onClick={() => row.status && handleView(row.id)}
            disabled={!row.status}
          >
            <Eye size={14} />
          </Button>
          <Button
            color="primary"
            size="sm"
            className={`${styles.actionBtn} ${!row.status ? styles.disabledButton : ''}`}
            title={row.status ? "Edit Lens" : "Lens Inactive"}
            onClick={() => row.status && handleEdit(row.id)}
            disabled={!row.status}
          >
            <Edit2 size={14} />
          </Button>
          <Button
            color="danger"
            size="sm"
            className={`${styles.actionBtn} ${!row.status ? styles.disabledButton : ''}`}
            title={row.status ? "Delete Lens" : "Lens Inactive"}
            onClick={() => row.status && handleDelete(row)}
            disabled={!row.status}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
      width: '150px',
      right: true,
    }
  ];

  const handleLensTypeSave = async (lensType: LensType) => {
    try {
      const method = lensType.id ? 'PUT' : 'POST';
      const response = await fetch('/api/lens-types', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lensType),
      });

      if (!response.ok) throw new Error('Failed to save lens type');

      // Hiển thị thông báo thành công
      toast.success(`Lens type ${lensType.id ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Error saving lens type:', error);
      toast.error('Failed to save lens type');
    }
  };

  const handleLensTypeDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this lens type?')) return;

    try {
      const response = await fetch(`/api/lens-types/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete lens type');

      toast.success('Lens type deleted successfully');
    } catch (error) {
      console.error('Error deleting lens type:', error);
      toast.error('Failed to delete lens type');
    }
  };

  const memoizedTableColumns = useMemo(() => tableColumns, []);

  const renderGridView = () => {
    if (isLoading) {
      return <div className={styles.loadingWrapper}><div className={styles.spinner} /></div>;
    }

    const sortedLenses = sortLenses(lenses);

    return (
      <Row className={styles.productsGrid}>
        {sortedLenses.map((lens) => (
          <Col key={lens.id} lg={3} md={4} sm={6} xs={12}>
            <Card className={`${styles.productCard} ${!lens.status ? styles.inactive : ''}`}>
              <div className={styles.imageWrapper}>
                <div className={styles.productId}>#{lens.id}</div>
                <img
                  src={lens.lensImages[0]?.url || '/placeholder-image.jpg'}
                  alt={lens.lensName}
                  className={styles.productImage}
                />
                {!lens.status && (
                  <div className={styles.inactiveOverlay}>
                    <span>INACTIVE</span>
                  </div>
                )}
              </div>
              <CardBody className={styles.productDetails}>
                <div className={styles.productHeader}>
                  <h5 className={styles.productName}>{lens.lensName}</h5>
                  <Badge color={lens.status ? 'success' : 'danger'} className={styles.statusBadge}>
                    {lens.status ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className={styles.productSpecs}>
                  <span className={styles.specItem}>{lens.lensDescription}</span>
                </div>

                <div className={styles.typeAndRating}>
                  <span className={`${styles.typeTag} ${styles[lens.lensType?.name?.toLowerCase()]}`}>
                    {lens.lensType?.name}
                  </span>
                  <span className={styles.reflactiveTag}>
                    {lens.eyeReflactive?.reflactiveName}
                  </span>
                </div>

                <div className={styles.priceAndActions}>
                  <h4 className={styles.price}>{formatCurrency(lens.lensPrice)}</h4>
                  <div className={styles.actionButtons}>
                    <Button
                      color="info"
                      size="sm"
                      title={lens.status ? "View Details" : "Lens Inactive"}
                      onClick={() => lens.status && handleView(lens.id)}
                      disabled={!lens.status}
                      className={!lens.status ? styles.disabledButton : ''}
                    >
                      <Eye size={14} />
                    </Button>
                    <Button
                      color="primary"
                      size="sm"
                      title={lens.status ? "Edit Lens" : "Lens Inactive"}
                      onClick={() => lens.status && handleEdit(lens.id)}
                      disabled={!lens.status}
                      className={!lens.status ? styles.disabledButton : ''}
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      title={lens.status ? "Delete Lens" : "Lens Inactive"}
                      onClick={() => lens.status && handleDelete(lens)}
                      disabled={!lens.status}
                      className={!lens.status ? styles.disabledButton : ''}
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
    if (isLoading && !lenses.length) {
      return (
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner}></div>
        </div>
      );
    }

    const sortedLenses = sortLenses(lenses);

    return (
      <>
        <div className={styles.resultSummary}>
          <span>{totalItems} lenses found</span>
        </div>

        {viewMode === 'table' ? (
          <div className={`${styles.tableWrapper} ${isLoading ? styles.loadingOverlay : ''}`}>
            <CustomTable
              columns={memoizedTableColumns}
              data={sortedLenses}
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

  const renderHeader = () => {
    return (
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1>Lens Management</h1>
          <p>Manage your lens products and configurations</p>
          <div className={styles.headerActions}>
            <Button
              color="primary"
              className={styles.addButton}
              onClick={() => router.push('/en/products/lens/create')}
            >
              <Plus size={16} />
              Add New Lens
            </Button>
            <Button
              color="secondary"
              className={styles.configButton}
              onClick={() => setIsLensTypeModalOpen(true)}
            >
              <Settings size={16} />
              Manage Lens Types
            </Button>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search lenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={18} />
          </div>

          <div className={styles.viewToggle}>
            <Button
              color="light"
              className={`${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.productListPage}>
      {renderHeader()}
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
            <div className={styles.filterWrapper}>
              <LensFilter
                onFilterChange={handleFilterChange}
                lensTypes={lensTypes}
                eyeReflactives={eyeReflactives}
                initialParams={filterParams}
              />
            </div>
            {renderContent()}
          </Col>
        </Row>
      </Container>

      <LensTypeManagement
        isOpen={isLensTypeModalOpen}
        onClose={() => setIsLensTypeModalOpen(false)}
      />
    </div>
  );
};

export default LensList;