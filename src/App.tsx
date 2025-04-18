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
import { NotificationProvider } from './components/notification/NotificationProvider';
import {PaymentSuccessPage} from "./pages/payment/PaymentSuccessPage";
import {PaymentCancelledPage} from "./pages/payment/PaymentCancelledPage";
import {MyCoursesPage} from "./pages/student/MyCoursesPage";
import {AllDiscountCoursesPage} from "./pages/AllDiscountCoursesPage";
import {AllHotCoursesPage} from "./pages/AllHotCoursesPage";
import {InstructorLayout} from "./layouts/InstructorLayout";
import {InstructorDashboard} from "./pages/instructor/InstructorDashboard";
import CourseUpload from "./pages/instructor/CourseUpload";
import InstructorCourses from "./pages/instructor/InstructorCourses";
import UploadStatusPage from "./pages/instructor/UploadStatusPage";
import {AdminLayout} from "./layouts/AdminLayout";
import {AdminLoginPage} from "./pages/admin/AdminLoginPage";
import {AdminDashboard} from "./pages/admin/AdminDashboard";
import StudentManagement from "./pages/admin/StudentManagement";
import CourseEdit from "./pages/instructor/CourseEdit";
import ChapterEditPage from "./pages/instructor/ChapterEditPage";
import LessonEdit from "./pages/instructor/LessonEdit";
import {AdvisorChat} from "./pages/AdvisorChat";
import {Terms} from "./pages/Terms";
import {Policies} from "./pages/Policies";
import {InstructorWithdraw} from "./pages/instructor/InstructorWithdraw";
import AdminWithdraw from "./pages/admin/AdminWithdraw";
import {BecomeInstructor} from "./pages/instructor/BecomeInstructor";
import {InstructorPaymentPage} from "./pages/student/InstructorPaymentPage";
import {InstructorPaymentCancelledPage} from "./pages/payment/InstructorPaymentCancelledPage";
import {InstructorPaymentSuccessPage} from "./pages/payment/InstructorPaymentSuccessPage";
import QuizLessonDetail from "./pages/courses/QuizLessonDetail";
import QuizPage from "./pages/courses/QuizWindowsPage";
import LessonDetailLayout from "./layouts/LessonDetailLayout";
import CertificatePage from "./pages/certificate/CertificatePage";
import {Helmet, HelmetProvider} from "react-helmet-async";
import PublicCertificatePage from "./pages/certificate/PublicCertificatePage";

function App() {
    return (
        <NotificationProvider>
            <HelmetProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/certificate/:courseId" element={<CertificatePage></CertificatePage>} />
                    <Route path="/certificate/public/:publiccode" element={<PublicCertificatePage></PublicCertificatePage>} />
                    <Route path="/" element={<Home />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/policies" element={<Policies />} />
                    <Route path="/login" element={<LoginPage/>} />
                    <Route path="/signup" element={<SignupPage/>} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/category/:categoryId" element={<Category />} />
                    <Route path="/course-detail/:id" element={<CourseDetail />} />
                    <Route path="/advisor-chat" element={<AdvisorChat/>} />

                    <Route path='activate/:email/:activateCode' element={<ActivateAccount/>}></Route>
                    <Route path='profile' element={<Profile/>}></Route>


                    {/*error*/}
                    <Route path='/forbidden' element={<Forbidden403/>}></Route>
                    <Route path='/not-found' element={<NotFound404/>}></Route>

                    {/*payment*/}
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/payment/success" element={<PaymentSuccessPage></PaymentSuccessPage>} />
                    <Route path="/payment/cancel" element={<PaymentCancelledPage />} />
                    <Route path="/payment-instructor/error" element={<InstructorPaymentCancelledPage />} />
                    <Route path="/payment-instructor/success" element={<InstructorPaymentSuccessPage />} />


                    <Route path='/courses/discount' element={<AllDiscountCoursesPage/>}></Route>
                    <Route path='/courses/hot' element={<AllHotCoursesPage/>}></Route>


                    {/* Learning routes */}

                    <Route path='/become-instructor' element={<BecomeInstructor/>}></Route>
                    <Route path='/register-instructor' element={<InstructorPaymentPage/>}></Route>
                    <Route path='/my-courses' element={<MyCoursesPage/>}></Route>
                    <Route path="/course-detail/:courseId/:chapterId/:lessonId" element={<LessonDetailLayout />}>
                        <Route path="video" element={<VideoLesson />} />
                        <Route path="quiz" element={<QuizLessonDetail />} />
                    </Route>
                    {/*<Route path="/course-detail/:courseId/:chapterId/:lessonId/video" element={<VideoLesson />} />*/}
                    {/*<Route path="/course-detail/:courseId/:chapterId/:lessonId/quiz" element={<QuizLessonDetail />} />*/}
                    <Route path="/quiz/:courseId/:chapterId/:lessonId" element={<QuizPage />} />
                    {/*<Route path="/course-detail/:courseId/:chapterId/:lessonId/reading" element={<TextLessonDetail />} />*/}
                    {/*<Route path="/course-detail/:courseId/:chapterId/:lessonId/practice" element={<CodeLessonDetail />} />*/}
                    {/*<Route path="/course-detail/:courseId/:chapterId/:lessonId/quiz" element={<QuizLessonDetail />} />*/}


                    {/*instructor*/}
                    {/*<Route path="/instructor" element={<InstructorDashboard />} />*/}
                    <Route path="/instructor/*" element={
                            <InstructorLayout>
                                <Routes>
                                    <Route path="dashboard" element={<InstructorDashboard />} />
                                    <Route path="courses" element={<InstructorCourses />} />
                                    <Route path="upload" element={<CourseUpload />} />
                                    <Route path="uploads" element={<UploadStatusPage />} />
                                    <Route path="course/:courseId/edit" element={<CourseEdit />} />


                                    <Route path="withdraw" element={<InstructorWithdraw />} />
                                    {/*<Route path="analytics" element={<Analytics />} />*/}
                                    <Route path="course/:courseId/chapter/:chapterId" element={<ChapterEditPage />} />
                                    {<Route path="course/:courseId/chapter/:chapterId/lesson/:lessonId" element={<LessonEdit />} />}
                                </Routes>
                            </InstructorLayout>
                    } />

                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/admin/*" element={
                        <AdminLayout>
                            <Routes>
                                <Route path="dashboard" element={<AdminDashboard />} />
                                <Route path="users" element={<StudentManagement />} />
                                <Route path="withdraw" element={<AdminWithdraw />} />
                                {/*<Route path="courses" element={<AdminCourses />} />*/}
                                {/*<Route path="settings" element={<AdminSettings />} />*/}
                                {/*<Route path="users/:userId" element={<AdminUserDetail />} />*/}
                                {/*<Route path="courses/:courseId" element={<AdminCourseDetail />} />*/}
                            </Routes>
                        </AdminLayout>
                    } />
                </Routes>
            </BrowserRouter>
            </HelmetProvider>
        </NotificationProvider>

    );

}


export default App;
