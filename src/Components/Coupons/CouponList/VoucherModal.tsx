import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Form, FormGroup, Label } from 'reactstrap';
import { X, Ticket, Tag, Package, Percent, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import styles from '../Styles/VoucherModal.module.scss';

interface VoucherModalProps {
  isOpen: boolean;
  toggle: () => void;
  onSubmit: (data: VoucherFormData) => Promise<void>;
  initialData?: VoucherFormData;
  mode: 'create' | 'edit';
}

interface VoucherFormData {
  id?: number;
  name: string;
  code: string;
  quantity: string;
  sale: string;
}

const defaultFormData: VoucherFormData = {
  name: '',
  code: '',
  quantity: '',
  sale: ''
};

interface ValidationErrors {
  name?: string;
  code?: string;
  quantity?: string;
  sale?: string;
}

const VoucherModal: React.FC<VoucherModalProps> = ({
  isOpen,
  toggle,
  onSubmit,
  initialData,
  mode
}) => {
  const [formData, setFormData] = useState<VoucherFormData>(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<VoucherFormData>>({});

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData(initialData);
    } else if (!isOpen) {
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [isOpen, initialData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<VoucherFormData> = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Voucher name is required';
      isValid = false;
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Voucher code is required';
      isValid = false;
    }

    const quantityNum = Number(formData.quantity);
    if (isNaN(quantityNum) || quantityNum < 1) {
      newErrors.quantity = 'Quantity must be greater than 0';
      isValid = false;
    }

    const saleNum = Number(formData.sale);
    if (isNaN(saleNum) || saleNum < 1 || saleNum > 100) {
      newErrors.sale = 'Discount must be between 1 and 100';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please check all required fields');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      toast.success(`Voucher ${mode === 'create' ? 'created' : 'updated'} successfully!`);
      toggle();
      // Reset form after successful submission
      setFormData(defaultFormData);
    } catch (error) {
      toast.error('Failed to save voucher. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name as keyof VoucherFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };



  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      className={styles.voucherModal}
      centered
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <div className={styles.modalHeader}>
          <div className={styles.headerIcon}>
            <Ticket size={24} />
          </div>
          <div className={styles.headerContent}>
            <h4>{mode === 'create' ? 'Create New Voucher' : 'Edit Voucher'}</h4>
            <p>Fill in the details below to {mode === 'create' ? 'create a new' : 'update the'} voucher</p>
          </div>
          <button className={styles.closeButton} onClick={toggle}>
            <X size={20} />
          </button>
        </div>

        <Form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formSection}>
            <FormGroup className={styles.formGroup}>
              <Label className={styles.label}>
                <Tag size={16} />
                Voucher Name
              </Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter voucher name"
                className={errors.name ? styles.inputError : ''}
              />
              {errors.name && (
                <div className={styles.errorMessage}>
                  <AlertCircle size={14} />
                  {errors.name}
                </div>
              )}
            </FormGroup>

            <FormGroup className={styles.formGroup}>
              <Label className={styles.label}>
                <Tag size={16} />
                Voucher Code
              </Label>
              <Input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="Enter voucher code"
                className={errors.code ? styles.inputError : ''}
              />
              {errors.code && (
                <div className={styles.errorMessage}>
                  <AlertCircle size={14} />
                  {errors.code}
                </div>
              )}
            </FormGroup>

            <div className={styles.twoColumns}>
              <FormGroup className={styles.formGroup}>
                <Label className={styles.label}>
                  <Package size={16} />
                  Quantity
                </Label>
                <Input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  className={errors.quantity ? styles.inputError : ''}
                />
                {errors.quantity && (
                  <div className={styles.errorMessage}>
                    <AlertCircle size={14} />
                    {errors.quantity}
                  </div>
                )}
              </FormGroup>

              <FormGroup className={styles.formGroup}>
                <Label className={styles.label}>
                  <Percent size={16} />
                  Discount (%)
                </Label>
                <Input
                  type="number"
                  name="sale"
                  value={formData.sale}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  className={errors.sale ? styles.inputError : ''}
                />
                {errors.sale && (
                  <div className={styles.errorMessage}>
                    <AlertCircle size={14} />
                    {errors.sale}
                  </div>
                )}
              </FormGroup>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <Button
              type="button"
              color="light"
              onClick={toggle}
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                <>{mode === 'create' ? 'Create Voucher' : 'Update Voucher'}</>
              )}
            </Button>
          </div>
        </Form>
      </motion.div>
    </Modal>
  );
};

export default VoucherModal;