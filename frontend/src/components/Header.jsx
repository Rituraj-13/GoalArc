import React, { useState } from 'react'
import { useLocation, useNavigate } from "react-router-dom";
import { GithubIcon } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import currStreak from '../assets/currStreak.svg';
import bestStreak from '../assets/bestStreak.svg';
import bestStreakk from '../assets/bestStreakk.svg';

function Header({ setIsAuthenticated, currentStreakData, bestStreakData }) {
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
        <header className='bg-gradient-to-r from-blue-600 to-blue-900 text-white p-2 shadow-md'>
            <div className='container mx-auto flex justify-between items-center'>
                <Toaster position="bottom-right" />
                {/* <h1 className='text-2xl font-bold text-blue-50'>
                    <a href="/">GoalArc</a>
                </h1> */}
                <h1 className='text-xl md:text-xl lg:text-2xl font-bold text-blue-50 hover:text-blue-200 transition-colors'>
                    <a href="/">GoalArc</a>
                </h1>

                <div className='flex items-center gap-4 '>
                    {/* <a
                        href='https://github.com/Rituraj-13'
                        className='hover:text-blue-200 transition-colors duration-200 flex gap-2'
                        target='_blank'
                        rel="noreferrer"
                    >
                        Github
                        <span>
                            <GithubIcon />
                        </span>
                    </a> */}

                    {location.pathname === '/todos' && (
                        <>
                            {/* <div className="bg-white rounded-lg shadow-md p-4 mb-6"> */}
                            <div className="flex justify-around items-center gap-10 mr-10">
                                <div className="flex flex-col items-center">
                                    <div className="relative">
                                        <img
                                            src={currStreak || "/placeholder.svg"}
                                            alt="Current Streak"
                                            className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 hover:scale-110 transition-transform mb-2"
                                        />
                                        {/* <p className="absolute left-14 bottom-4 -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-blue-600 z-20 "> */}
                                        <p className="absolute left-11 bottom-1 md:left-14 md:bottom-3 lg:left-15 lg:bottom-4 -translate-x-1/2 -translate-y-1/2 text-lg md:text-xl lg:text-xl font-bold text-white z-20"
                                        >
                                            {currentStreakData}
                                        </p>
                                    </div>
                                    {/* <p className="text-sm text-white">Current Streak</p> */}
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="relative">
                                        {/* <img src={bestStreakk || "/placeholder.svg"} alt="Best Streak" className="w-12 h-14  hover:scale-110 transition-transform" /> */}
                                        <img
                                            src={bestStreakk || "/placeholder.svg"}
                                            alt="Current Streak"
                                            className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-14 hover:scale-110 transition-transform "
                                        />
                                        {/* <p className="absolute left-16 bottom-4 -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-blue-600 z-20"> */}
                                        <p className="absolute left-12 bottom-0 md:left-14 md:bottom-2 lg:left-16 lg:bottom-4 -translate-x-1/2 -translate-y-1/2 text-lg md:text-xl lg:text-xl font-bold text-white z-20"
                                        >
                                            {bestStreakData}
                                        </p>
                                    </div>
                                    {/* <p className="text-sm text-white">Best Streak</p> */}
                                </div>
                            </div>
                            {/* </div> */}
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-all duration-300 ease-in-out hover:bg-red-500 font-semibold"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;