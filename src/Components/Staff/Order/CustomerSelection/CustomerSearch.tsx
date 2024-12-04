import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, UserPlus, Phone, Mail, MapPin, 
  X, AlertCircle, Check, Calendar, Loader2 
} from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDebounce } from 'use-debounce';
import { useAccountService } from '../../../../../Api/accountService';
import styles from '../styles/CustomerSearch.module.scss';

interface CustomerSectionProps {
  onCustomerSelect: (customer: any) => void;
  onBack: () => void;
}

interface CustomerData {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  status: boolean;
  roleID: number;
  role: {
    id: number;
    name: string;
    description: string;
    status: boolean;
  };
  profiles: null; // Updated to match new structure
}

// Validation schema remains the same
const validationSchema = Yup.object({
  fullName: Yup.string()
    .required('Họ tên không được để trống')
    .min(2, 'Họ tên quá ngắn')
    .max(50, 'Họ tên quá dài'),
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Email không được để trống'),
  phoneNumber: Yup.string()
    .matches(/^[0-9]{10}$/, 'Số điện thoại phải có 10 chữ số')
    .required('Số điện thoại không được để trống'),
  address: Yup.string()
    .required('Địa chỉ không được để trống')
    .min(5, 'Địa chỉ quá ngắn'),
  birthday: Yup.date()
    .max(new Date(), 'Ngày sinh không hợp lệ')
    .nullable()
});

const CustomerSection: React.FC<CustomerSectionProps> = ({ onCustomerSelect, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { fetchAccounts, createAccount } = useAccountService();

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const performSearch = async () => {
      // Don't perform search if query is empty or too short
      if (!debouncedSearch?.trim() || debouncedSearch.length < 2) {
        if (isActive) {
          setCustomers([]);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const response = await fetchAccounts({
          Username: debouncedSearch,
          RoleID: 1
        });
        
        if (isActive) {
          setCustomers(response?.data || []);
          console.log('Search results:', response?.data);
          setError(null);
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          return;
        }
        if (isActive) {
          setError('Không thể tìm kiếm khách hàng');
          setCustomers([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    performSearch();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [debouncedSearch]);

  // Handle customer selection
  const handleCustomerSelect = useCallback((customer: CustomerData) => {
    console.log('Selected customer:', customer);
    setSelectedCustomer(customer);
    
    // Delay the navigation slightly to allow the UI to update
    setTimeout(() => {
      onCustomerSelect(customer);
    }, 100);
  }, [onCustomerSelect]);

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setCustomers([]);
    setSelectedCustomer(null);
  }, []);

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      address: '',
      birthday: ''
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);
        const accountData = {
          username: values.email,
          password: "VUP@123",
          email: values.email,
          roleID: 1,
          phoneNumber: values.phoneNumber,
          profiles: [{
            fullName: values.fullName,
            phoneNumber: values.phoneNumber,
            address: values.address,
            birthday: values.birthday || new Date().toISOString()
          }]
        };

        const response = await createAccount(accountData);
        setError(null);
        handleCustomerSelect(response);
        setShowModal(false);
        resetForm();
      } catch (error: any) {
        setError(error.message || 'Không thể tạo khách hàng mới');
      } finally {
        setLoading(false);
      }
    }
  });

  const renderCustomerCard = useCallback((customer: CustomerData) => (
    <motion.div
      key={customer.id}
      className={`${styles.customerCard} ${
        selectedCustomer?.id === customer.id ? styles.selected : ''
      }`}
      onClick={() => handleCustomerSelect(customer)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.customerInfo}>
        <h3>{customer.username}</h3>
        <div className={styles.details}>
          {customer.phoneNumber && (
            <span>
              <Phone size={16} />
              {customer.phoneNumber}
            </span>
          )}
          <span>
            <Mail size={16} />
            {customer.email}
          </span>
          <span>
            <AlertCircle size={16} />
            {customer.status ? 'Đang hoạt động' : 'Không hoạt động'}
          </span>
        </div>
      </div>
      {selectedCustomer?.id === customer.id && (
        <div className={styles.checkmark}>
          <Check size={20} />
        </div>
      )}
    </motion.div>
  ), [selectedCustomer, handleCustomerSelect]);


  return (
    <div className={styles.customerSection}>
      <header className={styles.header}>
        <button 
          className={styles.backButton} 
          onClick={onBack}
          type="button"
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <button 
          className={styles.addButton} 
          onClick={() => setShowModal(true)}
          type="button"
        >
          <UserPlus size={20} />
          <span>Thêm khách hàng</span>
        </button>
      </header>

      <div className={styles.searchContainer}>
        <div className={styles.searchInput}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button 
              className={styles.clearButton}
              onClick={clearSearch}
              type="button"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className={styles.error} onClick={() => setError(null)}>
          <AlertCircle size={20} />
          <span>{error}</span>
          <button className={styles.closeError} type="button">
            <X size={16} />
          </button>
        </div>
      )}

      <div className={styles.customerList}>
        {loading ? (
          <div className={styles.loading}>
            <Loader2 className={styles.spinner} />
            <span>Đang tìm kiếm...</span>
          </div>
        ) : customers.length > 0 ? (
          <AnimatePresence>
            {customers.map(renderCustomerCard)}
          </AnimatePresence>
        ) : searchQuery ? (
          <div className={styles.emptyState}>
            <AlertCircle size={48} />
            <h3>Không tìm thấy khách hàng</h3>
            <p>Thử tìm kiếm lại hoặc thêm khách hàng mới</p>
            <button onClick={() => setShowModal(true)} type="button">
              <UserPlus size={20} />
              Thêm khách hàng mới
            </button>
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div 
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div 
              className={styles.modalContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>Thêm khách hàng mới</h2>
                <button onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={formik.handleSubmit}>
                <div className={styles.formField}>
                  <label>Họ và tên</label>
                  <input
                    type="text"
                    {...formik.getFieldProps('fullName')}
                    className={formik.errors.fullName && formik.touched.fullName ? styles.error : ''}
                  />
                  {formik.touched.fullName && formik.errors.fullName && (
                    <span className={styles.errorText}>{formik.errors.fullName}</span>
                  )}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label>Email</label>
                    <input
                      type="email"
                      {...formik.getFieldProps('email')}
                      className={formik.errors.email && formik.touched.email ? styles.error : ''}
                    />
                    {formik.touched.email && formik.errors.email && (
                      <span className={styles.errorText}>{formik.errors.email}</span>
                    )}
                  </div>

                  <div className={styles.formField}>
                    <label>Số điện thoại</label>
                    <input
                      type="tel"
                      {...formik.getFieldProps('phoneNumber')}
                      className={formik.errors.phoneNumber && formik.touched.phoneNumber ? styles.error : ''}
                    />
                    {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                      <span className={styles.errorText}>{formik.errors.phoneNumber}</span>
                    )}
                  </div>
                </div>

                <div className={styles.formField}>
                  <label>Địa chỉ</label>
                  <input
                    type="text"
                    {...formik.getFieldProps('address')}
                    className={formik.errors.address && formik.touched.address ? styles.error : ''}
                  />
                  {formik.touched.address && formik.errors.address && (
                    <span className={styles.errorText}>{formik.errors.address}</span>
                  )}
                </div>

                <div className={styles.formField}>
  <label>Ngày sinh</label>
  <input
    type="date"
    {...formik.getFieldProps('birthday')}
    className={`${styles.dateInput} ${
      formik.errors.birthday && formik.touched.birthday ? styles.error : ''
    }`}
  />
  {formik.touched.birthday && formik.errors.birthday && (
    <span className={styles.errorText}>{formik.errors.birthday}</span>
  )}
</div>

                <div className={styles.modalActions}>
                  <button 
                    type="button" 
                    className={styles.cancelButton}
                    onClick={() => setShowModal(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={loading || !formik.isValid}
                  >
                    {loading ? (
                      <>
                        <Loader2 className={styles.spinner} />
                        Đang xử lý...
                      </>
                    ) : (
                      'Thêm khách hàng'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerSection;