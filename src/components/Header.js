import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

function Header({ user }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="bg-blue-600 text-white shadow-md">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold">
                        ContractApp
                    </Link>

                    {/* Hamburger menu for mobile */}
                    <div className="md:hidden">
                        <button onClick={toggleMenu} className="focus:outline-none">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* Desktop menu */}
                    <nav className="hidden md:flex space-x-4 items-center">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="hover:text-blue-200 transition-colors duration-200">
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                >
                                    Log Out
                                </button>
                                <span className="text-sm">{user.email}</span>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                            >
                                Log In
                            </Link>
                        )}
                    </nav>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <nav className="md:hidden mt-4">
                        {user ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="block py-2 hover:bg-blue-700 transition duration-150 ease-in-out"
                                    onClick={toggleMenu}
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => { handleLogout(); toggleMenu(); }}
                                    className="block w-full text-left py-2 hover:bg-blue-700 transition duration-150 ease-in-out"
                                >
                                    Log Out
                                </button>
                                <span className="block py-2 text-sm">{user.email}</span>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="block py-2 hover:bg-blue-700 transition duration-150 ease-in-out"
                                onClick={toggleMenu}
                            >
                                Log In
                            </Link>
                        )}
                    </nav>
                )}
            </div>
        </header>
    );
}

export default Header;