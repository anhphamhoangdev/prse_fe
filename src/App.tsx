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
import CodeLessonDetail from "./pages/courses/CodeLessonDetail";

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
                <Route path="/course-detail/1/1" element={<CodeLessonDetail />} />



                <Route path='activate/:email/:activateCode' element={<ActivateAccount/>}></Route>

                <Route path='profile' element={<Profile/>}></Route>

            </Routes>
        </BrowserRouter>
    );
}



export default App;
