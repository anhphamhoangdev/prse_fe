export interface CodeLessonData {
    id: number;
    lessonId: number;
    language: string;
    content: string;
    initialCode: string;
    solutionCode: string;
    expectedOutput: string;
    hints: string;
    difficultyLevel: string;
    testCaseInput: string;
    testCaseOutput: string;
    testCaseDescription: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserSubmission {
    id: number;
    studentId: number;
    courseId: number;
    chapterId: number;
    lessonId: number;
    submittedCode: string;
    language: string;
    score: number;
    status: string; // "PASSED", "FAILED", "PENDING"
    isCorrect: boolean;
    executionTime: number;
    memoryUsed: number;
    submittedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface CodeLessonApiResponse {
    currentLesson: CodeLessonData;
    isCompleted: boolean;
    userSubmission?: UserSubmission;
    lastSubmission?: UserSubmission;
}