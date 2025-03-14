import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Settings,
  HelpCircle,
  Moon,
  SidebarClose,
  Sun,
  ChevronRight,
  LogOut,
  Flame,
  Timer,
  Menu,
  Medal
} from "lucide-react";
import { useTheme } from './ThemeProvider';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Sidebar = ({ className, setIsAuthenticated }) => {
  const {
    isDark,
    setIsDark,
    isCollapsed,
    setIsCollapsed,
  } = useTheme();

  const navigate = useNavigate();
  const location = useLocation();

  const isActivePath = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('todoToken');
    setIsAuthenticated(false);
    navigate('/');
    toast.success('Logged out', {
      duration: 2000
    });
  };

  // Extract sidebar content into a separate component for reuse
  const SidebarContent = ({ className }) => (
    <div className={cn(
      "h-full border-r border-border bg-card",
      className
    )}>
      <div className="space-y-4 py-4">
        {/* Logo and Collapse Section */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-6">
            <h2
              className={cn(
                "font-bold transition-all duration-300 cursor-pointer",
                isDark ? "text-purple-300" : "text-blue-600",
                isCollapsed ? "text-sm ml-1" : "text-xl px-4"
              )}
              onClick={() => navigate('/')}
            >
              {isCollapsed ? "GA" : "GoalArc"}
            </h2>

            {/* Collapse Button 👇 */}

            {/* <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 mr-1",
                isDark
                  ? "hover:bg-gray-800 text-gray-300"
                  : "hover:bg-gray-100 text-gray-600"
              )}
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <SidebarClose className="h-5 w-5" />
              )}
            </Button> */}
          </div>

          {/* Main Navigation Section */}
          <div className="space-y-1 mb-6 mt-12">
            {!isCollapsed && (
              <div className={cn(
                "px-4 mb-2 text-xs font-semibold",
                isDark ? "text-gray-500" : "text-gray-400"
              )}>
                Activities
              </div>
            )}

            {/* Primary Menu Items */}
            {[
              { path: '/todos', icon: CheckSquare, label: 'My Tasks' },
              { path: '/calendar', icon: Calendar, label: 'Calendar' },
              { path: '/pomodoro', icon: Timer, label: 'Pomodoro' },
            ].map((item) => (
              <Button
                key={item.path}
                variant={isActivePath(item.path) ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isCollapsed ? "px-0" : "",
                  isDark
                    ? `${isActivePath(item.path)
                      ? "bg-purple-900/50 text-purple-300 hover:bg-purple-900/70"
                      : "text-gray-400 hover:bg-gray-800 hover:text-purple-300"}`
                    : `${isActivePath(item.path)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"}`
                )}
                onClick={() => navigate(item.path)}
              >
                <div className={cn(
                  "flex items-center",
                  isCollapsed ? "justify-center w-full px-0" : "justify-start px-4"
                )}>
                  <item.icon className="h-4 w-4" />
                  {!isCollapsed && <span className="ml-2">{item.label}</span>}
                </div>
              </Button>
            ))}
          </div>

          {/* Progress & Analytics Section */}
          <div className="space-y-1 mb-6">
            {!isCollapsed && (
              <div className={cn(
                "px-4 mb-2 text-xs font-semibold",
                isDark ? "text-gray-500" : "text-gray-400"
              )}>
                Progress
              </div>
            )}

            {/* Analytics Menu Items */}
            {[
              { path: '/streaks', icon: Flame, label: 'Streaks' },
              { path: '/leaderboard', icon: Medal, label: 'Leaderboard' },
            ].map((item) => (
              <Button
                key={item.path}
                variant={isActivePath(item.path) ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isCollapsed ? "px-0" : "",
                  isDark
                    ? `${isActivePath(item.path)
                      ? "bg-purple-900/50 text-purple-300 hover:bg-purple-900/70"
                      : "text-gray-400 hover:bg-gray-800 hover:text-purple-300"}`
                    : `${isActivePath(item.path)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"}`
                )}
                onClick={() => navigate(item.path)}
              >
                <div className={cn(
                  "flex items-center",
                  isCollapsed ? "justify-center w-full px-0" : "justify-start px-4"
                )}>
                  <item.icon className="h-4 w-4" />
                  {!isCollapsed && <span className="ml-2">{item.label}</span>}
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Preferences Section */}
        <div className="px-3 py-2">
          {!isCollapsed && (
            <div className={cn(
              "px-4 mb-2 text-xs font-semibold",
              isDark ? "text-gray-500" : "text-gray-400"
            )}>
              Preferences
            </div>
          )}

          {/* Settings */}
          <div className="space-y-1 mb-2">
            <Button
              variant={isActivePath('/settings') ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                isCollapsed ? "px-0" : "",
                isDark
                  ? `${isActivePath('/settings')
                    ? "bg-purple-900/50 text-purple-300 hover:bg-purple-900/70"
                    : "text-gray-400 hover:bg-gray-800 hover:text-purple-300"}`
                  : `${isActivePath('/settings')
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"}`
              )}
              onClick={() => navigate('/settings')}
            >
              <div className={cn(
                "flex items-center",
                isCollapsed ? "justify-center w-full px-0" : "justify-start px-4"
              )}>
                <Settings className="h-4 w-4" />
                {!isCollapsed && <span className="ml-2">Settings</span>}
              </div>
            </Button>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              isCollapsed ? "px-0" : "",
              isDark
                ? "text-gray-400 hover:bg-gray-800 hover:text-purple-300"
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => setIsDark(!isDark)}
          >
            <div className={cn(
              "flex items-center",
              isCollapsed ? "justify-center w-full px-0" : "justify-start px-4"
            )}>
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {!isCollapsed && (
                <span className="ml-2">
                  {isDark ? "Light mode" : "Dark mode"}
                </span>
              )}
            </div>
          </Button>
        </div>

        {/* Account Section */}
        <div className="px-3 py-2 mt-auto">
          {!isCollapsed && (
            <div className={cn(
              "px-4 mb-2 text-xs font-semibold",
              isDark ? "text-gray-500" : "text-gray-400"
            )}>
              Account
            </div>
          )}

          {/* Logout button */}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              isCollapsed ? "px-0" : "",
              isDark
                ? "text-red-400 hover:bg-red-900/20 hover:text-red-300"
                : "text-red-600 hover:bg-red-50 hover:text-red-700"
            )}
            onClick={handleLogout}
          >
            <div className={cn(
              "flex items-center",
              isCollapsed ? "justify-center w-full px-0" : "justify-start px-4"
            )}>
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Logout</span>}
            </div>
          </Button>
        </div>
      </div>
    </div>
  );

  // Render different layouts for mobile and desktop
  return (
    <>
      {/* Mobile View */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden fixed top-4 left-4 z-50">
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px]">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop View */}
      <div className={cn(
        "hidden md:block transition-all duration-200 ease-in-out",
        isCollapsed ? "w-16" : "w-60"
      )}>
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar; 