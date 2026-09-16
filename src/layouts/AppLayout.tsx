import { useState, useEffect, useCallback } from "react";
import {
  Outlet,
  NavLink,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  Mail,
  Send,
  Search,
  Bell,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { Logo } from "@/components/Logo";
import { Avatar } from "@/components/Avatar";
import { RootState } from "@/store/store";
import { logout as logoutAction } from "@/store/slices/authSlice";
import { logoutApi } from "@/api/auth.api";
import { getUserProfile } from "@/api/user.api";
import { cn } from "@/utils";

const navItems = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/messages", label: "Inbox", icon: Mail },
  { to: "/sent-messages", label: "Sent Messages", icon: Send },
  { to: "/search", label: "Search", icon: Search },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
];

// Define the context type so pages know what they are receiving
export type LayoutContextType = {
  setMobileOpen: (open: boolean) => void;
};

export function AppLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken } = useSelector((state: RootState) => state.auth);

  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
    enabled: !!accessToken,
  });

  const handleLogout = useCallback(async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      dispatch(logoutAction());
      toast.success("Logged out successfully");
      navigate("/login");
    }
  }, [dispatch, navigate]);

  if (!accessToken) return null;

  return (
    <div className="flex min-h-screen bg-paper-100">
      {/* ========================================= */}
      {/* MOBILE DRAWER MODAL (Animated Slide-in)   */}
      {/* ========================================= */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            {/* Dark background with heavy Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-ink-900/50 backdrop-blur-md"
            />
            {/* Sidebar Slide-in Content */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute left-0 top-0 bottom-0 w-[280px] bg-paper-50 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-ink-100">
                <Logo size="sm" to="/dashboard" />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 bg-ink-100 rounded-xl text-ink-600 hover:bg-ink-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-medium transition-all",
                        isActive
                          ? "bg-ink-900 text-paper-50"
                          : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
                      )
                    }
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="p-4 border-t border-ink-100 bg-paper-100">
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl p-3 hover:bg-ink-100 transition-colors"
                >
                  <Avatar
                    name={user?.displayName || "User"}
                    seed={user?.userName || "anon"}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-ink-800 truncate">
                      {user?.displayName || "Loading..."}
                    </div>
                    <div className="text-sm text-ink-400 truncate">
                      @{user?.userName || "user"}
                    </div>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[15px] font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  <LogOut className="h-5 w-5" /> Log out
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================= */}
      {/* DESKTOP SIDEBAR (Hidden on mobile) */}
      {/* ========================================= */}
      <aside className="fixed left-0 top-0 bottom-0 hidden md:flex md:w-64 lg:w-80 flex-col border-r border-ink-100 bg-paper-50/80 backdrop-blur z-30">
        <div className="p-6">
          <Logo size="lg" to="/dashboard" />
        </div>
        <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-medium transition-all",
                  isActive
                    ? "bg-ink-900 text-paper-50"
                    : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-ink-100">
          <Link
            to="/profile"
            className="flex items-center gap-3 rounded-xl p-3 hover:bg-ink-100 transition-colors"
          >
            <Avatar
              name={user?.displayName || "User"}
              seed={user?.userName || "anon"}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-ink-800 truncate">
                {user?.displayName || "Loading..."}
              </div>
              <div className="text-sm text-ink-400 truncate">
                @{user?.userName || "user"}
              </div>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium text-ink-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="h-5 w-5" /> Log out
          </button>
        </div>
      </aside>

      {/* ========================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================= */}
      <main className="flex-1 flex flex-col min-h-screen md:ml-64 lg:ml-80">
        <Outlet context={{ setMobileOpen } satisfies LayoutContextType} />
      </main>
    </div>
  );
}
