import {PaymentMethod} from "../../../types/payment";

interface PaymentMethodsProps {
    selectedId: number | null;
    onSelect: (id: number) => void;
    methods: PaymentMethod[];
    isLoading?: boolean;
}



export const PaymentMethods = ({
                                   selectedId,
                                   onSelect,
                                   methods,
                                   isLoading = false
                               }: PaymentMethodsProps) => {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg border">
                <div className="p-6 border-b">
                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="p-6">
                    <div className="space-y-3">
                        {[1, 2].map(i => (
                            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">Phương thức thanh toán</h2>
            </div>
            <div className="p-6">
                <div className="space-y-3">
                    {methods.filter(m => m.isActive).map(method => (
                        <div
                            key={method.id}
                            onClick={() => onSelect(method.id)}
                            className={`
                                flex items-center p-4 border rounded-lg cursor-pointer
                                transition-all duration-200
                                ${selectedId === method.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                            }
                            `}
                        >
                            <input
                                type="radio"
                                checked={selectedId === method.id}
                                onChange={() => onSelect(method.id)}
                                className="h-4 w-4 text-blue-600 cursor-pointer"
                            />
                            <span className="ml-3 font-medium flex-1">
                                {method.name}
                            </span>
                            <img
                                src={method.logoUrl}
                                alt={method.name}
                                className="h-8 w-auto object-contain"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};