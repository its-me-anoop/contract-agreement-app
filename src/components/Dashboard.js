import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { FaFileContract, FaCheckCircle, FaClock, FaExclamationCircle } from 'react-icons/fa';

function Dashboard() {
    const [contracts, setContracts] = useState([]);
    const [stats, setStats] = useState({ total: 0, signed: 0, pending: 0, expired: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        setLoading(true);
        setError(null);
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("User not authenticated");
            }

            const q = query(
                collection(db, 'contracts'),
                where('createdBy', '==', user.uid),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const contractList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setContracts(contractList);

            // Calculate stats
            const newStats = contractList.reduce((acc, contract) => {
                acc.total++;
                acc[contract.status]++;
                return acc;
            }, { total: 0, signed: 0, pending: 0, expired: 0 });

            setStats(newStats);
        } catch (error) {
            console.error('Error fetching contracts:', error);
            setError('Failed to load contracts. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'signed':
                return <FaCheckCircle className="text-green-500" />;
            case 'pending':
                return <FaClock className="text-yellow-500" />;
            case 'expired':
                return <FaExclamationCircle className="text-red-500" />;
            default:
                return <FaFileContract className="text-gray-500" />;
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
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
                            <li key={contract.id} className="p-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        {getStatusIcon(contract.status)}
                                        <div className="ml-3">
                                            <h3 className="text-lg font-semibold">{contract.title}</h3>
                                            <p className="text-sm text-gray-500">Client: {contract.clientEmail}</p>
                                        </div>
                                    </div>
                                    <Link
                                        to={`/contract/${contract.id}`}
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                                    >
                                        View Contract
                                    </Link>
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