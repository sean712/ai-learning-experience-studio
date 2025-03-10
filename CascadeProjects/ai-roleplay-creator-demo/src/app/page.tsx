import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="mb-4 flex items-center justify-center">
            <div className="px-4 py-2 bg-[#003E74] text-white rounded-md text-sm font-medium">
              Imperial College Business School
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            AI Learning Experience Studio
          </h1>
          
          <p className="text-xl mb-3 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Create immersive educational experiences with AI-powered learning interactions.
            Designed exclusively for Imperial College Business School faculty.
          </p>
          
          <p className="text-md mb-8 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            A project of the <span className="font-semibold text-[#1D8348]">IDEA Lab</span>
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link 
              href="/demo"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:from-purple-700 hover:to-blue-600 transition-all font-medium shadow-lg hover:shadow-xl flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Try Demo
            </Link>
            
            <Link 
              href="/create"
              className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium">
              Create Learning Experience
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <Link 
            href="/create"
            className="group p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-2xl font-semibold mb-3 group-hover:text-blue-500 transition-colors">
              Create Learning Experience
              <span className="inline-block transition-transform group-hover:translate-x-1 ml-1">
                →
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Design interactive learning experiences with AI as a roleplay character, discussion partner, feedback coach, or learning facilitator.
            </p>
          </Link>
          
          <Link 
            href="/manage"
            className="group p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-2xl font-semibold mb-3 group-hover:text-blue-500 transition-colors">
              Manage Experiences
              <span className="inline-block transition-transform group-hover:translate-x-1 ml-1">
                →
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              View, edit, and share your AI learning experiences with your students using secure access codes.
            </p>
          </Link>
        </div>
        
        <div className="mt-16 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
          <h3 className="text-xl font-semibold mb-3">For Faculty, By Faculty</h3>
          <ol className="text-left space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span> 
              <span>Create an AI learning experience aligned with your pedagogical goals</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span> 
              <span>Choose from multiple interaction types: roleplay, feedback, discussion, or other educational roles</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span> 
              <span>Upload course materials to provide relevant, curriculum-aligned knowledge</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">4.</span> 
              <span>Share with your students using secure access codes</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">5.</span> 
              <span>Watch as students engage deeply with personalized learning interactions</span>
            </li>
          </ol>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Custom Learning Content</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Upload your course materials and readings to create a knowledge base for accurate, curriculum-aligned interactions across all learning formats.
            </p>
          </div>
          
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Access</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Control student access with unique access codes, ensuring only your class can participate in the learning experience.
            </p>
          </div>
          
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Diverse Learning Modes</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Choose from multiple AI-powered learning modes including roleplay characters, discussion facilitators, feedback coaches, and other customizable educational roles.
            </p>
          </div>
        </div>
        
        <div className="mt-16 p-8 bg-blue-600 text-white rounded-xl text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Teaching?</h3>
          <p className="text-lg mb-6">Create engaging, personalized AI learning experiences in multiple formats that your students will love.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/demo" 
              className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Try Demo
            </Link>
            <Link 
              href="/create" 
              className="px-6 py-3 bg-white/20 border border-white text-white rounded-lg hover:bg-white/30 transition-colors font-medium"
            >
              Create Your First Experience
            </Link>
          </div>
        </div>
        
        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-[#003E74] flex items-center justify-center text-white font-bold text-xs mr-2">
                IC
              </div>
              <span className="text-sm font-medium text-[#003E74]">Imperial College Business School</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-[#1D8348] flex items-center justify-center text-white font-bold text-xs mr-2">
                IL
              </div>
              <span className="text-sm font-medium text-[#1D8348]">IDEA Lab</span>
            </div>
          </div>
          <p className="text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} Imperial College Business School</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Created and supported by the IDEA Lab</p>
        </footer>
      </main>
    </div>
  );
}
