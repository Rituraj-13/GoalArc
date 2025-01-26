import React, { useState } from 'react'
import { useLocation, useNavigate } from "react-router-dom";
import { GithubIcon } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

function Header({ setIsAuthenticated }) {
    const location = useLocation();
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('todoToken');
        setIsAuthenticated(false);
        navigate('/');
        toast.success("Successfully logged out !", {
            duration: 4000
        })

    };
    return (
        <header className='bg-gradient-to-r from-blue-600 to-blue-900 text-white p-4 shadow-md'>
            <div className='container mx-auto flex justify-between items-center'>
                <Toaster position="bottom-right" />
                <h1 className='text-2xl font-bold text-blue-50'>
                    <a href="/">GoalArc</a>
                </h1>

                <div className='flex items-center gap-4 '>
                    <a
                        href='https://github.com/Rituraj-13'
                        className='hover:text-blue-200 transition-colors duration-200 flex gap-2'
                        target='_blank'
                        rel="noreferrer"
                    >
                        Github
                        <span>
                            <GithubIcon />
                        </span>
                    </a>

                    {location.pathname === '/todos' && (
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-all 
                                     duration-300 ease-in-out hover:bg-red-500 font-semibold"
                        >
                            Logout
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;