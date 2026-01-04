// File: src/App.tsx
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
import Login from "./pages/Login";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthGuard } from "./components/AuthGuard";
import CourseEnrollment from "./pages/CourseEnrollment";

function App() {
  return (
    <ThemeProvider>
      <Router>
        {/* Main Layout Container */}
        <div className="flex min-h-screen text-text font-sans selection:bg-secondary/30">
          <Routes>
            {/* Public Route (Login handles its own layout) */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes Layout */}
            <Route
              path="*"
              element={
                <AuthGuard>
                  <div className="flex w-full">
                    <Sidebar />
                    {/* 
                       The main content area needs to be a scrollable container 
                       that takes up the remaining width.
                    */}
                    <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden relative">
                       {/* 
                          We add a large gradient orb in the top-left of the dashboard area 
                          to give continuity from the login screen 
                       */}
                      <div className="fixed -top-40 -left-40 w-96 h-96 bg-secondary/10 blur-[100px] rounded-full pointer-events-none -z-10" />
                      
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/courses" element={<Courses />} />
                        <Route path="/enroll/:id" element={<CourseEnrollment />} />
                        <Route path="/achievements" element={<Achievements />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/edit-profile" element={<EditProfile />} />
                        <Route path="/subscription" element={<Subscription />} />
                        
                        {/* Full Screen Pages within the auth guard, but maybe different layout? 
                            For now, we keep them here. Classroom might need to hide sidebar later, 
                            but for this structure, it works.
                        */}
                        <Route path="/classroom/:id" element={<Classroom />} />
                        <Route path="/completion/:id" element={<CourseCompletion />} />

                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </main>
                  </div>
                </AuthGuard>
              }
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;