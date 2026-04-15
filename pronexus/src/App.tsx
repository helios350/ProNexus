import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminBatches } from './pages/AdminBatches';
import AdminBatchDetail from './pages/AdminBatchDetail';
import { AdminFaculty } from './pages/AdminFaculty';
import { AdminStudents } from './pages/AdminStudents';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { ProjectDetail } from './pages/ProjectDetail';
import { StudentDashboard } from './pages/StudentDashboard';
import StudentProjectDetail from './pages/StudentProjectDetail';
import StudentAttendance from './pages/StudentAttendance';
import StudentSettings from './pages/StudentSettings';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/batches" element={
            <ProtectedRoute role="admin">
              <AdminBatches />
            </ProtectedRoute>
          } />
          <Route path="/admin/batches/:batchId" element={
            <ProtectedRoute role="admin">
              <AdminBatchDetail />
            </ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute role="admin">
              <AdminStudents />
            </ProtectedRoute>
          } />
          <Route path="/admin/faculty" element={
            <ProtectedRoute role="admin">
              <AdminFaculty />
            </ProtectedRoute>
          } />

          {/* Teacher routes */}
          <Route path="/teacher" element={
            <ProtectedRoute role="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          {/* Project Detail */}
          <Route path="/teacher/project/:projectId" element={
            <ProtectedRoute role="teacher">
              <ProjectDetail />
            </ProtectedRoute>
          } />

          {/* Student routes */}
          <Route path="/student" element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          {/* Student Project Detail */}
          <Route path="/student/project/:id" element={
            <ProtectedRoute role="student">
              <StudentProjectDetail />
            </ProtectedRoute>
          } />
          {/* Student Attendance */}
          <Route path="/student/attendance/:projectId" element={
            <ProtectedRoute role="student">
              <StudentAttendance />
            </ProtectedRoute>
          } />
          {/* Student Settings */}
          <Route path="/student/settings" element={
            <ProtectedRoute role="student">
              <StudentSettings />
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
