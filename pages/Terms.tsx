
import React from 'react';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-12 px-6 bg-white shadow-2xl rounded-xl my-8">
      {/* Unique Page Identifier */}
      <div className="fixed bottom-4 left-4 bg-black text-white px-3 py-1 z-[9999] rounded-md font-mono text-xs opacity-70 pointer-events-none">Page: Terms</div>
      <div className="border-b pb-6 mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 garden-text">Terms and Conditions</h1>
        <p className="text-gray-500">Effective Date: October 26, 2023</p>
      </div>

      <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-blue-800 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using PDF Garden (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. 
            In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services. 
            All such guidelines or rules are hereby incorporated by reference into the Terms of Use.
          </p>
          <p>
             If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-blue-800 mb-4">2. Description of Service</h2>
          <p>
            PDF Garden provides a web-based interface for converting Portable Document Format (PDF) files into image formats (e.g., JPG). 
            The service is provided "AS IS" and "AS AVAILABLE" without any warranty of any kind. We emphasize that our unique selling proposition 
            is the client-side processing nature of the application, ensuring data privacy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-blue-800 mb-4">3. User Conduct</h2>
          <p>
            You agree to use the Service only for lawful purposes. You are strictly prohibited from using the Service to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Upload or process illegal, harmful, threatening, or abusive content.</li>
            <li>Attempt to reverse engineer the application code.</li>
            <li>Use automated scripts to access the service without permission.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-blue-800 mb-4">4. Intellectual Property</h2>
          <p>
             The Service and its original content, features, and functionality are and will remain the exclusive property of PDF Garden and its licensors. 
             However, the files you process using the Service remain your intellectual property. We claim no ownership over your documents.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-blue-800 mb-4">5. Disclaimer of Warranties</h2>
          <p>
             The Service is provided on an "AS IS" and "AS AVAILABLE" basis. PDF Garden makes no representations or warranties of any kind, express or implied, 
             as to the operation of their services, or the information, content, or materials included therein. You expressly agree that your use of these services 
             is at your sole risk.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-blue-800 mb-4">6. Limitation of Liability</h2>
          <p>
             In no event shall PDF Garden, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, 
             special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, 
             resulting from your access to or use of or inability to access or use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-blue-800 mb-4">7. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 
            30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
