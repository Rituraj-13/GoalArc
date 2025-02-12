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
  Timer
} from "lucide-react";
import { useTheme } from './ThemeProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

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

  return (
    <div
      className={cn(
        "border-r border-border bg-card transition-all duration-200 ease-in-out",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
      <div className="space-y-4 py-4">
        {/* Logo and Collapse Section */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className={cn(
              "font-bold transition-all duration-300",
              isDark ? "text-purple-300" : "text-blue-600",
              isCollapsed ? "text-sm ml-1" : "text-xl px-4"
            )}>
              {isCollapsed ? "GA" : "GoalArc"}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 mr-1",
                isDark
                  ? "hover:bg-gray-800 text-gray-300"
                  : "hover:bg-gray-100 text-gray-600"
              )}
            // onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {/* {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <SidebarClose className="h-5 w-5" />
              )} */}
            </Button>
          </div>

          <div className="space-y-1">
            {/* Menu Items */}
            {[
              { path: '/overview', icon: LayoutDashboard, label: 'Overview' },
              { path: '/calendar', icon: Calendar, label: 'Calendar' },
              { path: '/todos', icon: CheckSquare, label: 'My Tasks' },
              { path: '/pomodoro', icon: Timer, label: 'Pomodoro' },
              { path: '/streaks', icon: Flame, label: 'Streaks' },
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

        {/* Dark Mode Toggle */}
        <div className="px-3 py-2">
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

        {/* Bottom Section */}
        <div className="px-3 py-2">
          <div className="space-y-1">
            {/* Settings and Help */}
            {[
              { path: '/settings', icon: Settings, label: 'Settings' },
              { path: '/help', icon: HelpCircle, label: 'Help center' },
            ].map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  isCollapsed ? "px-0" : "",
                  isDark
                    ? "text-gray-400 hover:bg-gray-800 hover:text-purple-300"
                    : "text-gray-600 hover:bg-gray-100"
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
    </div>
  );
};

export default Sidebar; 