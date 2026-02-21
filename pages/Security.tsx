
import React from 'react';
import { Link } from 'react-router-dom';

const Security: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-12 px-6 bg-white shadow-2xl rounded-xl my-8">
      {/* Unique Page Identifier */}
      <div className="fixed bottom-4 left-4 bg-black text-white px-3 py-1 z-[9999] rounded-md font-mono text-xs opacity-70 pointer-events-none">Page: Security</div>
      <div className="border-b pb-6 mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 garden-text">Data Security Guarantee</h1>
        <p className="text-gray-500">Your Safety is Our Architecture</p>
      </div>

      <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-purple-800 mb-4">1. Our Philosophy: Zero-Knowledge Architecture</h2>
          <p>
            At PDF Garden, we believe the best way to keep data secure is not to have it in the first place. This is why we adopted a 
            <strong> Zero-Knowledge Architecture</strong>. This technical approach means that we, as the service provider, technically cannot see, 
            read, or persist your data even if we wanted to.
          </p>
          <p>
            Traditional converters upload your file to a server, process it, and send it back. This creates multiple points of vulnerability:
            transmission interception, server hacks, or malicious insider access. We eliminate all these risks by processing everything on your machine.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-purple-800 mb-4">2. Client-Side Processing Technology</h2>
          <p>
            We utilize <strong>WebAssembly (Wasm)</strong> and modern JavaScript engines to run complex PDF processing libraries (like PDF.js) directly inside your browser.
          </p>
          <div className="grid md:grid-cols-2 gap-6 my-6">
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                  <h3 className="font-bold text-purple-900 mb-2">Sandbox Isolation</h3>
                  <p className="text-sm">The browser sandbox isolates our code from your operating system, preventing any malicious access to your file system beyond the specific files you select.</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                  <h3 className="font-bold text-purple-900 mb-2">Ephemeral Memory</h3>
                  <p className="text-sm">Data loaded into the browser memory (RAM) is volatile. As soon as you close the tab, the operating system reclaims that memory, effectively destroying the data.</p>
              </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-purple-800 mb-4">3. Network Security</h2>
          <p>
            While we don't transfer your files, the loading of our application code itself requires network communication. We secure this via:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>TLS 1.2/1.3:</strong> We strictly enforce Transport Layer Security for all connections. Downgrading to insecure HTTP is blocked.</li>
            <li><strong>HSTS (HTTP Strict Transport Security):</strong> This header tells browsers that they should only ever interact with us using HTTPS, preventing protocol downgrade attacks.</li>
            <li><strong>CDN Security:</strong> Our assets are delivered via a global Content Delivery Network (CDN) with DDoS protection and web application firewalls (WAF).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-purple-800 mb-4">4. Code Integrity</h2>
          <p>
            How do you know the code running in your browser does what we say it does?
          </p>
          <p>
            <strong>Open Source Transparency:</strong> Our entire codebase is open source. Developers and security experts can audit the code to verify that no hidden upload scripts exist.
          </p>
          <p>
            <strong>Subresource Integrity (SRI):</strong> Where possible, we use SRI tags for external scripts. This ensures that if a third-party CDN is compromised, the browser will refuse to execute the modified malicious script.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-purple-800 mb-4">5. Local Storage & Caching</h2>
          <p>
            We may use your browser's local storage or IndexedDB solely for functional purposes, such as maintaining the state of your conversion queue if you accidentally refresh. 
            This data:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Resides only on your device.</li>
            <li>Is never synchronized to our servers.</li>
            <li>Can be cleared by you at any time via browser settings.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-purple-800 mb-4">6. Vulnerability Disclosure</h2>
          <p>
            We welcome reports from the security research community. If you discover a vulnerability in PDF Garden, please disclose it to us responsibly via our GitHub repository. 
            We commit to addressing confirmed security issues promptly.
          </p>
        </section>

        <section>
           <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-8">
             <h3 className="font-bold text-yellow-800">User Responsibility</h3>
             <p className="text-sm text-yellow-700 mt-1">
               While we secure the application, you are responsible for the security of your own device. Ensure your browser is up to date and your operating system is free from malware, as compromised local environments can bypass browser protections.
             </p>
           </div>
        </section>
      </div>
    </div>
  );
};

export default Security;
