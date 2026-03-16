import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const PomodoroContext = createContext();

export const PomodoroProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    notifications: true,
    soundEnabled: true
  });
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [currentSession, setCurrentSession] = useState('work');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [taskCompletedSessions, setTaskCompletedSessions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const timerRef = useRef(null);
  const audioRef = useRef(new Audio('/notification.mp3'));
  const [isPlaying, setIsPlaying] = useState(false);
  const isHandlingSession = useRef(false);

  const fetchTaskCompletedSessions = async (todoId) => {
    if (!todoId) return 0;

    try {
      const token = localStorage.getItem('todoToken');
      const response = await axios.get('https://goalarcservices.riturajdey.com/pomodoro/sessions/count', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: {
          todoId: todoId,
          type: 'work',
          completed: true
        }
      });
      return response.data.count;
    } catch (error) {
      console.error('Failed to fetch task completed sessions:', error);
      return 0;
    }
  };

  const fetchCompletedSessions = async () => {
    try {
      const token = localStorage.getItem('todoToken');
      const response = await axios.get('https://goalarcservices.riturajdey.com/pomodoro/sessions/count', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: {
          type: 'work',
          completed: true
        }
      });
      setCompletedSessions(response.data.count);
    } catch (error) {
      console.error('Failed to fetch completed sessions:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('todoToken');
      const response = await axios.get('https://goalarcservices.riturajdey.com/pomodoro/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSettings(response.data);
      if (timeLeft === 25 * 60) {
        setTimeLeft(response.data.workDuration * 60);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if (settings?.notifications && "Notification" in window) {
      await Notification.requestPermission();
    }
  };

  const stopNotification = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  useEffect(() => {
    const initializePomodoro = async () => {
      await fetchSettings();
      await fetchCompletedSessions();
      await requestNotificationPermission();
    };

    initializePomodoro();
    audioRef.current.loop = true;

    return () => {
      stopNotification();
      audioRef.current.loop = false;
    };
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isHandlingSession.current) {
      handleSessionComplete();
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const handleSessionComplete = async () => {
    if (isHandlingSession.current) return;
    isHandlingSession.current = true;

    clearInterval(timerRef.current);
    setIsActive(false);

    if (settings.soundEnabled) {
      audioRef.current.play().catch(error => {
        console.error('Failed to play notification:', error);
      });
      setIsPlaying(true);

      if (settings.notifications && "Notification" in window) {
        const notification = new Notification("Pomodoro Timer", {
          body: `${currentSession === 'work' ? 'Work session' : 'Break'} completed!\nClick to stop notification`,
          requireInteraction: true,
        });

        notification.onclick = () => {
          stopNotification();
          notification.close();
        };
      }
    }

    try {
      const token = localStorage.getItem('todoToken');
      const sessionData = {
        todoId: selectedTodo?._id,
        type: currentSession,
        duration: currentSession === 'work'
          ? settings.workDuration
          : settings.shortBreakDuration,
        completed: true,
        endTime: new Date()
      };

      await axios.post('https://goalarcservices.riturajdey.com/pomodoro/sessions', sessionData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (currentSession === 'work' && selectedTodo) {
        setTaskCompletedSessions(prev => prev + 1);
      }

      if (currentSession === 'work') {
        setCurrentSession('shortBreak');
        setTimeLeft(settings.shortBreakDuration * 60);

        if (settings.autoStartBreaks) {
          setIsActive(true);
        }
      } else {
        setCurrentSession('work');
        setTimeLeft(settings.workDuration * 60);

        if (settings.autoStartPomodoros) {
          setIsActive(true);
        }
      }

      window.dispatchEvent(new Event('pomodoroSessionCompleted'));

    } catch (error) {
      console.error('Failed to handle session completion:', error);
      toast.error('Failed to save session');
    } finally {
      setTimeout(() => {
        isHandlingSession.current = false;
      }, 1000);
    }
  };

  if (isLoading) {
    return null;
  }

  const value = {
    settings,
    setSettings,
    timeLeft,
    setTimeLeft,
    isActive,
    setIsActive,
    currentSession,
    setCurrentSession,
    selectedTodo,
    setSelectedTodo,
    isPlaying,
    stopNotification,
    handleSessionComplete,
    fetchTaskCompletedSessions,
    taskCompletedSessions,
    setTaskCompletedSessions,
    fetchSettings,
    isLoading
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
}; 