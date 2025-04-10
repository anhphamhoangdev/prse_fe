// src/routes/LessonDetailLayout.tsx
import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { CurriculumProvider } from './CurriculumContext';

const LessonDetailLayout: React.FC = () => {
    const { courseId } = useParams();

    if (!courseId) {
        return <div>Không tìm thấy courseId</div>;
    }

    return (
        <CurriculumProvider courseId={courseId}>
            <Outlet />
        </CurriculumProvider>
    );
};

export default LessonDetailLayout;