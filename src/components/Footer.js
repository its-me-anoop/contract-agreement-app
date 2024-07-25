// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="bg-gray-800 text-white mt-auto">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <p>&copy; 2023 ContractApp. All rights reserved.</p>
                    </div>
                    <div className="flex space-x-4">
                        <Link to="/legal/privacy" className="hover:text-gray-300 transition-colors duration-200">
                            Privacy Policy
                        </Link>
                        <Link to="/legal/terms" className="hover:text-gray-300 transition-colors duration-200">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;