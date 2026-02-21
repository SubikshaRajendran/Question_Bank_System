import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import About from './pages/About';
import LoginSelection from './pages/LoginSelection';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

import StudentDashboard from './pages/student/Dashboard';
import MyCourses from './pages/student/MyCourses';
import ReviewLater from './pages/student/ReviewLater';
import CourseView from './pages/student/CourseView';
import StudentComments from './pages/student/StudentComments';
import StudentProfile from './pages/student/Profile'; // Imported

import AdminDashboard from './pages/admin/Dashboard';
import AddCourse from './pages/admin/AddCourse';
import EditCourse from './pages/admin/EditCourse';
import AdminComments from './pages/admin/AdminComments';
import AdminProfile from './pages/admin/Profile';
import AdminStudents from './pages/admin/Students';
import AdminStudentProfile from './pages/admin/AdminStudentProfile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="about" element={<About />} />
            <Route path="login" element={<LoginSelection />} />
            <Route path="login/student" element={<Login mode="student" />} />
            <Route path="login/admin" element={<Login mode="admin" />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="student/dashboard" element={<StudentDashboard />} />
              <Route path="student/courses" element={<MyCourses />} />
              <Route path="student/review" element={<ReviewLater />} />
              <Route path="student/comments" element={<StudentComments />} />
              <Route path="student/profile" element={<StudentProfile />} /> {/* Added Route */}
              <Route path="course/:id" element={<CourseView />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="admin/students" element={<AdminStudents />} />
              <Route path="admin/student/:id" element={<AdminStudentProfile />} /> {/* Added Dedicated Profile Route */}
              <Route path="admin/profile" element={<AdminProfile />} />
              <Route path="admin/course/new" element={<AddCourse />} />
              <Route path="admin/course/edit/:id" element={<EditCourse />} />
              <Route path="admin/comments" element={<AdminComments />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
