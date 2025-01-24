import React, { useState } from 'react'

function Header({ setIsAuthenticated }) {
    const handleLogout = () => {
        localStorage.removeItem('todoToken');
        setIsAuthenticated(false);
    };
    return (
        <>
            <header className='bg-gray-800 text-white p-4'>
                <div className='container mx-auto flex justify-between items-center'>
                    <h1 className='text-2xl font-bold'>ToDo AI</h1>
                    <nav className='flex items-center'>
                        <ul className='flex space-x-4 mr-20'>
                            <li><a href='/' className='hover:text-gray-300'>Home</a></li>
                            <li><a href='https://github.com/Rituraj-13' className='hover:text-gray-300' target='_blank'>Github</a></li>
                        </ul>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg transition-all duration-300 ease-in-out transform hover:bg-red-600 hover:scale-105"
                        >
                            Logout
                        </button>
                    </nav>
                </div>
            </header>
        </>
    )
}

export default Header