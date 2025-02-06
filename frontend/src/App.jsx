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

export default function App({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('todoToken');
    if (token) {
      // Validate token by making a request to protected endpoint
      axios.get('http://localhost:3000/todos', {
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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />

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
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}