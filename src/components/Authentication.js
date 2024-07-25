import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';

function Authentication() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        try {
            if (isSignUp) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await sendEmailVerification(userCredential.user);
                setMessage("Account created. Please check your email to verify your account.");
            } else {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                if (!userCredential.user.emailVerified) {
                    setError("Please verify your email before signing in.");
                    await sendEmailVerification(userCredential.user);
                    setMessage("A new verification email has been sent.");
                    return;
                }
                const redirectTo = location.state?.from || '/dashboard';
                navigate(redirectTo);
            }
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-center">{isSignUp ? 'Create Account' : 'Login'}</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {message && <p className="text-green-500 mb-4">{message}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        {isSignUp ? 'Sign Up' : 'Sign In'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                    >
                        {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Authentication;