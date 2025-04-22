export interface WebSocketMessage {
    type: string; // E.g., 'NEW_MESSAGE', 'NOTIFICATION', 'COURSE_PROGRESS', 'PURCHASE_SUCCESS'
    message: string;
    status: 'SUCCESS' | 'ERROR' | 'INFO';
    progress?: number;
    courseId?: number;
    lessonId?: number;
    instructorId?: number;
    timestamp?: string;
    data?: any; // Can hold ChatMessageDTO for NEW_MESSAGE
}