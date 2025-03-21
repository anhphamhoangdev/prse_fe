import React, { useState, useEffect, useRef } from "react";
import { Briefcase, AlertTriangle } from "lucide-react";
import {requestWithAuth} from "../../utils/request";
import {ENDPOINTS} from "../../constants/endpoint";

interface AutocompleteInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    label: string;
    helperText?: string;
}

// Define interface for instructor title data
interface InstructorTitle {
    id: number;
    position: string;
}

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
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [tooManyTitles, setTooManyTitles] = useState(false);
    const [allTitles, setAllTitles] = useState<string[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch all instructor common titles from the database
    useEffect(() => {
        const fetchInstructorTitles = async () => {
            setIsLoading(true);
            try {
                // Fetch all titles from the database (up to 400)
                const response = await requestWithAuth<{  instructor_common_titles: InstructorTitle[] }>(
                    ENDPOINTS.INSTRUCTOR.COMMON_TITLES
                );

                // Extract position strings and filter out any empty values
                const positions = response.instructor_common_titles
                    .map(item => item.position)
                    .filter(position => position && position.trim() !== '');

                setAllTitles(positions);
                console.log(`Loaded ${positions.length} instructor common titles`);
            } catch (error) {
                console.error("Failed to fetch instructor titles:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInstructorTitles();
    }, []);

    // Handle click outside to close suggestions
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

    // Check number of titles
    useEffect(() => {
        const titles = inputValue.split(',').map(t => t.trim()).filter(t => t !== '');
        setTooManyTitles(titles.length > 2);
    }, [inputValue]);

    // Get current term (after the last comma)
    const getCurrentTerm = (text: string): string => {
        const parts = text.split(',');
        return parts[parts.length - 1].trim();
    };

    // Update suggestions based on user input
    useEffect(() => {
        const currentTerm = getCurrentTerm(inputValue);

        if (currentTerm.length < 2 || allTitles.length === 0) {
            setSuggestions([]);
            return;
        }

        // Filter titles based on current input
        const filteredTitles = allTitles.filter(title =>
            title.toLowerCase().includes(currentTerm.toLowerCase())
        );

        setSuggestions(filteredTitles);
    }, [inputValue, allTitles]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        setShowSuggestions(true);
        setHighlightedIndex(-1); // Reset highlighted index when user types
    };

    const handleSelectSuggestion = (suggestion: string) => {
        // Split input into parts
        const parts = inputValue.split(',');

        // Get all parts except the last one
        const previousParts = parts.slice(0, parts.length - 1);

        // Create new value with the suggestion
        const newValue = previousParts.length
            ? previousParts.join(',') + ', ' + suggestion
            : suggestion;

        setInputValue(newValue);
        onChange(newValue);
        setShowSuggestions(false);

        // Add comma after selection so user can continue typing
        setTimeout(() => {
            if (inputRef.current) {
                const updatedValue = newValue + ', ';
                setInputValue(updatedValue);
                onChange(updatedValue);

                // Set cursor to the end
                inputRef.current.focus();
                const length = updatedValue.length;
                inputRef.current.setSelectionRange(length, length);
            }
        }, 50);
    };

    const handleInputBlur = () => {
        // When blurring, update final value to parent component
        setTimeout(() => {
            // Remove trailing commas and whitespace
            const cleanedValue = inputValue.replace(/,\s*$/, '');
            setInputValue(cleanedValue);
            onChange(cleanedValue);
        }, 200);
    };

    // Handle Tab, Enter, and arrow key navigation
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
                    <Briefcase className="h-5 w-5 text-gray-400"/>
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
                    className={`block w-full pl-8 pr-3 py-2 text-sm border ${
                        tooManyTitles ? 'border-amber-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder={placeholder}
                />
                {isLoading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg"
                             fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
            </div>

            {helperText && (
                <p className="mt-1 text-xs text-gray-500">
                    {helperText} <span className="text-blue-500">(Phân cách bằng dấu phẩy nếu có nhiều chức danh, nên giới hạn tối đa 2 chức danh)</span>
                </p>
            )}

            {/* Too many titles warning */}
            {tooManyTitles && (
                <div className="mt-2 flex items-start gap-2 text-amber-600 bg-amber-50 p-2 rounded text-xs">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <p>Bạn đã nhập nhiều hơn 2 chức danh. Chúng tôi khuyến nghị chỉ nên để tối đa 2 chức danh để tối ưu hiển thị và tăng tính chuyên nghiệp.</p>
                </div>
            )}

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 mt-2 w-full bg-white shadow-xl rounded-lg border border-gray-100 max-h-64 overflow-y-auto transition-all duration-200 ease-in-out">
                    <ul className="py-2">
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                className={`px-4 py-2.5 hover:bg-blue-50 cursor-pointer flex items-center transition-colors duration-150 ease-in-out ${
                                    index === highlightedIndex ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                }`}
                                onMouseDown={(e) => {
                                    e.preventDefault(); // Prevent blur event
                                    handleSelectSuggestion(suggestion);
                                }}
                                onMouseEnter={() => setHighlightedIndex(index)}
                            >
                                <Briefcase className="h-4 w-4 text-blue-600 mr-3" />
                                <span className="text-sm font-medium">{suggestion}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};