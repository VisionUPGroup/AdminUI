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
    FormGroup,
    Label,
    Input,
    Button,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane
} from 'reactstrap';
import {
    ArrowLeft,
    Save,
    Package,
    FileText,
    DollarSign,
    Star,
    Box,
    Activity,
    Image as ImageIcon,
    Upload,
    X,
    Plus,
    Grid,
    Tag,
    Eye
} from 'lucide-react';
import CommonBreadcrumb from '@/CommonComponents/CommonBreadcrumb';
import styles from '../../Lens/styles/EditEyeGlass.module.scss';
import { useLensService } from '../../../../../Api/lensService';

interface EditLensProps {
    id?: string;
}

interface LensImage {
    id: number;
    lensID: number;
    angleView: number;
    url: string;
}

interface LensType {
    id: number;
    name: string;
    description: string;
    status: boolean;
}

interface EyeReflactive {
    id: number;
    reflactiveName: string;
    status: boolean;
}

// Update function parameters with type annotations
const handleTypeChange = (type: LensType) => {
    // Function implementation
};

const handleReflactiveChange = (reflactive: EyeReflactive) => {
    // Function implementation
};

interface FormData {
    lensName: string;
    lensDescription: string;
    lensPrice: string;
    quantity: string;
    status: boolean;
    rate: number;
    rateCount: number;
    lensTypeID: string;
    eyeReflactiveID: string;
    images: LensImage[];
}

interface ValidationErrors {
    lensName: string;
    lensDescription: string;
    lensPrice: string;
    // quantity: string;
    lensTypeID: string;
    eyeReflactiveID: string;
    images?: string;
}

const EditLens: React.FC<EditLensProps> = ({ id }) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('basic');
    const [selectedImage, setSelectedImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const {
        fetchLensById,
        fetchLensImages,
        updateLens,
        updateLensImage,
        fetchLensTypes,
        fetchEyeReflactives
    } = useLensService();

    // Form state
    const [formData, setFormData] = useState<FormData>({
        lensName: '',
        lensDescription: '',
        lensPrice: '',
        quantity: '',
        status: true,
        rate: 0,
        rateCount: 0,
        lensTypeID: '',
        eyeReflactiveID: '',
        images: Array(4).fill({ angleView: 0, url: '' })
    });

    const [errors, setErrors] = useState<ValidationErrors>({
        lensName: '',
        lensDescription: '',
        lensPrice: '',
        // quantity: '',
        lensTypeID: '',
        eyeReflactiveID: '',
    });

    const [lensTypes, setLensTypes] = useState<LensType[]>([]);
    const [eyeReflactives, setEyeReflactives] = useState<EyeReflactive[]>([]);

    const formatCurrency = (value: string): string => {
        const number = value.replace(/\D/g, '');
        return number ? new Intl.NumberFormat('vi-VN').format(parseInt(number)) : '';
    };

    const parseCurrency = (value: string): string => {
        return value.replace(/\D/g, '');
    };

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                setLoading(true);
                try {
                    const [lensData, imagesData, typesData, reflactivesData] = await Promise.all([
                        fetchLensById(Number(id)),
                        fetchLensImages(Number(id)),
                        fetchLensTypes() as Promise<LensType[]>,
                        fetchEyeReflactives() as Promise<EyeReflactive[]>
                    ]);

                    if (lensData) {
                        setFormData(prevData => ({
                            ...prevData,
                            lensName: lensData.lensName,
                            lensDescription: lensData.lensDescription,
                            lensPrice: lensData.lensPrice.toString(),
                            quantity: "1000",
                            status: lensData.status,
                            rate: lensData.rate,
                            rateCount: lensData.rateCount,
                            lensTypeID: lensData.lensTypeID.toString(),
                            eyeReflactiveID: lensData.eyeReflactiveID.toString(),
                            images: imagesData || []
                        }));

                        if (imagesData && imagesData.length > 0) {
                            setSelectedImage(imagesData[0].url);
                        }
                    }

                    if (typesData) {
                        setLensTypes(typesData.filter(type => type.status));
                    }

                    if (reflactivesData) {
                        setEyeReflactives(reflactivesData.filter(reflactive => reflactive.status));
                    }

                } catch (error) {
                    console.error("Error fetching lens data:", error);
                    toast.error("Failed to load lens data");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [id]);

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
        const { name, value, type } = e.target;
        const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

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

        const error = validateField(name as keyof FormData, newValue);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {
            lensName: validateField('lensName', formData.lensName),
            lensDescription: validateField('lensDescription', formData.lensDescription),
            lensPrice: validateField('lensPrice', formData.lensPrice),
            // quantity: validateField('quantity', formData.quantity),
            lensTypeID: validateField('lensTypeID', formData.lensTypeID),
            eyeReflactiveID: validateField('eyeReflactiveID', formData.eyeReflactiveID),
        };

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== '');
    };

    const [changedImages, setChangedImages] = useState<{
        [key: number]: File
    }>({});

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && selectedImageIndex !== null) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = (event) => {
                if (event.target?.result) {
                    setFormData(prev => ({
                        ...prev,
                        images: prev.images.map((img, idx) =>
                            idx === selectedImageIndex
                                ? { ...img, url: event.target?.result as string }
                                : img
                        )
                    }));

                    setChangedImages(prev => ({
                        ...prev,
                        [selectedImageIndex]: file
                    }));
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

        setLoading(true);
        try {
            const lensUpdateData = {
                id: parseInt(id as string),
                lensName: formData.lensName,
                lensDescription: formData.lensDescription,
                lensPrice: parseFloat(formData.lensPrice),
                quantity: parseInt(formData.quantity),
                status: true,
                lensTypeID: parseInt(formData.lensTypeID),
                eyeReflactiveID: parseInt(formData.eyeReflactiveID)
            };
            console.log("lensUpdateData", lensUpdateData);

            const updateResult = await updateLens(lensUpdateData);

            if (!updateResult) {
                throw new Error("Failed to update lens information");
            }

            const imageUpdatePromises = Object.entries(changedImages).map(([index, file]) => {
                const imageData = formData.images[parseInt(index)];
                return updateLensImage(file, {
                    ID: imageData.id,
                    LensID: parseInt(id as string),
                    AngleView: imageData.angleView
                });
            });

            await Promise.all(imageUpdatePromises);
            setChangedImages({});

            toast.success("Updated successfully!");
            router.back();

        } catch (error) {
            console.error("Error updating lens:", error);
            toast.error("Failed to update lens. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const renderThumbnail = (image: LensImage, index: number) => {
        if (!image.url || image.url.trim() === '') {
            return (
                <div className={styles.emptyThumbnail}>
                    <Plus size={24} />
                </div>
            );
        }

        return (
            <img
                src={image.url}
                alt={`View ${image.angleView}`}
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                        const placeholder = document.createElement('div');
                        placeholder.className = styles.emptyThumbnail;
                        placeholder.innerHTML = '<svg>...</svg>';
                        parent.appendChild(placeholder);
                    }
                }}
            />
        );
    };

    return (
        <div className={styles.editProductPage}>
            <CommonBreadcrumb
                parent="Products"
                title={id ? `Edit ${formData.lensName}` : 'Create New Lens'}
            />

            <Container fluid>
                <Form onSubmit={(e) => e.preventDefault()}>
                    <Row>
                        {/* Left Column - Images */}
                        <Col lg={4}>
                            <Card className={styles.imageCard}>
                                <CardBody>
                                    <h5 className={styles.sectionTitle}>Product Images</h5>
                                    <div className={styles.imageGallery}>
                                        <div className={styles.mainImage}>
                                            {selectedImage ? (
                                                <img src={selectedImage} alt="Main lens view" />
                                            ) : (
                                                <div className={styles.uploadPlaceholder}>
                                                    <ImageIcon size={48} />
                                                    <p>Upload main lens image</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.thumbnails}>
                                            {formData.images.map((image, index) => (
                                                <div
                                                    key={image.id}
                                                    className={`${styles.thumbnail} ${selectedImage === image.url ? styles.active : ''}`}
                                                    onClick={() => {
                                                        setSelectedImageIndex(index);
                                                        setShowImageModal(true);
                                                    }}
                                                >
                                                    {renderThumbnail(image, index)}
                                                    <div className={styles.thumbnailOverlay}>
                                                        <Upload size={16} />
                                                        <span>Change</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* Right Column - Form */}
                        <Col lg={8}>
                            <Card className={styles.formCard}>
                                <CardBody>
                                    <Nav tabs className={styles.modernTabs}>
                                        <NavItem>
                                            <NavLink
                                                className={`${styles.tabLink} ${activeTab === 'basic' ? styles.active : ''}`}
                                                onClick={() => setActiveTab('basic')}
                                            >
                                                <Eye size={18} />
                                                <span>Basic Information</span>
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink
                                                className={`${styles.tabLink} ${activeTab === 'details' ? styles.active : ''}`}
                                                onClick={() => setActiveTab('details')}
                                            >
                                                <FileText size={18} />
                                                <span>Details</span>
                                            </NavLink>
                                        </NavItem>
                                    </Nav>

                                    <TabContent activeTab={activeTab} className={styles.tabContent}>
                                        <TabPane tabId="basic">
                                            <div className={styles.formSection}>
                                                <div className={styles.sectionHeader}>
                                                    <h4>General Information</h4>
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
                                                                {errors.lensName && <div className={styles.errorMessage}>{errors.lensName}</div>}
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
                                                    <Col md={6}>
                                                        {/* <div className={styles.modernFormGroup}>
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
                                                                {errors.quantity && <div className={styles.errorMessage}>{errors.quantity}</div>}
                                                            </div>
                                                        </div> */}
                                                    </Col>
                                                    {/* <Col md={6}>
                                                        <div className={styles.modernFormGroup}>
                                                            <div className={styles.inputIcon}>
                                                                <Star className={styles.fieldIcon} size={18} />
                                                                <Input
                                                                    id="rate"
                                                                    name="rate"
                                                                    type="number"
                                                                    value={formData.rate}
                                                                    disabled
                                                                    className={styles.modernInput}
                                                                />
                                                                <span className={styles.rateCount}>({formData.rateCount} ratings)</span>
                                                            </div>
                                                        </div>
                                                    </Col> */}
                                                </Row>

                                                <Row className="g-4">
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
                                                                            {type.name}
                                                                        </option>
                                                                    ))}
                                                                </Input>
                                                                {errors.lensTypeID && <div className={styles.errorMessage}>{errors.lensTypeID}</div>}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col md={6}>
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
                                                                {errors.eyeReflactiveID && <div className={styles.errorMessage}>{errors.eyeReflactiveID}</div>}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>

                                                {/* <div className={styles.modernSwitch}>
                                                    <Input
                                                        id="status"
                                                        name="status"
                                                        type="checkbox"
                                                        checked={formData.status}
                                                        onChange={handleInputChange}
                                                    />
                                                    <Label for="status" className={styles.switchLabel}>
                                                        <Activity size={16} />
                                                        <span>Active Status</span>
                                                    </Label>
                                                </div> */}
                                            </div>
                                        </TabPane>

                                        <TabPane tabId="details">
                                            <div className={styles.formSection}>
                                                <div className={styles.sectionHeader}>
                                                    <h4>Description</h4>
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
                                                            className={`${styles.modernInput} ${styles.textarea} ${errors.lensDescription ? styles.inputError : ''}`}
                                                            rows={6}
                                                        />
                                                        {errors.lensDescription && <div className={styles.errorMessage}>{errors.lensDescription}</div>}
                                                    </div>
                                                </div>
                                            </div>
                                        </TabPane>
                                    </TabContent>

                                    <div className={styles.formActions}>
                                        <Button color="light" onClick={handleCancel}>
                                            <ArrowLeft size={14} className="me-2" /> Cancel
                                        </Button>
                                        <Button color="primary" onClick={handleSave} disabled={loading}>
                                            <Save size={14} className="me-2" />
                                            {id ? 'Update Lens' : 'Create Lens'}
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </Container>

            {loading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner}>
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            )}

            {/* Image Upload Modal */}
            {showImageModal && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h5>Update Lens Image</h5>
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
                                    <span>Support for a single or bulk upload. Strictly prohibited from uploading company data or other banned files.</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditLens;