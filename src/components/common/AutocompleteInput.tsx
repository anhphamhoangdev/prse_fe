import React, { useState, useEffect, useRef } from "react";
import { Briefcase, AlertTriangle } from "lucide-react";

interface AutocompleteInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    label: string;
    helperText?: string;
}

// Mô phỏng API gọi lấy gợi ý chức danh
const fetchTitleSuggestions = async (query: string): Promise<string[]> => {
    // Trong thực tế, đây sẽ là API call đến backend
    // Nhưng hiện tại chúng ta sẽ mô phỏng với một danh sách cứng

    const commonTitles = [
        "Senior Java Developer",
        "Senior Frontend Developer",
        "React Developer",
        "Angular Developer",
        "Full Stack Developer",
        "UI/UX Designer",
        "Product Manager",
        "Data Scientist",
        "DevOps Engineer",
        "Machine Learning Engineer",
        "iOS Developer",
        "Android Developer",
        "Backend Developer",
        "Cloud Architect",
        "Software Architect",
        "Node.js Developer",
        "Python Developer",
        "Blockchain Developer",
        "Game Developer",
        "QA Engineer"
    ];

    // // Giả lập độ trễ của network request
    // await new Promise(resolve => setTimeout(resolve, 200));

    // Lọc danh sách theo query
    return commonTitles.filter(title =>
        title.toLowerCase().includes(query.toLowerCase())
    );
};

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
                                                                        value,
                                                                        onChange,
                                                                        placeholder,
                                                                        label,
                                                                        helperText
                                                                    }) => {
    const [inputValue, setInputValue] = useState(value);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1); // Thêm state để theo dõi tùy chọn được chọn
    const [tooManyTitles, setTooManyTitles] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Xử lý click ngoài để đóng suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Kiểm tra số lượng chức danh
    useEffect(() => {
        const titles = inputValue.split(',').map(t => t.trim()).filter(t => t !== '');
        setTooManyTitles(titles.length > 2);
    }, [inputValue]);

    // Lấy phần đang nhập hiện tại (sau dấu phẩy cuối cùng)
    const getCurrentTerm = (text: string): string => {
        const parts = text.split(',');
        return parts[parts.length - 1].trim();
    };

    // Fetch suggestions khi người dùng nhập
    useEffect(() => {
        const fetchSuggestions = async () => {
            const currentTerm = getCurrentTerm(inputValue);

            if (currentTerm.length < 2) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);
            try {
                const results = await fetchTitleSuggestions(currentTerm);
                setSuggestions(results);
            } catch (error) {
                console.error("Failed to fetch suggestions:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchSuggestions();
        }, 300); // Debounce

        return () => clearTimeout(timeoutId);
    }, [inputValue]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        setShowSuggestions(true);
        setHighlightedIndex(-1); // Reset highlighted index khi người dùng nhập
    };

    const handleSelectSuggestion = (suggestion: string) => {
        // Tách chuỗi nhập thành các phần
        const parts = inputValue.split(',');

        // Lấy tất cả phần trước phần cuối
        const previousParts = parts.slice(0, parts.length - 1);

        // Tạo giá trị mới với suggestion
        const newValue = previousParts.length
            ? previousParts.join(',') + ', ' + suggestion
            : suggestion;

        setInputValue(newValue);
        onChange(newValue);
        setShowSuggestions(false);

        // Thêm dấu phẩy sau khi chọn để người dùng có thể tiếp tục nhập
        setTimeout(() => {
            if (inputRef.current) {
                const updatedValue = newValue + ', ';
                setInputValue(updatedValue);
                onChange(updatedValue);

                // Đặt con trỏ vào vị trí cuối cùng
                inputRef.current.focus();
                const length = updatedValue.length;
                inputRef.current.setSelectionRange(length, length);
            }
        }, 50);
    };

    const handleInputBlur = () => {
        // Khi blur, cập nhật giá trị cuối cùng về parent component
        setTimeout(() => {
            // Loại bỏ dấu phẩy và khoảng trắng thừa ở cuối
            const cleanedValue = inputValue.replace(/,\s*$/, '');
            setInputValue(cleanedValue);
            onChange(cleanedValue);
        }, 200);
    };

    // Xử lý phím Tab, Enter, và mũi tên lên/xuống
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (showSuggestions && suggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlightedIndex((prevIndex) =>
                    prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightedIndex((prevIndex) =>
                    prevIndex > 0 ? prevIndex - 1 : 0
                );
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                if (highlightedIndex >= 0) {
                    handleSelectSuggestion(suggestions[highlightedIndex]);
                }
            }
        }
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <label htmlFor="title-input" className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    id="title-input"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    className={`block w-full pl-10 pr-3 py-3 border ${tooManyTitles ? 'border-amber-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder={placeholder}
                />
                {isLoading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
            </div>

            {helperText && (
                <p className="mt-1 text-xs text-gray-500">
                    {helperText} <span className="text-blue-500">(Phân cách bằng dấu phẩy nếu có nhiều chức danh, nên giới hạn tối đa 2 chức danh)</span>
                </p>
            )}

            {/* Thông báo khi có quá nhiều chức danh */}
            {tooManyTitles && (
                <div className="mt-2 flex items-start gap-2 text-amber-600 bg-amber-50 p-2 rounded text-xs">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <p>Bạn đã nhập nhiều hơn 2 chức danh. Chúng tôi khuyến nghị chỉ nên để tối đa 2 chức danh để tối ưu hiển thị và tăng tính chuyên nghiệp.</p>
                </div>
            )}

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                    <ul className="py-1">
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                className={`px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center ${
                                    index === highlightedIndex ? 'bg-blue-50' : ''
                                }`}
                                onMouseDown={(e) => {
                                    e.preventDefault(); // Ngăn blur event
                                    handleSelectSuggestion(suggestion);
                                }}
                                onMouseEnter={() => setHighlightedIndex(index)} // Highlight khi di chuột qua
                            >
                                <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                                <span>{suggestion}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};