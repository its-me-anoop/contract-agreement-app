import React from 'react';
import { useParams } from 'react-router-dom';

const legalDocs = {
    privacy: {
        title: "Privacy Policy",
        content: `
      <h1>Privacy Policy</h1>
      <p>Last updated: July 25, 2024</p>
      
      <h2>1. Introduction</h2>
      <p>Welcome to ContractApp. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
      
      <h2>2. The Data We Collect About You</h2>
      <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
      <ul>
        <li>Identity Data includes first name, last name, username or similar identifier.</li>
        <li>Contact Data includes email address and telephone numbers.</li>
        <li>Technical Data includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
        <li>Usage Data includes information about how you use our website, products and services.</li>
        <li>Contract Data includes the content of contracts you create or sign using our service.</li>
      </ul>
      
      <h2>3. How We Use Your Personal Data</h2>
      <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
      <ul>
        <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
        <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
        <li>Where we need to comply with a legal obligation.</li>
      </ul>
      
      <h2>4. Data Security and Encryption</h2>
      <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>
      <p>Specifically, we use encryption to protect sensitive data transmitted to and from our site. Contract data is encrypted at rest using industry-standard encryption algorithms. This means that your contract information is converted into a code that can only be read with a decryption key, providing an additional layer of security to your sensitive information.</p>
      <p>While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security. No method of transmission over the Internet or method of electronic storage is 100% secure.</p>
      
      <h2>5. Your Legal Rights</h2>
      <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.</p>
      
      <h2>6. Contact Us</h2>
      <p>If you have any questions about this privacy policy, our privacy practices, or if you would like to exercise any of your rights, please contact us at anoop@flutterly.co.uk.</p>
    `
    },
    terms: {
        title: "Terms of Service",
        content: `
      <h1>Terms of Service</h1>
      <p>Last updated: July 25, 2024</p>
      
      <h2>1. Agreement to Terms</h2>
      <p>By accessing our website, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
      
      <h2>2. Use License</h2>
      <p>Permission is granted to temporarily download one copy of the materials (information or software) on ContractApp's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
      <ul>
        <li>modify or copy the materials;</li>
        <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
        <li>attempt to decompile or reverse engineer any software contained on ContractApp's website;</li>
        <li>remove any copyright or other proprietary notations from the materials; or</li>
        <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
      </ul>
      
      <h2>3. Disclaimer</h2>
      <p>The materials on ContractApp's website are provided on an 'as is' basis. ContractApp makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
      
      <h2>4. Limitations</h2>
      <p>In no event shall ContractApp or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ContractApp's website, even if ContractApp or a ContractApp authorized representative has been notified orally or in writing of the possibility of such damage.</p>
      
      <h2>5. Data Encryption and Security</h2>
      <p>ContractApp uses industry-standard encryption methods to protect your data. However, you acknowledge that no method of transmission over the internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.</p>
      <p>You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password.</p>
      
      <h2>6. Accuracy of Materials</h2>
      <p>The materials appearing on ContractApp's website could include technical, typographical, or photographic errors. ContractApp does not warrant that any of the materials on its website are accurate, complete or current. ContractApp may make changes to the materials contained on its website at any time without notice.</p>
      
      <h2>7. Links</h2>
      <p>ContractApp has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by ContractApp of the site. Use of any such linked website is at the user's own risk.</p>
      
      <h2>8. Modifications</h2>
      <p>ContractApp may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.</p>
      
      <h2>9. Governing Law</h2>
      <p>These terms and conditions are governed by and construed in accordance with the laws of the United Kingdom and you irrevocably submit to the exclusive jurisdiction of the courts in that country.</p>
    `
    }
};

function LegalDoc() {
    const { docType } = useParams();
    const doc = legalDocs[docType];

    if (!doc) {
        return <div>Document not found</div>;
    }

    return (
        <div className="max-w-4xl mx-auto mt-8 p-4">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-6">
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: doc.content }} />
                </div>
            </div>
        </div>
    );
}

export default LegalDoc;