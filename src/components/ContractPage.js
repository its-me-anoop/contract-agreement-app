import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import CryptoJS from 'crypto-js';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';

const formatDate = (date) => {
    if (date instanceof Timestamp) {
        return date.toDate().toLocaleString();
    } else if (date && typeof date.toDate === 'function') {
        return date.toDate().toLocaleString();
    } else if (date instanceof Date) {
        return date.toLocaleString();
    } else {
        console.warn('Unexpected date format:', date);
        return 'Invalid Date';
    }
};

function ContractPage() {
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [editedExpiryDate, setEditedExpiryDate] = useState('');
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    const decryptData = (encryptedData, key) => {
        const bytes = CryptoJS.AES.decrypt(encryptedData, key);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    };

    const fetchContract = useCallback(async (currentUser) => {
        try {
            const docRef = doc(db, 'contracts', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const contractData = docSnap.data();
                if (currentUser.email !== contractData.senderEmail && currentUser.email !== contractData.receiverEmail) {
                    throw new Error("You are not authorized to view this contract.");
                }
                const encryptionKey = contractData.createdBy + contractData.receiverEmail;
                const decryptedData = decryptData(contractData.encryptedData, encryptionKey);

                let expiryDate = contractData.expiryDate;
                if (expiryDate instanceof Timestamp) {
                    expiryDate = expiryDate.toDate();
                } else if (!(expiryDate instanceof Date)) {
                    console.warn('Unexpected expiryDate format:', expiryDate);
                    expiryDate = new Date(); // Fallback to current date
                }

                setContract({
                    id: docSnap.id,
                    ...contractData,
                    ...decryptedData,
                    expiryDate: expiryDate,
                    lastEditedAt: contractData.lastEditedAt || null
                });
                setEditedExpiryDate(expiryDate.toISOString().split('T')[0]);
            } else {
                throw new Error("No such contract!");
            }
        } catch (error) {
            console.error("Error fetching contract:", error);
            setError("Error fetching contract: " + error.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                fetchContract(currentUser);
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [fetchContract]);

    const handleEdit = () => {
        setIsEditing(true);
        setEditedContent(contract.content);
    };

    const handleSaveEdit = async () => {
        try {
            const newVersion = (contract.version || 0) + 1;
            const encryptionKey = contract.createdBy + contract.receiverEmail;

            const updatedData = {
                content: editedContent,
                expiryDate: new Date(editedExpiryDate),
                version: newVersion,
            };

            const encryptedData = CryptoJS.AES.encrypt(
                JSON.stringify({
                    ...contract,
                    ...updatedData
                }),
                encryptionKey
            ).toString();

            await updateDoc(doc(db, 'contracts', id), {
                encryptedData,
                expiryDate: Timestamp.fromDate(new Date(editedExpiryDate)),
                version: newVersion,
                lastEditedAt: Timestamp.now(),
                lastEditedBy: user.email
            });

            setIsEditing(false);
            fetchContract(user);
        } catch (error) {
            console.error("Error updating contract:", error);
            setError("Error updating contract: " + error.message);
        }
    };

    const handleSign = async () => {
        if (!agreeToTerms) {
            setError("Please confirm that you have read and agree to the terms before signing.");
            return;
        }

        if (!user || user.email !== contract.receiverEmail) {
            setError("You are not authorized to sign this contract.");
            return;
        }

        try {
            setLoading(true);
            const contractRef = doc(db, 'contracts', id);

            await updateDoc(contractRef, {
                status: 'signed',
                signedBy: user.uid,
                signedAt: Timestamp.now()
            });

            fetchContract(user);
        } catch (error) {
            console.error("Error signing contract:", error);
            setError("Error signing contract: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}/contract/${id}`;
        navigator.clipboard.writeText(link);
        alert('Contract link copied to clipboard!');
    };

    if (!user && !loading) {
        return <Navigate to="/login" state={{ from: `/contract/${id}` }} />;
    }

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

    if (error) {
        return <div className="max-w-4xl mx-auto mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p>{error}</p>
        </div>;
    }

    if (!contract) {
        return <div className="max-w-4xl mx-auto mt-8 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            <h2 className="text-2xl font-bold mb-2">Contract Not Found</h2>
            <p>The requested contract could not be found.</p>
        </div>;
    }

    const canEdit = contract.status === 'pending' && user.email === contract.senderEmail;
    const canSign = contract.status === 'pending' && user.email === contract.receiverEmail;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-4 sm:p-6">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800 border-b pb-2">{contract.title}</h1>
                    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full mb-2 sm:mb-0 ${contract.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            contract.status === 'signed' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            Status: {contract.status}
                        </span>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                            {contract.version && (
                                <span className="text-sm text-gray-600 mr-4 mb-2 sm:mb-0">
                                    Version: {contract.version}
                                </span>
                            )}
                            {contract.lastEditedAt && (
                                <span className="text-sm text-gray-600">
                                    Last edited: {formatDate(contract.lastEditedAt)} by {contract.lastEditedBy}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
                        <h2 className="text-xl font-semibold mb-2 text-gray-700">Expiry Date</h2>
                        {isEditing ? (
                            <input
                                type="date"
                                value={editedExpiryDate}
                                onChange={(e) => setEditedExpiryDate(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        ) : (
                            <p>{formatDate(contract.expiryDate)}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-2 text-gray-700">Sender</h2>
                            <PartyDetails party={contract.sender} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold mb-2 text-gray-700">Receiver</h2>
                            <PartyDetails party={contract.receiver} />
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2 text-gray-700">Contract Details</h2>
                        {isEditing ? (
                            <ReactQuill
                                theme="snow"
                                value={editedContent}
                                onChange={setEditedContent}
                            />
                        ) : (
                            <div className="prose max-w-none bg-gray-50 p-4 rounded-lg">
                                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contract.content) }} />
                            </div>
                        )}
                    </div>

                    {canSign && (
                        <div className="mb-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={agreeToTerms}
                                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                                    className="form-checkbox h-5 w-5 text-blue-600"
                                />
                                <span className="ml-2 text-gray-700">
                                    I have read and agree to the terms of this contract
                                </span>
                            </label>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 px-4 sm:px-6 py-4 flex flex-wrap justify-between items-center">
                    <div className="flex flex-wrap gap-2 mb-2 sm:mb-0">
                        {canEdit && !isEditing && (
                            <button
                                onClick={handleEdit}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                            >
                                Edit Contract
                            </button>
                        )}
                        {isEditing && (
                            <button
                                onClick={handleSaveEdit}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                            >
                                Save Changes
                            </button>
                        )}
                        {canSign && (
                            <button
                                onClick={handleSign}
                                className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ${!agreeToTerms || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!agreeToTerms || loading}
                            >
                                {loading ? 'Signing...' : 'Sign Contract'}
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {user.email === contract.senderEmail && (
                            <button
                                onClick={handleCopyLink}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                            >
                                Copy Share Link
                            </button>
                        )}
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                        >
                            Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PartyDetails({ party }) {
    return (
        <div className="bg-gray-50 p-4 rounded-lg">
            {Object.entries(party).map(([key, value]) => (
                <div key={key} className="mb-1">
                    <span className="font-semibold text-gray-700">{key.charAt(0).toUpperCase() + key.slice(1)}:</span> {value}
                </div>
            ))}
        </div>
    );
}

export default ContractPage;