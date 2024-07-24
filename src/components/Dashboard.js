import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth, storage } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function Dashboard() {
    const [contracts, setContracts] = useState([]);
    const [newContract, setNewContract] = useState({
        clientName: '',
        clientAddress: '',
        clientEmail: '',
        developerName: '',
        developerAddress: '',
        developerEmail: '',
        hourlyRate: '',
        estimatedMinTotal: '',
        estimatedMaxTotal: '',
        hostingFee: '',
    });
    const [shareLink, setShareLink] = useState('');
    const [logo, setLogo] = useState(null);
    const [customSections, setCustomSections] = useState([
        { title: 'Services', content: '* Website design and layout\n* Front-end and back-end development\n* Integration of provided domain and email services\n* Testing and debugging\n* Deployment and final launch' },
        { title: 'Project Timeline', content: 'The project is expected to take approximately 100 to 140 hours to complete. The Developer will make reasonable efforts to complete the project within this timeframe. Any delays will be communicated promptly to the Client.' },
        { title: 'Payment Terms', content: '* Payment will be made in full upon completion of the project.\n* An invoice will be sent at the end of the project detailing the total hours worked and the total amount due.\n* Payments are due within 14 days of receipt of the final invoice.' },
        { title: 'Client Responsibilities', content: 'The Client agrees to provide all necessary content, information, and access required for the completion of the project, including but not limited to:\n* Text, images, and other media\n* Timely feedback and approvals' },
        { title: 'Revisions and Changes', content: 'The Developer agrees to make revisions and changes to the project as requested by the Client. However, if the scope of work changes significantly, additional hours may be required and will be billed at the agreed hourly rate.' },
        { title: 'Ownership and Rights', content: 'Upon full payment, the Client will own all rights to the completed website, including the code, design, and content provided by the Client. The Developer retains the right to use the project in their portfolio and for promotional purposes.' },
        { title: 'Confidentiality', content: 'Both parties agree to keep all information related to the project confidential and not disclose it to any third party without prior written consent, except as necessary for the completion of the project.' },
        { title: 'Termination', content: 'Either party may terminate this contract with 14 days\' written notice. In the event of termination, the Client will pay for all hours worked up to the termination date.' },
        { title: 'Governing Law', content: 'This Contract shall be governed by and construed in accordance with the laws of [Your Country/Region].' },
        { title: 'Entire Agreement', content: 'This Contract constitutes the entire agreement between the parties and supersedes all prior agreements, understandings, and representations.' },
    ]);

    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        const q = query(collection(db, 'contracts'), where('createdBy', '==', auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        setContracts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewContract(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e) => {
        if (e.target.files[0]) {
            setLogo(e.target.files[0]);
        }
    };

    const handleCustomSectionChange = (index, field, value) => {
        const updatedSections = [...customSections];
        updatedSections[index][field] = value;
        setCustomSections(updatedSections);
    };

    const addCustomSection = () => {
        setCustomSections([...customSections, { title: '', content: '' }]);
    };

    const removeCustomSection = (index) => {
        const updatedSections = customSections.filter((_, i) => i !== index);
        setCustomSections(updatedSections);
    };

    const handleCreateContract = async (e) => {
        e.preventDefault();
        try {
            let logoUrl = '';
            if (logo) {
                const storageRef = ref(storage, `logos/${auth.currentUser.uid}/${logo.name}`);
                await uploadBytes(storageRef, logo);
                logoUrl = await getDownloadURL(storageRef);
            }

            const contractDate = new Date().toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            let contractContent = `
**Web Development Contract**
**Contract Date:** ${contractDate}

${logoUrl ? `![Company Logo](${logoUrl})` : ''}

**Client:**
* **Name:** ${newContract.clientName}
* **Address:** ${newContract.clientAddress}
* **Email:** ${newContract.clientEmail}

**Developer:**
* **Name:** ${newContract.developerName}
* **Title:** Freelance Web and App Developer
* **Address:** ${newContract.developerAddress}
* **Email:** ${newContract.developerEmail}

**Compensation**
* **Hourly Rate:** £${newContract.hourlyRate}
* **Estimated Total Cost:** £${newContract.estimatedMinTotal} to £${newContract.estimatedMaxTotal} (based on estimated hours of completion)

**Hosting Fees**
Upon completion of the project, a hosting fee of £${newContract.hostingFee} per month will be charged as a subscription. This fee will cover the hosting services for the Client's website.

`;

            customSections.forEach((section, index) => {
                contractContent += `
**${index + 1}. ${section.title}**
${section.content}

`;
            });

            contractContent += `
**Signatures**

**Client:**
${newContract.clientName}

**Developer:**
${newContract.developerName}
Freelance Web and App Developer
`;

            const docRef = await addDoc(collection(db, 'contracts'), {
                title: `Web Development Contract for ${newContract.clientName}`,
                content: contractContent,
                createdBy: auth.currentUser.uid,
                createdAt: new Date(),
                status: 'pending',
                clientEmail: newContract.clientEmail,
                logoUrl: logoUrl
            });

            const newShareLink = `${window.location.origin}/contract/${docRef.id}`;
            setShareLink(newShareLink);
            setNewContract({
                clientName: '',
                clientAddress: '',
                clientEmail: '',
                developerName: '',
                developerAddress: '',
                developerEmail: '',
                hourlyRate: '',
                estimatedMinTotal: '',
                estimatedMaxTotal: '',
                hostingFee: '',
            });
            setLogo(null);
            fetchContracts();
        } catch (error) {
            console.error('Error creating contract:', error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto mt-8 p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Contract Dashboard</h1>

            <div className="mb-8 bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Create New Contract</h2>
                <form onSubmit={handleCreateContract} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-gray-600">Client Information</h3>
                            <input
                                type="text"
                                name="clientName"
                                placeholder="Client Name"
                                value={newContract.clientName}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                type="text"
                                name="clientAddress"
                                placeholder="Client Address"
                                value={newContract.clientAddress}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                type="email"
                                name="clientEmail"
                                placeholder="Client Email"
                                value={newContract.clientEmail}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-gray-600">Developer Information</h3>
                            <input
                                type="text"
                                name="developerName"
                                placeholder="Developer Name"
                                value={newContract.developerName}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                type="text"
                                name="developerAddress"
                                placeholder="Developer Address"
                                value={newContract.developerAddress}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                type="email"
                                name="developerEmail"
                                placeholder="Developer Email"
                                value={newContract.developerEmail}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-600">Project Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <input
                                type="number"
                                name="hourlyRate"
                                placeholder="Hourly Rate (£)"
                                value={newContract.hourlyRate}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                type="number"
                                name="estimatedMinTotal"
                                placeholder="Estimated Min Total (£)"
                                value={newContract.estimatedMinTotal}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                type="number"
                                name="estimatedMaxTotal"
                                placeholder="Estimated Max Total (£)"
                                value={newContract.estimatedMaxTotal}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                type="number"
                                name="hostingFee"
                                placeholder="Monthly Hosting Fee (£)"
                                value={newContract.hostingFee}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-600">Logo (Optional)</h3>
                        <input
                            type="file"
                            onChange={handleLogoChange}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            accept="image/*"
                        />
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-600">Custom Sections</h3>
                        {customSections.map((section, index) => (
                            <div key={index} className="mb-4 p-4 border border-gray-300 rounded">
                                <input
                                    type="text"
                                    value={section.title}
                                    onChange={(e) => handleCustomSectionChange(index, 'title', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Section Title"
                                />
                                <textarea
                                    value={section.content}
                                    onChange={(e) => handleCustomSectionChange(index, 'content', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Section Content"
                                    rows="4"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeCustomSection(index)}
                                    className="mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                                >
                                    Remove Section
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addCustomSection}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                        >
                            Add New Section
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                    >
                        Create Contract
                    </button>
                </form>
                {shareLink && (
                    <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
                        <h3 className="text-lg font-semibold mb-2 text-green-800">Contract Created Successfully!</h3>
                        <p className="mb-2 text-green-700">Share this link with your client:</p>
                        <div className="flex">
                            <input
                                type="text"
                                value={shareLink}
                                readOnly
                                className="flex-grow p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={() => { navigator.clipboard.writeText(shareLink) }}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-r focus:outline-none focus:shadow-outline transition duration-300"
                            >
                                Copy Link
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Your Contracts</h2>
                {contracts.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {contracts.map((contract) => (
                            <li key={contract.id} className="py-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-800">{contract.title}</h3>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${contract.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            contract.status === 'signed' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {contract.status}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-600">Client: {contract.clientEmail}</p>
                                <Link
                                    to={`/contract/${contract.id}`}
                                    className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    View Contract
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-600">You don't have any contracts yet.</p>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
