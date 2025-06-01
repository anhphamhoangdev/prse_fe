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
        <>
            <button
                onClick={() => setShowHints(!showHints)}
                className="w-full px-6 py-4 text-left hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-200"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-100 to-orange-100">
                            <Lightbulb className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <div className="font-medium text-gray-800">Gợi ý</div>
                            <div className="text-sm text-gray-500">Tips</div>
                        </div>
                    </div>
                    <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                            showHints ? 'rotate-180' : ''
                        }`}
                    />
                </div>
            </button>

            {showHints && (
                <div className="px-6 pb-4">
                    <div className="text-gray-700 whitespace-pre-wrap">
                        {hints}
                    </div>
                </div>
            )}
        </>
    );
};

export default HintsSection;