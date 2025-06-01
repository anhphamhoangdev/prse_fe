import {Check, Terminal, X} from "lucide-react";

export const OutputConsole: React.FC<{
    output: string;
    isSuccess: boolean | null;
}> = ({ output, isSuccess }) => {
    if (!output) return null;

    return (
        <div className="mt-6">
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-700">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
                    <div className="flex items-center space-x-2">
                        <Terminal className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 font-semibold text-sm">Console Output</span>
                    </div>
                    {isSuccess !== null && (
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold ${
                            isSuccess
                                ? 'bg-green-900 text-green-300 border border-green-700'
                                : 'bg-red-900 text-red-300 border border-red-700'
                        }`}>
                            {isSuccess ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span>{isSuccess ? 'Thành công' : 'Lỗi'}</span>
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <pre className="text-gray-200 font-mono text-sm leading-relaxed">{output}</pre>
                </div>
            </div>
        </div>
    );
};