import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CourseCategory {
    name: string;
    value: number;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        payload: CourseCategory;
    }>;
}

interface CustomLabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    index: number;
    name: string;
    value: number;
}

interface CourseDistributionProps {
    data: CourseCategory[];
}

export const CourseDistribution: React.FC<CourseDistributionProps> = ({ data }) => {
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

    const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-100">
                    <p className="text text-gray-900">{payload[0].name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                        {payload[0].value} khóa học
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomLabel: React.FC<CustomLabelProps> = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="#ffffff"
                textAnchor="middle"
                dominantBaseline="central"
                className="text-xs font-semibold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const renderLegendText = (value: string) => {
        const item = data.find(d => d.name === value);
        return (
            <span className="text-sm text-gray-600 font-medium">
                {value} ({item?.value} khóa học)
            </span>
        );
    };

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-gray-900">Phân bố khóa học</h2>
                    <p className="text-sm text-gray-500">Thống kê theo thể loại</p>
                </div>
                <div className="px-4 py-2 bg-blue-50 rounded-lg text-center">
                    <div className="text-sm font-medium text-blue-600">
                        Tổng số khoá học
                    </div>
                    <div className="text-2xl font-bold text-blue-700">
                        {total}
                    </div>
                </div>
            </div>
            <div className="flex justify-center relative" style={{height: '320px'}}>
                {/* Animated circular backgrounds */}
                {/*<div className="absolute inset-0 flex items-center justify-center pointer-events-none">*/}
                {/*    <div className="absolute w-[220px] h-[220px] rounded-full border border-blue-100 opacity-20 animate-[ping_3s_ease-in-out_infinite]" />*/}
                {/*    <div className="absolute w-[180px] h-[180px] rounded-full border-2 border-blue-50 animate-[spin_30s_linear_infinite]" />*/}
                {/*    <div className="absolute w-[140px] h-[140px] rounded-full border-2 border-blue-50 animate-[spin_20s_linear_infinite_reverse]" />*/}
                {/*</div>*/}

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                            labelLine={false}
                            label={CustomLabel}
                            startAngle={90}
                            endAngle={-270}
                            animationBegin={0}
                            animationDuration={1200}
                            animationEasing="ease-out"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    className="transition-all duration-300"
                                    style={{
                                        filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                                    }}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: 'transparent' }}
                            animationDuration={100}
                        />
                        <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            formatter={renderLegendText}
                            wrapperStyle={{
                                paddingLeft: "20px",
                            }}
                            className="text-sm"
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Animated center content */}
                {/*<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">*/}
                {/*    <div className="relative">*/}
                {/*        <div className="absolute inset-0 flex items-center justify-center">*/}
                {/*            <div className="w-24 h-24 rounded-full bg-blue-50/50 animate-pulse" />*/}
                {/*        </div>*/}
                {/*        <div className="relative">*/}
                {/*            <div className="text-sm font-medium text-gray-500">Khóa học</div>*/}
                {/*            <div className="text-2xl font-bold text-gray-900">{total}</div>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}
            </div>

            {/* Category summary with animations */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                {data.slice(0, 3).map((category, index) => (
                    <div
                        key={index}
                        className="text-center transform transition-all duration-300 hover:scale-105"
                    >
                        <div
                            className="text-sm font-medium text-gray-500 h-10 flex items-center justify-center px-2"
                        >
                <span className="line-clamp-2">
                    {category.name}
                </span>
                        </div>
                        <div
                            className="mt-1 text-lg font-semibold transition-colors duration-300"
                            style={{color: COLORS[index]}}
                        >
                            {((category.value / total) * 100).toFixed(1)}%
                        </div>
                        <div className="mt-1 h-1 rounded-full bg-gray-100 overflow-hidden">
                            <div
                                className="h-full transition-all duration-1000 ease-out"
                                style={{
                                    width: `${(category.value / total) * 100}%`,
                                    backgroundColor: COLORS[index],
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>        </div>
    );
};

export default CourseDistribution;