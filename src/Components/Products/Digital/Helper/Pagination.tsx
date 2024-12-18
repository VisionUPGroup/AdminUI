import React from 'react';
import styles from './Pagination.module.scss';
import { ChevronLeft, ChevronRight } from 'react-feather';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxPagesToShow?: number;
  showNavigationText?: boolean;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxPagesToShow = 5,
  showNavigationText = true,
  className = ''
}) => {
  // Tạo mảng các số trang cần hiển thị
  const getPageNumbers = () => {
    const pageNumbers: number[] = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  // Nếu chỉ có 1 trang thì không hiển thị pagination
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers();

  return (
    <nav className={`${styles.paginationContainer} ${className}`}>
      <ul className={styles.paginationList}>
        {/* Previous Button */}
        <li className={styles.paginationItem}>
          <button
            className={`${styles.paginationButton} ${styles.navButton}`}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft />
            {showNavigationText && <span>Previous</span>}
          </button>
        </li>

        {/* First Page + Dots */}
        {pageNumbers[0] > 1 && (
          <>
            <li className={styles.paginationItem}>
              <button
                className={`${styles.paginationButton} ${currentPage === 1 ? styles.active : ''}`}
                onClick={() => onPageChange(1)}
              >
                1
              </button>
            </li>
            {pageNumbers[0] > 2 && (
              <li className={styles.paginationDots}>...</li>
            )}
          </>
        )}

        {/* Page Numbers */}
        {pageNumbers.map(number => (
          <li key={number} className={styles.paginationItem}>
            <button
              className={`${styles.paginationButton} ${currentPage === number ? styles.active : ''}`}
              onClick={() => onPageChange(number)}
            >
              {number}
            </button>
          </li>
        ))}

        {/* Last Page + Dots */}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <li className={styles.paginationDots}>...</li>
            )}
            <li className={styles.paginationItem}>
              <button
                className={`${styles.paginationButton} ${currentPage === totalPages ? styles.active : ''}`}
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </button>
            </li>
          </>
        )}

        {/* Next Button */}
        <li className={styles.paginationItem}>
          <button
            className={`${styles.paginationButton} ${styles.navButton}`}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            {showNavigationText && <span>Next</span>}
            <ChevronRight />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;