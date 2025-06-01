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
    userId: number;
    codeLessonId: number;
    submittedCode: string;
    isCorrect: boolean;
    executionTime: number;
    submittedAt: string;
}

export interface CodeLessonApiResponse {
    currentLesson: CodeLessonData;
    isCompleted: boolean;
    userSubmission?: UserSubmission;
}