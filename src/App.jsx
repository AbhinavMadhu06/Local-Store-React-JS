import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './AuthContext';
import { Briefcase, LayoutDashboard, LogIn, UserPlus, LogOut, Building2 } from 'lucide-react';
import api from './api';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JobDetails from './pages/JobDetails';
import ShopDetails from './pages/ShopDetails';
import Dashboard from './pages/Dashboard';
import CreateJob from './pages/CreateJob';
import UserProfile from './pages/UserProfile';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [isShopOwner, setIsShopOwner] = useState(false);
    const [shopId, setShopId] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (user) {
            api.get('shops/my_shop/')
                .then((res) => {
                    setIsShopOwner(true);
                    setShopId(res.data.id);
                })
                .catch(() => {
                    setIsShopOwner(false);
                    setShopId(null);
                });
        } else {
            setIsShopOwner(false);
            setShopId(null);
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-[0_4px_30px_rgba(0,0,0,0.03)] mb-8 transition-all duration-300">
            <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
                <div className="flex items-center justify-between relative h-12 sm:h-14">
                    {/* Logo Area */}
                    <div className="flex-1 flex items-center justify-start">
                        <Link to="/" className="flex items-center space-x-2.5 group">
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 sm:p-2.5 rounded-xl shadow-md group-hover:scale-105 group-hover:shadow-indigo-500/30 transition-all">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-800 tracking-tight group-hover:opacity-80 transition-opacity">
                                LocalStore
                            </span>
                        </Link>
                    </div>

                    {/* Centered Navigation Links */}
                    {!isShopOwner && (
                        <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center space-x-1 font-bold text-sm text-slate-600 bg-slate-50/80 px-1.5 py-1.5 rounded-full border border-slate-200/60 shadow-sm backdrop-blur-md">
                            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-5 py-1.5 rounded-full hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all focus:outline-none">Home</Link>
                            <a href="/#jobs" className="px-5 py-1.5 rounded-full hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all focus:outline-none">Jobs</a>
                            <a href="/#companies" className="px-5 py-1.5 rounded-full hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all focus:outline-none">Local Companies</a>
                        </nav>
                    )}

                    {/* User Actions Area */}
                    <div className="flex-1 flex items-center justify-end space-x-2 sm:space-x-3">
                        {user ? (
                            <>
                                {isShopOwner && (
                                    <>
                                        <a
                                            href="/#jobs"
                                            className="hidden md:block font-bold text-sm text-slate-600 hover:text-indigo-600 transition-colors px-3 py-2 rounded-xl hover:bg-slate-50"
                                            onClick={(e) => {
                                                if (location.pathname === '/') {
                                                    e.preventDefault();
                                                    document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' });
                                                }
                                            }}
                                        >
                                            View Listings
                                        </a>
                                        {shopId && (
                                            <Link
                                                to={`/shops/${shopId}`}
                                                className={`hidden md:flex items-center space-x-1.5 px-4 py-2 text-sm rounded-full font-bold transition-all ${location.pathname.includes('/shops/') ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600 border border-transparent'}`}
                                                title="View Public Profile"
                                            >
                                                <Building2 className="w-4 h-4" />
                                                <span>My Shop</span>
                                            </Link>
                                        )}
                                    </>
                                )}
                                {!isShopOwner && (
                                    <Link
                                        to="/profile"
                                        className={`flex items-center space-x-1.5 px-4 py-2 text-sm rounded-full font-bold transition-all ${location.pathname === '/profile' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600 border border-transparent'}`}
                                    >
                                        <span className="hidden sm:inline">My Profile</span>
                                    </Link>
                                )}
                                <Link
                                    to="/dashboard"
                                    className={`flex items-center space-x-1.5 px-4 py-2 text-sm rounded-full font-bold transition-all ${location.pathname === '/dashboard' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600 border border-transparent'}`}
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    <span className="hidden sm:inline">Dashboard</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1.5 px-3 py-2 text-sm rounded-full font-bold text-rose-600 hover:bg-rose-50 transition-colors border border-transparent"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="flex items-center space-x-1.5 px-4 py-2 rounded-full font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    <span className="hidden sm:inline">Sign In</span>
                                    <LogIn className="w-4 h-4 sm:hidden" />
                                </Link>
                                <Link
                                    to="/register"
                                    className="flex items-center space-x-1.5 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
                                >
                                    <span className="hidden sm:inline">Post a Job / Apply</span>
                                    <UserPlus className="w-4 h-4 sm:hidden" />
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header >
    );
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="min-h-screen relative flex flex-col">
                    {/* Decorative background blobs - Wrapped to prevent overflow */}
                    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                        <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                        <div className="absolute top-0 -right-40 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                        <div className="absolute -bottom-40 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                    </div>

                    <Navbar />

                    <main className="flex-1 flex flex-col max-w-[1500px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 z-10 overflow-x-hidden">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/jobs/create" element={<CreateJob />} />
                            <Route path="/jobs/:id" element={<JobDetails />} />
                            <Route path="/shops/:id" element={<ShopDetails />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/profile" element={<UserProfile />} />
                        </Routes>
                    </main>

                    <footer className="bg-slate-900 border-t border-slate-800 mt-auto w-full text-slate-300 relative z-0">
                        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                <div className="md:col-span-2">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <Briefcase className="w-6 h-6 text-indigo-400" />
                                        <span className="text-2xl font-black text-white tracking-tight">LocalStore</span>
                                    </div>
                                    <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                                        Connecting local talent with businesses in your community. Find jobs, build your career, and hire locally.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Quick Links</h4>
                                    <ul className="space-y-2 text-sm font-medium">
                                        <li><Link to="/" className="hover:text-indigo-400 transition-colors">Home Feed</Link></li>
                                        <li><a href="/#jobs" className="hover:text-indigo-400 transition-colors">Latest Vacancies</a></li>
                                        <li><a href="/#companies" className="hover:text-indigo-400 transition-colors">Local Companies</a></li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Account</h4>
                                    <ul className="space-y-2 text-sm font-medium">
                                        <li><Link to="/login" className="hover:text-indigo-400 transition-colors">Sign In</Link></li>
                                        <li><Link to="/register" className="hover:text-indigo-400 transition-colors">Register as Shop</Link></li>
                                        <li><Link to="/register" className="hover:text-indigo-400 transition-colors">Register as Seeker</Link></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500">
                                <div>&copy; {new Date().getFullYear()} LocalStore platform. All rights reserved.</div>
                                <div className="flex gap-4">
                                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
