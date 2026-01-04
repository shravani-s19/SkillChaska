import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet
} from "react-router-dom";

// --- Components & Context ---
import { ThemeProvider } from "./context/ThemeContext";
import { AuthGuard } from "./components/AuthGuard";
import { Sidebar } from "./components/Sidebar";

// --- Public Pages ---
import Landing from "./pages/Landing";
import RoleSelection from "./pages/RoleSelection";
import Login from "./pages/Login"; // Student Login

// --- Student Portal Pages ---
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Classroom from "./pages/Classroom";
import Achievements from "./pages/Achievements";
import CourseCompletion from "./pages/CourseCompletion";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Subscription from "./pages/Subscription";
import CourseEnrollment from "./pages/CourseEnrollment";

// --- Instructor Portal Pages ---
import InstructorLogin from "./pages/instructor/InstructorLogin"; // Import the new login page
import InstructorLayout from "./layouts/InstructorLayout";
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import CourseManager from "./pages/instructor/CourseManager";
import CreateCourse from "./pages/instructor/CreateCourse";
import CourseDetail from "./pages/instructor/CourseDetail";
import ReviewStudio from "./pages/instructor/ReviewStudio";
import InstructorProfile from "./pages/instructor/InstructorProfile";


// --- ADMIN PAGES (New) ---
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";

/**
 * Layout wrapper for the Student Portal.
 * Applies the Sidebar and protects all nested routes with AuthGuard.
 */
const StudentLayout = () => {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-background text-text font-sans transition-colors duration-300">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet /> {/* Renders the nested student page */}
        </main>
      </div>
    </AuthGuard>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          
          {/* =========================================
              1. PUBLIC & AUTH ROUTES
             ========================================= */}
          <Route path="/" element={<Landing />} />
          <Route path="/get-started" element={<RoleSelection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/instructor/login" element={<InstructorLogin />} />
           <Route path="/admin" element={<AdminLogin />} />

         {/* =========================================
              2. ADMIN PORTAL (Own Layout, No AuthGuard for demo)
             ========================================= */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
          </Route>


          {/* =========================================
              2. INSTRUCTOR PORTAL (Protected Layout)
             ========================================= */}
          <Route path="/instructor" element={<InstructorLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<InstructorDashboard />} />
            <Route path="courses" element={<CourseManager />} />
            <Route path="create-course" element={<CreateCourse />} />
            <Route path="course/:courseId" element={<CourseDetail />} />
            <Route path="review/:courseId/:moduleId" element={<ReviewStudio />} />
            <Route path="profile" element={<InstructorProfile />} />
          </Route>

          {/* =========================================
              3. STUDENT PORTAL (Protected Layout with Sidebar)
             ========================================= */}
          <Route element={<StudentLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/subscription" element={<Subscription />} />
          </Route>

          {/* =========================================
              4. FULL-SCREEN STUDENT ROUTES (No Sidebar, Still Protected)
             ========================================= */}
          <Route 
            path="/classroom/:id" 
            element={<AuthGuard><Classroom /></AuthGuard>} 
          />
          <Route 
            path="/completion/:id" 
            element={<AuthGuard><CourseCompletion /></AuthGuard>} 
          />
           <Route
              path="/enroll/:id"
              element={<AuthGuard><CourseEnrollment /></AuthGuard>}
            />

          {/* =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=
              5. FALLBACK ROUTE
             ========================================= */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;