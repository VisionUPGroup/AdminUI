"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    CardBody,
    Container,
    Row,
    Col,
    Badge,
    Button,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane
} from 'reactstrap';
import { Edit2, ArrowLeft, Shield, Droplet, Award, Eye } from 'react-feather';
import CommonBreadcrumb from '@/CommonComponents/CommonBreadcrumb';
import { useLensService } from '../../../../../Api/lensService';
import styles from './LensDetail.module.scss';

interface LensDetailProps {
    id: string;
}

interface LensImage {
    id: number;
    lensID: number;
    angleView: number;
    url: string;
}

interface LensDetail {
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
    eyeReflactive: {
        id: number;
        reflactiveName: string;
        status: boolean;
    };
    lensType: {
        id: number;
        description: string;
        status: boolean;
    };
    lensImages: LensImage[];
}

const LensDetail: React.FC<LensDetailProps> = ({ id }) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedImage, setSelectedImage] = useState('');
    const [lens, setLens] = useState<LensDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const { fetchLensById, fetchLensImages } = useLensService();
    const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                setLoading(true);
                try {
                    const [lensData, imagesData] = await Promise.all([
                        fetchLensById(Number(id)),
                        fetchLensImages(Number(id))
                    ]);

                    if (lensData) {
                        // Xử lý trường hợp không có ảnh hoặc ảnh null
                        let validImages = [];
                        if (imagesData && Array.isArray(imagesData)) {
                            validImages = imagesData.filter((img: LensImage) => img && img.url);

                            // Nếu có ít hơn 5 ảnh, thêm placeholder cho đủ 5 slots
                            if (validImages.length < 5) {
                                const placeholdersNeeded = 5 - validImages.length;
                                for (let i = 0; i < placeholdersNeeded; i++) {
                                    validImages.push({
                                        id: -1 * (i + 1), // ID âm để phân biệt với ảnh thật
                                        lensID: Number(id),
                                        angleView: 0,
                                        url: '' // Empty url for placeholder
                                    });
                                }
                            }
                        }

                        setLens({
                            ...lensData,
                            lensImages: validImages
                        });

                        // Set ảnh đầu tiên là selected nếu có
                        if (validImages.length > 0 && validImages[0].url) {
                            setSelectedImage(validImages[0].url);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching lens data:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [id]);

    const handleImageError = (imageUrl: string) => {
        setImageErrors(prev => ({
            ...prev,
            [imageUrl]: true
        }));
    };

    const renderImage = (url: string, index: number) => {
        if (!url) {
            return (
                <div className={styles.imagePlaceholder}>
                    <span>No Image {index + 1}</span>
                </div>
            );
        }

        if (imageErrors[url]) {
            return (
                <div className={styles.imageError}>
                    <span>Image Error</span>
                </div>
            );
        }

        return (
            <img
                src={url}
                alt={`Lens view ${index + 1}`}
                onError={() => handleImageError(url)}
            />
        );
    };

    const renderMainImage = () => {
        if (!selectedImage) {
            return (
                <div className={styles.mainImagePlaceholder}>
                    <span>No Image Available</span>
                </div>
            );
        }

        if (imageErrors[selectedImage]) {
            return (
                <div className={styles.mainImageError}>
                    <span>Failed to load image</span>
                </div>
            );
        }

        return (
            <img
                src={selectedImage}
                alt={lens?.lensName}
                onError={() => handleImageError(selectedImage)}
            />
        );
    };


    const handleBack = () => {
        router.push('/en/products/lens');
    };

    const handleEdit = () => {
        router.push(`/en/products/lens/${id}/edit`);
    };

    const handleImageClick = (url: string) => {
        setSelectedImage(url);
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

    if (loading) {
        return (
            <div className={styles.loadingWrapper}>
                <div className={styles.spinner} />
            </div>
        );
    }

    if (!lens) {
        return (
            <div className={styles.errorWrapper}>
                <h3>Product not found</h3>
                <Button color="primary" onClick={handleBack}>
                    <ArrowLeft size={14} className="me-2" /> Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className={styles.productDetailPage}>
            <CommonBreadcrumb parent="Products" title={lens.lensName} />

            <Container fluid>
                <Card className={styles.mainCard}>
                    <CardBody>
                        <div className={styles.headerActions}>
                            <Button color="light" onClick={handleBack}>
                                <ArrowLeft size={14} className="me-2" /> Back
                            </Button>
                            <Button color="primary" onClick={handleEdit}>
                                <Edit2 size={14} className="me-2" /> Edit Product
                            </Button>
                        </div>

                        <Row className="mt-4">
                            {/* Product Images */}
                            <Col lg={6}>
                                <div className={styles.imageGallery}>
                                    <div className={styles.mainImage}>
                                        {renderMainImage()}
                                    </div>
                                    <div className={styles.thumbnails}>
                                        {lens?.lensImages.map((image, index) => (
                                            <div
                                                key={image.id}
                                                className={`${styles.thumbnail} ${selectedImage === image.url ? styles.active : ''}`}
                                                onClick={() => image.url && handleImageClick(image.url)}
                                            >
                                                {renderImage(image.url, index)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Col>

                            {/* Product Info */}
                            <Col lg={6}>
                                <div className={styles.productInfo}>
                                    <div className={styles.header}>
                                        <h2>{lens.lensName}</h2>
                                        <Badge color={lens.status ? 'success' : 'danger'} className={styles.statusBadge}>
                                            {lens.status ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>

                                    <div className={styles.type}>
                                        <span className={styles.typeTag}>
                                            {lens.lensType?.description?.split('.')[0] || 'N/A'}
                                        </span>
                                    </div>

                                    <div className={styles.price}>
                                        <h3>{formatCurrency(lens.lensPrice)}</h3>
                                    </div>

                                    <Nav tabs className={styles.tabs}>
                                        <NavItem>
                                            <NavLink
                                                className={activeTab === 'overview' ? 'active' : ''}
                                                onClick={() => setActiveTab('overview')}
                                            >
                                                Overview
                                            </NavLink>
                                        </NavItem>
                                    </Nav>

                                    <TabContent activeTab={activeTab}>
                                        <TabPane tabId="overview">
                                            <div className={styles.overviewGrid}>
                                                <div className={styles.overviewItem}>
                                                    <Shield size={20} />
                                                    <div>
                                                        <h6>Type</h6>
                                                        <p>{lens.lensType?.description?.split('.')[0] || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className={styles.overviewItem}>
                                                    <Eye size={20} />
                                                    <div>
                                                        <h6>Reflective</h6>
                                                        <p>{lens.eyeReflactive?.reflactiveName || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={styles.detailsContent}>
                                                <h5>Description</h5>
                                                <p>{lens.lensDescription || 'N/A'}</p>

                                                <h5 className="mt-4">Technical Details</h5>
                                                <div className={styles.specificationsGrid}>
                                                    <div className={styles.specItem}>
                                                        <span className={styles.label}>Lens Type</span>
                                                        <span className={styles.value}>
                                                            {lens.lensType?.description || 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className={styles.specItem}>
                                                        <span className={styles.label}>Reflactive Coating</span>
                                                        <span className={styles.value}>
                                                            {lens.eyeReflactive?.reflactiveName || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabPane>
                                    </TabContent>
                                </div>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Container>
        </div>
    );
};

export default LensDetail;