import React from 'react';
import NavBar from '../Header/NavBar';
import Header from '../Header/Header';

const HomePage = () => {
    return (
        <div className='flex flex-col w-screen h-screen  '>
            <div className='h-[11%] w-full '>
                <Header />
            </div>
            <div className='h-[93%] w-full'>
                <div className='w-screen overflow-hidden h-screen flex bg-slate-200'>

                    <nav className='w-[25%] h-full bg-white flex flex-col p-4 fixed'>
                        <a
                            className='lg:text-3xl sm:text-2xl font-bold flex items-center justify-center mt-[15%] p-2'
                            href='/services'
                        >
                            Services
                        </a>

                        <ul className='flex flex-col gap-8 text-2xl mt-9'>

                            <li className='flex items-center w-[90%]'>
                                <img
                                    className='object-contain w-[20%] h-[60px] mr-4'
                                    src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjrpsryruSpqhLVKB0kYYFEFciwSXPkn-XDA&s'
                                    alt='Service 1'
                                />
                                <a className='p-1 text-base lg:text-xl' href='#services'>
                                    HealthMentá.ai
                                </a>
                            </li>


                            <li className='flex items-center w-[90%]'>
                                <img
                                    className='object-contain w-[20%] h-[60px] mr-4'
                                    src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjrpsryruSpqhLVKB0kYYFEFciwSXPkn-XDA&s'
                                    alt='Service 2'
                                />
                                <a className='p-1 text-base lg:text-xl' href='#services'>
                                    Prescription Manager
                                </a>
                            </li>


                            <li className='flex items-center w-[90%]'>
                                <img
                                    className='object-contain w-[20%] h-[60px] mr-4'
                                    src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjrpsryruSpqhLVKB0kYYFEFciwSXPkn-XDA&s'
                                    alt='Service 3'
                                />
                                <a className='p-1 text-base lg:text-xl' href='#services'>
                                    Health Centers
                                </a>
                            </li>
                        </ul>
                    </nav>

                    <div className='w-[75%] h-full bg-gray-200'>

                        {/* {Main content on the left side of sidebar} */}
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
