import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { renderMarkdown } from 'react-markdown';

function ContractPage() {
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [activeSection, setActiveSection] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const sectionRefs = useRef({});

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                fetchContract();
            }
        });

        return () => unsubscribe();
    }, [id]);

    const fetchContract = async () => {
        try {
            const docRef = doc(db, 'contracts', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setContract({ id: docSnap.id, ...docSnap.data() });
            } else {
                setError("No such contract!");
            }
        } catch (error) {
            setError("Error fetching contract: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSign = async () => {
        if (!user || user.email !== contract.clientEmail) {
            setError("You are not authorized to sign this contract.");
            return;
        }

        try {
            await updateDoc(doc(db, 'contracts', id), {
                status: 'signed',
                signedBy: user.uid,
                signedAt: new Date()
            });
            fetchContract();
        } catch (error) {
            setError("Error signing contract: " + error.message);
        }
    };

    // ... (keep the renderMarkdown function and other utility functions)

    if (!user) {
        return <Navigate to="/login" state={{ from: `/contract/${id}` }} />;
    }

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="max-w-4xl mx-auto mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p>{error}</p>
        </div>
    );

    if (!contract) return (
        <div className="max-w-4xl mx-auto mt-8 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            <h2 className="text-2xl font-bold mb-2">Contract Not Found</h2>
            <p>The requested contract could not be found.</p>
        </div>
    );

    const canSign = contract.status === 'pending' && user.email === contract.clientEmail;

    // ... (keep the sections const and the return statement structure)

    return (
        <div className="max-w-6xl mx-auto mt-8 p-4 flex">
            {/* ... (keep the navigation sidebar) */}
            <div className="flex-1">
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="p-6">
                        <h1 className="text-3xl font-bold mb-4 text-gray-800">{contract.title}</h1>
                        <div className="mb-6 flex items-center">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${contract.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                contract.status === 'signed' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                {contract.status}
                            </span>
                            {contract.signedBy && (
                                <span className="ml-2 text-sm text-gray-600">
                                    Signed by: {contract.signedBy}
                                </span>
                            )}
                            {contract.signedAt && (
                                <span className="ml-2 text-sm text-gray-600">
                                    on {contract.signedAt.toDate().toLocaleString()}
                                </span>
                            )}
                        </div>
                        <div className="prose max-w-none">
                            {renderMarkdown(contract.content)}
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4">
                        {canSign ? (
                            <button
                                onClick={handleSign}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                            >
                                Sign Contract
                            </button>
                        ) : (
                            <p className="text-gray-600 italic">
                                {contract.status === 'signed'
                                    ? 'This contract has been signed.'
                                    : 'You are not authorized to sign this contract.'}
                            </p>
                        )}
                        {contract.createdBy === user.uid && (
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold mb-2">Share Contract</h3>
                                <div className="flex">
                                    <input
                                        type="text"
                                        value={`${window.location.origin}/contract/${contract.id}`}
                                        readOnly
                                        className="flex-grow p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/contract/${contract.id}`) }}
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-r focus:outline-none focus:shadow-outline transition duration-300"
                                    >
                                        Copy Link
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                >
                    Back
                </button>
            </div>
        </div>
    );
}

export default ContractPage;