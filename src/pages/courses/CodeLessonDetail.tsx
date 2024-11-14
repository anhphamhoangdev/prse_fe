import React, { useState } from 'react';
import { Play, RotateCcw, Terminal, CheckCircle, XCircle, AlertCircle, Clock, ChevronLeft, FileText, Star, Coffee, Award } from 'lucide-react';
import {SearchHeaderAndFooterLayout} from "../../layouts/UserLayout";

interface TestCase {
    input: string;
    expectedOutput: string;
}

interface CodeLesson {
    id: number;
    title: string;
    description: string;
    initialCode: string;
    programmingLanguage: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    estimatedTime: string;
    points: number;
    testCases: TestCase[];
}

interface TestResult {
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput: string;
}

const CodeLessonDetail: React.FC = () => {
    const lessonData: CodeLesson = {
        id: 1,
        title: "Build a Simple Calculator",
        description: `Create a function called 'calculate' that takes three parameters:
            - num1 (number)
            - num2 (number)
            - operation (string: 'add', 'subtract', 'multiply', 'divide')
            
            The function should return the result of the mathematical operation between num1 and num2.
            For division, if num2 is 0, return 'Cannot divide by zero'`,
        initialCode:
            `function calculate(num1: number, num2: number, operation: string): number | string {
    // Write your code here
    
}`,
        programmingLanguage: "typescript",
        difficulty: "Medium",
        estimatedTime: "15 mins",
        points: 50,
        testCases: [
            { input: "calculate(10, 5, 'add')", expectedOutput: "15" },
            { input: "calculate(10, 5, 'subtract')", expectedOutput: "5" },
            { input: "calculate(10, 0, 'divide')", expectedOutput: "Cannot divide by zero" }
        ]
    };

    const [code, setCode] = useState<string>(lessonData.initialCode);
    const [output, setOutput] = useState<string>("");
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'instructions' | 'testCases'>('instructions');

    const handleCodeChange = (newCode: string) => {
        setCode(newCode);
    };

    const resetCode = () => {
        setCode(lessonData.initialCode);
        setOutput("");
        setTestResults([]);
    };

    const runCode = () => {
        setIsRunning(true);
        setOutput("Running code...");
        setTimeout(() => {
            setOutput("// Code output will appear here");
            setIsRunning(false);
        }, 1000);
    };

    const submitCode = () => {
        setIsRunning(true);
        setTimeout(() => {
            const mockResults: TestResult[] = [
                {
                    passed: true,
                    input: "calculate(10, 5, 'add')",
                    expectedOutput: "15",
                    actualOutput: "15"
                },
                {
                    passed: false,
                    input: "calculate(10, 5, 'subtract')",
                    expectedOutput: "5",
                    actualOutput: "15"
                }
            ];
            setTestResults(mockResults);
            setIsRunning(false);
        }, 1500);
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-500';
            case 'Medium': return 'text-yellow-500';
            case 'Hard': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <SearchHeaderAndFooterLayout>
            {/* Top Navigation Bar */}
            <nav className="bg-gray-900 text-white">
                <div className="container mx-auto px-4">
                    <div className="h-16 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button className="hover:bg-gray-800 p-2 rounded-lg">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-lg font-semibold">{lessonData.title}</h1>
                                <div className="flex items-center space-x-4 text-sm text-gray-400">
                                    <span className={`${getDifficultyColor(lessonData.difficulty)}`}>
                                        {lessonData.difficulty}
                                    </span>
                                    <span className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {lessonData.estimatedTime}
                                    </span>
                                    <span className="flex items-center">
                                        <Award className="w-4 h-4 mr-1" />
                                        {lessonData.points} points
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm">
                                Need Help?
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto py-6">
                    <div className="grid grid-cols-5 gap-6">
                        {/* Left Panel - Instructions & Test Cases */}
                        <div className="col-span-2 space-y-4">
                            {/* Tab Navigation */}
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <div className="flex border-b">
                                    <button
                                        className={`flex-1 py-3 text-sm font-medium ${
                                            activeTab === 'instructions'
                                                ? 'border-b-2 border-blue-500 text-blue-600'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                        onClick={() => setActiveTab('instructions')}
                                    >
                                        <FileText className="w-4 h-4 inline mr-2" />
                                        Instructions
                                    </button>
                                    <button
                                        className={`flex-1 py-3 text-sm font-medium ${
                                            activeTab === 'testCases'
                                                ? 'border-b-2 border-blue-500 text-blue-600'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                        onClick={() => setActiveTab('testCases')}
                                    >
                                        <CheckCircle className="w-4 h-4 inline mr-2" />
                                        Test Cases
                                    </button>
                                </div>

                                <div className="p-6">
                                    {activeTab === 'instructions' ? (
                                        <div className="prose max-w-none">
                                            <div className="space-y-6">
                                                <div>
                                                    <h2 className="text-lg font-semibold mb-3">Problem Description</h2>
                                                    <pre className="whitespace-pre-wrap text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                                                        {lessonData.description}
                                                    </pre>
                                                </div>

                                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                                    <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                                                        <Coffee className="w-4 h-4 mr-2" />
                                                        Tips for Success
                                                    </h3>
                                                    <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                                                        <li>Remember to handle the division by zero case</li>
                                                        <li>Test your code with different inputs before submitting</li>
                                                        <li>Make sure your function returns the correct type</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {testResults.length > 0 ? (
                                                testResults.map((result, index) => (
                                                    <div
                                                        key={index}
                                                        className={`border rounded-lg p-4 ${
                                                            result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                                        }`}
                                                    >
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            {result.passed ? (
                                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                                            ) : (
                                                                <XCircle className="w-5 h-5 text-red-500" />
                                                            )}
                                                            <span className="font-medium">
                                                                Test Case {index + 1}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="bg-white bg-opacity-50 p-2 rounded">
                                                                <span className="font-medium">Input:</span>
                                                                <pre className="mt-1 text-gray-600">{result.input}</pre>
                                                            </div>
                                                            <div className="bg-white bg-opacity-50 p-2 rounded">
                                                                <span className="font-medium">Expected:</span>
                                                                <pre className="mt-1 text-gray-600">{result.expectedOutput}</pre>
                                                            </div>
                                                            <div className="bg-white bg-opacity-50 p-2 rounded">
                                                                <span className="font-medium">Your Output:</span>
                                                                <pre className="mt-1 text-gray-600">{result.actualOutput}</pre>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                    <p>Run your code to see test results</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Code Editor */}
                        <div className="col-span-3 space-y-4">
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                {/* Editor Header */}
                                <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-blue-400 font-medium">{lessonData.programmingLanguage}</span>
                                        <div className="h-4 w-px bg-gray-700"></div>
                                        <button
                                            onClick={resetCode}
                                            className="text-gray-400 hover:text-white flex items-center space-x-1 text-sm"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            <span>Reset Code</span>
                                        </button>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-400">
                                        <span>Auto-save enabled</span>
                                    </div>
                                </div>

                                {/* Code Editor */}
                                <div className="bg-gray-900">
                                    <textarea
                                        value={code}
                                        onChange={(e) => handleCodeChange(e.target.value)}
                                        className="w-full h-[500px] bg-gray-900 text-gray-100 p-4 font-mono text-sm focus:outline-none"
                                        spellCheck="false"
                                    />
                                </div>

                                {/* Console Output */}
                                <div className="border-t border-gray-800">
                                    <div className="bg-gray-900 px-4 py-2 flex items-center justify-between border-b border-gray-800">
                                        <div className="flex items-center space-x-2 text-gray-400">
                                            <Terminal className="w-4 h-4" />
                                            <span className="text-sm">Console</span>
                                        </div>
                                        <button
                                            className="text-gray-400 hover:text-white p-1 rounded"
                                            onClick={() => setOutput("")}
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    <div className="bg-gray-900 p-4 text-sm font-mono max-h-40 overflow-auto">
                                        <pre className="text-gray-300">
                                            {output || "// Output will appear here"}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-4">
                                <button
                                    onClick={runCode}
                                    disabled={isRunning}
                                    className="flex-1 bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                                >
                                    <Play className="w-4 h-4" />
                                    <span>Run Code</span>
                                </button>
                                <button
                                    onClick={submitCode}
                                    disabled={isRunning}
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    Submit Solution
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SearchHeaderAndFooterLayout>
    );
};

export default CodeLessonDetail;