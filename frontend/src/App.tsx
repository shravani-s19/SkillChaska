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
import { ThemeProvider } from "./context/ThemeContext";
import { AuthGuard } from "./components/AuthGuard";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthGuard>
          <div className="flex min-h-screen bg-background text-text font-sans transition-colors duration-300">
            <Routes>
              {/* Layout with Sidebar */}
              <Route
                path="/dashboard"
                element={
                  <>
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto">
                      <Dashboard />
                    </main>
                  </>
                }
              />

              <Route
                path="/courses"
                element={
                  <>
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto">
                      <Courses />
                    </main>
                  </>
                }
              />

              <Route
                path="/achievements"
                element={
                  <>
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto">
                      <Achievements />
                    </main>
                  </>
                }
              />

              <Route
                path="/profile"
                element={
                  <>
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto">
                      <Profile />
                    </main>
                  </>
                }
              />

              <Route
                path="/edit-profile"
                element={
                  <>
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto">
                      <EditProfile />
                    </main>
                  </>
                }
              />

              <Route
                path="/subscription"
                element={
                  <>
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto">
                      <Subscription />
                    </main>
                  </>
                }
              />

              {/* Full Screen Classroom */}
              <Route path="/classroom/:id" element={<Classroom />} />

              {/* Course Completion */}
              <Route path="/completion/:id" element={<CourseCompletion />} />

              {/* Fallback */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </AuthGuard>
      </Router>
    </ThemeProvider>
  );
}

export default App;
