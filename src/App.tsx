import React from 'react';
import './App.css';
import {Home} from "./pages/Home";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {CourseDetail} from "./pages/CourseDetail";
import {LoginPage} from "./pages/Login";
import {SignupPage} from "./pages/Signup";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/course/:id" element={<CourseDetail />} />
                <Route path="/login" element={<LoginPage/>} />
                <Route path="/signup" element={<SignupPage/>} />
            </Routes>
            {/* Các route khác */}
        </BrowserRouter>
    );
}



export default App;
