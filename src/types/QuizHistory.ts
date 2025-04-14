// src/types/QuizHistory.ts
export class QuizHistory {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    lessonId: number;
    courseId: number;
    chapterId: number;

    constructor(score: number, correctAnswers: number, totalQuestions: number, lessonId: number, courseId: number, chapterId: number) {
        this.score = score;
        this.correctAnswers = correctAnswers;
        this.totalQuestions = totalQuestions;
        this.lessonId = lessonId;
        this.courseId = courseId;
        this.chapterId = chapterId;
    }

    // Optional: Hàm chuyển object sang JSON để gửi API
    toJSON() {
        return {
            score: this.score,
            correctAnswers: this.correctAnswers,
            totalQuestions: this.totalQuestions,
            lessonId: this.lessonId,
            courseId: this.courseId,
            chapterId: this.chapterId,
        };
    }
}