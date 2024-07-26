import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { FaFileContract, FaCheckCircle, FaClock, FaExclamationCircle, FaUser, FaEnvelope, FaCalendar } from 'react-icons/fa';

function Dashboard() {
    const [contracts, setContracts] = useState([]);
    const [stats, setStats] = useState({ total: 0, signed: 0, pending: 0, expired: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchContracts();
            } else {
                navigate('/login');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const fetchContracts = async () => {
        setLoading(true);
        setError(null);
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("User not authenticated");
            }

            const senderQuery = query(
                collection(db, 'contracts'),
                where('senderEmail', '==', user.email),
                orderBy('createdAt', 'desc')
            );

            const receiverQuery = query(
                collection(db, 'contracts'),
                where('receiverEmail', '==', user.email),
                orderBy('createdAt', 'desc')
            );

            const [senderSnapshot, receiverSnapshot] = await Promise.all([
                getDocs(senderQuery),
                getDocs(receiverQuery)
            ]);

            const senderContracts = senderSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                role: 'sender'
            }));

            const receiverContracts = receiverSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                role: 'receiver'
            }));

            const allContracts = [...senderContracts, ...receiverContracts];

            // Sort all contracts by createdAt
            allContracts.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

            // Check for expired contracts
            const now = new Date();
            allContracts.forEach(contract => {
                if (contract.expiryDate && contract.expiryDate.toDate) {
                    if (contract.expiryDate.toDate() < now && contract.status !== 'signed') {
                        contract.status = 'expired';
                    }
                } else {
                    console.warn(`Contract ${contract.id} has invalid expiryDate:`, contract.expiryDate);
                    contract.status = 'invalid';
                }
            });

            setContracts(allContracts);

            // Calculate stats
            const newStats = allContracts.reduce((acc, contract) => {
                acc.total++;
                acc[contract.status] = (acc[contract.status] || 0) + 1;
                return acc;
            }, { total: 0, signed: 0, pending: 0, expired: 0, invalid: 0 });

            setStats(newStats);
        } catch (error) {
            console.error('Error fetching contracts:', error);
            setError('Failed to load contracts. Please try again. Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date || !date.seconds) {
            return 'Invalid Date';
        }
        return new Date(date.seconds * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };


    const getStatusIcon = (status) => {
        switch (status) {
            case 'signed':
                return <FaCheckCircle className="text-green-500" title="Signed" />;
            case 'pending':
                return <FaClock className="text-yellow-500" title="Pending" />;
            case 'expired':
                return <FaExclamationCircle className="text-red-500" title="Expired" />;
            default:
                return <FaFileContract className="text-gray-500" title="Contract" />;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'signed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'expired':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return <div className="text-center mt-8">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center mt-8">{error}</div>;
    }

    return (
        <div className="max-w-6xl mx-auto mt-8 p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Your Contracts Dashboard</h1>
                <button
                    onClick={() => navigate('/create-contract')}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                    Create New Contract
                </button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Total Contracts</h3>
                    <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Signed Contracts</h3>
                    <p className="text-3xl font-bold text-green-500">{stats.signed}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Pending Contracts</h3>
                    <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Expired Contracts</h3>
                    <p className="text-3xl font-bold text-red-500">{stats.expired}</p>
                </div>
            </div>

            {/* Contracts List */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <h2 className="text-xl font-semibold p-4 bg-gray-50">Your Contracts</h2>
                {contracts.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {contracts.map((contract) => (
                            <li key={contract.id} className="p-4 hover:bg-gray-50 transition duration-150 ease-in-out">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <div className="flex items-start mb-2 sm:mb-0">
                                        <div className="mr-3">
                                            {getStatusIcon(contract.status)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold">{contract.title}</h3>
                                            <div className="text-sm text-gray-500 mt-1">
                                                <p className="flex items-center">
                                                    <FaUser className="mr-2" />
                                                    {contract.role === 'sender' ? 'To:' : 'From:'} {contract.role === 'sender' ? contract.receiverEmail : contract.senderEmail}
                                                </p>
                                                <p className="flex items-center mt-1">
                                                    <FaCalendar className="mr-2" />
                                                    Created: {formatDate(contract.createdAt)}
                                                </p>
                                                <p className="flex items-center mt-1">
                                                    <FaCalendar className="mr-2" />
                                                    Expires: {formatDate(contract.expiryDate)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center mt-2 sm:mt-0">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(contract.status)} mr-2 mb-2 sm:mb-0`}>
                                            {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                                        </span>
                                        <Link
                                            to={`/contract/${contract.id}`}
                                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                                        >
                                            View Contract
                                        </Link>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="p-4 text-center text-gray-500">You don't have any contracts yet.</p>
                )}
            </div>
        </div>
    );
}

export default Dashboard;