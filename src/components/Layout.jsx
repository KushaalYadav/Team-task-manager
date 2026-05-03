import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

export default function Layout() {
  const { currentUser, userRole, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'My Tasks', path: '/tasks', icon: CheckSquare },
  ];

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <h1 className="text-xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold">T</span>
          TeamTask
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-primary-50 text-primary-700 font-medium" 
                  : "text-[var(--color-text-muted)] hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon size={20} className={isActive ? "text-primary-600" : ""} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
          <p className="text-sm font-medium text-[var(--color-text-main)] truncate">{currentUser?.displayName || 'User'}</p>
          <p className="text-xs text-[var(--color-text-muted)] truncate">{currentUser?.email}</p>
          <div className="mt-2 inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-md font-medium capitalize">
            {userRole}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 hover:bg-red-50 w-full px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[var(--color-bg-base)] overflow-hidden font-sans">
      {/* Mobile menu button */}
      <div className="lg:hidden absolute top-4 left-4 z-50">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col glass-panel border-r border-gray-200 z-10 relative shadow-sm">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile */}
      <div className={clsx(
        "lg:hidden fixed inset-0 z-40 transition-opacity duration-300",
        mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
        <aside className={clsx(
          "absolute top-0 left-0 bottom-0 w-64 bg-white flex flex-col shadow-xl transition-transform duration-300",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <SidebarContent />
        </aside>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="p-8 lg:p-10 max-w-6xl mx-auto mt-12 lg:mt-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
