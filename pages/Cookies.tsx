
import React from 'react';
import { Link } from 'react-router-dom';

const Cookies: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-12 px-6 bg-white shadow-2xl rounded-xl my-8">
      {/* Unique Page Identifier */}
      <div className="fixed bottom-4 left-4 bg-black text-white px-3 py-1 z-[9999] rounded-md font-mono text-xs opacity-70 pointer-events-none">Page: Cookies</div>
      <div className="border-b pb-6 mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 garden-text">Cookie Policy</h1>
        <p className="text-gray-500">Minimalist Approach to Tracking</p>
      </div>

      <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-orange-800 mb-4">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently, 
            as well as to provide information to the owners of the site. They can be "persistent" or "session" cookies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-orange-800 mb-4">2. How We Use Cookies</h2>
          <p>
            PDF Garden adopts a minimalist approach. We believe in respecting user agency and avoiding unnecessary clutter on your device.
          </p>
          
          <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">2.1. Essential Cookies</h3>
          <p>
            These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you 
            which amount to a request for services, such as setting your privacy preferences or maintaining your session state during a multi-file conversion.
          </p>

          <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">2.2. Functional Cookies</h3>
          <p>
            These enable the website to provide enhanced functionality and personalisation. For instance, remembering your preferred view mode (Grid vs. List) for the download page.
          </p>
          
          <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">2.3. Analytics Cookies</h3>
          <p>
            We may use anonymous analytics tools (like simple privacy-focused counters) to understand how many users visit our garden. We do not use invasive tracking pixels that follow you across the web.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-orange-800 mb-4">3. Third-Party Cookies</h2>
          <p>
            When you use third-party integrations like Google Drive or Dropbox through our site, they may set their own cookies to handle authentication. 
            PDF Garden does not control these cookies.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Google:</strong> Used for authentication and API access.</li>
            <li><strong>Dropbox:</strong> Used for the file picker interface and authentication.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-orange-800 mb-4">4. Managing Cookies</h2>
          <p>
            Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set, 
            visit <a href="https://www.aboutcookies.org" target="_blank" rel="noreferrer" className="text-blue-600 underline">www.aboutcookies.org</a> or 
            <a href="https://www.allaboutcookies.org" target="_blank" rel="noreferrer" className="text-blue-600 underline">www.allaboutcookies.org</a>.
          </p>
          <p>
            Find out how to manage cookies on popular browsers:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><a href="#" className="text-blue-600 hover:underline">Google Chrome</a></li>
            <li><a href="#" className="text-blue-600 hover:underline">Microsoft Edge</a></li>
            <li><a href="#" className="text-blue-600 hover:underline">Mozilla Firefox</a></li>
            <li><a href="#" className="text-blue-600 hover:underline">Apple Safari</a></li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-orange-800 mb-4">5. "Do Not Track" Signals</h2>
          <p>
            We respect "Do Not Track" (DNT) signals. If your browser sends a DNT signal, we do not engage in tracking mechanisms. 
            However, since we already limit tracking to the bare minimum required for functionality, your experience will remain largely the same.
          </p>
        </section>

        <section>
           <div className="bg-orange-50 p-6 rounded-lg mt-8">
             <h3 className="font-bold text-orange-900 text-lg mb-2">Consent</h3>
             <p>
               By using our website, you hereby consent to our Cookie Policy and agree to its terms. If you do not agree, please configure your browser settings accordingly or discontinue use of the site.
             </p>
           </div>
        </section>
      </div>
    </div>
  );
};

export default Cookies;
