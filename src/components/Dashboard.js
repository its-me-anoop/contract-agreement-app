import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

function Dashboard() {
    const [contracts, setContracts] = useState([]);
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
                where('senderEmail', '==', user.email),
                orderBy('createdAt', 'desc')
            );

            const q2 = query(
                collection(db, 'contracts'),
                where('receiverEmail', '==', user.email),
                orderBy('createdAt', 'desc')
            );

            const [sentSnapshot, receivedSnapshot] = await Promise.all([
                getDocs(q),
                getDocs(q2)
            ]);

            const sentContracts = sentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'sent' }));
            const receivedContracts = receivedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'received' }));

            setContracts([...sentContracts, ...receivedContracts].sort((a, b) => b.createdAt - a.createdAt));
        } catch (error) {
            setError('Error fetching contracts: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center mt-8">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center mt-8">{error}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto mt-8 p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Your Contracts</h1>
                <button
                    onClick={() => navigate('/create-contract')}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Create New Contract
                </button>
            </div>

            {contracts.length > 0 ? (
                <ul className="space-y-4">
                    {contracts.map((contract) => (
                        <li key={contract.id} className="border p-4 rounded shadow">
                            <h3 className="text-lg font-semibold">{contract.title}</h3>
                            <p className="text-gray-600">Status: {contract.status}</p>
                            <p className="text-gray-600">
                                {contract.type === 'sent' ? `Sent to: ${contract.receiverEmail}` : `Received from: ${contract.senderEmail}`}
                            </p>
                            <Link to={`/contract/${contract.id}`} className="text-blue-500 hover:underline">
                                View Contract
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center">You don't have any contracts yet.</p>
            )}
        </div>
    );
}

export default Dashboard;