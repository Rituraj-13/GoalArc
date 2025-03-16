import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import AuthForm from './components/Auth'
import TodoInterface from './components/TodoInterface'
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import { ThemeProvider } from './components/ThemeProvider'
import StreaksPage from './components/StreaksPage'
import Settings from './components/Settings'
import PomodoroPage from './components/PomodoroPage'
import { PomodoroProvider } from './contexts/PomodoroContext'
import CalendarPage from './components/CalendarPage'
import ProtectedRoute from './components/ProtectedRoute'
import { Toaster } from 'react-hot-toast'
import Dashboard from './components/Dashboard'
import Leaderboard from './components/Leaderboard'

export default function App({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('todoToken');
    if (token) {
      // Validate token by making a request to protected endpoint
      // axios.get('http://localhost:3000/todos', {
      axios.get('https://goalarcservices.riturajdey.com/todos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(() => {
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem('todoToken');
          setIsAuthenticated(false);
        });
    }
  }, []);

  return (
    <ThemeProvider>
      <PomodoroProvider>
        <BrowserRouter>
          <Toaster position="bottom-right" />
          <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route path="/leaderboard"
              element={
                isAuthenticated ?
                  <Leaderboard setIsAuthenticated={setIsAuthenticated} /> :
                  <Navigate to="/auth" />
              }
            />

            <Route path="/overview" element={
              isAuthenticated ?
                <Dashboard /> :
                <Navigate to="/auth" />
            } />

            <Route path="/auth" element={
              isAuthenticated ?
                <Navigate to="/todos" /> :
                <AuthForm setIsAuthenticated={setIsAuthenticated} />
            } />

            <Route path="/todos" element={
              isAuthenticated ?
                <TodoInterface setIsAuthenticated={setIsAuthenticated} /> :
                <Navigate to="/auth" />
            } />

            <Route path="/streaks" element={
              isAuthenticated ?
                <StreaksPage setIsAuthenticated={setIsAuthenticated} /> :
                <Navigate to="/auth" />
            } />

            <Route path="/pomodoro" element={
              isAuthenticated ?
                <PomodoroPage setIsAuthenticated={setIsAuthenticated} /> :
                <Navigate to="/auth" />
            } />

            <Route path="/settings" element={<Settings setIsAuthenticated={setIsAuthenticated} />} />

            <Route
              path="/calendar"
              element={
                isAuthenticated ?
                  <CalendarPage setIsAuthenticated={setIsAuthenticated} /> :
                  <Navigate to="/auth" />
              }
            />
          </Routes>
        </BrowserRouter>
      </PomodoroProvider>
    </ThemeProvider>
  )
}