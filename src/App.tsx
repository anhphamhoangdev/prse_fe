import React from 'react';
import './App.css';
import {Home} from "./pages/Home";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {CourseDetail} from "./pages/CourseDetail";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/course/:id" element={<CourseDetail />} />
            </Routes>
            {/* Các route khác */}
        </BrowserRouter>
    );
}



export default App;
