
import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-12 px-6 bg-white shadow-2xl rounded-xl my-8">
      {/* Unique Page Identifier */}
      <div className="fixed bottom-4 left-4 bg-black text-white px-3 py-1 z-[9999] rounded-md font-mono text-xs opacity-70 pointer-events-none">Page: Privacy</div>
      <div className="border-b pb-6 mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 garden-text">Privacy Policy</h1>
        <p className="text-gray-500">Last Updated: October 26, 2023</p>
      </div>

      <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-green-800 mb-4">1. Introduction</h2>
          <p>
            Welcome to PDF Garden ("we," "our," or "us"). We are committed to protecting your privacy and ensuring your data security. 
            This Privacy Policy explains how we handle your information when you use our website and services. Unlike traditional online converters, 
            PDF Garden operates primarily as a client-side application, meaning the vast majority of processing happens directly on your device 
            rather than on our servers.
          </p>
          <p>
            By using PDF Garden, you agree to the collection and use of information in accordance with this policy. We value the trust you place 
            in us and strive to be transparent about our data practices.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-green-800 mb-4">2. The Client-Side Advantage</h2>
          <p className="bg-green-50 p-4 border-l-4 border-green-500 rounded-r-lg">
            <strong>Key Distinction:</strong> Your files are NOT uploaded to a remote server for processing. 
            When you select a PDF file, our application uses advanced browser technologies (WebAssembly and JavaScript) 
            to read and convert that file entirely within your browser's memory.
          </p>
          <p>
            This architecture provides a superior level of privacy because:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your sensitive documents never leave your computer or mobile device.</li>
            <li>We do not have access to view, copy, or store your original PDF files.</li>
            <li>There is no risk of interception during a file upload process because no file upload occurs for the conversion engine.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-green-800 mb-4">3. Information We Collect</h2>
          <p>Since we prioritize user anonymity, we collect minimal data:</p>
          
          <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">3.1. Personal Information</h3>
          <p>
            We do not require you to create an account, provide an email address, or submit personal details to use our core conversion features. 
            You remain anonymous throughout your session.
          </p>

          <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">3.2. Usage Data</h3>
          <p>
            We may collect non-identifiable technical data to improve our service, such as:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Browser type and version.</li>
            <li>Device type (Desktop, Mobile, Tablet).</li>
            <li>Operating system.</li>
            <li>Time spent on the platform.</li>
            <li>General geographic location (Country level).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-green-800 mb-4">4. Third-Party Integrations</h2>
          <p>
            To provide enhanced functionality, we integrate with trusted third-party services. Note that their privacy policies govern their respective services:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Google Drive:</strong> If you choose to import files from Google Drive, you will authenticate directly with Google. 
              We receive an access token solely to download the specific file you select. We do not store this token permanently or access other files.
            </li>
            <li>
              <strong>Dropbox:</strong> Similar to Google Drive, Dropbox integration is handled via their official API. 
              Authentication happens on Dropbox servers, and we only access the file you explicitly choose.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-green-800 mb-4">5. Data Retention</h2>
          <p>
            <strong>We do not retain your files.</strong>
          </p>
          <p>
            Since the conversion happens in your browser's ephemeral memory:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Once you close the tab or refresh the page, all file data is instantly wiped from your browser's memory.</li>
            <li>We have no backups, logs, or copies of your documents.</li>
            <li>You are the sole owner and custodian of your data at all times.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-green-800 mb-4">6. Security Measures</h2>
          <p>
            We implement robust security standards to protect the integrity of our application:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>HTTPS Encryption:</strong> All communication between your browser and our website hosting provider is encrypted using Transport Layer Security (TLS).</li>
            <li><strong>Content Security Policy (CSP):</strong> We employ strict CSP headers to prevent cross-site scripting (XSS) and other code injection attacks.</li>
            <li><strong>Open Source Transparency:</strong> Being an open-source project, our code is available for audit by security researchers, ensuring no hidden backdoors exist.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-green-800 mb-4">7. Children's Privacy</h2>
          <p>
            Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. 
            If You are a parent or guardian and You are aware that Your child has provided Us with Personal Data, please contact Us.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-green-800 mb-4">8. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top.
            You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-green-800 mb-4">9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, proper usage of the platform, or open-source contributions, please contact us via our GitHub repository or community channels.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
