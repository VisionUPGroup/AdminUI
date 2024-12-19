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
    Ruler,
    DollarSign,
    Hash,
    Box,
    Feather,
    Palette,
    Activity,
    Image as ImageIcon,
    Upload,
    X,
    Plus,
    Grid,
    Tag,
    ShoppingBag,
    Glasses
} from 'lucide-react';
import CommonBreadcrumb from '@/CommonComponents/CommonBreadcrumb';
import styles from './Scss/EditEyeGlass.module.scss';
import { useEyeGlassService } from '../../../../Api/eyeGlassService';
import { validateField, validateForm, isFormValid } from './Helper/validators';

interface EditEyeGlassProps {
    id?: string;
}

interface EyeGlassImage {
    id: number;
    eyeGlassID: number;
    angleView: number;
    url: string;
}

enum ColorType {
    Red = 0,
    Green = 1,
    Blue = 2,
    Yellow = 3,
    Gray = 4,
    Black = 5,
    White = 6
}

enum MaterialType {
    StainlessSteel = "Stainless Steel",
    Titanium = "Titanium",
    Aluminum = "Aluminum",
    Monel = "Monel",
    Nylon = "Nylon",
    Wood = "Wood",
    Bamboo = "Bamboo",
    CarbonFiber = "Carbon Fiber",
    Gold = "Gold",
    Silver = "Silver"
}

enum DesignType {
    Round = "Round",
    Wayfarer = "Wayfarer",
    Aviator = "Aviator",
    CatEye = "Cat-Eye",
    Oversized = "Oversized",
    Slimline = "Slimline",
    SemiRimless = "Semi-Rimless",
    Rimless = "Rimless"
}

// Tạo mapper để chuyển đổi giữa string và enum number
const colorStringToEnum: { [key: string]: ColorType } = {
    'Red': ColorType.Red,
    'Green': ColorType.Green,
    'Blue': ColorType.Blue,
    'Yellow': ColorType.Yellow,
    'Gray': ColorType.Gray,
    'Black': ColorType.Black,
    'White': ColorType.White
};

const colorEnumToString: { [key: number]: string } = {
    [ColorType.Red]: 'Red',
    [ColorType.Green]: 'Green',
    [ColorType.Blue]: 'Blue',
    [ColorType.Yellow]: 'Yellow',
    [ColorType.Gray]: 'Gray',
    [ColorType.Black]: 'Black',
    [ColorType.White]: 'White'
};


interface ColorOption {
    value: ColorType;
    label: string;
}

interface EyeGlassType {
    id: number;
    glassType: string;
    status: boolean;
}

enum StyleType {
    Classic = "Classic",
    Modern = "Modern",
    Vintage = "Vintage",
    Sport = "Sport",
    Casual = "Casual",
    Fashion = "Fashion"
}

interface FormData {
    name: string;
    price: string;
    // quantity: string;
    material: MaterialType | string;
    color: string;
    style: StyleType | string;
    design: DesignType | string;
    eyeGlassTypeID: string;
    status: boolean;
    lensWidth: string;
    lensHeight: string;
    bridgeWidth: string;
    templeLength: string;
    frameWidth: string;
    weight: string;
    images: EyeGlassImage[];
}

interface ValidationErrors {
    name: string;
    price: string;
    // quantity: string;
    eyeGlassTypeID: string;
    material: string;
    color: string;
    design: string;
    style: string;
    lensWidth: string;
    lensHeight: string;
    bridgeWidth: string;
    templeLength: string;
    frameWidth: string;
    weight: string;
    images?: string; // Add validation for images
}


const EditEyeGlass: React.FC<EditEyeGlassProps> = ({ id }) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('basic');
    const [selectedImage, setSelectedImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const { fetchEyeGlassById, fetchEyeGlassImagesById, updateEyeGlass, updateEyeGlassImage, fetchEyeGlassTypes, uploadEyeGlassImage } = useEyeGlassService();
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        // quantity: '',
        material: '',
        color: '',
        style: '',
        design: '',
        eyeGlassTypeID: '',
        status: true,
        lensWidth: '',
        lensHeight: '',
        bridgeWidth: '',
        templeLength: '',
        frameWidth: '',
        weight: '',
        images: [] as { id: number; url: string; angleView: number }[]
    });
    const [errors, setErrors] = useState<ValidationErrors>({
        name: '',
        price: '',
        // quantity: '',
        eyeGlassTypeID: '',
        material: '',
        color: '',
        design: '',
        style: '',
        lensWidth: '',
        lensHeight: '',
        bridgeWidth: '',
        templeLength: '',
        frameWidth: '',
        weight: ''
    });

    // const colorOptions: ColorOption[] = [
    //     { value: ColorType.Red, label: 'Red' },
    //     { value: ColorType.Green, label: 'Green' },
    //     { value: ColorType.Blue, label: 'Blue' },
    //     { value: ColorType.Yellow, label: 'Yellow' },
    //     { value: ColorType.Gray, label: 'Gray' },
    //     { value: ColorType.Black, label: 'Black' },
    //     { value: ColorType.White, label: 'White' }
    // ];
    const colorOptions: ColorOption[] = [
        { value: ColorType.Red, label: 'Red' },
        { value: ColorType.Green, label: 'Green' },
        { value: ColorType.Blue, label: 'Blue' },
        { value: ColorType.Yellow, label: 'Yellow' },
        { value: ColorType.Gray, label: 'Gray' },
        { value: ColorType.Black, label: 'Black' },
        { value: ColorType.White, label: 'White' }
    ];

    const [eyeGlassTypes, setEyeGlassTypes] = useState<{ id: number; glassType: string; status: boolean }[]>([]);

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
                    const [eyeGlassData, imagesData, typesData] = await Promise.all([
                        fetchEyeGlassById(Number(id)),
                        fetchEyeGlassImagesById(Number(id)),
                        fetchEyeGlassTypes()
                    ]);

                    if (eyeGlassData) {
                        // Xử lý danh sách ảnh
                        let processedImages = [];
                        if (imagesData && imagesData.length > 0) {
                            // Map các ảnh hiện có
                            processedImages = imagesData.map((img: EyeGlassImage) => ({
                                ...img,
                                url: img.url && img.url.trim() !== '' ? img.url : ''
                            }));

                            // Nếu số lượng ảnh < 5, thêm các ô trống
                            if (processedImages.length < 5) {
                                const emptySlots = 5 - processedImages.length;
                                for (let i = 0; i < emptySlots; i++) {
                                    processedImages.push({
                                        id: Math.random() * -1000000, // ID tạm thời âm để tránh trùng
                                        eyeGlassID: parseInt(id),
                                        angleView: processedImages.length + i,
                                        url: ''
                                    });
                                }
                            }
                        } else {
                            // Nếu không có ảnh, tạo 5 ô trống
                            for (let i = 0; i < 5; i++) {
                                processedImages.push({
                                    id: Math.random() * -1000000,
                                    eyeGlassID: parseInt(id),
                                    angleView: i,
                                    url: ''
                                });
                            }
                        }

                        setFormData(prevData => ({
                            ...prevData,
                            name: eyeGlassData.name,
                            price: eyeGlassData.price.toString(),
                            quantity: eyeGlassData.quantity.toString(),
                            material: eyeGlassData.material,
                            color: colorStringToEnum[eyeGlassData.color]?.toString() || '',
                            style: eyeGlassData.style,
                            design: eyeGlassData.design,
                            eyeGlassTypeID: eyeGlassData.eyeGlassTypeID.toString(),
                            status: true,
                            lensWidth: eyeGlassData.lensWidth.toString(),
                            lensHeight: eyeGlassData.lensHeight.toString(),
                            bridgeWidth: eyeGlassData.bridgeWidth.toString(),
                            templeLength: eyeGlassData.templeLength.toString(),
                            frameWidth: eyeGlassData.frameWidth.toString(),
                            weight: eyeGlassData.weight.toString(),
                            images: processedImages
                        }));
                    }

                    // Set selected image từ ảnh hợp lệ đầu tiên
                    if (imagesData && imagesData.length > 0) {
                        const firstValidImage = imagesData.find((img: EyeGlassImage) => img.url && img.url.trim() !== '');
                        if (firstValidImage) {
                            setSelectedImage(firstValidImage.url);
                        }
                    }

                    if (typesData) {
                        const activeTypes = typesData.filter((type: EyeGlassType) => type.status === true);
                        setEyeGlassTypes(activeTypes);
                    }
                } catch (error) {
                    console.error("Error fetching eye glass data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [id]);

    const renderThumbnail = (image: any, index: number) => {
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
                        placeholder.innerHTML = '<svg>...</svg>'; // Plus icon
                        parent.appendChild(placeholder);
                    }
                }}
            />
        );
    };

    // Trong EditEyeGlass.tsx
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));

        if (name === 'price') {
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

        const error = validateField(name as keyof FormData, newValue, false);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));

    };

    const validationForm = (): boolean => {
        const validationErrors = validateForm(formData, false); // false for Edit mode
        setErrors(validationErrors);
        return isFormValid(validationErrors);
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
                    // Update UI immediately với base64 của ảnh
                    setFormData(prev => ({
                        ...prev,
                        images: prev.images.map((img, idx) =>
                            idx === selectedImageIndex
                                ? { ...img, url: event.target?.result as string }
                                : img
                        )
                    }));

                    // Lưu file để update sau
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
        if (!validationForm()) {
            toast.error("Please check all required fields");
            return;
        }
    
        setLoading(true);
        try {
            // 1. Update thông tin cơ bản của kính
            const eyeGlassUpdateData = {
                id: parseInt(id as string),
                eyeGlassTypeID: parseInt(formData.eyeGlassTypeID),
                name: formData.name,
                price: parseFloat(formData.price),
                quantity: 1000,
                material: formData.material,
                color: parseInt(formData.color),
                lensWidth: parseFloat(formData.lensWidth),
                lensHeight: parseFloat(formData.lensHeight),
                bridgeWidth: parseFloat(formData.bridgeWidth),
                templeLength: parseFloat(formData.templeLength),
                frameWidth: parseFloat(formData.frameWidth),
                style: formData.style,
                weight: parseFloat(formData.weight),
                design: formData.design,
                status: formData.status
            };
    
            // Thực hiện update eyeglass
            const updateResult = await updateEyeGlass(eyeGlassUpdateData);
    
            if (!updateResult) {
                throw new Error("Failed to update eye glass information");
            }
    
            // 2. Fetch current images sau khi update thành công
            const currentImages = await fetchEyeGlassImagesById(updateResult.id);
    
            if (currentImages) {
                // 3. Update các ảnh đã thay đổi
                const imageUpdatePromises = Object.entries(changedImages).map(([index, file]) => {
                    const imageData = formData.images[parseInt(index)];
                    // Tìm ảnh tương ứng trong currentImages
                    const currentImage = currentImages.find((img:any) => img.angleView === imageData.angleView);
                    
                    if (currentImage) {
                        // Nếu ảnh đã tồn tại, update với ID từ currentImages
                        return updateEyeGlassImage(file, {
                            ID: currentImage.id,
                            EyeGlassID: updateResult.id,
                            AngleView: imageData.angleView
                        });
                    } else {
                        // Nếu là ảnh mới, thực hiện upload mới
                        return uploadEyeGlassImage(file, {
                            EyeGlassID: updateResult.id,
                            AngleView: imageData.angleView
                        });
                    }
                });
    
                await Promise.all(imageUpdatePromises);
            }
    
            // Clear changed images sau khi update thành công
            setChangedImages({});
    
            // Hiển thị thông báo thành công
            toast.success("Updated successfully!");
    
            // Quay lại trang trước
            router.push(`/en/products/eyeglass/${updateResult.id}`);
    
        } catch (error) {
            console.error("Error updating eye glass:", error);
            toast.error("Failed to update eye glass. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (id) {
            router.push(`/en/products/eyeglass/${id}`);
        } else {
            router.push('/en/products/digital/digital-product-list');
        }
    };



    return (
        <div className={styles.editProductPage}>
            <CommonBreadcrumb
                parent="Products"
                title={id ? `Edit ${formData.name}` : 'Create New Product'}
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
                                                <img src={selectedImage} alt="Main product view" />
                                            ) : (
                                                <div className={styles.uploadPlaceholder}>
                                                    <ImageIcon size={48} />
                                                    <p>Upload main product image</p>
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
                                                <ShoppingBag size={18} />
                                                <span>Basic Information</span>
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink
                                                className={`${styles.tabLink} ${activeTab === 'specs' ? styles.active : ''}`}
                                                onClick={() => setActiveTab('specs')}
                                            >
                                                <Ruler size={18} />
                                                <span>Specifications</span>
                                            </NavLink>
                                        </NavItem>
                                    </Nav>

                                    <TabContent activeTab={activeTab} className={styles.tabContent}>
                                        <TabPane tabId="basic">
                                            <div className={styles.formSection}>
                                                <div className={styles.sectionHeader}>
                                                    <h4>General Details</h4>
                                                    <p>Enter the basic product information below</p>
                                                </div>

                                                <Row className="g-4">
                                                    <Col md={6}>
                                                        <div className={styles.modernFormGroup}>
                                                            <div className={styles.inputIcon}>
                                                                <Glasses className={styles.fieldIcon} size={18} />
                                                                <Input
                                                                    id="name"
                                                                    name="name"
                                                                    value={formData.name}
                                                                    onChange={handleInputChange}
                                                                    placeholder="Product Name"
                                                                    className={`${styles.modernInput} ${errors.name ? styles.inputError : ''}`}
                                                                />
                                                                {errors.name && <div className={styles.errorMessage}>{errors.name}</div>}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className={styles.modernFormGroup}>
                                                            <div className={styles.inputIcon}>
                                                                <div className={styles.priceIcon}>VND</div>
                                                                <Input
                                                                    id="price"
                                                                    name="price"
                                                                    value={formatCurrency(formData.price)}
                                                                    onChange={handleInputChange}
                                                                    placeholder="Enter price"
                                                                    className={`${styles.modernInput} ${styles.priceInput}`}
                                                                />
                                                                {errors.price && <div className={styles.errorMessage}>{errors.price}</div>}
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
                                                                {errors.quantity && <div className={styles.errorMessage}>{errors.quantity}</div>}
                                                            </div>
                                                        </div>
                                                    </Col> */}
                                                    <Col md={6}>
                                                        <div className={styles.modernFormGroup}>
                                                            <div className={styles.inputIcon}>
                                                                <Tag className={styles.fieldIcon} size={18} />
                                                                <Input
                                                                    id="eyeGlassTypeID"
                                                                    name="eyeGlassTypeID"
                                                                    type="select"
                                                                    value={formData.eyeGlassTypeID}
                                                                    onChange={handleInputChange}
                                                                    className={styles.modernInput}
                                                                >
                                                                    <option value="">Select Glass Type</option>
                                                                    {eyeGlassTypes.map(type => (
                                                                        <option key={type.id} value={type.id}>
                                                                            {type.glassType}
                                                                        </option>
                                                                    ))}
                                                                </Input>
                                                                {errors.eyeGlassTypeID && <div className={styles.errorMessage}>{errors.eyeGlassTypeID}</div>}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>

                                                <div className={`${styles.sectionHeader} mt-5`}>
                                                    <h4>Design Information</h4>
                                                    <p>Specify the design and appearance details</p>
                                                </div>

                                                <Row className="g-4">
                                                    <Col md={4}>
                                                        <div className={styles.modernFormGroup}>
                                                            <div className={styles.inputIcon}>
                                                                <Box className={styles.fieldIcon} size={18} />
                                                                <Input
                                                                    id="material"
                                                                    name="material"
                                                                    type="select"
                                                                    value={formData.material}
                                                                    onChange={handleInputChange}
                                                                    className={styles.modernInput}
                                                                >
                                                                    <option value="">Select Material</option>
                                                                    {Object.values(MaterialType).map(material => (
                                                                        <option key={material} value={material}>
                                                                            {material}
                                                                        </option>
                                                                    ))}
                                                                </Input>
                                                                {errors.material && <div className={styles.errorMessage}>{errors.material}</div>}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col md={4}>
                                                        <div className={styles.modernFormGroup}>
                                                            <div className={styles.inputIcon}>
                                                                <Palette className={styles.fieldIcon} size={18} />
                                                                <Input
                                                                    id="color"
                                                                    name="color"
                                                                    type="select"
                                                                    value={formData.color}
                                                                    onChange={handleInputChange}
                                                                    className={styles.modernInput}
                                                                >
                                                                    <option value="">Select Color</option>
                                                                    {colorOptions.map(color => (
                                                                        <option
                                                                            key={color.value}
                                                                            value={color.value}
                                                                        >
                                                                            {color.label}
                                                                        </option>
                                                                    ))}
                                                                </Input>
                                                                {errors.color && <div className={styles.errorMessage}>{errors.color}</div>}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col md={4}>
                                                        <div className={styles.modernFormGroup}>
                                                            <div className={styles.inputIcon}>
                                                                <Grid className={styles.fieldIcon} size={18} />
                                                                <Input
                                                                    id="style"
                                                                    name="style"
                                                                    type="select"
                                                                    value={formData.style}
                                                                    onChange={handleInputChange}
                                                                    className={styles.modernInput}
                                                                >
                                                                    <option value="">Select Style</option>
                                                                    {Object.values(StyleType).map(styleType => (
                                                                        <option key={styleType} value={styleType}>
                                                                            {styleType}
                                                                        </option>
                                                                    ))}
                                                                </Input>
                                                                {errors.style && <div className={styles.errorMessage}>{errors.style}</div>}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col md={4}>
                                                        <div className={styles.modernFormGroup}>
                                                            <div className={styles.inputIcon}>
                                                                <Grid className={styles.fieldIcon} size={18} />
                                                                <Input
                                                                    id="design"
                                                                    name="design"
                                                                    type="select"
                                                                    value={formData.design}
                                                                    onChange={handleInputChange}
                                                                    className={styles.modernInput}
                                                                >
                                                                    <option value="">Select Design</option>
                                                                    {Object.values(DesignType).map(design => (
                                                                        <option key={design} value={design}>
                                                                            {design}
                                                                        </option>
                                                                    ))}
                                                                </Input>
                                                                {errors.design && <div className={styles.errorMessage}>{errors.design}</div>}
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

                                        <TabPane tabId="specs">
                                            <div className={styles.formSection}>
                                                <div className={styles.sectionHeader}>
                                                    <h4>Dimensions</h4>
                                                    <p>Enter the precise measurements for the eyeglass frame</p>
                                                </div>

                                                <div className={styles.specsGrid}>
                                                    {[
                                                        { id: 'lensWidth', label: 'Lens Width', unit: 'mm', value: formData.lensWidth },
                                                        { id: 'lensHeight', label: 'Lens Height', unit: 'mm', value: formData.lensHeight },
                                                        { id: 'bridgeWidth', label: 'Bridge Width', unit: 'mm', value: formData.bridgeWidth },
                                                        { id: 'templeLength', label: 'Temple Length', unit: 'mm', value: formData.templeLength },
                                                        { id: 'frameWidth', label: 'Frame Width', unit: 'mm', value: formData.frameWidth },
                                                        { id: 'weight', label: 'Weight', unit: 'g', value: formData.weight }
                                                    ].map((spec) => (
                                                        <div className={styles.specCard} key={spec.id}>
                                                            <div className={styles.specIcon}>
                                                                {spec.id === 'weight' ? (
                                                                    <Package size={20} />
                                                                ) : (
                                                                    <Ruler size={20} />
                                                                )}
                                                            </div>
                                                            <div className={styles.specContent}>
                                                                <Label for={spec.id}>{spec.label}</Label>
                                                                <Input
                                                                    id={spec.id}
                                                                    name={spec.id}
                                                                    type="number"
                                                                    value={spec.value}
                                                                    onChange={handleInputChange}
                                                                    placeholder="0"
                                                                    className={`${styles.specInput} ${errors[spec.id as keyof typeof errors] ? styles.inputError : ''}`}
                                                                />
                                                                {errors[spec.id as keyof typeof errors] &&
                                                                    <div className={styles.errorMessage}>{errors[spec.id as keyof typeof errors]}</div>
                                                                }
                                                                <span className={styles.unit}>{spec.unit}</span>
                                                            </div>
                                                        </div>
                                                    ))}
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
                                            {id ? 'Update Product' : 'Create Product'}
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
                            <h5>Update Product Image</h5>
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

export default EditEyeGlass;