import React from 'react';
import NavBar from '../Header/NavBar';
import Header from '../Header/Header';

const ServicePage = () => {
    return (
        <div className='flex flex-col min-h-screen w-full'>
            <div className='h-16 w-full'> {/* Adjust header height responsively */}
                <Header />
            </div>
            <div className='flex flex-1 overflow-hidden'>
                <nav className='w-64 flex-shrink-0 bg-white p-4 lg:fixed lg:h-full'> {/* Sidebar width and positioning */}
                    <a className='text-lg lg:text-3xl font-bold flex items-center justify-center my-4' href='/services'>
                        Services
                    </a>
                    <ul className='flex flex-col gap-4 text-lg'>
                        <li className='flex items-center'>
                            <img
                                className='w-12 h-12 mr-4' // Adjust image size responsively
                                src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjrpsryruSpqhLVKB0kYYFEFciwSXPkn-XDA&s'
                                alt='Service 1'
                            />
                            <a className='hover:text-blue-500' href='#services'>
                                HealthMentá.ai
                            </a>
                        </li>
                        <li className='flex items-center'>
                            <img
                                className='w-12 h-12 mr-4' // Adjust image size responsively
                                src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjrpsryruSpqhLVKB0kYYFEFciwSXPkn-XDA&s'
                                alt='Service 2'
                            />
                            <a className='hover:text-blue-500' href='#services'>
                                Prescription Manager
                            </a>
                        </li>
                        <li className='flex items-center'>
                            <img
                                className='w-12 h-12 mr-4' // Adjust image size responsively
                                src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjrpsryruSpqhLVKB0kYYFEFciwSXPkn-XDA&s'
                                alt='Service 3'
                            />
                            <a className='hover:text-blue-500' href='#services'>
                                Health Centers
                            </a>
                        </li>
                    </ul>
                </nav>
                <div className='flex-1 bg-gray-200 p-4'> {/* Main content area */}
                    {/* Main content on the left side of the sidebar */}
                </div>
            </div>
        </div>
    );
};

export default ServicePage;
