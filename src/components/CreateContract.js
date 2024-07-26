import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import CryptoJS from 'crypto-js';

const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
    ],
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image'
];

function CreateContract() {
    const [contract, setContract] = useState({
        title: '',
        content: '',
        expiryDate: '',
        sender: {
            fullName: '',
            designation: '',
            companyName: '',
            phone: '',
            email: '',
            address: ''
        },
        receiver: {
            fullName: '',
            designation: '',
            companyName: '',
            phone: '',
            email: '',
            address: ''
        }
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e, party) => {
        const { name, value } = e.target;
        if (party) {
            setContract(prev => ({
                ...prev,
                [party]: {
                    ...prev[party],
                    [name]: value
                }
            }));
        } else {
            setContract(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleContentChange = (content) => {
        setContract(prev => ({ ...prev, content }));
    };

    const encryptData = (data, key) => {
        return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!contract.title || !contract.content || !contract.sender.email || !contract.receiver.email || !contract.expiryDate) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('You must be logged in to create a contract');
            }

            const encryptionKey = user.uid + contract.receiver.email;

            const encryptedContract = {
                title: contract.title,
                encryptedData: encryptData({
                    content: contract.content,
                    sender: contract.sender,
                    receiver: contract.receiver,
                }, encryptionKey),
                createdBy: user.uid,
                createdAt: Timestamp.now(),
                status: 'pending',
                senderEmail: user.email,
                receiverEmail: contract.receiver.email,
                expiryDate: Timestamp.fromDate(new Date(contract.expiryDate))
            };

            const docRef = await addDoc(collection(db, 'contracts'), encryptedContract);
            navigate(`/contract/${docRef.id}`);
        } catch (error) {
            console.error('Error creating contract:', error);
            setError('Error creating contract: ' + error.message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-8 p-4">
            <h2 className="text-2xl font-bold mb-4">Create New Contract</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Contract Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={contract.title}
                        onChange={(e) => handleChange(e)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Expiry Date</label>
                    <input
                        type="date"
                        id="expiryDate"
                        name="expiryDate"
                        value={contract.expiryDate}
                        onChange={(e) => handleChange(e)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                </div>

                {['sender', 'receiver'].map((party) => (
                    <div key={party} className="border-t pt-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{party === 'sender' ? 'Your' : 'Receiver'} Details</h3>
                        {['fullName', 'designation', 'companyName', 'phone', 'email', 'address'].map((field) => (
                            <div key={field} className="mb-2">
                                <label htmlFor={`${party}-${field}`} className="block text-sm font-medium text-gray-700">
                                    {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                                </label>
                                <input
                                    type={field === 'email' ? 'email' : 'text'}
                                    id={`${party}-${field}`}
                                    name={field}
                                    value={contract[party][field]}
                                    onChange={(e) => handleChange(e, party)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    required={field === 'email'}
                                />
                            </div>
                        ))}
                    </div>
                ))}

                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">Contract Content</label>
                    <ReactQuill
                        theme="snow"
                        value={contract.content}
                        onChange={handleContentChange}
                        modules={modules}
                        formats={formats}
                        className="mt-1 block w-full"
                    />
                </div>

                <div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Create Contract
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateContract;