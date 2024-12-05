

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, UserPlus, Phone, Mail, AlertCircle,
  Check, Calendar, Loader2, User, Building, X
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
}

const validationSchema = Yup.object({
  fullName: Yup.string()
    .required('Full name is required')
    .min(2, 'Name is too short')
    .max(50, 'Name is too long'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  phoneNumber: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  address: Yup.string()
    .required('Address is required')
    .min(5, 'Address is too short'),
  birthday: Yup.date()
    .max(new Date(), 'Birthday cannot be in the future')
    .nullable()
});

const CustomerSection: React.FC<CustomerSectionProps> = ({ onCustomerSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { fetchAccounts, createAccount } = useAccountService();

  // Search effect
  useEffect(() => {
    // Tạo một biến để track component mounted state
    let mounted = true;
    const abortController = new AbortController();

    const performSearch = async () => {
      // Clear previous results if search is empty
      if (!debouncedSearch?.trim() || debouncedSearch.length < 2) {
        setCustomers([]);
        setLoading(false);
        return;
      }

      // Set loading state
      if (mounted) {
        setLoading(true);
      }

      try {
        const response = await fetchAccounts({
          Username: debouncedSearch,
          RoleID: 1,
          signal: abortController.signal
        });

        // Only update state if component is still mounted
        if (mounted) {
          setCustomers(response?.data || []);
          setError(null);
          setLoading(false);
        }
      } catch (error: any) {
        // Ignore if request was aborted
        if (error.name === 'AbortError') {
          return;
        }

        // Only update state if component is still mounted
        if (mounted) {
          setError('Could not search for customers');
          setCustomers([]);
          setLoading(false);
        }
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300); // Reduce debounce time to make it more responsive

    // Cleanup function
    return () => {
      mounted = false;
      abortController.abort();
      clearTimeout(timeoutId);
    };
  }, [debouncedSearch]);


  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.trim() === searchQuery.trim()) return; // Prevent unnecessary updates
    setSearchQuery(value);
  }, [searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setCustomers([]);
    setSelectedCustomer(null);
  }, []);


  const handleCustomerSelect = useCallback((customer: CustomerData) => {
    setSelectedCustomer(customer);
    onCustomerSelect(customer);
  }, [onCustomerSelect]);

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
        setError(error.message || 'Could not create new customer');
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <div className={styles.customerSection}>
      <div className={styles.welcomeHeader}>
        <Building className={styles.icon} />
        <h1>Welcome to Vision Store</h1>
        <p>Let's start by selecting a customer or creating a new one</p>
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.searchInput}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, email or phone number..."
            value={searchQuery}
            onChange={handleSearchChange}
            // Thêm onBlur để tránh việc search khi blur
            onBlur={() => {
              if (!searchQuery.trim()) {
                setCustomers([]);
              }
            }}
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
        <button
          className={styles.addButton}
          onClick={() => setShowModal(true)}
          type="button"
        >
          <UserPlus size={20} />
          <span>New Customer</span>
        </button>
      </div>

      {error && (
        <div className={styles.error} onClick={() => setError(null)}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.customerList}>
        {loading ? (
          <div className={styles.loading}>
            <Loader2 className={styles.spinner} />
            <span>Searching...</span>
          </div>
        ) : customers.length > 0 ? (
          <AnimatePresence>
            {customers.map((customer) => (
              <motion.div
                key={customer.id}
                className={`${styles.customerCard} ${selectedCustomer?.id === customer.id ? styles.selected : ''
                  }`}
                onClick={() => handleCustomerSelect(customer)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className={styles.customerInfo}>
                  <User className={styles.avatar} size={40} />
                  <div className={styles.details}>
                    <h3>{customer.username}</h3>
                    <div className={styles.contactInfo}>
                      <span className={styles.phone}>
                        <Phone size={16} />
                        {customer.phoneNumber}
                      </span>
                      <span className={styles.email}>
                        <Mail size={16} />
                        {customer.email}
                      </span>
                    </div>
                  </div>
                  {selectedCustomer?.id === customer.id && (
                    <div className={styles.selectedCheck}>
                      <Check size={20} />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : searchQuery ? (
          <div className={styles.noResults}>
            <AlertCircle size={48} />
            <h3>No customers found</h3>
            <p>Try searching with different terms or create a new customer</p>
            <button onClick={() => setShowModal(true)}>
              <UserPlus size={20} />
              Add New Customer
            </button>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <User size={48} />
            <h3>Search for a Customer</h3>
            <p>Enter customer details to search or create a new customer</p>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
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
                <h2>Add New Customer</h2>
                <button onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={formik.handleSubmit}>
                <div className={styles.formField}>
                  <label>Full Name</label>
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
                    <label>Phone Number</label>
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
                  <label>Address</label>
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
                  <label>Birthday</label>
                  <input
                    type="date"
                    {...formik.getFieldProps('birthday')}
                    className={`${styles.dateInput} ${formik.errors.birthday && formik.touched.birthday ? styles.error : ''
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
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={loading || !formik.isValid}
                  >
                    {loading ? (
                      <>
                        <Loader2 className={styles.spinner} />
                        Processing...
                      </>
                    ) : (
                      'Add Customer'
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