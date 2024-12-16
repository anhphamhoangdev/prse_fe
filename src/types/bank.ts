export interface Bank {
    name: string;
    code: string;
    shortName: string;
    logo: string;
}

export interface BankSelectProps {
    selectedBank: Bank | null;
    onBankSelect: (bank: Bank) => void;
    banks: Bank[];
    className?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
}