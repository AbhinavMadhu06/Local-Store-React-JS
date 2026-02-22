import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { UserPlus, Briefcase, User } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        mobile_number: '',
        password: '',
        role: 'JOB_SEEKER',
        company_name: '',
        description: '',
        location: '',
        latitude: null,
        longitude: null,
        logo: null
    });
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    const handleChange = (e) => {
        if (e.target.name === 'logo') {
            setFormData({ ...formData, logo: e.target.files[0] });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData({
                    ...formData,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                setIsLocating(false);
                // Optionally we could reverse geocode here to get a string location
            },
            () => {
                setError('Unable to retrieve your location. Please check your browser permissions.');
                setIsLocating(false);
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            let payload = null;
            let headers = {};

            if (formData.role === 'SHOP_OWNER') {
                payload = new FormData();
                payload.append('username', formData.username);
                payload.append('email', formData.email);
                payload.append('mobile_number', formData.mobile_number);
                payload.append('password', formData.password);
                payload.append('role', formData.role);
                payload.append('company_name', formData.company_name);
                payload.append('description', formData.description);
                payload.append('location', formData.location);

                if (formData.latitude) payload.append('latitude', formData.latitude);
                if (formData.longitude) payload.append('longitude', formData.longitude);
                if (formData.logo) payload.append('logo', formData.logo);

                headers = { 'Content-Type': 'multipart/form-data' };
            } else {
                payload = {
                    username: formData.username,
                    email: formData.email,
                    mobile_number: formData.mobile_number,
                    password: formData.password,
                    role: formData.role
                };
            }

            await api.post('users/', payload, { headers });

            if (formData.role === 'SHOP_OWNER') {
                navigate('/login', { state: { message: 'Registration successful! Your account is pending admin approval.' } });
            } else {
                navigate('/login', { state: { message: 'Registration successful! You can now log in.' } });
            }
        } catch (err) {
            if (err.response?.data?.username) {
                setError("That username is already taken. Please choose another.");
            } else if (err.response?.data?.password) {
                const pwdErrs = err.response.data.password;
                setError(Array.isArray(pwdErrs) ? pwdErrs[0] : pwdErrs);
            } else {
                setError('Registration failed. Please check your data and try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[calc(100vh-160px)] w-full">
            <div className="w-full max-w-4xl relative animate-fade-in-up">
                <div className="absolute -top-10 -left-10 w-48 h-48 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>

                <div className="glass-card rounded-3xl p-6 sm:p-8 relative z-10 shadow-2xl border-white/50">
                    <div className="text-center mb-6">
                        <div className="inline-flex shrink-0 items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-pink-600 mb-3 shadow-lg shadow-pink-500/30">
                            <UserPlus className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Create your account</h2>
                        <p className="max-w-xs mx-auto mt-1 text-xs text-slate-500 font-medium">Join securely today and connect with local stores.</p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-rose-50 border border-rose-200 text-rose-700 font-medium text-xs text-center p-2 rounded-xl shadow-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                            {/* Left Column: Account + Role */}
                            <div className={`space-y-4 ${formData.role === 'SHOP_OWNER' ? 'md:col-span-5' : 'md:col-span-8 md:col-start-3'}`}>
                                <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">I am registering as a:</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className={`cursor-pointer rounded-xl px-2 py-2 border-2 flex items-center justify-center gap-2 text-xs font-bold transition-all ${formData.role === 'JOB_SEEKER' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                            <input type="radio" name="role" value="JOB_SEEKER" className="hidden" checked={formData.role === 'JOB_SEEKER'} onChange={handleChange} />
                                            <User className="w-3.5 h-3.5" /> Seeker
                                        </label>
                                        <label className={`cursor-pointer rounded-xl px-2 py-2 border-2 flex items-center justify-center gap-2 text-xs font-bold transition-all ${formData.role === 'SHOP_OWNER' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                            <input type="radio" name="role" value="SHOP_OWNER" className="hidden" checked={formData.role === 'SHOP_OWNER'} onChange={handleChange} />
                                            <Briefcase className="w-3.5 h-3.5" /> Shop
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-slate-800 px-1 border-b pb-1">Account Details</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Username</label>
                                            <input name="username" type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 outline-none transition-all font-medium placeholder:text-slate-400" placeholder="johndoe123" value={formData.username} onChange={handleChange} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                                            <input name="email" type="email" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 outline-none transition-all font-medium placeholder:text-slate-400" placeholder="mail@ext.com" value={formData.email} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mobile</label>
                                            <input name="mobile_number" type="tel" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 outline-none transition-all font-medium placeholder:text-slate-400" placeholder="+1 234 567 890" value={formData.mobile_number} onChange={handleChange} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
                                            <input name="password" type="password" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 outline-none transition-all font-medium placeholder:text-slate-400" placeholder="Strong pwd" value={formData.password} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Shop Details (Only visible for SHOP_OWNER) */}
                            {formData.role === 'SHOP_OWNER' && (
                                <div className="space-y-3 md:col-span-7 md:pl-6 md:border-l border-slate-200 animate-[fadeIn_0.3s_ease-out]">
                                    <h3 className="text-sm font-bold text-slate-800 px-1 border-b pb-1">Shop Details</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Shop Name</label>
                                            <input name="company_name" type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 outline-none transition-all font-medium placeholder:text-slate-400" placeholder="Joe's Coffee" value={formData.company_name} onChange={handleChange} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Location Name</label>
                                            <input name="location" type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 outline-none transition-all font-medium placeholder:text-slate-400" placeholder="Downtown" value={formData.location} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">GPS (Optional)</label>
                                            <button
                                                type="button"
                                                onClick={handleGetLocation}
                                                disabled={isLocating}
                                                className="w-full h-[38px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl px-2 text-sm font-bold transition-all flex items-center justify-center gap-1"
                                            >
                                                <span>📍</span>
                                                {isLocating ? 'Locating...' : (formData.latitude ? 'Captured' : 'Use GPS')}
                                            </button>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Logo (Optional)</label>
                                            <input name="logo" type="file" accept="image/*" className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                                        <textarea name="description" required rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 outline-none transition-all font-medium text-sm placeholder:text-slate-400 resize-none" placeholder="What does your store do?" value={formData.description} onChange={handleChange} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 max-w-sm mx-auto">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center py-2.5 px-4 rounded-xl shadow-lg border border-transparent text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-pink-600 hover:shadow-pink-500/30 transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:hover:translate-y-0"
                            >
                                {isSubmitting ? 'Creating...' : 'Create Account'}
                            </button>
                        </div>

                        <div className="text-center pt-2">
                            <span className="text-sm text-slate-500 font-medium">Already have an account? </span>
                            <Link to="/login" className="text-sm font-bold text-indigo-600 hover:text-pink-600 transition-colors">Sign in here</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
