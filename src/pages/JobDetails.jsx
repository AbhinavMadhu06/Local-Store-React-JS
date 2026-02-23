import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../AuthContext';
import { Calendar, MapPin, DollarSign, Building, CheckCircle, Upload, MessageCircle, Users, FileText, Download, Briefcase, CheckCircle2 } from 'lucide-react';

const JobDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    // Application State
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [applyNotes, setApplyNotes] = useState('');
    const [applyCv, setApplyCv] = useState(null);
    const [applyMessage, setApplyMessage] = useState('');

    // Owner State
    const [isOwner, setIsOwner] = useState(false);
    const [applications, setApplications] = useState([]);
    const [showApplicants, setShowApplicants] = useState(false);
    const [applicantTab, setApplicantTab] = useState('ALL'); // ALL, PENDING, SHORTLISTED
    const [expandedApplicant, setExpandedApplicant] = useState(null);
    const [isJobActive, setIsJobActive] = useState(true);

    // Status Action Modal State
    const [actionModal, setActionModal] = useState({ isOpen: false, appId: null, actionType: null, applicantName: '' });
    const [actionNote, setActionNote] = useState('');
    const [rejectOthers, setRejectOthers] = useState(false);
    const [rejectOthersNote, setRejectOthersNote] = useState('');

    // Job Seeker State
    // Job Seeker State
    const [applicationStatus, setApplicationStatus] = useState(null);
    const [applicationNote, setApplicationNote] = useState(null);

    // Comment State
    const [commentText, setCommentText] = useState('');
    const [replyText, setReplyText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);

    useEffect(() => {
        if (showApplyModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [showApplyModal]);

    useEffect(() => {
        if (actionModal.isOpen) {
            document.body.style.overflow = 'hidden';
        } else if (!showApplyModal) {
            document.body.style.overflow = '';
        }
        return () => {
            if (!showApplyModal) document.body.style.overflow = '';
        };
    }, [actionModal.isOpen, showApplyModal]);

    useEffect(() => {
        fetchJob();
    }, [id, user]);

    const fetchJob = async () => {
        try {
            const response = await api.get(`jobs/${id}/`);
            setJob(response.data);

            // Check if current user is the owner by fetching profile
            if (user) {
                try {
                    const profileRes = await api.get('shops/my_shop/');
                    const myShop = profileRes.data;
                    const isMyJob = myShop.id === response.data.shop.id;
                    setIsOwner(isMyJob);

                    if (isMyJob) {
                        fetchApplications();
                        setIsJobActive(response.data.is_active);
                    } else {
                        checkIfApplied();
                    }
                } catch (e) {
                    setIsOwner(false);
                    checkIfApplied();
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchApplications = async () => {
        try {
            // Get all applications and filter for this job
            const res = await api.get('applications/');
            const jobApps = res.data.filter(app => app.job === parseInt(id));
            setApplications(jobApps);
        } catch (err) {
            console.error(err);
        }
    };

    const checkIfApplied = async () => {
        try {
            const res = await api.get('applications/');
            const applied = res.data.find(app => app.job === parseInt(id));
            if (applied) {
                setApplicationStatus(applied.status);
                setApplicationNote(applied.owner_note);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleJobStatus = async () => {
        try {
            const newStatus = !isJobActive;
            await api.patch(`jobs/${id}/`, { is_active: newStatus });
            setIsJobActive(newStatus);
            setJob({ ...job, is_active: newStatus });
        } catch (err) {
            console.error(err);
        }
    };

    const openActionModal = (appId, actionType, applicantName) => {
        setActionModal({ isOpen: true, appId, actionType, applicantName });
        setActionNote('');
        setRejectOthers(false);
        setRejectOthersNote('');
    };

    const submitApplicationAction = async () => {
        if (!actionModal.appId || !actionModal.actionType) return;

        try {
            let payload = { status: actionModal.actionType };
            if (actionNote) {
                payload.owner_note = actionNote;
            }

            const res = await api.patch(`applications/${actionModal.appId}/`, payload);
            let updatedApps = applications.map(app => app.id === actionModal.appId ? res.data : app);

            // If they selected bulk reject
            if (actionModal.actionType === 'ACCEPTED' && rejectOthers) {
                await api.post(`jobs/${id}/bulk_reject_pending/`, { owner_note: rejectOthersNote });
                // Optimistically update all pending/shortlisted to rejected locally
                updatedApps = updatedApps.map(app => {
                    if (app.id !== actionModal.appId && (app.status === 'PENDING' || app.status === 'SHORTLISTED')) {
                        return { ...app, status: 'REJECTED', owner_note: rejectOthersNote };
                    }
                    return app;
                });
            }

            setApplications(updatedApps);
            setActionModal({ isOpen: false, appId: null, actionType: null, applicantName: '' });

        } catch (err) {
            console.error("Failed to update application status", err);
            alert("Failed to update status.");
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        if (applyNotes) formData.append('notes', applyNotes);
        if (applyCv) formData.append('cv', applyCv);
        formData.append('meets_requirements', 'True');

        try {
            await api.post(`jobs/${id}/apply/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setApplyMessage('Application submitted successfully! Redirecting...');
            setApplicationStatus('PENDING');
            setTimeout(() => setShowApplyModal(false), 2000);
        } catch (err) {
            console.error("Apply error:", err.response?.data);
            let errMsg = 'Application failed. Please try again.';
            if (err.response?.data) {
                if (err.response.data.detail) {
                    errMsg = err.response.data.detail;
                } else if (typeof err.response.data === 'object') {
                    // Extract first error value from the DRF error object
                    const firstKey = Object.keys(err.response.data)[0];
                    if (firstKey) {
                        const firstError = err.response.data[firstKey];
                        errMsg = Array.isArray(firstError) ? firstError[0] : String(firstError);
                    }
                } else if (typeof err.response.data === 'string') {
                    errMsg = err.response.data;
                }
            }
            setApplyMessage(errMsg);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();

        const text = replyingTo ? replyText : commentText;
        if (!text.trim()) return;

        const payload = { text: text };
        if (replyingTo) {
            payload.parent = parseInt(replyingTo);
        }

        try {
            await api.post(`jobs/${id}/comment/`, payload);
            if (replyingTo) {
                setReplyText('');
                setReplyingTo(null);
            } else {
                setCommentText('');
            }
            fetchJob();
        } catch (err) {
            console.error("Comment submission failed", err.response?.data || err);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            await api.delete(`comments/${commentId}/`);
            fetchJob();
        } catch (err) {
            console.error("Failed to delete comment", err);
            alert("Failed to delete comment.");
        }
    };

    const handleDownloadCSV = async () => {
        try {
            const response = await api.get(`jobs/${id}/export_applicants_csv/`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.href = url;
            a.setAttribute('download', `applicants_job_${id}.csv`);
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            console.error("Failed to download CSV", err);
            alert("Failed to download applicant data.");
        }
    };

    if (loading) return <div className="text-center mt-20 animate-pulse text-indigo-600 font-bold text-xl">Loading Experience...</div>;
    if (!job) return <div className="text-center mt-20 text-slate-500">Job not found</div>;

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACCEPTED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'REJECTED': return 'bg-rose-100 text-rose-800 border-rose-200';
            case 'SHORTLISTED': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-amber-100 text-amber-800 border-amber-200';
        }
    };

    return (
        <div className="relative max-w-6xl mx-auto space-y-12 pb-20">
            {/* Hero Section */}
            <div className="glass-dark rounded-3xl overflow-hidden shadow-2xl relative min-h-[300px] flex items-end">
                {job.image && (
                    <div className="absolute inset-0 z-0">
                        <img src={job.image} alt={job.title} className="w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                    </div>
                )}
                {!job.image && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 mix-blend-overlay"></div>
                )}

                <div className="p-6 sm:p-12 relative z-10 flex flex-col md:flex-row gap-6 sm:gap-8 justify-between items-start md:items-end w-full">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md border border-white/30 shadow-sm">
                                {job.is_active ? '🟢 Accepting Applications' : '🔴 Closed'}
                            </span>
                            {isOwner && (
                                <button
                                    onClick={toggleJobStatus}
                                    className={`text-xs font-bold px-3 py-1 rounded-full border transition-colors ${job.is_active ? 'bg-rose-500/20 text-rose-100 border-rose-500/50 hover:bg-rose-500/40' : 'bg-emerald-500/20 text-emerald-100 border-emerald-500/50 hover:bg-emerald-500/40'}`}
                                >
                                    {job.is_active ? 'Close Job' : 'Reopen Job'}
                                </button>
                            )}
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg leading-tight">{job.title}</h1>
                        <div className="flex flex-wrap gap-3 sm:gap-4 text-indigo-100 font-medium drop-shadow-md text-sm sm:text-base">
                            <Link to={`/shops/${job.shop?.id}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                                <Building className="w-5 h-5" /> {job.shop?.company_name}
                            </Link>
                            <span className="flex items-center gap-1.5"><MapPin className="w-5 h-5" /> {job.shop?.location}</span>
                            {job.job_type && (
                                <span className="flex items-center gap-1.5 bg-white/20 px-2.5 py-0.5 rounded-md backdrop-blur-md uppercase text-xs font-bold tracking-wider">
                                    {job.job_type.replace('_', ' ')}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:space-x-4 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-white/20 md:border-0">
                        <div className="text-left sm:text-right sm:mr-4 text-white drop-shadow-md">
                            <div className="text-sm text-indigo-100 font-medium">Salary</div>
                            <div className="text-2xl font-bold flex items-center gap-1"><DollarSign className="w-5 h-5" /> {job.salary_range || 'Competitive'}</div>
                        </div>
                        {user ? (
                            !isOwner && (
                                applicationStatus ? (
                                    <div className="flex flex-col items-end gap-2 text-right">
                                        <div className={`px-5 py-2 rounded-xl text-sm font-bold border flex items-center gap-2 shadow-sm ${getStatusColor(applicationStatus)}`}>
                                            <CheckCircle className="w-4 h-4" />
                                            {applicationStatus === 'SHORTLISTED' ? "⭐ You're Shortlisted!" : `Application ${applicationStatus === 'PENDING' ? 'Pending' : applicationStatus === 'ACCEPTED' ? 'Accepted' : 'Rejected'}`}
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowApplyModal(true)}
                                        disabled={!job.is_active}
                                        className={`font-bold px-8 py-3.5 rounded-full transition-transform shadow-xl ${job.is_active ? 'bg-white text-indigo-900 hover:scale-105 shadow-white/10' : 'bg-slate-300 text-slate-500 cursor-not-allowed hidden'}`}
                                    >
                                        Apply Now
                                    </button>
                                )
                            )
                        ) : (
                            <Link to="/login" className="bg-white text-indigo-900 font-bold px-8 py-3.5 rounded-full hover:scale-105 transition-transform shadow-xl shadow-white/10">
                                Login to Apply
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                    <section className="glass-card rounded-3xl p-6 sm:p-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600"><CheckCircle className="w-5 h-5" /></span>
                            Role Overview
                        </h2>
                        <div className="prose prose-indigo max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                            {job.description}
                        </div>
                    </section>

                    {/* Q&A Section */}
                    <section className="glass rounded-3xl p-6 sm:p-8 border border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600"><MessageCircle className="w-5 h-5" /></span>
                            Public Q&A ({job.comments?.length || 0})
                        </h2>

                        <div className="space-y-6 mb-8">
                            {job.comments.length === 0 ? (
                                <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-slate-500 font-medium">No questions asked yet.</p>
                                </div>
                            ) : (
                                job.comments.map(c => (
                                    <div key={c.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-slate-800 flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center text-xs text-slate-600 uppercase">{c.user.charAt(0)}</div>
                                                {c.user}
                                            </span>
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs font-medium text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                                                {isOwner && (
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Reply</button>
                                                        <button onClick={() => handleDeleteComment(c.id)} className="text-xs font-bold text-rose-500 hover:text-rose-700">Delete</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-slate-600 ml-8">{c.text}</p>

                                        {/* Nested Replies */}
                                        {c.replies && c.replies.length > 0 && (
                                            <div className="ml-8 mt-4 space-y-3">
                                                {c.replies.map(reply => (
                                                    <div key={reply.id} className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-bold text-indigo-900 flex items-center gap-2 text-sm">
                                                                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-200 to-indigo-300 flex items-center justify-center text-[10px] text-indigo-700 uppercase">{reply.user.charAt(0)}</div>
                                                                {reply.user} (Owner)
                                                            </span>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[10px] font-medium text-slate-400">{new Date(reply.created_at).toLocaleDateString()}</span>
                                                                {isOwner && (
                                                                    <button onClick={() => handleDeleteComment(reply.id)} className="text-[10px] font-bold text-rose-400 hover:text-rose-600">Delete</button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-slate-600 text-sm ml-7">{reply.text}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {replyingTo === c.id && (
                                            <div className="ml-8 mt-4">
                                                <form onSubmit={handleCommentSubmit} className="relative mt-2">
                                                    <textarea
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 text-slate-700 outline-none text-sm resize-none"
                                                        rows="2"
                                                        placeholder={`Reply to ${c.user}...`}
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        required
                                                    ></textarea>
                                                    <div className="flex justify-end mt-2 gap-2">
                                                        <button type="button" onClick={() => { setReplyingTo(null); setReplyText(''); }} className="text-xs font-bold text-slate-500 hover:text-slate-700 px-3 py-1.5">Cancel</button>
                                                        <button type="submit" className="bg-indigo-600 text-white text-xs font-bold py-1.5 px-4 rounded-lg hover:bg-indigo-700">Send Reply</button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {user ? (
                            <form onSubmit={handleCommentSubmit} className="relative">
                                <textarea
                                    className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm px-5 py-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 outline-none transition-all resize-none font-medium"
                                    rows="3"
                                    placeholder="Ask a question about this role..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    required
                                ></textarea>
                                <button
                                    type="submit"
                                    className="absolute bottom-4 right-4 bg-slate-900 text-white font-medium py-2 px-6 rounded-xl hover:bg-indigo-600 transition-colors shadow-lg"
                                >
                                    Post
                                </button>
                            </form>
                        ) : (
                            <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl flex justify-between items-center">
                                <span className="text-indigo-800 font-medium">Join the conversation</span>
                                <Link to="/login" className="bg-white text-indigo-600 font-bold px-5 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow">Sign In</Link>
                            </div>
                        )}
                    </section>

                    {/* Owner Applicant View */}
                    {isOwner && (
                        <section className="glass rounded-3xl p-6 sm:p-8 border border-slate-200 mt-8 sm:mt-12 bg-white/60">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0"><Users className="w-5 h-5" /></span>
                                    Applicants for this Post ({applications.length})
                                </h2>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    {applications.length > 0 && (
                                        <button
                                            onClick={handleDownloadCSV}
                                            className="text-sm font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                                        >
                                            <Download className="w-4 h-4" /> Export CSV
                                        </button>
                                    )}
                                    {applications.length > 0 && (
                                        <button
                                            onClick={() => setShowApplicants(!showApplicants)}
                                            className="text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors"
                                        >
                                            {showApplicants ? 'Hide Applicants' : 'View All Applicants'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {showApplicants && (
                                <div className="space-y-6 transition-all duration-300">
                                    {/* Tabs */}
                                    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
                                        <button
                                            onClick={() => setApplicantTab('ALL')}
                                            className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${applicantTab === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                        >
                                            All ({applications.length})
                                        </button>
                                        <button
                                            onClick={() => setApplicantTab('SHORTLISTED')}
                                            className={`px-4 py-2 text-sm font-bold rounded-full transition-colors flex items-center gap-1.5 ${applicantTab === 'SHORTLISTED' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                                        >
                                            ⭐ Shortlisted ({applications.filter(a => a.status === 'SHORTLISTED').length})
                                        </button>
                                        <button
                                            onClick={() => setApplicantTab('PENDING')}
                                            className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${applicantTab === 'PENDING' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
                                        >
                                            Pending ({applications.filter(a => a.status === 'PENDING').length})
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {applications.filter(a => applicantTab === 'ALL' || a.status === applicantTab).length === 0 ? (
                                            <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100">
                                                <p className="text-slate-500 font-medium">No applications found in this category.</p>
                                            </div>
                                        ) : (
                                            applications
                                                .filter(a => applicantTab === 'ALL' || a.status === applicantTab)
                                                .map(app => (
                                                    <div key={app.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md overflow-hidden">
                                                        {/* Applicant Header (Click to Expand) */}
                                                        <div
                                                            className="p-5 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                                                            onClick={() => setExpandedApplicant(expandedApplicant === app.id ? null : app.id)}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold uppercase shadow-sm">
                                                                    {app.applicant?.username.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                                                        {app.applicant?.username}
                                                                        {app.meets_requirements && (
                                                                            <span className="inline-flex" title="Meets Requirements"><CheckCircle className="w-4 h-4 text-emerald-500" /></span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-sm text-slate-500 font-medium">
                                                                        Applied {new Date(app.applied_at).toLocaleDateString()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(app.status)}`}>
                                                                    {app.status}
                                                                </span>
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${expandedApplicant === app.id ? 'rotate-180 bg-slate-200' : 'bg-slate-100'} text-slate-600`}>
                                                                    ▼
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Expanded Applicant Details */}
                                                        {expandedApplicant === app.id && (
                                                            <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 bg-slate-50/50 mt-2">
                                                                <div className="pt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                                                    {/* Details Column */}
                                                                    <div className="space-y-4">
                                                                        <div>
                                                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Details</div>
                                                                            <div className="text-sm font-medium text-slate-800 flex flex-col gap-1">
                                                                                <span>📧 {app.applicant?.email}</span>
                                                                                <span>📞 {app.applicant?.mobile_number || 'No number provided'}</span>
                                                                            </div>
                                                                        </div>

                                                                        {app.cv && (
                                                                            <div>
                                                                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Resume</div>
                                                                                <a href={app.cv} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors border border-indigo-200 bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow">
                                                                                    <FileText className="w-4 h-4" /> View Applicant CV
                                                                                </a>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Notes & Actions Column */}
                                                                    <div className="space-y-4 flex flex-col h-full">
                                                                        {app.notes && (
                                                                            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex-1 mb-2">
                                                                                <div className="text-xs font-bold text-slate-500 mb-1">Applicant's Pitch:</div>
                                                                                <p className="text-slate-700 text-sm italic">"{app.notes}"</p>
                                                                            </div>
                                                                        )}

                                                                        {app.owner_note && (
                                                                            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 shadow-sm flex-1">
                                                                                <div className="text-xs font-bold text-indigo-600 mb-1 flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> Message sent to applicant:</div>
                                                                                <p className="text-indigo-900 text-sm italic">"{app.owner_note}"</p>
                                                                            </div>
                                                                        )}

                                                                        {(app.status === 'PENDING' || app.status === 'SHORTLISTED') && (
                                                                            <div className="flex flex-col gap-2 mt-auto pt-2">
                                                                                {app.status === 'PENDING' && (
                                                                                    <button
                                                                                        onClick={() => openActionModal(app.id, 'SHORTLISTED', app.applicant?.username)}
                                                                                        className="w-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-sm font-bold py-2 px-4 rounded-xl transition-colors shadow-sm"
                                                                                    >
                                                                                        ⭐ Shortlist Candidate
                                                                                    </button>
                                                                                )}
                                                                                <div className="flex items-center gap-2">
                                                                                    <button
                                                                                        onClick={() => openActionModal(app.id, 'ACCEPTED', app.applicant?.username)}
                                                                                        className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-bold py-2 px-4 rounded-xl transition-colors shadow-sm"
                                                                                    >
                                                                                        Accept
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => openActionModal(app.id, 'REJECTED', app.applicant?.username)}
                                                                                        className="flex-1 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-sm font-bold py-2 px-4 rounded-xl transition-colors shadow-sm"
                                                                                    >
                                                                                        Reject
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card rounded-3xl p-8 sticky top-28">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Requirements</h3>

                        <div className="space-y-6">
                            <div>
                                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Skills needed</div>
                                <div className="font-medium text-slate-700">{job.skills_required}</div>
                            </div>
                            <div className="w-full h-px bg-slate-100"></div>
                            <div>
                                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Experience</div>
                                <div className="font-medium text-slate-700">{job.experience_required}</div>
                            </div>
                            <div className="w-full h-px bg-slate-100"></div>
                            <div>
                                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Education</div>
                                <div className="font-medium text-slate-700">{job.education_required}</div>
                            </div>
                            <div className="w-full h-px bg-slate-100"></div>
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                <Calendar className="w-4 h-4" />
                                Posted {new Date(job.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                <Building className="w-4 h-4" />
                                {job.views} Views
                            </div>
                        </div>

                        {user ? (
                            !isOwner && (
                                applicationStatus ? (
                                    <div className="mt-8 space-y-3">
                                        <div className={`w-full font-bold py-4 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 border ${getStatusColor(applicationStatus)}`}>
                                            <CheckCircle className="w-5 h-5" />
                                            {applicationStatus === 'SHORTLISTED' ? "⭐ You're Shortlisted!" : `Application ${applicationStatus === 'PENDING' ? 'Pending' : applicationStatus === 'ACCEPTED' ? 'Accepted' : 'Rejected'}`}
                                        </div>
                                        {applicationNote && (
                                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 shadow-sm relative pt-6">
                                                <div className="absolute top-0 left-0 bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-br-lg rounded-tl-xl flex items-center gap-1 border-r border-b border-indigo-600/20">
                                                    <MessageCircle className="w-3 h-3" /> Message from Shop
                                                </div>
                                                <p className="text-sm font-medium text-indigo-900 italic text-center">"{applicationNote}"</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowApplyModal(true)}
                                        disabled={!job.is_active}
                                        className={`w-full mt-8 font-bold py-4 px-4 rounded-xl shadow-lg transition-all ${job.is_active ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-indigo-500/30 hover:-translate-y-0.5' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
                                    >
                                        {job.is_active ? 'Apply for this Role' : 'Role Closed'}
                                    </button>
                                )
                            )
                        ) : (
                            <div className="mt-8">
                                <Link
                                    to="/login"
                                    className="block w-full text-center font-bold py-4 px-4 rounded-xl shadow-lg border border-transparent text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
                                >
                                    Log in to Apply
                                </Link>
                                <p className="text-center text-xs text-slate-500 mt-3 font-medium">Create an account to submit your application.</p>
                            </div>
                        )}

                    </div>
                </div>

            </div>

            {showApplyModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowApplyModal(false)}></div>
                    <div className="glass-card shadow-2xl rounded-2xl w-full max-w-4xl relative z-10 animate-[fadeIn_0.2s_ease-out] overflow-hidden max-h-[95dvh] flex flex-col md:flex-row">

                        {/* Left Side: Job Info (Hidden on mobile to save vertical space) */}
                        <div className="hidden md:flex bg-gradient-to-br from-indigo-900 to-slate-900 p-8 md:p-12 text-white md:w-2/5 flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20">
                                    <Briefcase className="w-6 h-6 text-indigo-300" />
                                </div>
                                <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-2">Applying for</h3>
                                <h2 className="text-3xl font-black mb-4 leading-tight">{job.title}</h2>
                                <p className="text-indigo-200/80 font-medium">Join <span className="text-white font-bold">{job.shop.company_name}</span> and take the next step in your career.</p>
                            </div>
                        </div>

                        {/* Right Side: Form (Ultra Compact on Mobile) */}
                        <div className="p-5 sm:p-8 md:p-12 md:w-3/5 w-full relative bg-white flex flex-col h-full justify-center">
                            <button
                                onClick={() => setShowApplyModal(false)}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                            >
                                ✕
                            </button>

                            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6 pr-8">Complete Application</h3>

                            <form onSubmit={handleApply} className="space-y-3 sm:space-y-5">
                                {/* Upload Box - Compressed */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Resume / CV</label>
                                    <label className="flex flex-col items-center justify-center w-full h-16 sm:h-24 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 transition-colors group">
                                        <div className="flex flex-col items-center justify-center pt-2 pb-2">
                                            <Upload className="w-5 h-5 mb-1 sm:mb-2 text-slate-400 group-hover:text-indigo-500 transition-colors hidden sm:block" />
                                            <p className="text-xs sm:text-sm text-slate-600 font-medium text-center px-2">
                                                <span className="font-bold text-indigo-600">Click to upload</span> {applyCv ? applyCv.name : '(Optional)'}
                                            </p>
                                        </div>
                                        <input type="file" onChange={(e) => setApplyCv(e.target.files[0])} className="hidden" />
                                    </label>
                                </div>

                                {/* Text Area - Compressed */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Cover Note (Optional)</label>
                                    <textarea
                                        rows="2"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 sm:py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none font-medium text-slate-700 text-sm"
                                        value={applyNotes}
                                        onChange={(e) => setApplyNotes(e.target.value)}
                                        placeholder="Why you're a great fit..."
                                    ></textarea>
                                </div>

                                {/* Checkbox - Compressed */}
                                <div className="bg-amber-50/70 p-3 sm:p-4 rounded-xl border border-amber-100 flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="requirements"
                                        className="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 bg-white border-amber-300 rounded focus:ring-indigo-500 cursor-pointer flex-shrink-0"
                                        required
                                    />
                                    <label htmlFor="requirements" className="text-[11px] sm:text-sm text-amber-900 font-medium cursor-pointer leading-tight sm:leading-relaxed">
                                        I formally declare that I meet all <span className="font-bold">skills, experience, and educational requirements</span> for this position.
                                    </label>
                                </div>

                                {/* Messages */}
                                {applyMessage && (
                                    <div className={`p-3 rounded-xl text-xs sm:text-sm font-bold ${applyMessage.includes('success') ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                        {applyMessage}
                                    </div>
                                )}

                                {/* Submit Button - Compressed */}
                                <button
                                    type="submit"
                                    className="w-full relative group overflow-hidden bg-slate-900 text-white font-bold py-3 sm:py-4 px-6 rounded-xl sm:rounded-2xl shadow-lg transition-all hover:bg-indigo-600 flex items-center justify-center"
                                >
                                    <span className="relative z-10 flex items-center gap-2 text-sm sm:text-lg">Apply Now <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /></span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Status Action Modal for Owners */}
            {actionModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 z-[9999]">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setActionModal({ ...actionModal, isOpen: false })}></div>
                    <div className="glass shadow-2xl rounded-3xl max-w-md w-full relative z-10 animate-[fadeIn_0.2s_ease-out] overflow-hidden flex flex-col h-[90dvh] sm:h-auto sm:max-h-[90vh]">
                        <div className="p-8 overflow-y-auto overscroll-contain pb-24 sm:pb-8">
                            <button
                                onClick={() => setActionModal({ ...actionModal, isOpen: false })}
                                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                                ✕
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${actionModal.actionType === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-600' : actionModal.actionType === 'REJECTED' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {actionModal.actionType === 'ACCEPTED' ? <CheckCircle className="w-6 h-6" /> : actionModal.actionType === 'REJECTED' ? <FileText className="w-6 h-6" /> : <span className="text-xl">⭐</span>}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        {actionModal.actionType === 'ACCEPTED' ? 'Accept' : actionModal.actionType === 'REJECTED' ? 'Reject' : 'Shortlist'}
                                    </h2>
                                    <p className="text-slate-500 font-medium text-sm">{actionModal.applicantName}</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Message to Applicant (Optional)</label>
                                    <textarea
                                        rows="3"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none font-medium text-slate-700"
                                        value={actionNote}
                                        onChange={(e) => setActionNote(e.target.value)}
                                        placeholder={actionModal.actionType === 'ACCEPTED' ? "e.g., We'd love to schedule an interview..." : "e.g., We decided to move forward with other candidates..."}
                                    ></textarea>
                                </div>

                                {actionModal.actionType === 'ACCEPTED' && (
                                    <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 flex flex-col items-start gap-4">
                                        <div className="flex items-start gap-3 w-full">
                                            <input
                                                type="checkbox"
                                                id="rejectOthers"
                                                checked={rejectOthers}
                                                onChange={(e) => setRejectOthers(e.target.checked)}
                                                className="mt-1 w-4 h-4 text-rose-600 bg-white border-rose-300 rounded focus:ring-rose-500 cursor-pointer flex-shrink-0"
                                            />
                                            <label htmlFor="rejectOthers" className="text-sm text-rose-900 font-bold cursor-pointer">
                                                Bulk Reject all other Pending and Shortlisted applicants immediately.
                                            </label>
                                        </div>

                                        {rejectOthers && (
                                            <div className="w-full pl-7">
                                                <label className="block text-xs font-bold text-rose-800 mb-2">Message to Rejected Applicants (Optional)</label>
                                                <textarea
                                                    rows="2"
                                                    className="w-full bg-white border border-rose-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all resize-none font-medium text-slate-700 text-sm"
                                                    value={rejectOthersNote}
                                                    onChange={(e) => setRejectOthersNote(e.target.value)}
                                                    placeholder="e.g., We decided to move forward with another candidate..."
                                                ></textarea>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    onClick={submitApplicationAction}
                                    className={`w-full text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all text-center ${actionModal.actionType === 'ACCEPTED' ? 'bg-emerald-600 hover:bg-emerald-700' : actionModal.actionType === 'REJECTED' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    Confirm {actionModal.actionType === 'ACCEPTED' ? 'Acceptance' : actionModal.actionType === 'REJECTED' ? 'Rejection' : 'Shortlist'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobDetails;
