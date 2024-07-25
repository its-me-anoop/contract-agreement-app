import React from 'react';
import { useParams } from 'react-router-dom';

const legalDocs = {
    privacy: {
        title: "Privacy Policy",
        content: `
      <h1>Privacy Policy</h1>
      <p>Last updated: [Date]</p>
      <p>This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from our site.</p>
      
      <h2>Personal information we collect</h2>
      <p>[Your content here]</p>

      <h2>How we use your personal information</h2>
      <p>[Your content here]</p>

      <h2>Sharing your personal information</h2>
      <p>[Your content here]</p>

      <h2>Your rights</h2>
      <p>[Your content here]</p>

      <h2>Changes</h2>
      <p>We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal or regulatory reasons.</p>

      <h2>Contact us</h2>
      <p>For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at [email address] or by mail using the details provided below:</p>
      <p>[Your Company Name and Address]</p>
    `
    },
    terms: {
        title: "Terms of Service",
        content: `
      <h1>Terms of Service</h1>
      <p>Last updated: [Date]</p>
      <p>Please read these terms of service carefully before using our website.</p>

      <h2>1. Terms</h2>
      <p>[Your content here]</p>

      <h2>2. Use License</h2>
      <p>[Your content here]</p>

      <h2>3. Disclaimer</h2>
      <p>[Your content here]</p>

      <h2>4. Limitations</h2>
      <p>[Your content here]</p>

      <h2>5. Revisions and Errata</h2>
      <p>[Your content here]</p>

      <h2>6. Links</h2>
      <p>[Your content here]</p>

      <h2>7. Site Terms of Use Modifications</h2>
      <p>[Your content here]</p>

      <h2>8. Governing Law</h2>
      <p>[Your content here]</p>
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