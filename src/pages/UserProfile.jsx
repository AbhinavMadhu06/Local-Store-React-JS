import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import api from '../api';
import { User, Mail, Phone, KeyRound, Save, Upload, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    // Password Modal State
    const [showPwdModal, setShowPwdModal] = useState(false);
    const [pwdData, setPwdData] = useState({ current_password: '', new_password: '', confirm_password: '' });
    const [pwdStatus, setPwdStatus] = useState({ type: '', message: '' });
    const [isChangingPwd, setIsChangingPwd] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchProfile = async () => {
            try {
                // Fetch the authenticated user's latest data via the /me/ endpoint
                const res = await api.get('users/me/');
                setProfileData(res.data);
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user, navigate]);

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUpdating(true);
        const formData = new FormData();
        formData.append('profile_photo', file);

        try {
            const res = await api.patch('users/update_profile/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfileData(res.data);
        } catch (error) {
            console.error("Failed to upload photo", error);
            alert("Failed to upload photo. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePwdChange = (e) => {
        setPwdData({ ...pwdData, [e.target.name]: e.target.value });
    };

    const submitPwdChange = async (e) => {
        e.preventDefault();
        setPwdStatus({ type: '', message: '' });

        if (pwdData.new_password !== pwdData.confirm_password) {
            setPwdStatus({ type: 'error', message: 'New passwords do not match' });
            return;
        }

        setIsChangingPwd(true);
        try {
            const res = await api.post('users/change_password/', {
                current_password: pwdData.current_password,
                new_password: pwdData.new_password,
                confirm_password: pwdData.confirm_password
            });
            setPwdStatus({ type: 'success', message: res.data.detail || 'Password updated successfully!' });
            setPwdData({ current_password: '', new_password: '', confirm_password: '' });
            setTimeout(() => {
                setShowPwdModal(false);
                setPwdStatus({ type: '', message: '' });
            }, 2000);
        } catch (err) {
            setPwdStatus({ type: 'error', message: err.response?.data?.detail || 'Failed to update password' });
        } finally {
            setIsChangingPwd(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!profileData) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4 sm:px-6">

            {/* Header / Hero Section */}
            <div className="glass-card rounded-3xl overflow-hidden relative shadow-xl">
                <div className="h-32 sm:h-48 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                </div>

                <div className="px-8 pb-10 sm:px-12 relative -mt-16 sm:-mt-20">
                    <div className="flex flex-col sm:flex-row gap-6 relative z-10 items-start sm:items-end">

                        {/* Profile Photo Area */}
                        <div className="relative group">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full shadow-xl flex items-center justify-center overflow-hidden border-4 border-white shrink-0">
                                {profileData.profile_photo ? (
                                    <img src={profileData.profile_photo} alt={profileData.username} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-16 h-16 text-slate-200" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-indigo-700 transition-colors border-2 border-white group-hover:scale-110">
                                {isUpdating ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : <Camera className="w-5 h-5" />}
                                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isUpdating} />
                            </label>
                        </div>

                        <div className="flex-1 pb-2 w-full">
                            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                                {profileData.username}
                            </h1>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 w-max tracking-wide uppercase">
                                    {profileData.role.replace('_', ' ')}
                                </span>

                                <button
                                    onClick={() => setShowPwdModal(true)}
                                    className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all"
                                >
                                    <KeyRound className="w-4 h-4" /> Change Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card rounded-3xl p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <User className="w-4 h-4" />
                        </div>
                        Personal Information
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Username</label>
                            <div className="text-slate-900 font-semibold text-lg">{profileData.username}</div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                            <div className="flex items-center gap-3 text-slate-700 font-medium">
                                <Mail className="w-5 h-5 text-indigo-400" />
                                {profileData.email}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mobile Number</label>
                            <div className="flex items-center gap-3 text-slate-700 font-medium">
                                <Phone className="w-5 h-5 text-indigo-400" />
                                {profileData.mobile_number || <span className="text-slate-400 italic">Not provided</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-3xl p-8 shadow-sm flex flex-col justify-center items-center text-center bg-gradient-to-br from-white to-slate-50">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-6">
                        <Save className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Keep your profile updated</h3>
                    <p className="text-slate-500 font-medium text-sm">Having a complete profile with a professional photo increases your chances of being noticed by top local stores.</p>
                </div>
            </div>

            {/* Password Modal */}
            {showPwdModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowPwdModal(false)}></div>
                    <div className="glass-card shadow-2xl rounded-3xl max-w-md w-full p-8 relative z-10 animate-[fadeIn_0.2s_ease-out]">
                        <button
                            onClick={() => setShowPwdModal(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                        >
                            ✕
                        </button>
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600"><KeyRound className="w-5 h-5" /></div>
                            Change Password
                        </h2>
                        <form onSubmit={submitPwdChange} className="space-y-4">
                            {pwdStatus.message && (
                                <div className={`p-3 rounded-xl text-sm font-bold shadow-sm ${pwdStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                    {pwdStatus.message}
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Password</label>
                                <input type="password" name="current_password" required value={pwdData.current_password} onChange={handlePwdChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 outline-none transition-all font-medium placeholder:text-slate-400" placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                                <input type="password" name="new_password" required value={pwdData.new_password} onChange={handlePwdChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 outline-none transition-all font-medium placeholder:text-slate-400" placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                                <input type="password" name="confirm_password" required value={pwdData.confirm_password} onChange={handlePwdChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 outline-none transition-all font-medium placeholder:text-slate-400" placeholder="••••••••" />
                            </div>
                            <button type="submit" disabled={isChangingPwd} className="w-full flex items-center gap-2 justify-center py-3 px-6 rounded-xl shadow-lg border border-transparent text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 disabled:hover:translate-y-0 mt-6">
                                {isChangingPwd ? 'Updating...' : <><Save className="w-4 h-4" /> Save New Password</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
