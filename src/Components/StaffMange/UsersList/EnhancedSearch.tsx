import React from 'react';
import { FaSearch } from 'react-icons/fa';
import './UserStyle.scss';

interface EnhancedSearchProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholderText?: string;
}

const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  searchTerm,
  onSearchChange,
  onKeyPress,
  placeholderText = "Search users..."
}) => {
  return (
    <div className="search-box">
      <FaSearch className="search-icon" />
      <input
        type="text"
        placeholder={placeholderText}
        value={searchTerm}
        onChange={onSearchChange}
        onKeyPress={onKeyPress}
      />
    </div>
  );
};

export default EnhancedSearch;