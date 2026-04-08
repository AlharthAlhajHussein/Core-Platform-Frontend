'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { login } from '@/services/auth';

export default function LoginPage() {
  // 1. State Management: We use React's useState to hold the form data.
  // As the user types, these variables update in real-time.
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 2. Next.js Router: This allows us to programmatically redirect the user after login.
  const router = useRouter();

  // 3. Form Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents the browser from refreshing the page on submit
    setError('');       // Clear any previous errors
    setIsLoading(true); // Disable the button and show a loading state

    try {
      // Call the API service we built in Phase 2
      await login(username, password);
      
      // If we reach this line, the login was successful and cookies are set!
      // Redirect the user to the protected dashboard.
      router.push('/dashboard');
    } catch (err: any) {
      // Edge Case Handling: Catch 401 Unauthorized or 400 Bad Request
      let errorMessage = 'Login failed. Please check your credentials.';
      const detail = err.response?.data?.detail;
      
      // Check if FastAPI returned a string (e.g. 401) or an array of objects (e.g. 422)
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail) && detail.length > 0 && detail[0].msg) {
        errorMessage = detail[0].msg;
      }

      setError(errorMessage);
    } finally {
      // Whether it succeeded or failed, stop the loading spinner
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans">
      
      {/* LEFT SIDE: Branding / Decorative (Hidden on smaller screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 relative items-center justify-center overflow-hidden">
        {/* Subtle decorative gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center px-12">
          <div className="w-40 h-40 mb-8 shadow-2xl shadow-blue-500/50 rounded-2xl overflow-hidden">
            <Image 
              src="/my_logo1.png" 
              alt="AI Agents Platform Logo" 
              width={1008} 
              height={1044} 
              className="w-full h-full object-cover rounded-2xl"
              priority 
            />
          </div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4">
            AI Agents Platform
          </h1>
          <p className="text-lg text-slate-400 max-w-md">
            Manage your AI agents, streamline workflows, and monitor real-time conversations with enterprise-grade security.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: The Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-sm w-full space-y-8">
          
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-500">
              Please sign in to your account to continue.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow sm:text-sm"
                  placeholder="you@company.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Display error messages dynamically */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
