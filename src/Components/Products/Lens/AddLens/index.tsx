"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
    Card,
    CardBody,
    Container,
    Row,
    Col,
    Form,
    Input,
    Button,
} from 'reactstrap';
import {
    ArrowLeft,
    Save,
    Package,
    FileText,
    DollarSign,
    Box,
    Activity,
    ImageIcon,
    Upload,
    X,
    Tag,
    Grid,
    Eye
} from 'lucide-react';
import CommonBreadcrumb from '@/CommonComponents/CommonBreadcrumb';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../../Lens/styles/EditEyeGlass.module.scss';
import { useLensService } from '../../../../../Api/lensService';

interface LensImage {
    id?: number;
    lensID?: number;
    angleView: number;
    url: string;
}

interface LensType {
    id: number;
    description: string;
    status: boolean;
}

interface EyeReflactive {
    id: number;
    reflactiveName: string;
    status: boolean;
}

interface FormData {
    lensName: string;
    lensDescription: string;
    lensPrice: string;
    // quantity: string;
    status: boolean;
    lensTypeID: string;
    eyeReflactiveID: string;
    images: LensImage[];
}

interface ValidationErrors {
    lensName?: string;
    lensDescription?: string;
    lensPrice?: string;
    // quantity?: string;
    lensTypeID?: string;
    eyeReflactiveID?: string;
    images?: string;
}

const AddLens: React.FC = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const {
        createLens,
        uploadLensImage,
        fetchLensTypes,
        fetchEyeReflactives
    } = useLensService();

    // Form state
    const [formData, setFormData] = useState<FormData>({
        lensName: '',
        lensDescription: '',
        lensPrice: '',
        // quantity: '',
        status: true,
        lensTypeID: '',
        eyeReflactiveID: '',
        images: Array(4).fill({ angleView: 0, url: '' })
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [lensTypes, setLensTypes] = useState<LensType[]>([]);
    const [eyeReflactives, setEyeReflactives] = useState<EyeReflactive[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);

    const formatCurrency = (value: string): string => {
        const number = value.replace(/\D/g, '');
        return number ? new Intl.NumberFormat('vi-VN').format(parseInt(number)) : '';
    };

    const parseCurrency = (value: string): string => {
        return value.replace(/\D/g, '');
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [typesData, reflactivesData] = await Promise.all([
                    fetchLensTypes() as Promise<LensType[]>,
                    fetchEyeReflactives() as Promise<EyeReflactive[]>
                ]);

                if (typesData) {
                    setLensTypes(typesData.filter(type => type.status));
                }

                if (reflactivesData) {
                    setEyeReflactives(reflactivesData.filter(reflactive => reflactive.status));
                }
            } catch (error) {
                console.error("Error fetching initial data:", error);
                toast.error("Failed to load initial data");
            }
        };

        fetchInitialData();
    }, []);

    const validateField = (name: keyof FormData, value: any): string => {
        switch (name) {
            case 'lensName':
                if (!value?.toString().trim()) return 'Lens name is required';
                if (value.length < 3) return 'Lens name must be at least 3 characters';
                if (value.length > 100) return 'Lens name must not exceed 100 characters';
                return '';

            case 'lensDescription':
                if (!value?.toString().trim()) return 'Description is required';
                if (value.length < 10) return 'Description must be at least 10 characters';
                if (value.length > 500) return 'Description must not exceed 500 characters';
                return '';

            case 'lensPrice':
                if (!value) return 'Price is required';
                if (isNaN(value) || Number(value) <= 0) return 'Price must be a positive number';
                if (Number(value) > 1000000000) return 'Price is too high';
                return '';

            // case 'quantity':
            //     if (!value) return 'Quantity is required';
            //     if (!Number.isInteger(Number(value))) return 'Quantity must be a whole number';
            //     if (Number(value) < 0) return 'Quantity cannot be negative';
            //     if (Number(value) > 1000000) return 'Quantity is too high';
            //     return '';

            case 'lensTypeID':
                if (!value) return 'Lens type is required';
                return '';

            case 'eyeReflactiveID':
                if (!value) return 'Eye reflactive type is required';
                return '';

            default:
                return '';
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));

        if (name === 'lensPrice') {
            // Format giá trị tiền
            const numericValue = parseCurrency(value);
            const formattedValue = formatCurrency(numericValue);

            setFormData(prev => ({
                ...prev,
                [name]: numericValue // Lưu giá trị số trong state
            }));

            // Set giá trị đã format vào input
            e.target.value = formattedValue;
        } else {
            const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
            setFormData(prev => ({
                ...prev,
                [name]: newValue
            }));
        }

        // Clear error when user starts typing
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const validateImageFile = (file: File): boolean => {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            toast.error('Please upload only JPG, PNG or WebP images');
            return false;
        }

        if (file.size > maxSize) {
            toast.error('Image size should not exceed 5MB');
            return false;
        }

        return true;
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && selectedImageIndex !== null) {
            const file = e.target.files[0];

            if (!validateImageFile(file)) {
                return;
            }

            const reader = new FileReader();

            reader.onload = (event) => {
                if (event.target?.result) {
                    // Update preview images
                    setPreviewImages(prev => {
                        const newPreviews = [...prev];
                        newPreviews[selectedImageIndex] = event.target!.result as string;
                        return newPreviews;
                    });

                    // Store the actual file
                    setNewImages(prev => {
                        const newFiles = [...prev];
                        newFiles[selectedImageIndex] = file;
                        return newFiles;
                    });
                }
            };

            reader.readAsDataURL(file);
            setShowImageModal(false);
        }
    };

    const handleSave = async () => {
        if (!validateForm()) {
            toast.error("Please check all required fields");
            return;
        }

        if (newImages.length === 0) {
            toast.error("Please upload at least one image");
            return;
        }

        setLoading(true);
        try {
            // 1. Create lens first
            const lensData = {
                lensName: formData.lensName,
                lensDescription: formData.lensDescription,
                lensPrice: parseFloat(formData.lensPrice),
                quantity: 1000,
                status: formData.status,
                lensTypeID: parseInt(formData.lensTypeID),
                eyeReflactiveID: parseInt(formData.eyeReflactiveID)
            };

            const newLens = await createLens(lensData);

            if (!newLens || !newLens.id) {
                throw new Error("Failed to create lens");
            }

            // 2. Upload images sequentially
            const uploadPromises = newImages
                .map((file, index) => {
                    if (!file) return null;

                    return async () => {
                        try {
                            await uploadLensImage(file, {
                                LensID: newLens.id,
                                AngleView: index
                            });
                        } catch (error) {
                            console.error(`Failed to upload image ${index}:`, error);
                            throw new Error(`Failed to upload image ${index}`);
                        }
                    };
                })
                .filter(Boolean);

            // Execute uploads sequentially
            for (const uploadPromise of uploadPromises) {
                if (uploadPromise) {
                    await uploadPromise();
                }
            }

            toast.success("Lens created successfully with images!");
            router.push('/admin/products/lens');

        } catch (error) {
            console.error("Error in save process:", error);
            toast.error(error instanceof Error ? error.message : "Failed to create lens with images");
        } finally {
            setLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        let isValid = true;

        // Validate all fields
        Object.keys(formData).forEach((key) => {
            if (key !== 'images' && key !== 'status') {
                const error = validateField(key as keyof FormData, formData[key as keyof FormData]);
                if (error) {
                    newErrors[key as keyof ValidationErrors] = error;
                    isValid = false;
                }
            }
        });

        // Validate at least one image
        if (newImages.length === 0) {
            newErrors.images = 'At least one image is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };


    return (
        <div className={styles.editProductPage}>
            <CommonBreadcrumb parent="Products" title="Add New Lens" />

            <Container fluid>
                <Form onSubmit={(e) => e.preventDefault()}>
                    <Row>
                        {/* Left Column - Images */}
                        <Col lg={4}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Card className={styles.imageCard}>
                                    <CardBody>
                                        <h5 className={styles.sectionTitle}>
                                            <ImageIcon size={20} className="me-2" />
                                            Product Images
                                        </h5>
                                        <div className={styles.imageGallery}>
                                            <div className={`${styles.mainImage} ${!previewImages[0] ? styles.empty : ''}`}>
                                                {previewImages[0] ? (
                                                    <img src={previewImages[0]} alt="Main lens view" />
                                                ) : (
                                                    <div className={styles.uploadPlaceholder}>
                                                        <Upload size={48} />
                                                        <p>Upload main lens image</p>
                                                        <span>Click to upload primary image</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className={styles.thumbnails}>
                                                {Array(4).fill(null).map((_, index) => (
                                                    <div
                                                        key={index}
                                                        className={`${styles.thumbnail} ${previewImages[index] ? '' : styles.empty}`}
                                                        onClick={() => {
                                                            setSelectedImageIndex(index);
                                                            setShowImageModal(true);
                                                        }}
                                                    >
                                                        {previewImages[index] ? (
                                                            <>
                                                                <img src={previewImages[index]} alt={`View ${index + 1}`} />
                                                                <div className={styles.thumbnailOverlay}>
                                                                    <Upload size={16} />
                                                                    <span>Change</span>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className={styles.emptyThumbnail}>
                                                                <Upload size={24} />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.images && (
                                                <div className={styles.imageError}>
                                                    {errors.images}
                                                </div>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.div>
                        </Col>

                        {/* Right Column - Form */}
                        <Col lg={8}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Card className={styles.formCard}>
                                    <CardBody>
                                        <div className={styles.formSection}>
                                            <div className={styles.sectionHeader}>
                                                <h4>
                                                    <Box size={20} className="me-2" />
                                                    Basic Information
                                                </h4>
                                                <p>Enter the basic lens information below</p>
                                            </div>

                                            <Row className="g-4">
                                                <Col md={6}>
                                                    <div className={styles.modernFormGroup}>
                                                        <div className={styles.inputIcon}>
                                                            <Eye className={styles.fieldIcon} size={18} />
                                                            <Input
                                                                id="lensName"
                                                                name="lensName"
                                                                value={formData.lensName}
                                                                onChange={handleInputChange}
                                                                placeholder="Lens Name"
                                                                className={`${styles.modernInput} ${errors.lensName ? styles.inputError : ''}`}
                                                            />
                                                            {errors.lensName && (
                                                                <div className={styles.errorMessage}>{errors.lensName}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col md={6}>
                                                    <div className={styles.modernFormGroup}>
                                                        <div className={styles.inputIcon}>
                                                            <div className={styles.priceIcon}>VND</div>
                                                            <Input
                                                                id="lensPrice"
                                                                name="lensPrice"
                                                                value={formatCurrency(formData.lensPrice)}
                                                                onChange={handleInputChange}
                                                                placeholder="Nhập giá sản phẩm"
                                                                className={`${styles.modernInput} ${styles.priceInput}`}
                                                            />
                                                            {errors.lensPrice && <div className={styles.errorMessage}>{errors.lensPrice}</div>}
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>

                                            <Row className="g-4">
                                                {/* <Col md={6}>
                                                    <div className={styles.modernFormGroup}>
                                                        <div className={styles.inputIcon}>
                                                            <Package className={styles.fieldIcon} size={18} />
                                                            <Input
                                                                id="quantity"
                                                                name="quantity"
                                                                type="number"
                                                                value={formData.quantity}
                                                                onChange={handleInputChange}
                                                                placeholder="Quantity"
                                                                className={styles.modernInput}
                                                            />
                                                            {errors.quantity && (
                                                                <div className={styles.errorMessage}>{errors.quantity}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Col> */}
                                                <Col md={6}>
                                                    <div className={styles.modernFormGroup}>
                                                        <div className={styles.inputIcon}>
                                                            <Tag className={styles.fieldIcon} size={18} />
                                                            <Input
                                                                id="lensTypeID"
                                                                name="lensTypeID"
                                                                type="select"
                                                                value={formData.lensTypeID}
                                                                onChange={handleInputChange}
                                                                className={styles.modernInput}
                                                            >
                                                                <option value="">Select Lens Type</option>
                                                                {lensTypes.map(type => (
                                                                    <option key={type.id} value={type.id}>
                                                                        {type.description}
                                                                    </option>
                                                                ))}
                                                            </Input>
                                                            {errors.lensTypeID && (
                                                                <div className={styles.errorMessage}>{errors.lensTypeID}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col md={6}>  {/* Thay đổi từ md={6} thành md={12} */}
                                                    <div className={styles.modernFormGroup}>
                                                        <div className={styles.inputIcon}>
                                                            <Grid className={styles.fieldIcon} size={18} />
                                                            <Input
                                                                id="eyeReflactiveID"
                                                                name="eyeReflactiveID"
                                                                type="select"
                                                                value={formData.eyeReflactiveID}
                                                                onChange={handleInputChange}
                                                                className={styles.modernInput}
                                                            >
                                                                <option value="">Select Reflactive Type</option>
                                                                {eyeReflactives.map(reflactive => (
                                                                    <option key={reflactive.id} value={reflactive.id}>
                                                                        {reflactive.reflactiveName}
                                                                    </option>
                                                                ))}
                                                            </Input>
                                                            {errors.eyeReflactiveID && (
                                                                <div className={styles.errorMessage}>
                                                                    {errors.eyeReflactiveID}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>

                                            {/* Tách status thành một Row riêng */}
                                            <Row>
                                                {/* <Col>
                                                    <div className={`${styles.modernSwitch} mt-4`}>
                                                        <Input
                                                            id="status"
                                                            name="status"
                                                            type="checkbox"
                                                            checked={formData.status}
                                                            onChange={handleInputChange}
                                                        />
                                                        <label htmlFor="status" className={styles.switchLabel}>
                                                            <Activity size={16} />
                                                            <span>Active Status</span>
                                                        </label>
                                                    </div>
                                                </Col> */}
                                            </Row>

                                            <div className={styles.formSection}>
                                                <div className={styles.sectionHeader}>
                                                    <h4>
                                                        <FileText size={20} className="me-2" />
                                                        Description
                                                    </h4>
                                                    <p>Enter detailed information about the lens</p>
                                                </div>

                                                <div className={styles.modernFormGroup}>
                                                    <div className={styles.inputIcon}>
                                                        <FileText className={styles.fieldIcon} size={18} />
                                                        <Input
                                                            id="lensDescription"
                                                            name="lensDescription"
                                                            type="textarea"
                                                            value={formData.lensDescription}
                                                            onChange={handleInputChange}
                                                            placeholder="Enter lens description"
                                                            className={`${styles.modernInput} ${styles.textarea}`}
                                                            rows={6}
                                                        />
                                                        {errors.lensDescription && (
                                                            <div className={styles.errorMessage}>
                                                                {errors.lensDescription}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={styles.formActions}>
                                                <Button
                                                    color="light"
                                                    onClick={() => router.back()}
                                                    className={styles.cancelButton}
                                                >
                                                    <ArrowLeft size={14} className="me-2" />
                                                    Cancel
                                                </Button>
                                                <Button
                                                    color="primary"
                                                    onClick={handleSave}
                                                    disabled={loading}
                                                    className={styles.saveButton}
                                                >
                                                    {loading ? (
                                                        <span className={styles.loadingSpinner}>
                                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                            <span className="ms-2">Creating...</span>
                                                        </span>
                                                    ) : (
                                                        <>
                                                            <Save size={14} className="me-2" />
                                                            Create Lens
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>
                </Form>
            </Container>

            {/* Image Upload Modal */}
            <AnimatePresence>
                {showImageModal && (
                    <motion.div
                        className={styles.modalBackdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                        >
                            <div className={styles.modalHeader}>
                                <h5>Upload Lens Image</h5>
                                <button
                                    className={styles.closeButton}
                                    onClick={() => setShowImageModal(false)}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className={styles.modalBody}>
                                <div className={styles.uploadArea}>
                                    <input
                                        type="file"
                                        id="imageUpload"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className={styles.fileInput}
                                    />
                                    <label htmlFor="imageUpload" className={styles.uploadLabel}>
                                        <Upload size={48} />
                                        <p>Click or drag image to upload</p>
                                        <span>Supports: JPG, PNG, or WebP. Max size: 5MB</span>
                                    </label>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading Overlay */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        className={styles.loadingOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className={styles.spinner}>
                            <span className="sr-only">Loading...</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AddLens;