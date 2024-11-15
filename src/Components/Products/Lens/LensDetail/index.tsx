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

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                setLoading(true);
                try {
                    const [lensData, imagesData] = await Promise.all([
                        fetchLensById(Number(id)),
                        fetchLensImages(Number(id))
                    ]);
    
                    if (lensData && imagesData) {
                        // Lọc ảnh hợp lệ
                        const validImages = imagesData.filter((img: LensImage) => img.url && img.url.trim() !== '');
                        
                        // Cập nhật lens data với danh sách ảnh mới
                        setLens({
                            ...lensData,
                            lensImages: validImages
                        });
                        
                        // Set selected image là ảnh đầu tiên nếu có
                        if (validImages.length > 0) {
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

    const renderImage = (url: string) => {
        if (!url || url.trim() === '') {
            return null;
        }

        return (
            <img
                src={url}
                alt="Product view"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                }}
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
                                        <img
                                            src={selectedImage || '/placeholder-image.jpg'}
                                            alt={lens.lensName}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/placeholder-image.jpg';
                                            }}
                                        />
                                    </div>
                                    <div className={styles.thumbnails}>
                                        {lens.lensImages.map(image => (
                                            <div
                                                key={image.id}
                                                className={`${styles.thumbnail} ${selectedImage === image.url ? styles.active : ''}`}
                                                onClick={() => handleImageClick(image.url)}
                                            >
                                                {renderImage(image.url)}
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

                                    <div className={styles.rating}>
                                        {renderStars(lens.rate)}
                                        <span className={styles.rateCount}>({lens.rateCount} reviews)</span>
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
                                        <NavItem>
                                            <NavLink
                                                className={activeTab === 'details' ? 'active' : ''}
                                                onClick={() => setActiveTab('details')}
                                            >
                                                Details
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
                                                        {lens.lensType?.description?.split('.')[0] || 'N/A'}
                                                    </div>
                                                </div>
                                                <div className={styles.overviewItem}>
                                                    <Eye size={20} />
                                                    <div>
                                                        <h6>Reflective</h6>
                                                        <p>{lens.eyeReflactive?.reflactiveName || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className={styles.overviewItem}>
                                                    <Droplet size={20} />
                                                    <div>
                                                        <h6>Stock</h6>
                                                        <p>{lens.quantity} units</p>
                                                    </div>
                                                </div>
                                                <div className={styles.overviewItem}>
                                                    <Award size={20} />
                                                    <div>
                                                        <h6>Rating</h6>
                                                        <p>{lens.rate}/5 ({lens.rateCount} reviews)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabPane>

                                        <TabPane tabId="details">
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
                                                    <div className={styles.specItem}>
                                                        <span className={styles.label}>Stock Level</span>
                                                        <span className={styles.value}>
                                                            {lens.quantity ? `${lens.quantity} units` : 'N/A'}
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