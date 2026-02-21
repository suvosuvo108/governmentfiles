
import React from 'react';
import { Link } from 'react-router-dom';

const Contact: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-12 px-6 bg-white shadow-2xl rounded-xl my-8">
      {/* Unique Page Identifier */}
      <div className="fixed bottom-4 left-4 bg-black text-white px-3 py-1 z-[9999] rounded-md font-mono text-xs opacity-70 pointer-events-none">Page: Contact</div>
      <div className="border-b pb-6 mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 garden-text">Contact Us</h1>
        <p className="text-gray-500">We'd love to hear from you</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <p className="text-lg text-gray-700 leading-relaxed">
            Whether you have a question about features, trials, pricing, need a demo, or anything else, our team is ready to answer all your questions.
          </p>
          
          <div className="bg-teal-50 p-6 rounded-xl border border-teal-100 shadow-sm">
             <h3 className="text-2xl font-bold text-teal-800 mb-2">Get in Touch Directly</h3>
             <p className="text-gray-600 mb-4">For all general inquiries, partnership opportunities, or technical support, please email us at:</p>
             <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-teal-200">
                <i className="fas fa-envelope text-teal-600 text-xl"></i>
                <a href="mailto:digitalplatform.contact@gmail.com" className="text-lg font-bold text-gray-800 hover:text-teal-600 transition">
                  digitalplatform.contact@gmail.com
                </a>
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                   <i className="fas fa-comments"></i>
                </div>
                <div>
                   <h4 className="font-bold text-gray-800">Support</h4>
                   <p className="text-sm text-gray-600">Facing issues with conversion? Let us know the details.</p>
                </div>
             </div>
             <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                   <i className="fas fa-handshake"></i>
                </div>
                <div>
                   <h4 className="font-bold text-gray-800">Partnerships</h4>
                   <p className="text-sm text-gray-600">Interested in open-source collaboration? We are open to PRs.</p>
                </div>
             </div>
          </div>
        </div>

        {/* Decorative Side */}
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-8 rounded-2xl text-white shadow-xl h-full flex flex-col justify-between">
           <div>
              <h3 className="text-2xl font-bold mb-4 garden-text">Global Headquarters</h3>
              <p className="opacity-90 mb-6">
                PDF Garden is a digital-first, distributed open-source organization. We operate from the cloud, cultivating code across time zones.
              </p>
              
              <div className="space-y-4 mt-8">
                 <div className="flex items-center gap-3">
                    <i className="fas fa-globe-americas"></i>
                    <span>Worldwide Availability</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <i className="fas fa-clock"></i>
                    <span>24/7 Service Uptime</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <i className="fas fa-shield-alt"></i>
                    <span>100% Secure Operations</span>
                 </div>
              </div>
           </div>
           
           <div className="mt-12 text-center">
              <i className="fas fa-paper-plane text-6xl opacity-20"></i>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
