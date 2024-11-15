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
import { Edit2, ArrowLeft, Package, Droplet, Award, Eye } from 'react-feather';
import CommonBreadcrumb from '@/CommonComponents/CommonBreadcrumb';
import { useEyeGlassService } from '../../../../../Api/eyeGlassService';
import styles from './EyeGlassDetail.module.scss';

interface EyeGlassDetailProps {
  id: string;
}

interface EyeGlassImage {
  id: number;
  eyeGlassID: number;
  angleView: number;
  url: string;
}

interface EyeGlassDetail {
  id: number;
  eyeGlassTypeID: number;
  name: string;
  price: number;
  rate: number;
  rateCount: number;
  quantity: number;
  material: string;
  color: string;
  lensWidth: number;
  lensHeight: number;
  bridgeWidth: number;
  templeLength: number;
  frameWidth: number;
  style: string;
  weight: number;
  design: string;
  status: boolean;
  eyeGlassTypes: {
    id: number;
    glassType: string;
    status: boolean;
  };
}

const EyeGlassDetail: React.FC<EyeGlassDetailProps> = ({ id }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState('');
  const [eyeGlass, setEyeGlass] = useState<EyeGlassDetail | null>(null);
  const [eyeGlassImages, setEyeGlassImages] = useState<EyeGlassImage[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchEyeGlassById, fetchEyeGlassImagesById } = useEyeGlassService();

useEffect(() => {
  const fetchData = async () => {
    if (id) {
      setLoading(true);
      try {
        const [eyeGlassData, imagesData] = await Promise.all([
          fetchEyeGlassById(Number(id)),
          fetchEyeGlassImagesById(Number(id))
        ]);

        if (eyeGlassData) {
          setEyeGlass(eyeGlassData);
        }
        
        // Lọc ra những ảnh có url hợp lệ
        if (imagesData) {
          const validImages = imagesData.filter((img:EyeGlassImage) => img.url && img.url.trim() !== '');
          setEyeGlassImages(validImages);
          // Set selected image chỉ khi có ảnh hợp lệ
          if (validImages.length > 0) {
            setSelectedImage(validImages[0].url);
          }
        }
      } catch (error) {
        console.error('Error fetching eyeglass data:', error);
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
        e.currentTarget.style.display = 'none';  // Ẩn ảnh nếu load lỗi
      }}
    />
  );
};


  const handleBack = () => {
    // router.push('/en/products/eyeglass');
    router.push('/en/products/digital/digital-product-list');
  };
  
  const handleEdit = () => {
    router.push(`/en/products/eyeglass/${id}/edit`);
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

  if (!eyeGlass) {
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
      <CommonBreadcrumb parent="Products" title={eyeGlass.name} />
      
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
                      alt={eyeGlass.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                  <div className={styles.thumbnails}>
                    {eyeGlassImages.map(image => (
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
                    <h2>{eyeGlass.name}</h2>
                    <Badge color={eyeGlass.status ? 'success' : 'danger'} className={styles.statusBadge}>
                      {eyeGlass.status ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className={styles.type}>
                    <span className={`${styles.typeTag} ${styles[eyeGlass.eyeGlassTypes?.glassType ? eyeGlass.eyeGlassTypes.glassType.toLowerCase() : 'n/a']}`}>
                      {eyeGlass.eyeGlassTypes?.glassType || 'n/a'}
                    </span>
                  </div>

                  <div className={styles.rating}>
                    {renderStars(eyeGlass.rate)}
                    <span className={styles.rateCount}>({eyeGlass.rateCount} reviews)</span>
                  </div>

                  <div className={styles.price}>
                    <h3>{formatCurrency(eyeGlass.price)}</h3>
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
                        className={activeTab === 'specs' ? 'active' : ''}
                        onClick={() => setActiveTab('specs')}
                      >
                        Specifications
                      </NavLink>
                    </NavItem>
                  </Nav>

                  <TabContent activeTab={activeTab}>
                    <TabPane tabId="overview">
                      <div className={styles.overviewGrid}>
                        <div className={styles.overviewItem}>
                          <Package size={20} />
                          <div>
                            <h6>Style</h6>
                            <p>{eyeGlass.style}</p>
                          </div>
                        </div>
                        <div className={styles.overviewItem}>
                          <Eye size={20} />
                          <div>
                            <h6>Design</h6>
                            <p>{eyeGlass.design}</p>
                          </div>
                        </div>
                        <div className={styles.overviewItem}>
                          <Droplet size={20} />
                          <div>
                            <h6>Color</h6>
                            <p>{eyeGlass.color}</p>
                          </div>
                        </div>
                        <div className={styles.overviewItem}>
                          <Award size={20} />
                          <div>
                            <h6>Material</h6>
                            <p>{eyeGlass.material}</p>
                          </div>
                        </div>
                      </div>
                    </TabPane>

                    <TabPane tabId="specs">
                      <div className={styles.specificationsGrid}>
                        <div className={styles.specItem}>
                          <span className={styles.label}>Lens Width</span>
                          <span className={styles.value}>{eyeGlass.lensWidth} mm</span>
                        </div>
                        <div className={styles.specItem}>
                          <span className={styles.label}>Lens Height</span>
                          <span className={styles.value}>{eyeGlass.lensHeight} mm</span>
                        </div>
                        <div className={styles.specItem}>
                          <span className={styles.label}>Bridge Width</span>
                          <span className={styles.value}>{eyeGlass.bridgeWidth} mm</span>
                        </div>
                        <div className={styles.specItem}>
                          <span className={styles.label}>Temple Length</span>
                          <span className={styles.value}>{eyeGlass.templeLength} mm</span>
                        </div>
                        <div className={styles.specItem}>
                          <span className={styles.label}>Frame Width</span>
                          <span className={styles.value}>{eyeGlass.frameWidth} mm</span>
                        </div>
                        <div className={styles.specItem}>
                          <span className={styles.label}>Weight</span>
                          <span className={styles.value}>{eyeGlass.weight} g</span>
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

export default EyeGlassDetail;