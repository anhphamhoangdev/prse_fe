import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import './App.css';

// Layouts
import { InstructorLayout } from './layouts/InstructorLayout';
import { AdminLayout } from './layouts/AdminLayout';
import LessonDetailLayout from './layouts/LessonDetailLayout';

// Common/Public Pages
import { Home } from './pages/Home';
import { LoginPage } from './pages/Login';
import { SignupPage } from './pages/Signup';
import { Search } from './pages/Search';
import { Category } from './pages/Category';
import { Terms } from './pages/Terms';
import { Policies } from './pages/Policies';
import { AdvisorChat } from './pages/AdvisorChat';
import CourseDetail from './pages/courses/CourseDetail';
import { AllDiscountCoursesPage } from './pages/AllDiscountCoursesPage';
import { AllHotCoursesPage } from './pages/AllHotCoursesPage';

// Error Pages
import { Forbidden403 } from './pages/error/Forbidden403';
import { NotFound404 } from './pages/error/NotFound404';

// Student Pages
import { ActivateAccount } from './pages/student/ActivateAccount';
import { Profile } from './pages/student/Profile';
import { CartPage } from './pages/student/CartPage';
import { CheckoutPage } from './pages/student/CheckoutPage';
import { MyCoursesPage } from './pages/student/MyCoursesPage';
import { InvoicesPage } from './pages/student/InvoicesPage';
import { InstructorPaymentPage } from './pages/student/InstructorPaymentPage';

// Course Learning Pages
import VideoLesson from './pages/courses/VideoLesson';
import QuizLessonDetail from './pages/courses/QuizLessonDetail';
import QuizPage from './pages/courses/QuizWindowsPage';

// Instructor Pages
import { InstructorDashboard } from './pages/instructor/InstructorDashboard';
import CourseUpload from './pages/instructor/CourseUpload';
import InstructorCourses from './pages/instructor/InstructorCourses';
import UploadStatusPage from './pages/instructor/UploadStatusPage';
import CourseEdit from './pages/instructor/CourseEdit';
import ChapterEditPage from './pages/instructor/ChapterEditPage';
import LessonEdit from './pages/instructor/LessonEdit';
import { InstructorWithdraw } from './pages/instructor/InstructorWithdraw';
import { BecomeInstructor } from './pages/instructor/BecomeInstructor';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import StudentManagement from './pages/admin/StudentManagement';
import AdminWithdraw from './pages/admin/AdminWithdraw';

// Payment Pages
import { PaymentSuccessPage } from './pages/payment/PaymentSuccessPage';
import { PaymentCancelledPage } from './pages/payment/PaymentCancelledPage';
import { InstructorPaymentCancelledPage } from './pages/payment/InstructorPaymentCancelledPage';
import { InstructorPaymentSuccessPage } from './pages/payment/InstructorPaymentSuccessPage';

// Certificate Pages
import CertificatePage from './pages/certificate/CertificatePage';
import PublicCertificatePage from './pages/certificate/PublicCertificatePage';

// Components
import { NotificationProvider } from './components/notification/NotificationProvider';
import { UserProvider } from './context/UserContext';
import { StudentWebSocketProvider } from './context/StudentWebSocketContext';
import {WebSocketProvider} from "./context/WebSocketContext";
import InstructorMessages from "./pages/instructor/InstructorMessages";
import StudentMessages from "./pages/student/StudentMessages";
import {InstructorProfile} from "./pages/instructor/InstructorProfile";
import {CreateTicketPage} from "./pages/student/CreateTicketPage";
import StudentDetailsPage from "./pages/admin/StudentDetailsPage";
import InstructorManagement from "./pages/admin/InstructorManagement";
import InstructorDetailsPage from "./pages/admin/InstructorDetailsPage";
import TicketManagement from "./pages/admin/TicketManagement";
import InvoiceManagement from "./pages/admin/InvoiceManagement";

function App() {
    return (
        <NotificationProvider>
            <HelmetProvider>
                <UserProvider>
                    <BrowserRouter>
                        <Routes>
                            {/* Student Routes (Public & Student Pages) */}
                            <Route
                                path="/*"
                                element={
                                    <StudentWebSocketProvider>
                                        <Routes>
                                            {/* Public Routes */}
                                            <Route path="/" element={<Home />} />
                                            <Route path="/terms" element={<Terms />} />
                                            <Route path="/policies" element={<Policies />} />
                                            <Route path="/login" element={<LoginPage />} />
                                            <Route path="/signup" element={<SignupPage />} />
                                            <Route path="/search" element={<Search />} />
                                            <Route path="/category/:categoryId" element={<Category />} />
                                            <Route path="/course-detail/:id" element={<CourseDetail />} />
                                            <Route path="/advisor-chat" element={<AdvisorChat />} />
                                            <Route path="/courses/discount" element={<AllDiscountCoursesPage />} />
                                            <Route path="/courses/hot" element={<AllHotCoursesPage />} />

                                            {/* Error Pages */}
                                            <Route path="/forbidden" element={<Forbidden403 />} />
                                            <Route path="/not-found" element={<NotFound404 />} />

                                            {/* Account Activation */}
                                            <Route path="/activate/:email/:activateCode" element={<ActivateAccount />} />

                                            {/* Student Routes */}
                                            <Route path="/profile" element={<Profile />} />
                                            <Route path="/history" element={<InvoicesPage />} />
                                            <Route path="/my-courses" element={<MyCoursesPage />} />
                                            <Route path="/messages" element={<StudentMessages />} />

                                            {/* Cart & Payment Routes */}
                                            <Route path="/cart" element={<CartPage />} />
                                            <Route path="/checkout" element={<CheckoutPage />} />
                                            <Route path="/payment/success" element={<PaymentSuccessPage />} />
                                            <Route path="/payment/cancel" element={<PaymentCancelledPage />} />
                                            <Route path="/create-ticket" element={<CreateTicketPage />} />

                                            {/* Learning Routes */}
                                            <Route path="/course-detail/:courseId/:chapterId/:lessonId" element={<LessonDetailLayout />}>
                                                <Route path="video" element={<VideoLesson />} />
                                                <Route path="quiz" element={<QuizLessonDetail />} />
                                            </Route>
                                            <Route path="/quiz/:courseId/:chapterId/:lessonId" element={<QuizPage />} />

                                            {/* Certificate Routes */}
                                            <Route path="/certificate/:courseId" element={<CertificatePage />} />
                                            <Route path="/certificate/public/:publiccode" element={<PublicCertificatePage />} />

                                            {/* Instructor Application Routes */}
                                            <Route path="/become-instructor" element={<BecomeInstructor />} />
                                            <Route path="/register-instructor" element={<InstructorPaymentPage />} />
                                            <Route path="/payment-instructor/success" element={<InstructorPaymentSuccessPage />} />
                                            <Route path="/payment-instructor/error" element={<InstructorPaymentCancelledPage />} />
                                        </Routes>
                                    </StudentWebSocketProvider>
                                }
                            />

                            {/* Instructor Panel Routes */}
                            <Route
                                path="/instructor/*"
                                element={
                                    <WebSocketProvider>
                                        <InstructorLayout>
                                            <Routes>
                                                <Route path="dashboard" element={<InstructorDashboard />} />
                                                <Route path="profile" element={<InstructorProfile />} />
                                                <Route path="messages" element={<InstructorMessages />} />
                                                <Route path="courses" element={<InstructorCourses />} />
                                                <Route path="upload" element={<CourseUpload />} />
                                                <Route path="uploads" element={<UploadStatusPage />} />
                                                <Route path="withdraw" element={<InstructorWithdraw />} />
                                                <Route path="course/:courseId/edit" element={<CourseEdit />} />
                                                <Route path="course/:courseId/chapter/:chapterId" element={<ChapterEditPage />} />
                                                <Route
                                                    path="course/:courseId/chapter/:chapterId/lesson/:lessonId"
                                                    element={<LessonEdit />}
                                                />
                                            </Routes>
                                        </InstructorLayout>
                                    </WebSocketProvider>
                                }
                            />

                            {/* Admin Panel Routes */}
                            <Route path="/admin/login" element={<AdminLoginPage />} />
                            <Route
                                path="/admin/*"
                                element={
                                    <AdminLayout>
                                        <Routes>
                                            <Route path="dashboard" element={<AdminDashboard />} />
                                            <Route path="students" element={<StudentManagement />} />
                                            <Route path="student/:id" element={<StudentDetailsPage />} />
                                            <Route path="instructors" element={<InstructorManagement />} />
                                            <Route path="instructor/:id" element={<InstructorDetailsPage />} />
                                            <Route path="tickets" element={<TicketManagement />} />
                                            <Route path="invoices" element={<InvoiceManagement />} />
                                            <Route path="withdrawals" element={<AdminWithdraw />} />
                                        </Routes>
                                    </AdminLayout>
                                }
                            />
                        </Routes>
                    </BrowserRouter>
                </UserProvider>
            </HelmetProvider>
        </NotificationProvider>
    );
}

export default App;