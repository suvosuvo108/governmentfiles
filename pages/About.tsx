
import React from 'react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-12 px-6 bg-white shadow-2xl rounded-xl my-8">
      {/* Unique Page Identifier */}
      <div className="fixed bottom-4 left-4 bg-black text-white px-3 py-1 z-[9999] rounded-md font-mono text-xs opacity-70 pointer-events-none">Page: About</div>
      <div className="text-center mb-12">
        <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Our Story</span>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-6 garden-text">Cultivating a Better Web</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We believe that essential digital tools should be accessible, private, and free for everyone, forever.
        </p>
      </div>

      <div className="prose prose-lg max-w-none text-gray-700 space-y-12">
        {/* Section 1 */}
        <section className="grid md:grid-cols-2 gap-10 items-center">
           <div>
              <h2 className="text-3xl font-bold text-indigo-800 mb-4">The Seed of an Idea</h2>
              <p>
                PDF Garden started with a simple frustration: why do simple file conversions require uploading sensitive documents to unknown servers? Why are basic tools hidden behind paywalls or riddled with ads?
              </p>
              <p>
                We planted the seed for a different kind of platform. One that respects user privacy by design. By leveraging modern browser technologies like WebAssembly, we realized we could bring powerful PDF processing capabilities directly to the user's device, eliminating the need for server-side uploads entirely.
              </p>
           </div>
           <div className="bg-indigo-50 p-8 rounded-2xl border-l-8 border-indigo-500 shadow-md">
              <blockquote className="italic text-xl text-indigo-900">
                "Privacy isn't a feature; it's the soil in which trust grows. We built PDF Garden to be a sanctuary for your documents."
              </blockquote>
           </div>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-3xl font-bold text-indigo-800 mb-6 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
             <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-500 text-center">
                <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4 text-2xl">
                   <i className="fas fa-lock"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">Privacy First</h3>
                <p className="text-sm">Your data never leaves your device. We engineered our architecture to ensure zero-knowledge processing.</p>
             </div>
             
             <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500 text-center">
                <div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4 text-2xl">
                   <i className="fas fa-infinity"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">Always Free</h3>
                <p className="text-sm">No trials, no watermarks, no limits. Education and productivity shouldn't have a price tag.</p>
             </div>

             <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-purple-500 text-center">
                <div className="h-14 w-14 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mx-auto mb-4 text-2xl">
                   <i className="fas fa-users"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">Community Driven</h3>
                <p className="text-sm">Open source at heart. We thrive on feedback, contributions, and the collective wisdom of the web.</p>
             </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="bg-gray-900 text-white p-8 rounded-2xl">
           <h2 className="text-3xl font-bold text-white mb-4">Join the Movement</h2>
           <p className="text-gray-300 mb-6">
             We are more than just a converter; we are a community of developers, designers, and privacy advocates. 
             If you share our vision of a faster, safer, and freer internet, join us.
           </p>
           <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                 <i className="fab fa-github"></i> Open Source
              </span>
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                 <i className="fas fa-code"></i> Modern Stack
              </span>
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                 <i className="fas fa-globe"></i> Global Reach
              </span>
           </div>
        </section>
      </div>
    </div>
  );
};

export default About;
