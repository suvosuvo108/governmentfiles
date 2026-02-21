
import React from 'react';
import { Link } from 'react-router-dom';

const Press: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-12 px-6 bg-white shadow-2xl rounded-xl my-8">
      {/* Unique Page Identifier */}
      <div className="fixed bottom-4 left-4 bg-black text-white px-3 py-1 z-[9999] rounded-md font-mono text-xs opacity-70 pointer-events-none">Page: Press</div>
      <div className="border-b pb-6 mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 garden-text">Press & Media</h1>
        <p className="text-gray-500">Resources for journalists and content creators</p>
      </div>

      <div className="prose prose-lg max-w-none text-gray-700 space-y-12">
        
        {/* About Section */}
        <section className="grid md:grid-cols-3 gap-8">
           <div className="md:col-span-2">
             <h2 className="text-2xl font-bold text-cyan-800 mb-4">About PDF Garden</h2>
             <p>
               PDF Garden is a pioneering open-source platform dedicated to secure, client-side document processing. 
               Launched with the mission to democratize digital tools, it offers a 1000% free, privacy-focused alternative 
               to traditional server-based converters. By utilizing WebAssembly, PDF Garden ensures that user data never leaves the browser.
             </p>
             <p className="mt-4 font-bold text-gray-900">
               Boilerplate: <br/>
               <span className="font-normal text-gray-600">
                 "PDF Garden is a free, open-source, client-side PDF converter that prioritizes user privacy by processing all files locally on the device."
               </span>
             </p>
           </div>
           <div className="bg-cyan-50 p-6 rounded-xl border border-cyan-100">
              <h3 className="font-bold text-cyan-900 mb-4">Quick Facts</h3>
              <ul className="space-y-3 text-sm">
                 <li className="flex items-center gap-2"><i className="fas fa-check text-cyan-600"></i> Founded: 2023</li>
                 <li className="flex items-center gap-2"><i className="fas fa-check text-cyan-600"></i> HQ: Digital / Distributed</li>
                 <li className="flex items-center gap-2"><i className="fas fa-check text-cyan-600"></i> License: MIT Open Source</li>
                 <li className="flex items-center gap-2"><i className="fas fa-check text-cyan-600"></i> Core Tech: React, Wasm</li>
              </ul>
           </div>
        </section>

        <hr className="border-gray-200" />

        {/* Brand Assets */}
        <section>
           <h2 className="text-2xl font-bold text-cyan-800 mb-6">Brand Assets</h2>
           <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6 flex flex-col items-center hover:shadow-lg transition">
                 <div className="h-32 w-full bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <h1 className="text-3xl font-bold text-gray-800 garden-text">
                      <span className="text-green-600"><i className="fas fa-leaf mr-2"></i>PDF</span> Garden
                    </h1>
                 </div>
                 <h3 className="font-bold text-gray-800 mb-2">Full Logo (Light Mode)</h3>
                 <button className="text-cyan-600 font-bold hover:underline text-sm">Download SVG</button>
              </div>
              
              <div className="border border-gray-200 rounded-xl p-6 flex flex-col items-center hover:shadow-lg transition">
                 <div className="h-32 w-full bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                    <h1 className="text-3xl font-bold text-white garden-text">
                      <span className="text-green-400"><i className="fas fa-leaf mr-2"></i>PDF</span> Garden
                    </h1>
                 </div>
                 <h3 className="font-bold text-gray-800 mb-2">Full Logo (Dark Mode)</h3>
                 <button className="text-cyan-600 font-bold hover:underline text-sm">Download SVG</button>
              </div>
           </div>
        </section>

        {/* Color Palette */}
        <section>
           <h2 className="text-2xl font-bold text-cyan-800 mb-6">Brand Colors</h2>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                 <div className="h-20 bg-green-600 rounded-lg shadow-sm"></div>
                 <p className="font-mono text-xs text-center">Leaf Green<br/>#16A34A</p>
              </div>
              <div className="space-y-2">
                 <div className="h-20 bg-emerald-100 rounded-lg shadow-sm"></div>
                 <p className="font-mono text-xs text-center">Garden Mist<br/>#D1FAE5</p>
              </div>
              <div className="space-y-2">
                 <div className="h-20 bg-gray-800 rounded-lg shadow-sm"></div>
                 <p className="font-mono text-xs text-center">Soil Dark<br/>#1F2937</p>
              </div>
              <div className="space-y-2">
                 <div className="h-20 bg-blue-600 rounded-lg shadow-sm"></div>
                 <p className="font-mono text-xs text-center">Sky Blue<br/>#2563EB</p>
              </div>
           </div>
        </section>

        {/* Media Contact */}
        <section className="bg-gray-50 p-8 rounded-2xl border border-gray-200 text-center">
           <h2 className="text-2xl font-bold text-gray-800 mb-4">Media Inquiries</h2>
           <p className="text-gray-600 mb-6">
             For press releases, interview requests, or high-resolution imagery, please contact our media team.
           </p>
           <a href="mailto:digitalplatform.contact@gmail.com" className="inline-flex items-center gap-2 bg-cyan-700 text-white px-6 py-3 rounded-full font-bold hover:bg-cyan-800 transition">
             <i className="fas fa-envelope"></i> digitalplatform.contact@gmail.com
           </a>
        </section>
      </div>
    </div>
  );
};

export default Press;
