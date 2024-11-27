export interface WebSocketMessage {
    type: string;
    message: string;
    status: 'SUCCESS' | 'ERROR' | 'INFO';
    progress?: number;
    courseId?: number;
    lessonId?: number;
    instructorId?: number;
    timestamp?: string;
    data?: any;
}