/**
 * Example: Login Page with TanStack Query
 * Demonstrates proper API integration with loading, success, and error handling
 */

import React, { useState } from 'react';
import { useLogin } from '../../hooks/api/useAuthQueries';
import { Spinner } from '../../components/ui/skeleton';

const LoginExample = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Use the login mutation hook
    const loginMutation = useLogin();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Call the mutation
        loginMutation.mutate({ email, password });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-2xl font-bold text-center mb-6">Login to HiveHR</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loginMutation.isPending}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="your.email@company.com"
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loginMutation.isPending}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Error Message */}
                    {loginMutation.isError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">
                                {loginMutation.error?.message || 'Login failed. Please try again.'}
                            </p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loginMutation.isPending}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loginMutation.isPending ? (
                            <>
                                <Spinner size="sm" />
                                Logging in...
                            </>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>

                {/* Additional Links */}
                <div className="mt-6 text-center">
                    <a href="/forgot-password" className="text-sm text-gray-600 hover:text-black">
                        Forgot password?
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LoginExample;
