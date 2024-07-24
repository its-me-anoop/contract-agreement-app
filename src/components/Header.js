import React from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';

function Header({ user }) {
    const handleLogout = () => {
        auth.signOut();
    };

    return (
        <header className="bg-white shadow-md">
            <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-2xl font-bold text-blue-600">ContractApp</Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                                <button
                                    onClick={handleLogout}
                                    className="ml-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/"
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header;