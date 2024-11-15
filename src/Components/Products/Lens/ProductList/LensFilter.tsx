// LensFilter.tsx
import React, { useState } from 'react';
import { X, Filter as FilterIcon, ChevronDown, ChevronUp } from 'react-feather';
import { Input, Button, Collapse, FormGroup, Input as SelectInput } from 'reactstrap';
import styles from '../../Digital/ProductListDigital/ProductFilter.module.scss';
import 'react-range-slider-input/dist/style.css';
import RangeSlider from 'react-range-slider-input';

export interface FilterParams {
  Name?: string;
  LensTypeID?: number;
  Rate?: number;
  MinPrice?: number;
  MaxPrice?: number;
  SortBy?: string;
  Descending?: boolean;
  PageIndex: number;
  PageSize: number;
}

export const isDefaultParams = (params: FilterParams): boolean => {
  const defaultKeys = ['PageIndex', 'PageSize'];
  const paramKeys = Object.keys(params);
  return paramKeys.length === defaultKeys.length && 
         defaultKeys.every(key => key in params);
};

interface LensFilterProps {
  onFilterChange: (params: FilterParams) => void;
  lensTypes: Array<{ id: number; description: string; status: boolean }>;
  initialParams: FilterParams;
}

const PAGE_SIZE_OPTIONS = [
  { value: 10, label: '10 items' },
  { value: 20, label: '20 items' },
  { value: 50, label: '50 items' },
  { value: 100, label: '100 items' }
];

const LensFilter: React.FC<LensFilterProps> = ({
  onFilterChange,
  lensTypes,
  initialParams
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterParams, setFilterParams] = useState<FilterParams>(initialParams);
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

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

    const newActiveFilters = [];
    if (updatedParams.Name) newActiveFilters.push('name');
    if (updatedParams.LensTypeID) newActiveFilters.push('type');
    if (updatedParams.Rate) newActiveFilters.push('rating');
    if (updatedParams.MinPrice || updatedParams.MaxPrice) newActiveFilters.push('price');
    if (updatedParams.SortBy) newActiveFilters.push('sort');
    setActiveFilters(newActiveFilters);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(e.target.value);
    handleFilterChange({ PageSize: newPageSize, PageIndex: 1 });
  };

  const clearFilter = (filterType: string) => {
    const clearedParams = { ...filterParams };
    switch (filterType) {
      case 'name':
        delete clearedParams.Name;
        break;
      case 'type':
        delete clearedParams.LensTypeID;
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
      PageSize: filterParams.PageSize
    };
    
    setFilterParams(defaultParams);
    setPriceRange([0, 10000000]);
    setActiveFilters([]);
    
    onFilterChange(defaultParams);
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

          <div className={styles.filterSection}>
            <h6>Search</h6>
            <Input
              type="text"
              placeholder="Search lenses..."
              value={filterParams.Name || ''}
              onChange={(e) => handleFilterChange({ Name: e.target.value })}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterSection}>
            <h6>Lens Type</h6>
            <div className={styles.typeOptions}>
              {lensTypes.filter(type => type.status).map(type => (
                <Button
                  key={type.id}
                  color={filterParams.LensTypeID === type.id ? 'primary' : 'light'}
                  onClick={() => handleFilterChange({ LensTypeID: type.id })}
                  className={styles.typeButton}
                >
                  {type.description}
                </Button>
              ))}
            </div>
          </div>

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

export default LensFilter;