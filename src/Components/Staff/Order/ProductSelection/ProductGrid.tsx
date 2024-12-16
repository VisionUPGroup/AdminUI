import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Ruler, Package, Palette, Scale } from 'lucide-react';
import { useEyeGlassService } from '../../../../../Api/eyeGlassService';
import { EyeGlass } from '../types/product';
import styles from '../styles/ProductSelection.module.scss';

interface GlassType {
  id: number;
  glassType: string;
  status: boolean;
}

interface ProductGridProps {
  onProductSelect: (product: EyeGlass) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ onProductSelect }) => {
  const [products, setProducts] = useState<EyeGlass[]>([]);
  const [loading, setLoading] = useState(true);
  const [glassTypes, setGlassTypes] = useState<GlassType[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    eyeGlassTypeID: '',
    minPrice: '',
    maxPrice: ''
  });

  const { fetchEyeGlasses, fetchEyeGlassTypes } = useEyeGlassService();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadProducts();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [filters]);

  useEffect(() => {
    loadGlassTypes();
  }, []);

  const loadGlassTypes = async () => {
    try {
      const response = await fetchEyeGlassTypes();
      if (response) {
        const activeTypes = response.filter((type: GlassType) => type.status);
        setGlassTypes(activeTypes);
      }
    } catch (error) {
      console.error('Error loading glass types:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const queryParams: Record<string, string> = {
        Status: 'true', // Chỉ lấy active products
        Descending: 'true' // Sắp xếp theo thứ tự giảm dần
      };
      
      if (filters.name) queryParams.Name = filters.name;
      if (filters.eyeGlassTypeID) queryParams.EyeGlassTypeID = filters.eyeGlassTypeID;
      if (filters.minPrice) queryParams.MinPrice = filters.minPrice;
      if (filters.maxPrice) queryParams.MaxPrice = filters.maxPrice;

      const response = await fetchEyeGlasses(queryParams);
      if (response?.data) {
        // Filter chỉ lấy sản phẩm có status = true
        const activeProducts = response.data.filter((product: EyeGlass) => product.status === true);
        setProducts(activeProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
};

  const resetFilters = () => {
    setFilters({
      name: '',
      eyeGlassTypeID: '',
      minPrice: '',
      maxPrice: ''
    });
  };

  const [selectedImages, setSelectedImages] = useState<Record<number, number>>({}); // Track active image for each product

  const handleImageChange = (productId: number, imageIndex: number) => {
    setSelectedImages(prev => ({
      ...prev,
      [productId]: imageIndex
    }));
  };

  return (
    <div className={styles.productGridContainer}>
      <div className={styles.filterSection}>
        <div className={styles.searchBar}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search for products..."
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />
            {filters.name && (
              <button 
                className={styles.clearSearch}
                onClick={() => setFilters({ ...filters, name: '' })}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button 
            className={`${styles.filterButton} ${isFilterOpen ? styles.active : ''}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter size={20} />
            <span>Filters</span>
          </button>
        </div>

        {isFilterOpen && (
          <div className={styles.advancedFilters}>
            <div className={styles.filterGrid}>
              <div className={styles.filterItem}>
                <label>Type</label>
                <select
                  value={filters.eyeGlassTypeID}
                  onChange={(e) => setFilters({ ...filters, eyeGlassTypeID: e.target.value })}
                >
                  <option value="">All Types</option>
                  {glassTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.glassType}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterItem}>
                <label>Price Range (VND)</label>
                <div className={styles.priceInputs}>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className={styles.filterActions}>
              <button className={styles.resetButton} onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>Loading products...</span>
      </div>
    ) : (
      <div className={styles.grid}>
        {products.map((product) => {
          const activeImageIndex = selectedImages[product.id] || 0;
          const activeImage = product.eyeGlassImages[activeImageIndex]?.url || 'default-image-url';

          return (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.imageContainer}>
                <img src={activeImage} alt={product.name} />
                {product.eyeGlassImages.length > 1 && (
                  <div className={styles.imageGallery}>
                    {product.eyeGlassImages
                      .filter(img => img.url)
                      .slice(0, 4)
                      .map((image, index) => (
                        <button
                          key={image.id}
                          className={`${styles.thumbnailButton} ${
                            activeImageIndex === index ? styles.active : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageChange(product.id, index);
                          }}
                        >
                          <img src={image.url} alt={`View ${index + 1}`} />
                        </button>
                      ))}
                  </div>
                )}
              </div>

              <div className={styles.productInfo}>
                <h3 className={styles.title}>{product.name}</h3>
                
                <div className={styles.specs}>
                  <div className={styles.specItem}>
                    <Ruler className={styles.icon} />
                    <span className={styles.label}>Width</span>
                    <span className={styles.value}>{product.frameWidth}mm</span>
                  </div>
                  <div className={styles.specItem}>
                    <Package className={styles.icon} />
                    <span className={styles.label}>Material</span>
                    <span className={styles.value}>
                      {product.material.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </span>
                  </div>
                  <div className={styles.specItem}>
                    <Palette className={styles.icon} />
                    <span className={styles.label}>Color</span>
                    <span className={styles.value}>{product.color}</span>
                  </div>
                  <div className={styles.specItem}>
                    <Scale className={styles.icon} />
                    <span className={styles.label}>Weight</span>
                    <span className={styles.value}>{product.weight}g</span>
                  </div>
                </div>

                <div className={styles.footer}>
                  <span className={styles.price}>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(product.price)}
                  </span>
                  <button 
                    className={styles.selectButton}
                    onClick={() => onProductSelect(product)}
                  >
                    Select Frame
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
  );
};

export default ProductGrid;