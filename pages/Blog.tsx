
import React from 'react';
import { Link } from 'react-router-dom';

const BLOG_POSTS = [
  {
    id: 1,
    title: "Why Client-Side PDF Conversion is the Future of Privacy",
    excerpt: "In an age of data breaches, processing documents directly in the browser offers an unparalleled security advantage. Learn how WebAssembly is changing the game.",
    date: "Oct 24, 2023",
    author: "Sarah Jenkins",
    category: "Technology",
    color: "blue"
  },
  {
    id: 2,
    title: "5 Tips to Organize Your Digital Documents Efficiently",
    excerpt: "Drowning in a sea of PDFs? Discover the gardening method for digital file organization that keeps your virtual workspace blooming and clutter-free.",
    date: "Oct 18, 2023",
    author: "Michael Chen",
    category: "Productivity",
    color: "green"
  },
  {
    id: 3,
    title: "The Open Source Revolution: Why Free Software Wins",
    excerpt: "Proprietary software is losing ground to community-driven alternatives. We explore why transparent, free tools like PDF Garden are becoming the new standard.",
    date: "Oct 10, 2023",
    author: "Alex Rivera",
    category: "Open Source",
    color: "purple"
  },
  {
    id: 4,
    title: "Understanding Image Formats: JPG vs PNG for Documents",
    excerpt: "When should you convert your PDF to JPG? When is PNG better? A technical deep dive into compression algorithms and visual fidelity.",
    date: "Sep 28, 2023",
    author: "David Kim",
    category: "Guides",
    color: "orange"
  }
];

const Blog: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      {/* Unique Page Identifier */}
      <div className="fixed bottom-4 left-4 bg-black text-white px-3 py-1 z-[9999] rounded-md font-mono text-xs opacity-70 pointer-events-none">Page: Blog</div>
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4 garden-text">The Gardener's Almanac</h1>
        <p className="text-xl text-gray-600">Insights, updates, and guides from the world of digital document management.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {BLOG_POSTS.map((post) => (
          <article key={post.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 border border-gray-100 flex flex-col">
            <div className={`h-2 bg-${post.color}-500 w-full`}></div>
            <div className="p-8 flex-grow">
               <div className="flex items-center justify-between mb-4">
                  <span className={`bg-${post.color}-100 text-${post.color}-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide`}>
                    {post.category}
                  </span>
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                    <i className="far fa-calendar-alt"></i> {post.date}
                  </span>
               </div>
               <h2 className="text-2xl font-bold text-gray-800 mb-4 hover:text-green-600 transition cursor-pointer leading-tight">
                 {post.title}
               </h2>
               <p className="text-gray-600 mb-6 leading-relaxed">
                 {post.excerpt}
               </p>
            </div>
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-xs">
                    {post.author.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{post.author}</span>
               </div>
               <button className="text-green-600 font-bold text-sm hover:underline">
                 Read Article <i className="fas fa-arrow-right ml-1"></i>
               </button>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl p-10 text-white text-center shadow-2xl">
         <h2 className="text-3xl font-bold mb-4 garden-text">Subscribe to Our Newsletter</h2>
         <p className="mb-8 opacity-90 max-w-2xl mx-auto">Get the latest tips on document security and productivity delivered straight to your inbox. No spam, just seeds of knowledge.</p>
         <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <input type="email" placeholder="Enter your email address" className="px-6 py-3 rounded-full text-gray-800 w-full focus:outline-none focus:ring-4 focus:ring-pink-300" />
            <button className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition shadow-lg whitespace-nowrap">
              Subscribe Now
            </button>
         </div>
      </div>
    </div>
  );
};

export default Blog;
