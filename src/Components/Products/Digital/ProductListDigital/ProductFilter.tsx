// ProductFilter.tsx
import React, { useState, useEffect } from 'react';
import { X, Filter as FilterIcon, ChevronDown, ChevronUp } from 'react-feather';
import { Input, Button, Collapse, Row, Col, FormGroup, Label, Input as SelectInput } from 'reactstrap';
import styles from './ProductFilter.module.scss';
import 'react-range-slider-input/dist/style.css';
import RangeSlider from 'react-range-slider-input';

export interface FilterParams {
  Name?: string;
  EyeGlassTypeID?: number;
  Rate?: number;
  MinPrice?: number;
  MaxPrice?: number;
  SortBy?: string;
  Descending?: boolean;
  isDeleted?: boolean;
  status?: boolean;
  PageIndex: number;
  PageSize: number;
}

export interface FilterParams {
  Name?: string;
  EyeGlassTypeID?: number;
  Rate?: number;
  MinPrice?: number;
  MaxPrice?: number;
  SortBy?: string;
  Descending?: boolean;
  isDeleted?: boolean;
  status?: boolean;
  PageIndex: number;
  PageSize: number;
}

export const isDefaultParams = (params: FilterParams): boolean => {
  const defaultKeys = ['PageIndex', 'PageSize'];
  const paramKeys = Object.keys(params);
  return paramKeys.length === defaultKeys.length && 
         defaultKeys.every(key => key in params);
};


interface ProductFilterProps {
  onFilterChange: (params: FilterParams) => void;
  eyeGlassTypes: Array<{ id: number; glassType: string }>;
  initialParams: FilterParams;
  activeTab: 'active' | 'inactive'; 
  totalItems: number;
}

const DEFAULT_PARAMS: FilterParams = {
  PageIndex: 1,
  PageSize: 20,
  isDeleted: false,
};

const PAGE_SIZE_OPTIONS = [
  { value: 10, label: '10 items' },
  { value: 20, label: '20 items' },
  { value: 50, label: '50 items' },
  { value: 100, label: '100 items' },
  { value: -1, label: 'All items' } 
];


const ProductFilter: React.FC<ProductFilterProps> = ({
  onFilterChange,
  eyeGlassTypes,
  initialParams,
  activeTab,
  totalItems
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterParams, setFilterParams] = useState<FilterParams>(initialParams);
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Sort options
  const sortOptions = [
    { value: 'name_asc', label: 'Name (A-Z)', params: { SortBy: 'Name', Descending: false } },
    { value: 'name_desc', label: 'Name (Z-A)', params: { SortBy: 'Name', Descending: true } },
    { value: 'price_asc', label: 'Price (Low to High)', params: { SortBy: 'Price', Descending: false } },
    { value: 'price_desc', label: 'Price (High to Low)', params: { SortBy: 'Price', Descending: true } },
    { value: 'rate_desc', label: 'Rating (Highest)', params: { SortBy: 'Rate', Descending: true } },
  ];

  const ratingOptions = [4, 3, 2, 1].map(rate => ({
    value: rate,
    label: '★'.repeat(rate) + '★'.repeat(5 - rate)
  }));

  const handleFilterChange = (newParams: Partial<FilterParams>) => {
    const updatedParams = { ...filterParams, ...newParams };
    setFilterParams(updatedParams);
    onFilterChange(updatedParams);

    // Update active filters
    const newActiveFilters = [];
    if (updatedParams.Name) newActiveFilters.push('name');
    if (updatedParams.EyeGlassTypeID) newActiveFilters.push('type');
    if (updatedParams.Rate) newActiveFilters.push('rating');
    if (updatedParams.MinPrice || updatedParams.MaxPrice) newActiveFilters.push('price');
    if (updatedParams.SortBy) newActiveFilters.push('sort');
    setActiveFilters(newActiveFilters);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(e.target.value);
    // Nếu chọn All (-1), set PageSize bằng tổng số items
    const effectivePageSize = newPageSize === -1 ? totalItems : newPageSize;
    handleFilterChange({ 
      PageSize: effectivePageSize, 
      PageIndex: 1 
    });
  };

  const clearFilter = (filterType: string) => {
    const clearedParams = { ...filterParams };
    switch (filterType) {
      case 'name':
        delete clearedParams.Name;
        break;
      case 'type':
        delete clearedParams.EyeGlassTypeID;
        break;
      case 'rating':
        delete clearedParams.Rate;
        break;
      case 'price':
        delete clearedParams.MinPrice;
        delete clearedParams.MaxPrice;
        setPriceRange([0, 10000000]);
        break;
      case 'sort':
        delete clearedParams.SortBy;
        delete clearedParams.Descending;
        break;
      default:
        break;
    }
    setFilterParams(clearedParams);
    onFilterChange(clearedParams);
    setActiveFilters(activeFilters.filter(f => f !== filterType));
  };

  const clearAllFilters = () => {
    const defaultParams: FilterParams = {
      PageIndex: 1,
      PageSize: filterParams.PageSize,
      Descending: true,
      status: filterParams.status, // Giữ lại status hiện tại
      isDeleted: false
    };
  
    setFilterParams(defaultParams);
    setPriceRange([0, 10000000]);
    setActiveFilters([]);
  
    onFilterChange({
      PageIndex: 1,
      PageSize: filterParams.PageSize
    }); 
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterHeader}>
        <div className={styles.filterHeaderLeft}>
          <Button
            color="light"
            className={styles.toggleButton}
            onClick={() => setIsOpen(!isOpen)}
          >
            <FilterIcon size={16} />
            Filters
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>

          {activeFilters.length > 0 && (
            <Button
              color="link"
              className={styles.clearAllButton}
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Thêm dropdown chọn số items/trang */}
        <div className={styles.pageSizeSelector}>
          <FormGroup className="mb-0">
            <SelectInput
              type="select"
              value={filterParams.PageSize}
              onChange={handlePageSizeChange}
              className={styles.pageSizeSelect}
            >
              {PAGE_SIZE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectInput>
          </FormGroup>
        </div>
      </div>

      <Collapse isOpen={isOpen}>
        <div className={styles.filterContent}>
          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className={styles.activeFilters}>
              {activeFilters.map(filter => (
                <div key={filter} className={styles.filterTag}>
                  <span>{filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
                  <X size={14} onClick={() => clearFilter(filter)} />
                </div>
              ))}
            </div>
          )}

          {/* Search Filter */}
          <div className={styles.filterSection}>
            <h6>Search</h6>
            <Input
              type="text"
              placeholder="Search products..."
              value={filterParams.Name || ''}
              onChange={(e) => handleFilterChange({ Name: e.target.value })}
              className={styles.searchInput}
            />
          </div>

          {/* Type Filter */}
          <div className={styles.filterSection}>
            <h6>Type</h6>
            <div className={styles.typeOptions}>
              {eyeGlassTypes.map(type => (
                <Button
                  key={type.id}
                  color={filterParams.EyeGlassTypeID === type.id ? 'primary' : 'light'}
                  onClick={() => handleFilterChange({ EyeGlassTypeID: type.id })}
                  className={styles.typeButton}
                >
                  {type.glassType}
                </Button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className={styles.filterSection}>
            <h6>Rating</h6>
            <div className={styles.ratingOptions}>
              {ratingOptions.map(option => (
                <Button
                  key={option.value}
                  color={filterParams.Rate === option.value ? 'primary' : 'light'}
                  onClick={() => handleFilterChange({ Rate: option.value })}
                  className={styles.ratingButton}
                >
                  <span className={styles.stars}>{option.label}</span>
                  & Up
                </Button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className={styles.filterSection}>
            <h6>Price Range</h6>
            <div className={styles.priceRangeContainer}>
              <RangeSlider
                min={0}
                max={10000000}
                step={100000}
                value={priceRange}
                onInput={setPriceRange}
                onThumbDragEnd={() => handleFilterChange({
                  MinPrice: priceRange[0],
                  MaxPrice: priceRange[1]
                })}
              />
              <div className={styles.priceLabels}>
                <span>{formatPrice(priceRange[0])} VND</span>
                <span>{formatPrice(priceRange[1])} VND</span>
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div className={styles.filterSection}>
            <h6>Sort By</h6>
            <div className={styles.sortOptions}>
              {sortOptions.map(option => (
                <Button
                  key={option.value}
                  color="light"
                  className={`${styles.sortButton} ${filterParams.SortBy === option.params.SortBy &&
                    filterParams.Descending === option.params.Descending ? styles.active : ''}`}
                  onClick={() => handleFilterChange(option.params)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default ProductFilter;