import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Video, LogOut, UserCircle, Menu } from 'lucide-react'; // Changed Settings to UserCircle

const InstructorLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  
  // UPDATED: Replaced Settings with Profile
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/instructor/dashboard' },
    { name: 'My Courses', icon: Video, path: '/instructor/courses' },
    { name: 'Profile', icon: UserCircle, path: '/instructor/profile' },
  ];

  return (
    <div className="flex h-screen bg-background text-text font-sans overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-surface border-r border-border flex flex-col transition-all duration-300 relative z-20`}
      >
        <div className="p-6 flex items-center gap-3 border-b border-border h-20">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          {isSidebarOpen && (
            <div className="animate-fade-in">
              <h1 className="font-bold text-lg tracking-tight text-text">SkillChaska</h1>
              <p className="text-[10px] uppercase tracking-wider text-textSecondary font-semibold">Instructor</p>
            </div>
          )}
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path); // Use startsWith for better matching
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-textSecondary hover:bg-background hover:text-text'
                  }`}
              >
                <item.icon size={22} className={isActive ? 'opacity-100' : 'opacity-70'} />
                {isSidebarOpen && <span>{item.name}</span>}
                
                {/* Tooltip */}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-surface border border-border text-text text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button className={`flex items-center gap-3 px-3 py-3 w-full rounded-xl text-error hover:bg-error/10 transition-colors ${!isSidebarOpen && 'justify-center'}`}>
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-surface border-b border-border flex items-center justify-between px-8">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-background rounded-lg text-textSecondary">
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-text">Jane Doe</p>
                    <p className="text-xs text-textSecondary">Senior Instructor</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-secondary border border-border shadow-sm overflow-hidden">
                    <img src="https://i.pravatar.cc/150?img=32" alt="Instructor Avatar" className="w-full h-full object-cover" />
                </div>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InstructorLayout;