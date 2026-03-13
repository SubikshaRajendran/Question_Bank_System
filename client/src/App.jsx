import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/Loader';

// Lazy loading pages
const Landing = lazy(() => import('./pages/Landing'));
const About = lazy(() => import('./pages/About'));
const LoginSelection = lazy(() => import('./pages/LoginSelection'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const AccountBlocked = lazy(() => import('./pages/AccountBlocked'));

const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const MyCourses = lazy(() => import('./pages/student/MyCourses'));
const ReviewLater = lazy(() => import('./pages/student/ReviewLater'));
const CourseView = lazy(() => import('./pages/student/CourseView'));
const QuizView = lazy(() => import('./pages/student/QuizView'));
const StudentComments = lazy(() => import('./pages/student/StudentComments'));
const StudentProfile = lazy(() => import('./pages/student/Profile'));
const Leaderboard = lazy(() => import('./pages/student/Leaderboard'));
const MyAttempts = lazy(() => import('./pages/student/MyAttempts'));
const CourseAttempts = lazy(() => import('./pages/student/CourseAttempts'));

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AddCourse = lazy(() => import('./pages/admin/AddCourse'));
const EditCourse = lazy(() => import('./pages/admin/EditCourse'));
const AdminComments = lazy(() => import('./pages/admin/AdminComments'));
const AdminProfile = lazy(() => import('./pages/admin/Profile'));
const AdminStudents = lazy(() => import('./pages/admin/Students'));
const AdminStudentProfile = lazy(() => import('./pages/admin/AdminStudentProfile'));
const OnlineStudents = lazy(() => import('./pages/admin/OnlineStudents'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<Loader fullScreen message="Loading page..." />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Landing />} />
              <Route path="about" element={<About />} />
              <Route path="login" element={<LoginSelection />} />
              <Route path="login/student" element={<Login mode="student" />} />
              <Route path="login/admin" element={<Login mode="admin" />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="account-blocked" element={<AccountBlocked />} />

              {/* Student Routes */}
              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="student/dashboard" element={<StudentDashboard />} />
                <Route path="student/courses" element={<MyCourses />} />
                <Route path="student/review" element={<ReviewLater />} />
                <Route path="student/comments" element={<StudentComments />} />
                <Route path="student/profile" element={<StudentProfile />} />
                <Route path="student/leaderboard" element={<Leaderboard />} />
                <Route path="student/attempts" element={<MyAttempts />} />
                <Route path="student/attempts/:courseId" element={<CourseAttempts />} />
                <Route path="course/:id" element={<CourseView />} />
                <Route path="student/course/:id/quiz" element={<QuizView />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="admin/dashboard" element={<AdminDashboard />} />
                <Route path="admin/students" element={<AdminStudents />} />
                <Route path="admin/students/online" element={<OnlineStudents />} />
                <Route path="admin/student/:id" element={<AdminStudentProfile />} /> {/* Added Dedicated Profile Route */}
                <Route path="admin/profile" element={<AdminProfile />} />
                <Route path="admin/course/new" element={<AddCourse />} />
                <Route path="admin/course/edit/:id" element={<EditCourse />} />
                <Route path="admin/comments" element={<AdminComments />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
