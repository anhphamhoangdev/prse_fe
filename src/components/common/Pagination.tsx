import React, { useState } from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    maxButtons?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
                                                          currentPage,
                                                          totalPages,
                                                          onPageChange,
                                                          maxButtons = 3
                                                      }) => {
    const [showInput, setShowInput] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const getPageNumbers = () => {
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = startPage + maxButtons - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        let pages = [];

        // Add first page
        if (startPage > 1) {
            pages.push(1);
            if (startPage > 2) {
                pages.push('leftEllipsis');
            }
        }

        // Add middle pages
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // Add last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push('rightEllipsis');
            }
            pages.push(totalPages);
        }

        return pages;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || /^\d+$/.test(value)) {
            setInputValue(value);
        }
    };

    const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const page = parseInt(inputValue);
            if (page >= 1 && page <= totalPages) {
                onPageChange(page);
                setShowInput(false);
                setInputValue('');
            }
        }
    };

    const handleEllipsisClick = () => {
        setShowInput(true);
        setTimeout(() => {
            const input = document.getElementById('pageInput');
            if (input) {
                input.focus();
            }
        }, 0);
    };

    return (
        <div className="flex justify-center items-center space-x-2 mt-8">
            {/* First page button */}
            {currentPage > 1 && (
                <button
                    onClick={() => onPageChange(1)}
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    aria-label="First page"
                >
                    ←
                </button>
            )}

            {/* Page numbers */}
            {getPageNumbers().map((pageNum, index) => {
                if (pageNum === 'leftEllipsis' || pageNum === 'rightEllipsis') {
                    return (
                        <button
                            key={`${pageNum}-${index}`}
                            onClick={handleEllipsisClick}
                            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                        >
                            ...
                        </button>
                    );
                }

                return (
                    <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum as number)}
                        className={`px-4 py-2 rounded ${
                            currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                    >
                        {pageNum}
                    </button>
                );
            })}

            {/* Last page button */}
            {currentPage < totalPages && (
                <button
                    onClick={() => onPageChange(totalPages)}
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    aria-label="Last page"
                >
                    →
                </button>
            )}

            {/* Page input */}
            {showInput && (
                <div className="relative">
                    <input
                        id="pageInput"
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleInputSubmit}
                        className="w-16 px-2 py-2 border rounded text-center"
                        placeholder={`1-${totalPages}`}
                        onBlur={() => {
                            setTimeout(() => setShowInput(false), 200);
                            setInputValue('');
                        }}
                    />
                </div>
            )}
        </div>
    );
};