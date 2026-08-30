import { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Mail, Search, Bell, Settings, LogOut, Menu, X, User as UserIcon } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Avatar } from '@/components/Avatar';
import { useAuth } from '@/context/AuthContext';
import { mockApi } from '@/services/mockApi';
import { cn } from '@/utils';

const navItems = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/messages', label: 'Messages', icon: Mail },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function AppLayout() {
  const { user, status, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    mockApi.getUnreadNotificationCount().then(setUnreadCount).catch(() => {});
  }, [location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  if (status === 'idle') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper-100">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-ink-200 border-t-ember-500" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-paper-100">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 hidden md:flex w-64 flex-col border-r border-ink-100 bg-paper-50/80 backdrop-blur z-30">
        <div className="p-5">
          <Logo size="md" to="/dashboard" />
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive ? 'bg-ink-900 text-paper-50' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
              {item.label === 'Notifications' && unreadCount > 0 && (
                <span className="ml-auto chip bg-ember-500 text-white text-[10px] px-2 py-0.5">{unreadCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-ink-100">
          <Link
            to="/profile"
            className="flex items-center gap-3 rounded-xl p-2 hover:bg-ink-100 transition-colors"
          >
            <Avatar name={user.displayName} seed={user.avatarSeed} size="sm" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-ink-800 truncate">{user.displayName}</div>
              <div className="text-xs text-ink-400 truncate">@{user.username}</div>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition-all"
          >
            <LogOut className="h-5 w-5" /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 glass border-b border-ink-100">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo size="sm" to="/dashboard" />
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -mr-2 text-ink-700 hover:text-ink-900"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-paper-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-ink-100">
                <Logo size="sm" to={null} />
                <button onClick={() => setMobileOpen(false)} className="text-ink-500" aria-label="Close menu">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 p-3 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all',
                        isActive ? 'bg-ink-900 text-paper-50' : 'text-ink-600 hover:bg-ink-100'
                      )
                    }
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                    {item.label === 'Notifications' && unreadCount > 0 && (
                      <span className="ml-auto chip bg-ember-500 text-white text-[10px] px-2 py-0.5">{unreadCount}</span>
                    )}
                  </NavLink>
                ))}
              </nav>

              <div className="p-3 border-t border-ink-100 space-y-1">
                <Link to="/profile" className="flex items-center gap-3 rounded-xl p-2 hover:bg-ink-100 transition-colors">
                  <Avatar name={user.displayName} seed={user.avatarSeed} size="sm" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink-800 truncate">{user.displayName}</div>
                    <div className="text-xs text-ink-400 truncate">@{user.username}</div>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-ink-500 hover:bg-ink-100 transition-all"
                >
                  <LogOut className="h-5 w-5" /> Log out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom nav for mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass border-t border-ink-100">
        <div className="flex items-center justify-around px-2 py-1.5">
          {navItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all',
                  isActive ? 'text-ember-600' : 'text-ink-400'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
              {item.label === 'Notifications' && unreadCount > 0 && (
                <span className="absolute top-0 right-1/4 h-2 w-2 rounded-full bg-ember-500" />
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main className="md:ml-64 pb-16 md:pb-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
