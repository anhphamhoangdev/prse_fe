import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import {Bank} from "../../types/bank";


interface BankSelectProps {
    selectedBank: Bank | null;
    onBankSelect: (bank: Bank) => void;
    banks: Bank[];
    className?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
}

export const BankSelect: React.FC<BankSelectProps> = ({
                                                          selectedBank,
                                                          onBankSelect,
                                                          banks,
                                                          className = '',
                                                          error,
                                                          required = false,
                                                          disabled = false,
                                                      }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter banks based on search term
    const filteredBanks = banks.filter(bank =>
        bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div
            ref={dropdownRef}
            className={`relative ${className}`}
        >
            {/* Selected Bank Display / Trigger Button */}
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full px-3 py-2 border rounded-lg flex items-center justify-between cursor-pointer transition-colors
                    ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-blue-500'}
                    ${error ? 'border-red-500' : 'border-gray-300'}
                    ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : ''}
                `}
            >
                {selectedBank ? (
                    <div className="flex items-center gap-2">
                        <img
                            src={selectedBank.logo}
                            alt={selectedBank.name}
                            className="w-14 h-14 object-contain"
                        />
                        <span className="font-medium">{selectedBank.shortName}</span>
                        <span className="text-gray-500 text-sm">- {selectedBank.name}</span>
                    </div>
                ) : (
                    <span className="text-gray-500">Chọn ngân hàng</span>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    isOpen ? 'transform rotate-180' : ''
                }`} />
            </div>

            {/* Error Message */}
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-[320px] flex flex-col">
                    {/* Search Box */}
                    <div className="p-2 border-b sticky top-0 bg-white z-10">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm ngân hàng..."
                                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Bank List */}
                    <div className="overflow-y-auto">
                        {filteredBanks.length > 0 ? (
                            filteredBanks.map(bank => (
                                <div
                                    key={bank.code}
                                    onClick={() => {
                                        onBankSelect(bank);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                >
                                    <img
                                        src={bank.logo}
                                        alt={bank.name}
                                        className="w-14 h-14 object-contain"
                                    />
                                    <div>
                                        <div className="font-medium">{bank.shortName}</div>
                                        <div className="text-sm text-gray-500">{bank.name}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-3 text-center text-gray-500">
                                Không tìm thấy ngân hàng phù hợp
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};