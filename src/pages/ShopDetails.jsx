import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { MapPin, Briefcase, Clock, Users, DollarSign, Building2, KeyRound, Save, Phone } from 'lucide-react';
import { AuthContext } from '../AuthContext';

const ShopDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [shop, setShop] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isOwner, setIsOwner] = useState(false);

    // Password state
    const [showPwdModal, setShowPwdModal] = useState(false);
    const [pwdData, setPwdData] = useState({ current_password: '', new_password: '', confirm_password: '' });
    const [pwdStatus, setPwdStatus] = useState({ type: '', message: '' });
    const [isChangingPwd, setIsChangingPwd] = useState(false);

    useEffect(() => {
        const fetchShopDetails = async () => {
            try {
                const shopRes = await api.get(`shops/${id}/`);
                setShop(shopRes.data);

                const jobsRes = await api.get('jobs/');
                const shopJobs = jobsRes.data.filter(job => job.shop.id === parseInt(id));
                setJobs(shopJobs);

                // Check ownership
                if (user) {
                    try {
                        const myShopRes = await api.get('shops/my_shop/');
                        if (myShopRes.data.id === parseInt(id)) {
                            setIsOwner(true);
                        }
                    } catch (e) {
                        // Not owner or not a shop
                    }
                }

            } catch (err) {
                console.error("Failed to fetch shop details", err);
            } finally {
                setLoading(false);
            }
        };
        fetchShopDetails();
    }, [id, user]);

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

    if (!shop) return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-slate-700">Company not found</h2>
            <Link to="/" className="text-indigo-600 hover:underline mt-4 inline-block">Return Home</Link>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 sm:px-6">
            {/* Header / Hero Section */}
            <div className="glass-card rounded-[2.5rem] overflow-hidden relative shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200/50">
                <div className="h-56 md:h-72 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500 opacity-20 rounded-full blur-3xl mix-blend-screen"></div>
                    <div className="absolute bottom-0 left-10 -mb-20 w-72 h-72 bg-purple-500 opacity-20 rounded-full blur-3xl mix-blend-screen"></div>
                </div>

                <div className="px-8 pb-10 sm:px-14 relative z-10">
                    <div className="flex flex-col sm:flex-row gap-8 relative">
                        {/* Logo Box */}
                        <div className="w-36 h-36 sm:w-44 sm:h-44 bg-white rounded-3xl shadow-xl flex items-center justify-center overflow-hidden border-[6px] border-white shrink-0 -mt-20 sm:-mt-24 ring-4 ring-indigo-50/50 relative group">
                            <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            {shop.logo ? (
                                <img src={shop.logo} alt={shop.company_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <Building2 className="w-16 h-16 text-slate-200 group-hover:scale-110 transition-transform duration-500" />
                            )}
                        </div>

                        <div className="pt-2 sm:pt-4 flex-1">
                            <h1 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight leading-tight mb-3 flex items-center gap-4 drop-shadow-sm">
                                {shop.company_name}
                            </h1>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="inline-flex items-center gap-2.5 text-slate-600 font-bold bg-slate-100/80 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-200/50 w-max">
                                    <MapPin className="w-5 h-5 text-indigo-500" />
                                    {shop.location}
                                </div>
                                {shop.user?.email && (
                                    <div className="inline-flex items-center gap-2.5 text-slate-600 font-bold bg-slate-100/80 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-200/50 w-max">
                                        <span className="w-5 h-5 flex items-center justify-center text-indigo-500">📧</span>
                                        {shop.user.email}
                                    </div>
                                )}
                                {shop.user?.mobile_number && (
                                    <div className="inline-flex items-center gap-2.5 text-slate-600 font-bold bg-slate-100/80 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-200/50 w-max">
                                        <Phone className="w-4 h-4 text-indigo-500" />
                                        {shop.user.mobile_number}
                                    </div>
                                )}
                                {isOwner && (
                                    <button
                                        onClick={() => setShowPwdModal(true)}
                                        className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5"
                                    >
                                        <KeyRound className="w-4 h-4" /> Change Password
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Details Sidebar */}
                        <div className="lg:col-span-1 space-y-8">
                            <div className="bg-slate-50/50 rounded-3xl p-6 sm:p-8 border border-slate-100">
                                <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                    <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                                    About Us
                                </h3>
                                <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
                                    {shop.description}
                                </p>
                            </div>

                            {/* Map Box */}
                            {(shop.latitude && shop.longitude) ? (
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Location Map</h3>
                                    <div className="rounded-2xl overflow-hidden h-64 shadow-inner border border-slate-200">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            scrolling="no"
                                            marginHeight="0"
                                            marginWidth="0"
                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${shop.longitude - 0.01},${shop.latitude - 0.01},${shop.longitude + 0.01},${shop.latitude + 0.01}&layer=mapnik&marker=${shop.latitude},${shop.longitude}`}
                                            className="b-0"
                                            title="Shop Location"
                                        ></iframe>
                                    </div>
                                    <div className="mt-2 text-right">
                                        <a
                                            href={`https://www.openstreetmap.org/?mlat=${shop.latitude}&mlon=${shop.longitude}#map=16/${shop.latitude}/${shop.longitude}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-indigo-600 text-xs font-bold hover:underline"
                                        >
                                            View Larger Map
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                                    <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-500 font-medium text-sm">Exact map coordinates not provided by this shop.</p>
                                </div>
                            )}
                        </div>

                        {/* Open Vacancies */}
                        <div className="lg:col-span-2">
                            <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 shadow-inner border border-indigo-200/50">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                Open Roles
                                <span className="text-sm font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1 rounded-full ml-2 shadow-sm">{jobs.filter(j => j.is_active).length}</span>
                            </h2>

                            {jobs.filter(job => job.is_active).length === 0 ? (
                                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-12 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                                        <Briefcase className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <p className="text-slate-500 font-bold text-lg">No active job vacancies at the moment.</p>
                                    <p className="text-slate-400 font-medium text-sm mt-1">Check back later for new opportunities!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {jobs.filter(job => job.is_active).map(job => (
                                        <Link
                                            key={job.id}
                                            to={`/jobs/${job.id}`}
                                            className="block glass-card bg-white hover:bg-slate-50/80 p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                                            <div className="relative z-10 flex flex-col h-full justify-between">
                                                <div>
                                                    <h3 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors mb-4 pr-8 line-clamp-2 leading-tight">
                                                        {job.title}
                                                    </h3>
                                                    <div className="flex flex-col gap-2.5">
                                                        <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-lg w-max backdrop-blur-sm border border-slate-200/50">
                                                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                                            {job.job_type.replace('_', ' ')}
                                                        </span>
                                                        {job.salary_range && (
                                                            <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg w-max border border-emerald-100">
                                                                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> {job.salary_range}
                                                            </span>
                                                        )}
                                                        <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-lg w-max backdrop-blur-sm border border-slate-200/50">
                                                            <Users className="w-3.5 h-3.5 text-blue-500" />
                                                            {job.experience_required}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-6 flex justify-end">
                                                    <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:shadow-indigo-500/30">
                                                        &rarr;
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
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

export default ShopDetails;
