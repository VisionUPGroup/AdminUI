import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (pageNumber: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
}) => {
    // Nếu không có trang nào thì không hiển thị pagination
    if (totalPages <= 0) return null;

    const renderPageNumbers = () => {
        let pages = [];
        const maxVisiblePages = 5;

        // Logic để tính toán range của các trang cần hiển thị
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Điều chỉnh lại startPage nếu endPage đã chạm giới hạn
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Thêm trang đầu nếu cần
        if (startPage > 1) {
            pages.push(
                <button
                    key={1}
                    className="pagination-number"
                    onClick={() => onPageChange(1)}
                >
                    1
                </button>
            );
            if (startPage > 2) {
                pages.push(
                    <span key="start-dots" className="pagination-number dots">
                        ...
                    </span>
                );
            }
        }

        // Thêm các trang ở giữa
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    className={`pagination-number ${i === currentPage ? "active" : ""}`}
                    onClick={() => onPageChange(i)}
                >
                    {i}
                </button>
            );
        }

        // Thêm trang cuối nếu cần
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(
                    <span key="end-dots" className="pagination-number dots">
                        ...
                    </span>
                );
            }
            pages.push(
                <button
                    key={totalPages}
                    className="pagination-number"
                    onClick={() => onPageChange(totalPages)}
                >
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

    return (
        <div className="pagination">
            <button
                className="pagination-btn"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <FaChevronLeft />
            </button>
            
            <div className="pagination-numbers">
                {renderPageNumbers()}
            </div>

            <button
                className="pagination-btn"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <FaChevronRight />
            </button>
        </div>
    );
};

export default Pagination;