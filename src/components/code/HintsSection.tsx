import React from 'react';
import { Lightbulb, ChevronDown } from 'lucide-react';

interface HintsSectionProps {
    hints: string;
    showHints: boolean;
    setShowHints: (show: boolean) => void;
}

const HintsSection: React.FC<HintsSectionProps> = ({
                                                       hints,
                                                       showHints,
                                                       setShowHints
                                                   }) => {
    if (!hints) return null;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <button
                onClick={() => setShowHints(!showHints)}
                className="w-full px-6 py-4 text-left hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-200"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                            <Lightbulb className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Gợi ý</h2>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                            Tips
                        </span>
                    </div>
                    <div className={`transition-transform duration-200 ${showHints ? 'transform rotate-180' : ''}`}>
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                    </div>
                </div>
            </button>
            {showHints && (
                <div className="px-6 pb-6 border-t border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                    <div className="pt-4">
                        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-6 shadow-sm border border-yellow-200">
                            <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                                {hints}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HintsSection;