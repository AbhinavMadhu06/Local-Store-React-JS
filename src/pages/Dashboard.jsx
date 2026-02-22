import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Users, Presentation, FileText, AlertTriangle, MessageCircle, Clock } from 'lucide-react';

const COLORS = ['#8b5cf6', '#10b981', '#f43f5e'];

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [applications, setApplications] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isShopOwner, setIsShopOwner] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const appsRes = await api.get('applications/');
                setApplications(appsRes.data);

                try {
                    const analyticsRes = await api.get('shops/analytics/');
                    setAnalytics(analyticsRes.data);
                    setIsShopOwner(true);
                    setIsVerified(analyticsRes.data.shop_verified);
                } catch (e) {
                    // 403 means they are a job seeker
                    setIsShopOwner(false);
                }
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="w-full space-y-10 animate-fade-in-up">

            {/* Header */}
            <div className="glass-dark rounded-3xl overflow-hidden relative shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-indigo-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 via-purple-600/90 to-pink-600/90 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                {/* Decorative floating orbs */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-60 h-60 bg-indigo-400 opacity-20 rounded-full blur-2xl"></div>

                <div className="p-8 sm:p-12 relative z-10 flex flex-col md:flex-row gap-6 justify-between items-center">
                    <div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md">
                            {isShopOwner ? 'Shop Analytics' : 'My Applications'}
                        </h1>
                        <p className="text-indigo-100/90 mt-3 font-medium text-lg max-w-xl leading-relaxed">
                            {isShopOwner ? "Track your shop's performance and manage incoming candidates." : "Track your active job applications and discover your next great local opportunity."}
                        </p>
                    </div>
                    {isShopOwner && (
                        <div className="flex items-center gap-2.5 bg-black/20 px-5 py-2.5 rounded-full border border-white/10 backdrop-blur-md shadow-inner">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
                            <span className="text-white text-sm font-bold tracking-wide">Live Data</span>
                        </div>
                    )}
                </div>
            </div>

            {isShopOwner && !isVerified && (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="font-bold text-amber-900 text-lg">Your shop is pending verification.</div>
                            <p className="text-amber-700 mt-0.5 font-medium">You will not be able to post new job vacancies until an admin verifies your profile.</p>
                        </div>
                    </div>
                </div>
            )}

            {!isShopOwner && (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/80">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out opacity-50"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-1">Total Applications</div>
                                <div className="text-4xl font-black text-slate-800">{applications.length}</div>
                            </div>
                        </div>

                        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-emerald-200/60 bg-gradient-to-br from-white to-emerald-50/30">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out opacity-50"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="text-emerald-700/70 font-bold uppercase tracking-wider text-xs mb-1">Accepted Roles</div>
                                <div className="text-4xl font-black text-emerald-600">{applications.filter(a => a.status === 'ACCEPTED').length}</div>
                            </div>
                        </div>

                        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-amber-200/60 bg-gradient-to-br from-white to-amber-50/30">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out opacity-50"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="text-amber-700/70 font-bold uppercase tracking-wider text-xs mb-1">Pending Review</div>
                                <div className="text-4xl font-black text-amber-600">{applications.filter(a => a.status === 'PENDING').length}</div>
                            </div>
                        </div>
                    </div>

                    {/* Job Seeker Chart */}
                    {applications.length > 0 && (
                        <div className="glass-card rounded-3xl p-6 sm:p-8 mb-8">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                                Application Health Overview
                            </h2>
                            <div className="h-64 sm:h-72 w-full flex justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Pending', value: applications.filter(a => a.status === 'PENDING').length },
                                                { name: 'Accepted', value: applications.filter(a => a.status === 'ACCEPTED').length },
                                                { name: 'Shortlisted', value: applications.filter(a => a.status === 'SHORTLISTED').length },
                                                { name: 'Rejected', value: applications.filter(a => a.status === 'REJECTED').length },
                                            ].filter(d => d.value > 0)}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            <Cell fill="#f59e0b" /> {/* Pending - Amber */}
                                            <Cell fill="#10b981" /> {/* Accepted - Emerald */}
                                            <Cell fill="#3b82f6" /> {/* Shortlisted - Blue */}
                                            <Cell fill="#f43f5e" /> {/* Rejected - Rose */}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                            itemStyle={{ color: '#1e293b' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {isShopOwner && analytics && (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-100 rounded-full group-hover:scale-110 transition-transform duration-500 ease-out"></div>
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <div className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-1">Total Posts</div>
                                    <div className="text-4xl font-black text-slate-800">{analytics.kpis.total_jobs}</div>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Presentation className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-100 rounded-full group-hover:scale-110 transition-transform duration-500 ease-out"></div>
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <div className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-1">Total Views</div>
                                    <div className="text-4xl font-black text-slate-800">{analytics.kpis.total_views}</div>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-pink-100 rounded-full group-hover:scale-110 transition-transform duration-500 ease-out"></div>
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <div className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-1">Applications</div>
                                    <div className="text-4xl font-black text-slate-800">{analytics.kpis.total_applications}</div>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600">
                                    <Users className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                        <div className="glass-card rounded-3xl p-6 sm:p-8">
                            <h2 className="text-xl font-bold text-slate-800 mb-6">Views per Job</h2>
                            <div className="h-64 sm:h-72 w-full">
                                {analytics.jobs_performance && analytics.jobs_performance.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={analytics.jobs_performance}
                                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                        >
                                            <defs>
                                                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="title" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                                itemStyle={{ color: '#8b5cf6' }}
                                            />
                                            <Area type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex justify-center items-center h-full text-slate-400 font-medium">No job view data available yet.</div>
                                )}
                            </div>
                        </div>

                        <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col">
                            <h2 className="text-xl font-bold text-slate-800 mb-6">Application Status Breakdown</h2>
                            <div className="h-64 sm:h-72 w-full flex-1">
                                {analytics.kpis.total_applications > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={analytics.applications_status}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {analytics.applications_status.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex justify-center items-center h-full text-slate-400 font-medium">No applications received yet.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Applications Table */}
            <div className="glass-card rounded-3xl p-8 shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 shadow-inner border border-indigo-200/50">
                            <FileText className="w-5 h-5" />
                        </div>
                        Manage Applications
                    </h2>
                </div>

                {applications.length === 0 ? (
                    <div className="bg-slate-50/80 border border-slate-100 rounded-3xl p-12 text-center flex flex-col items-center shadow-inner">
                        <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                            <FileText className="w-10 h-10 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-bold text-lg">No applications found.</p>
                        <p className="text-slate-400 font-medium text-sm mt-1 max-w-sm">When you apply to jobs, they will appear here with their live status updates.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200/60 shadow-sm bg-white">
                        <table className="min-w-full divide-y divide-slate-200/80">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-5 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Job Details</th>
                                    <th className="px-6 py-5 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">{isShopOwner ? 'Applicant' : 'Contact'}</th>
                                    <th className="px-6 py-5 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Applied On</th>
                                    <th className="px-6 py-5 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Status</th>
                                    <th className="px-6 py-5 text-left text-[11px] font-black tracking-widest text-slate-400 uppercase">Documents</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100/80">
                                {applications.map((app) => (
                                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-slate-900">{app.job_details?.title}</div>
                                            <div className="text-xs font-medium text-slate-500 bg-slate-100 inline-block px-2 py-0.5 rounded mt-1">{app.job_details?.shop?.company_name}</div>
                                            {!isShopOwner && app.owner_note && (
                                                <button
                                                    onClick={() => setSelectedNote({ title: app.job_details?.title, note: app.owner_note })}
                                                    className="mt-3 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                                                >
                                                    <MessageCircle className="w-3.5 h-3.5" /> View Message
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-900 font-bold">{app.applicant?.username}</div>
                                            <div className="text-xs text-slate-500 font-medium">{app.applicant?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                                            {new Date(app.applied_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${app.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                app.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                                                    app.status === 'SHORTLISTED' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                        'bg-amber-100 text-amber-800 border-amber-200'
                                                }`}>
                                                {app.status === 'SHORTLISTED' ? '⭐ SHORTLISTED' : app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {app.cv ? (
                                                <a href={app.cv} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 font-bold mr-3 inline-block">📄 View CV</a>
                                            ) : (
                                                <span className="text-slate-400 font-medium mr-3 inline-block">No CV</span>
                                            )}
                                            <br />
                                            <span className="text-xs text-slate-400 font-medium max-w-[200px] block truncate mt-1 leading-tight" title={app.notes}>{app.notes ? `"${app.notes}"` : 'No additional notes'}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedNote && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedNote(null)}></div>
                    <div className="glass shadow-2xl rounded-3xl max-w-sm w-full p-8 relative z-10 animate-[fadeIn_0.2s_ease-out]">
                        <button
                            onClick={() => setSelectedNote(null)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                        >
                            ✕
                        </button>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Message from Shop</h3>
                        <p className="text-sm font-medium text-slate-500 mb-4">{selectedNote.title}</p>
                        <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 relative">
                            <span className="text-indigo-900 font-medium italic leading-relaxed">"{selectedNote.note}"</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
