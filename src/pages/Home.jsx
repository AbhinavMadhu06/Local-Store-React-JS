import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Briefcase, MapPin, DollarSign, Clock, Users, ArrowRight, Search, Navigation, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { AuthContext } from '../AuthContext';
import { motion } from 'framer-motion';

// Helper for Haversine distance calculate
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

const Home = () => {
    const [jobs, setJobs] = useState([]);
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isShopOwner, setIsShopOwner] = useState(false);
    const [jobStatuses, setJobStatuses] = useState({});
    const { user } = useContext(AuthContext);

    // Search and Location States
    const [searchTerm, setSearchTerm] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 20;

    // Reset page to 1 when search or location changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, userLocation]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobsResponse, shopsResponse] = await Promise.all([
                    api.get('jobs/'),
                    api.get('shops/')
                ]);
                let allJobs = jobsResponse.data;
                setShops(shopsResponse.data);

                if (user) {
                    try {
                        const profileRes = await api.get('shops/my_shop/');
                        const myShop = profileRes.data;
                        allJobs = allJobs.filter(job => job.shop.id === myShop.id);
                        setIsShopOwner(true);
                    } catch (e) {
                        // User is likely a job seeker, so show all jobs
                        setIsShopOwner(false);
                        try {
                            const appsRes = await api.get('applications/');
                            const statuses = {};
                            appsRes.data.forEach(app => {
                                statuses[app.job_details?.id || app.job] = app.status;
                            });
                            setJobStatuses(statuses);
                        } catch (err) {
                            console.error("Failed to fetch applicant status map", err);
                        }
                    }
                }
                setJobs(allJobs);
            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const toggleJobStatus = async (e, jobId, currentStatus) => {
        e.preventDefault();
        try {
            const newStatus = !currentStatus;
            await api.patch(`jobs/${jobId}/`, { is_active: newStatus });
            setJobs(jobs.map(job =>
                job.id === jobId ? { ...job, is_active: newStatus } : job
            ));
        } catch (err) {
            console.error("Failed to toggle status", err);
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser.');
            return;
        }
        setIsLocating(true);
        setLocationError('');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setIsLocating(false);
            },
            (err) => {
                setLocationError('Unable to retrieve your location. Check browser permissions.');
                setIsLocating(false);
            }
        );
    };

    // Filter Logic
    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.shop?.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    let filteredShops = shops.filter(shop =>
        shop.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (userLocation) {
        filteredShops = filteredShops.map(shop => {
            if (shop.latitude && shop.longitude) {
                shop.distance = getDistance(userLocation.lat, userLocation.lng, shop.latitude, shop.longitude);
            } else {
                shop.distance = Infinity;
            }
            return shop;
        }).sort((a, b) => a.distance - b.distance);
    }

    // Pagination Logic
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="space-y-16 pb-12">
            {/* Only show Hero and Search on Page 1 */}
            {currentPage === 1 && (
                <div className="text-center space-y-8 pt-8 pb-12 relative">
                    {/* Discovery UI (Search/Location) at the very top */}
                    {!isShopOwner && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/40 backdrop-blur-xl p-3 sm:px-4 rounded-3xl shadow-lg border border-white/60 z-20 mx-auto max-w-4xl"
                        >
                            <button
                                onClick={handleGetLocation}
                                disabled={isLocating}
                                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all w-full sm:w-auto ${userLocation ? 'bg-emerald-100/80 text-emerald-700 border border-emerald-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100 shadow-sm hover:shadow-md'}`}
                            >
                                <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                                {isLocating ? 'Locating...' : (userLocation ? 'Using My Location' : '📍 Sort by Proximity')}
                            </button>
                            <div className="relative w-full sm:flex-1">
                                <input
                                    type="text"
                                    placeholder="Search roles or companies..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white/60 border border-slate-200/60 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium text-slate-800 shadow-sm transition-all"
                                />
                                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            </div>
                        </motion.div>
                    )}
                    {locationError && <div className="text-rose-500 text-sm font-bold mt-2 animate-fade-in-up">{locationError}</div>}

                    {!searchTerm && (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: { staggerChildren: 0.2, delayChildren: 0.1 }
                                }
                            }}
                            className="pt-12"
                        >
                            <div className="animate-float">
                                <motion.h1
                                    variants={{
                                        hidden: { opacity: 0, y: 30 },
                                        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50, damping: 15 } }
                                    }}
                                    className="text-6xl sm:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight leading-tight"
                                >
                                    {isShopOwner ? 'Manage your ' : 'Find your next '}
                                    <br className="hidden sm:block" />
                                    <span className="text-gradient animate-gradient-x inline-block mt-2">{isShopOwner ? 'job vacancies' : 'local opportunity'}</span>
                                </motion.h1>
                                <motion.p
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
                                    }}
                                    className="text-xl text-slate-500 max-w-2xl mx-auto mt-8 mb-8 font-medium"
                                >
                                    {isShopOwner ? 'Create job postings, manage vacancies, and hire the best talent in your community.' : 'Discover open roles at stores and businesses in your community. Apply directly and grow your career locally.'}
                                </motion.p>
                                {isShopOwner && (
                                    <motion.div
                                        variants={{
                                            hidden: { opacity: 0, scale: 0.9 },
                                            visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 70, damping: 10 } }
                                        }}
                                        className="pt-6"
                                    >
                                        <Link to="/jobs/create" className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-10 rounded-full shadow-2xl shadow-indigo-500/30 hover:-translate-y-1 transition-all text-lg relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                                            <Briefcase className="w-6 h-6 relative z-10" /> <span className="relative z-10">Create New Post</span>
                                        </Link>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Companies / Shops List (Job Seekers Only) - Only on Page 1 */}
            {currentPage === 1 && !isShopOwner && shops.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    id="companies" className="space-y-6 pt-4 scroll-mt-24"
                >
                    <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 ml-2">
                        <Building2 className="w-6 h-6 text-indigo-500" /> Discover Companies
                    </h2>
                    {filteredShops.length === 0 ? (
                        <p className="text-slate-500 italic ml-2">No companies match your search.</p>
                    ) : (
                        <motion.div
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: { staggerChildren: 0.15 }
                                }
                            }}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x px-2 hide-scrollbar"
                        >
                            {filteredShops.map(shop => (
                                <motion.div
                                    key={shop.id}
                                    variants={{
                                        hidden: { opacity: 0, x: 50 },
                                        visible: { opacity: 1, x: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } }
                                    }}
                                    className="snap-start shrink-0"
                                >
                                    <Link to={`/shops/${shop.id}`} className="block w-72 glass-card rounded-3xl p-6 hover:-translate-y-1.5 transition-all duration-300 border border-slate-200/60 flex flex-col gap-4 group hover:shadow-xl hover:shadow-indigo-500/10">
                                        <div className="flex items-start justify-between">
                                            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform duration-300">
                                                {shop.logo ? (
                                                    <img src={shop.logo} className="w-full h-full object-cover rounded-xl" alt={shop.company_name} />
                                                ) : (
                                                    <Building2 className="w-8 h-8 text-slate-300" />
                                                )}
                                            </div>
                                            {shop.distance && shop.distance !== Infinity && (
                                                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                                                    {shop.distance < 1 ? '< 1 km' : `${shop.distance.toFixed(1)} km`}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">{shop.company_name}</h3>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mt-2 bg-slate-50 w-max px-2 py-1 rounded-lg border border-slate-100">
                                                <MapPin className="w-3.5 h-3.5 text-indigo-400" /> <span className="truncate">{shop.location}</span>
                                            </div>
                                        </div>
                                        <div className="mt-2 pt-4 border-t border-slate-100 relative bottom-0 flex justify-between items-center">
                                            <span className="text-sm font-bold text-indigo-600 group-hover:mr-2 transition-all">View Profile</span>
                                            <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* Jobs List */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: currentPage === 1 ? 0.5 : 0.1 }}
                id="jobs" className={`space-y-6 scroll-mt-24 px-2 sm:px-0 ${currentPage === 1 ? 'pt-4' : 'pt-8'}`}
            >
                <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
                        <Briefcase className="w-5 h-5 text-purple-600" />
                    </div>
                    {isShopOwner ? 'Your Postings' : 'Latest Jobs'}
                </h2>
                {filteredJobs.length === 0 ? (
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass-card rounded-3xl p-16 text-center flex flex-col items-center bg-slate-50 border-dashed border-2 border-slate-200"
                    >
                        <Briefcase className="w-20 h-20 text-indigo-200 mb-6 drop-shadow-sm" />
                        <h3 className="text-2xl font-black text-slate-700">No open vacancies right now</h3>
                        <p className="text-slate-500 mt-3 font-medium">Try adjusting your search or check back later.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.1 }
                            }
                        }}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "100px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
                    >
                        {currentJobs.map(job => (
                            <motion.div
                                key={job.id}
                                variants={{
                                    hidden: { opacity: 0, y: 40 },
                                    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 120 } }
                                }}
                                className="group glass-card rounded-[2rem] overflow-hidden relative flex flex-col h-full hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 border border-slate-200/60"
                            >
                                <Link to={`/jobs/${job.id}`} className="block focus:outline-none relative h-52 overflow-hidden bg-slate-100">
                                    {job.image ? (
                                        <>
                                            <img src={job.image} alt={job.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100"></div>
                                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 group-hover:scale-110 transition-transform duration-700"></div>
                                            <Briefcase className="w-16 h-16 text-indigo-300 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 drop-shadow-md" />
                                        </>
                                    )}
                                    <div className="absolute top-5 right-5 z-10">
                                        {isShopOwner ? (
                                            <button
                                                onClick={(e) => toggleJobStatus(e, job.id, job.is_active)}
                                                className={`px-4 py-2 text-xs font-black tracking-wide rounded-xl shadow-lg transition-colors border ${job.is_active ? 'bg-emerald-500 text-white border-emerald-400 hover:bg-rose-500 hover:border-rose-400' : 'bg-rose-500 text-white border-rose-400 hover:bg-emerald-500 hover:border-emerald-400'} backdrop-blur-sm group/btn`}
                                                title={job.is_active ? "Click to Close Job" : "Click to Reopen Job"}
                                            >
                                                <span className="group-hover/btn:hidden">{job.is_active ? 'ACTIVELY HIRING' : 'CLOSED'}</span>
                                                <span className="hidden group-hover/btn:inline">{job.is_active ? 'CLOSE ROLE' : 'REOPEN ROLE'}</span>
                                            </button>
                                        ) : (
                                            jobStatuses[job.id] ? (
                                                <span className={`px-4 py-2 text-xs font-black tracking-wide rounded-xl shadow-lg backdrop-blur-sm border ${jobStatuses[job.id] === 'ACCEPTED' ? 'bg-emerald-500 text-white border-emerald-400' :
                                                    jobStatuses[job.id] === 'REJECTED' ? 'bg-rose-500 text-white border-rose-400' :
                                                        jobStatuses[job.id] === 'SHORTLISTED' ? 'bg-blue-500 text-white border-blue-400' :
                                                            'bg-amber-500 text-white border-amber-400'
                                                    }`}>
                                                    {jobStatuses[job.id] === 'ACCEPTED' ? '🎉 ACCEPTED' : jobStatuses[job.id] === 'REJECTED' ? 'REJECTED' : jobStatuses[job.id] === 'SHORTLISTED' ? '⭐ SHORTLISTED' : 'APPLIED'}
                                                </span>
                                            ) : (
                                                <span className={`px-4 py-2 text-xs font-black tracking-wide rounded-xl shadow-lg backdrop-blur-sm border ${job.is_active ? 'bg-white/90 text-indigo-700 border-white/50' : 'bg-white/90 text-rose-700 border-white/50'}`}>
                                                    {job.is_active ? 'ACTIVELY HIRING' : 'CLOSED'}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </Link>

                                <div className="p-8 flex flex-col flex-1 bg-white relative">
                                    <Link to={`/jobs/${job.id}`} className="focus:outline-none group-hover:text-indigo-600 transition-colors">
                                        <h3 className="text-2xl font-black text-slate-800 line-clamp-2 mb-2 leading-tight">
                                            {job.title}
                                        </h3>
                                    </Link>

                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-4 tracking-wide uppercase">
                                        <Clock className="w-3.5 h-3.5" /> Published {new Date(job.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </div>

                                    <div className="flex items-center gap-2.5 text-slate-600 font-bold mb-5 pb-5 border-b border-slate-100">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                                            <Building2 className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <Link to={`/shops/${job.shop?.id}`} className="truncate hover:text-indigo-600 transition-colors text-base" onClick={(e) => e.stopPropagation()}>
                                            {job.shop?.company_name}
                                        </Link>
                                    </div>

                                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-6 flex-1">
                                        {job.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                                            <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {job.shop?.location}
                                        </span>
                                        {job.salary_range && (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                                <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> {job.salary_range}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-12 pb-8">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-xl transition-all ${currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100 bg-white shadow-sm hover:shadow-md'}`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Page Numbers */}
                        <div className="flex gap-1.5">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => paginate(i + 1)}
                                    className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white text-slate-600 hover:bg-slate-100 shadow-sm hover:shadow-md border border-slate-100'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-xl transition-all ${currentPage === totalPages ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100 bg-white shadow-sm hover:shadow-md'}`}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Home;
