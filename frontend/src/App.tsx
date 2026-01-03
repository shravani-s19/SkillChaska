import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Classroom from "./pages/Classroom";
import Courses from "./pages/Courses";
import Achievements from "./pages/Achievements";
import CourseCompletion from "./pages/CourseCompletion";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Subscription from "./pages/Subscription";
import Login from "./pages/Login"; // <--- Import Login
import { ThemeProvider } from "./context/ThemeContext";
import { AuthGuard } from "./components/AuthGuard";
import CourseEnrollment from "./pages/CourseEnrollment";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="flex min-h-screen bg-background text-text font-sans transition-colors duration-300">
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <>
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto">
                      <Dashboard />
                    </main>
                  </>
                </AuthGuard>
              }
            />

            <Route
              path="/courses"
              element={
                <AuthGuard>
                  <>
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto">
                      <Courses />
                    </main>
                  </>
                </AuthGuard>
              }
            />

            <Route
              path="/enroll/:id"
              element={
                <AuthGuard>
                  <CourseEnrollment />
                </AuthGuard>
              }
            />

            <Route
              path="/achievements"
              element={
                <AuthGuard>
                  <>
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto">
                      <Achievements />
                    </main>
                  </>
                </AuthGuard>
              }
            />

            <Route
              path="/profile"
              element={
                <AuthGuard>
                  <>
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto">
                      <Profile />
                    </main>
                  </>
                </AuthGuard>
              }
            />

            <Route
              path="/edit-profile"
              element={
                <AuthGuard>
                  <>
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto">
                      <EditProfile />
                    </main>
                  </>
                </AuthGuard>
              }
            />

            <Route
              path="/subscription"
              element={
                <AuthGuard>
                  <>
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto">
                      <Subscription />
                    </main>
                  </>
                </AuthGuard>
              }
            />

            {/* Full Screen Pages (Protected) */}
            <Route 
              path="/classroom/:id" 
              element={
                <AuthGuard>
                  <Classroom />
                </AuthGuard>
              } 
            />

            <Route 
              path="/completion/:id" 
              element={
                <AuthGuard>
                  <CourseCompletion />
                </AuthGuard>
              } 
            />

            {/* Fallback */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;