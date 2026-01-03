import React, { createContext, useContext, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Import Pages
import LandingPage from '../src/pages/public/LandingPage';
import LoginPage from './pages/public/Login';

// --- 1. MOCK AUTH CONTEXT ---
// This simulates Firebase Auth for now so you can build the UI
interface User {
  name: string;
  role: 'student' | 'instructor' | 'superadmin';
}

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: 'student' | 'instructor' | 'superadmin') => {
    setUser({ name: 'Test User', role });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// --- 2. PROTECTED ROUTE COMPONENT ---
// Ensures only specific roles can access specific URLs
const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />;
};

// --- 3. PLACEHOLDER DASHBOARDS (Temporary) ---
const InstructorDashboard = () => <div className="p-10 text-white bg-[#171717] h-screen"><h1>Instructor Dashboard (Protected)</h1></div>;
const SuperAdminDashboard = () => <div className="p-10 text-white bg-[#171717] h-screen"><h1>Super Admin Dashboard (Protected)</h1></div>;
const StudentDashboard = () => <div className="p-10 text-white bg-[#171717] h-screen"><h1>Student Dashboard (Protected)</h1></div>;

// --- 4. MAIN APP ROUTING ---
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Super Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
            <Route path="/superadmin" element={<SuperAdminDashboard />} />
            {/* Add more admin routes here */}
          </Route>

          {/* Instructor Routes */}
          <Route element={<ProtectedRoute allowedRoles={['instructor', 'superadmin']} />}>
            <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
            {/* You will add ReviewStudio and CourseCreate here later */}
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<div className="text-white p-10">404 Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;