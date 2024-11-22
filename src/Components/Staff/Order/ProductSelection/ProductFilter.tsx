import React from 'react';
import styles from '../styles/ProductSelection.module.scss';

interface FilterProps {
  filters: {
    name: string;
    type: string;
    minPrice: string;
    maxPrice: string;
  };
  onFilterChange: (filters: any) => void;
}

const ProductFilter: React.FC<FilterProps> = ({ filters, onFilterChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]: value
    });
  };

  return (
    <div className={styles.filterSection}>
      <div className={styles.searchBar}>
        <input
          type="text"
          name="name"
          placeholder="Search products..."
          value={filters.name}
          onChange={handleChange}
        />
      </div>

      <div className={styles.filters}>
        <select 
          name="type" 
          value={filters.type}
          onChange={handleChange}
        >
          <option value="">All Types</option>
          <option value="1">Single Vision</option>
          <option value="2">Bifocal</option>
          <option value="4">Non-Prescription</option>
        </select>

        <div className={styles.priceRange}>
          <input
            type="number"
            name="minPrice"
            placeholder="Min price"
            value={filters.minPrice}
            onChange={handleChange}
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Max price"
            value={filters.maxPrice}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;