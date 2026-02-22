import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        // Clear the success message on new attempt
        if (location.state && location.state.message) {
            window.history.replaceState({}, document.title)
        }

        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            if (err.response?.data?.detail?.includes('active') || err.response?.data?.detail?.includes('No active account')) {
                setError('Your account is pending admin approval or inactive.');
            } else {
                setError('Invalid username or password. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[calc(100vh-160px)] w-full">
            <div className="w-full max-w-sm relative animate-fade-in-up">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

                <div className="glass-card rounded-3xl p-6 sm:p-8 relative z-10 shadow-2xl">
                    <div className="text-center">
                        <div className="inline-flex shrink-0 items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/30">
                            <LogIn className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Welcome back</h2>
                        <p className="mt-1 text-xs text-slate-500 font-medium">Log in to manage your local opportunities</p>
                    </div>

                    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                        {location.state?.message && !error && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium text-xs text-center p-2 rounded-xl">
                                {location.state.message}
                            </div>
                        )}
                        {error && (
                            <div className="bg-rose-50 border border-rose-200 text-rose-700 font-medium text-xs text-center p-2 rounded-xl">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1" htmlFor="username">Username</label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 outline-none transition-all font-medium text-sm placeholder:text-slate-400"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1" htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 outline-none transition-all font-medium text-sm placeholder:text-slate-400"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-2.5 px-4 rounded-xl shadow-lg border border-transparent text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:hover:translate-y-0"
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign In'}
                        </button>

                        <div className="text-center pt-1">
                            <span className="text-sm text-slate-500 font-medium">Don't have an account? </span>
                            <Link to="/register" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">Create one now</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
