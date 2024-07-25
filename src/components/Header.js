import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

function Header({ user }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    return (
        <header className="bg-blue-600 text-white shadow-md">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold">
                        ContractApp
                    </Link>
                    <nav>
                        <ul className="flex space-x-4 items-center">
                            {user ? (
                                <>
                                    <li>
                                        <Link to="/dashboard" className="hover:text-blue-200 transition-colors duration-200">
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li>
                                        <button
                                            onClick={handleLogout}
                                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                        >
                                            Log Out
                                        </button>
                                    </li>
                                    <li className="text-sm">
                                        {user.email}
                                    </li>
                                </>
                            ) : (
                                <li>
                                    <Link
                                        to="/login"
                                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                    >
                                        Log In
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    );
}

export default Header;