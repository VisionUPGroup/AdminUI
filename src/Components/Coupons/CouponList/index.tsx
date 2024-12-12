import React, { useState, useMemo, useEffect } from 'react';
import { Container, Row, Col, Input, Button } from 'reactstrap';
import { Search, Plus, Ticket, Archive, Clock, Percent, Scissors } from 'lucide-react';
import CommonBreadcrumb from '@/CommonComponents/CommonBreadcrumb';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../Styles/VoucherList.module.scss';
import { useVoucherService } from '../../../../Api/voucherService';
import VoucherModal from './VoucherModal';
import { toast } from 'react-toastify';
import { Copy } from 'react-feather';
import Swal from 'sweetalert2'; // Add this import

interface Voucher {
  id: number;
  name: string;
  code: string;
  quantity: number;
  sale: number;
  status: boolean;
  createdAt: string; // Add this field
}

interface VoucherFormData {
  id?: number;
  name: string;
  code: string;
  quantity: string;
  sale: string;
}

const ITEMS_PER_PAGE = 6;
const PRIMARY_COLOR = 'rgb(153, 117, 17)';

const VoucherList: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherFormData | undefined>();
  const { fetchVouchers, createVoucher, updateVoucher, deleteVoucher } = useVoucherService();


  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    const data = await fetchVouchers();
    if (data) {
      setVouchers(data);
    }
  };

  const handleCreateClick = () => {
    setModalMode('create');
    setSelectedVoucher({
      name: '',
      code: '',
      quantity: '',
      sale: ''
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (voucher: Voucher) => {
    setModalMode('edit');
    setSelectedVoucher({
      id: voucher.id,
      name: voucher.name,
      code: voucher.code,
      quantity: voucher.quantity.toString(),
      sale: voucher.sale.toString()
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    // Reset selectedVoucher after modal closes
    setTimeout(() => {
      setSelectedVoucher(undefined);
      setModalMode('create');
    }, 200); // Small delay to allow modal close animation
  };

  const handleSubmit = async (data: VoucherFormData) => {
    try {
      if (modalMode === 'create') {
        await createVoucher({
          ...data,
          quantity: parseInt(data.quantity),
          sale: parseInt(data.sale)
        });
      } else {
        await updateVoucher({
          ...data,
          id: selectedVoucher?.id,
          quantity: parseInt(data.quantity),
          sale: parseInt(data.sale)
        });
      }
      await loadVouchers();
      handleModalClose();
    } catch (error) {
      console.error('Error submitting voucher:', error);
      toast.error('Failed to save voucher. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const result = await Swal.fire({
        title: 'Confirm Delete?',
        text: 'Are you sure you want to delete this voucher?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            await deleteVoucher(id);
            return true;
          } catch (error) {
            Swal.showValidationMessage(`Error: ${error.message}`);
            throw error;
          }
        },
        allowOutsideClick: () => !Swal.isLoading()
      });

      if (result.isConfirmed) {
        setVouchers(prevVouchers => prevVouchers.filter(voucher => voucher.id !== id));

        await Swal.fire({
          title: 'Deleted!',
          text: 'Voucher has been deleted successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });

        await loadVouchers();
      }
    } catch (error) {
      console.error('Error deleting voucher:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Unable to delete voucher. Please try again later.',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        toast.success('Copied to clipboard');
      })
      .catch((error) => {
        console.error('Copy failed:', error);
        toast.error('Failed to copy');
      });
  };

  // const sortedVouchers = useMemo(() => {
  //   return [...vouchers].sort((a, b) => {
  //     // First sort by status (active first, expired last)
  //     if (a.status !== b.status) {
  //       return a.status ? -1 : 1;
  //     }
  //     // Then sort by creation date (newest first)
  //     return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  //   });
  // }, [vouchers]);

  // // Filter and sort vouchers
  // const filteredVouchers = useMemo(() => {
  //   return sortedVouchers.filter(voucher => 
  //     voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     voucher.name.toLowerCase().includes(searchTerm.toLowerCase())
  //   );
  // }, [searchTerm, sortedVouchers]);

  

  const filteredVouchers = useMemo(() => {
    const sortedVouchers = [...vouchers].sort((a, b) => {
      if (a.status !== b.status) {
        return a.status ? -1 : 1;  
      }
      return b.id - a.id;
    });
    return sortedVouchers.filter(voucher =>
      voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, vouchers]);

  const totalPages = Math.ceil(filteredVouchers.length / ITEMS_PER_PAGE);
  const currentVouchers = filteredVouchers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusInfo = (status: boolean, quantity: number) => {
    if (!status) return { text: 'Expired', color: '#EF4444', disabled: true };
    if (quantity === 0) return { text: 'Out of Stock', color: '#EF4444', disabled: false };
    return { text: 'Active', color: '#22C55E', disabled: false };
  };

  return (
    <div className={styles.voucherPage}>
      <CommonBreadcrumb parent="Promotions" title="Voucher Management" />

      <Container fluid>
        {/* Header Section */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <Ticket size={32} />
              <div>
                <h2>Promotional Vouchers</h2>
                <p>Create and manage your discount vouchers</p>
              </div>
            </div>
            <Button className={styles.addButton} onClick={handleCreateClick}>
              <Plus size={20} />
              New Voucher
            </Button>
          </div>
        </div>

        {/* Search Section */}
        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <Search size={20} />
            <Input
              type="text"
              placeholder="Search vouchers by code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.searchStats}>
            Found {filteredVouchers.length} vouchers
          </div>
        </div>

        {/* Voucher Grid */}
        <Row className={styles.voucherGrid}>
          <AnimatePresence>
            {currentVouchers.map((voucher, index) => {
               const statusInfo = getStatusInfo(voucher.status, voucher.quantity);

              return (
                <Col key={voucher.id} lg={6} xl={4}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className={`${styles.voucherCard} ${!voucher.status ? styles.expiredCard : ''}`}
                  >
                    {/* Voucher Header */}
                    <div className={styles.voucherHeader}>
                    <div className={styles.saleTag}>
                      <span className={styles.saleAmount}>{voucher.sale}%</span>
                      <span className={styles.saleText}>OFF</span>
                    </div>
                    <div 
                      className={styles.voucherStatus} 
                      style={{ backgroundColor: statusInfo.color }}
                    >
                      {statusInfo.text}
                    </div>
                  </div>

                    {/* Voucher Content */}
                    <div className={styles.voucherContent}>
                      <div className={styles.voucherInfo}>
                        <h3>{voucher.name}</h3>
                        <div className={styles.codeSection}>
                          <div className={styles.code}>{voucher.code}</div>
                          <Button color="light" 
                                  className={styles.copyButton}
                                  onClick={() => handleCopy(voucher.code)}>
                            <Copy size={16} /> Copy
                          </Button>
                        </div>
                      </div>

                      <div className={styles.voucherDetails}>
                        <div className={styles.detailItem}>
                          <Archive size={16} />
                          <span>Available: {voucher.quantity}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <Clock size={16} />
                          <span>Valid until: 31/12/2024</span>
                        </div>
                      </div>
                    </div>

                    {/* Voucher Footer */}
                    <div className={styles.voucherFooter}>
                    <div className={styles.buttonGroup}>
                      <Button 
                        color="light" 
                        onClick={() => handleEditClick(voucher)}
                        disabled={statusInfo.disabled}
                        className={statusInfo.disabled ? styles.disabledButton : ''}
                      >
                        Edit
                      </Button>
                      <Button 
                        color="danger" 
                        outline 
                        onClick={() => handleDelete(voucher.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                    {/* Decorative Elements */}
                    <div className={styles.circleLeft}></div>
                    <div className={styles.circleRight}></div>
                    <div className={styles.dashedLine}></div>
                  </motion.div>
                </Col>
              );
            })}
          </AnimatePresence>
        </Row>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <Button
              className={styles.pageButton}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <div className={styles.pageNumbers}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  className={`${styles.pageNumber} ${currentPage === page ? styles.active : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              className={styles.pageButton}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* Voucher Modal */}
        <VoucherModal
          isOpen={isModalOpen}
          toggle={handleModalClose}
          onSubmit={handleSubmit}
          initialData={selectedVoucher}
          mode={modalMode}
        />
      </Container>
    </div>
  );
};

export default VoucherList;