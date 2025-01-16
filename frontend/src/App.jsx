import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import AuthForm from './components/Auth'
import TodoInterface from './components/TodoInterface'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('todoToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Add handleLogout function
  const handleLogout = () => {
    localStorage.removeItem('todoToken');
    setIsAuthenticated(false);
  };

  return (
    <>
      {!isAuthenticated ? (
        <AuthForm setIsAuthenticated={setIsAuthenticated} />
      ) : (
        <div>
          <button 
            onClick={handleLogout}
            className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Logout
          </button>
          <TodoInterface />
        </div>
      )}
    </>
  )
}