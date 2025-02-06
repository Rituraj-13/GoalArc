import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Search,
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Settings,
  HelpCircle,
  Moon,
  SidebarClose,
  Sun,
  ChevronRight,
} from "lucide-react";
import { useTheme } from './ThemeProvider';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ className }) => {
  const { 
    isDark, 
    setIsDark, 
    isCollapsed, 
    setIsCollapsed,
  } = useTheme();
  
  const navigate = useNavigate();
  const location = useLocation();

  const isActivePath = (path) => location.pathname === path;

  return (
    <div 
      className={cn(
        "pb-12 min-h-screen transition-all duration-300", 
        isCollapsed ? "w-20" : "w-60", 
        className
      )}
    >
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className={cn(
            "mb-6 px-4 text-lg font-semibold transition-all duration-300",
            isCollapsed && "text-center px-0 text-sm"
          )}>
            {isCollapsed ? "DA" : "Datewise"}
          </h2>
          <div className="space-y-1">
            {/* Search */}
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => navigate('/search')}
            >
              <Search className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Search</span>}
            </Button>
            
            {/* Overview */}
            <Button 
              variant={isActivePath('/overview') ? "secondary" : "ghost"}
              className="w-full justify-start" 
              onClick={() => navigate('/overview')}
            >
              <LayoutDashboard className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Overview</span>}
            </Button>
            
            {/* Calendar */}
            <Button 
              variant={isActivePath('/calendar') ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => navigate('/calendar')}
            >
              <Calendar className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Calendar</span>}
            </Button>
            
            {/* To do list */}
            <Button 
              variant={isActivePath('/todos') ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => navigate('/todos')}
            >
              <CheckSquare className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">To do list</span>}
            </Button>
          </div>
        </div>
        
        <div className="px-3 py-2">
          <div className="space-y-1">
            {/* Dark mode */}
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => setIsDark(!isDark)}
            >
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
            </Button>
            
            {/* Collapsed */}
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <SidebarClose className="h-4 w-4" />
              )}
              {!isCollapsed && <span className="ml-2">Collapse</span>}
            </Button>
          </div>
        </div>
        
        <div className="px-3 py-2">
          <div className="space-y-1">
            {/* Settings */}
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Settings</span>}
            </Button>
            
            {/* Help center */}
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => navigate('/help')}
            >
              <HelpCircle className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Help center</span>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 