import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Play, Pause, RotateCcw, Settings as SettingsIcon, BellOff } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import axios from 'axios';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import PomodoroSettings from './PomodoroSettings';
import { usePomodoro } from '../contexts/PomodoroContext';

const PomodoroTimer = () => {
  const {
    settings,
    timeLeft,
    setTimeLeft,
    isActive,
    setIsActive,
    currentSession,
    setCurrentSession,
    selectedTodo,
    isPlaying,
    stopNotification,
    fetchTaskCompletedSessions
  } = usePomodoro();
  const { isDark } = useTheme();
  const [notificationInterval, setNotificationInterval] = useState(null);
  const [taskCompletedSessions, setTaskCompletedSessions] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    const totalSeconds = currentSession === 'work'
      ? settings.workDuration * 60
      : currentSession === 'longBreak'
        ? (settings.longBreakDuration || settings.shortBreakDuration) * 60
        : settings.shortBreakDuration * 60;

    // Always ensure totalSeconds is at least 1
    const safeTotalSeconds = Math.max(1, totalSeconds);

    // Calculate progress ensuring it's between 0 and 100
    const progress = ((safeTotalSeconds - timeLeft) / safeTotalSeconds) * 100;
    return Math.min(Math.max(0, progress), 100);
  };

  useEffect(() => {
    const updateTaskSessions = async () => {
      if (selectedTodo && !isActive) {
        const count = await fetchTaskCompletedSessions(selectedTodo._id);
        setTaskCompletedSessions(count);
      }
    };
    updateTaskSessions();
  }, [selectedTodo, fetchTaskCompletedSessions, isActive]);

  // Add function to trigger stats update
  const triggerStatsUpdate = () => {
    window.dispatchEvent(new Event('pomodoroSessionCompleted'));
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
    stopNotification();
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-8">
      {/* Timer Display */}
      <div className="relative">
        <svg className="w-64 h-64">
          <circle
            className="text-gray-200"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="120"
            cx="128"
            cy="128"
          />
          <circle
            className={cn(
              "transform -rotate-90 origin-center transition-all",
              isDark ? "text-primary" : "text-blue-600"
            )}
            strokeWidth="8"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - (calculateProgress() || 0) / 100)}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="120"
            cx="128"
            cy="128"
          />
        </svg>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-4xl font-bold">{formatTime(timeLeft)}</div>
          <div className="text-sm text-muted-foreground capitalize">
            {currentSession.replace(/([A-Z])/g, ' $1').trim()}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex space-x-4">
        <Button
          variant={isActive ? "outline" : "default"}
          size="icon"
          onClick={() => setIsActive(!isActive)}
        >
          {isActive ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setIsActive(false);
            setTimeLeft(settings.workDuration * 60);
            setCurrentSession('work');
            stopNotification();
            triggerStatsUpdate();
          }}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)}>
              <SettingsIcon className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="mb-2">Timer Settings</SheetTitle>
            </SheetHeader>
            <PomodoroSettings onClose={handleCloseSettings} />
          </SheetContent>
        </Sheet>

        {isPlaying && (
          <Button
            variant="destructive"
            size="icon"
            onClick={stopNotification}
            className="animate-pulse"
          >
            <BellOff className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Only show Sessions Counter when a task is selected
      {selectedTodo && (
        <div className="text-sm text-muted-foreground">
          Completed Sessions: {taskCompletedSessions} / {settings.sessionsUntilLongBreak}
        </div>
      )} */}

      {/* Selected Todo */}
      {/* {selectedTodo && (
        <div className={cn(
          "w-full p-4 rounded-lg",
          isDark ? "bg-card" : "bg-white border"
        )}>
          <h3 className="font-medium">Current Task</h3>
          <p className="text-sm text-muted-foreground">{selectedTodo.title}</p>
        </div>
      )} */}
    </div>
  );
};

export default PomodoroTimer; 