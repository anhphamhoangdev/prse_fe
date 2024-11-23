
import React from "react";
import {CheckoutItem} from "../../../types/checkout";
import {formatCurrency} from "../../../utils/formatCurrency";

export const CheckoutCourseCard = ({ item }: { item: CheckoutItem }) => (
    <div className="flex gap-4 p-4 border rounded-lg">
        <img
            src={item.imageUrl}
            alt={item.title}
            className="w-24 h-16 object-cover rounded"
        />
        <div className="flex-1">
            <h3 className="font-medium text-gray-900 line-clamp-1">{item.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                {item.shortDescription}
            </p>
            <div className="mt-2 text-sm">
                {item.isDiscount && (
                    <span className="line-through text-gray-400 mr-2">
                        {formatCurrency(item.originalPrice)}
                    </span>
                )}
                <span className="font-semibold text-blue-600">
                    {formatCurrency(item.discountPrice || item.originalPrice)}
                </span>
            </div>
        </div>
    </div>
);
