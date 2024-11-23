import React from 'react';
import './App.css';
import {Home} from "./pages/Home";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {LoginPage} from "./pages/Login";
import {SignupPage} from "./pages/Signup";
import {Category} from "./pages/Category";
import {Search} from "./pages/Search";
import {ActivateAccount} from "./pages/student/ActivateAccount";
import {Profile} from "./pages/student/Profile";
import CourseDetail from "./pages/courses/CourseDetail";
import VideoLesson from "./pages/courses/VideoLesson";
import {Forbidden403} from "./pages/error/Forbidden403";
import {NotFound404} from "./pages/error/NotFound404";
import {CartPage} from "./pages/student/CartPage";
import {CheckoutPage} from "./pages/student/CheckoutPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage/>} />
                <Route path="/signup" element={<SignupPage/>} />
                <Route path="/search" element={<Search />} />
                <Route path="/category/:categoryId" element={<Category />} />
                <Route path="/course-detail/:id" element={<CourseDetail />} />
                <Route path="/course-detail/1/1" element={<VideoLesson />} />



                <Route path='activate/:email/:activateCode' element={<ActivateAccount/>}></Route>

                <Route path='profile' element={<Profile/>}></Route>


                {/*error*/}
                <Route path='/forbidden' element={<Forbidden403/>}></Route>
                <Route path='/not-found' element={<NotFound404/>}></Route>
                
                {/*payment*/}
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />

                {/* Learning routes */}
                <Route path="/course-detail/:courseId/:chapterId/:lessonId/video" element={<VideoLesson />} />
                {/*<Route path="/course-detail/:courseId/:chapterId/:lessonId/reading" element={<TextLessonDetail />} />*/}
                {/*<Route path="/course-detail/:courseId/:chapterId/:lessonId/practice" element={<CodeLessonDetail />} />*/}
                {/*<Route path="/course-detail/:courseId/:chapterId/:lessonId/quiz" element={<QuizLessonDetail />} />*/}
            </Routes>
        </BrowserRouter>
    );
}



export default App;
