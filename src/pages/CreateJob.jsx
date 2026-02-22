import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import api from '../api';
import { UploadCloud, Briefcase, GraduationCap, DollarSign, List, FileImage } from 'lucide-react';

const CreateJob = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        skills_required: '',
        experience_required: '',
        education_required: '',
        salary_range: '',
        job_type: 'FULL_TIME',
        image: null
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData({ ...formData, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const uploadData = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) {
                uploadData.append(key, formData[key]);
            }
        });

        try {
            const res = await api.post('jobs/', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            navigate(`/jobs/${res.data.id}`);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 403) {
                setError("You are not authorized to post jobs. Your shop must be verified by an admin.");
            } else {
                setError("Failed to create job posting. Please ensure all required fields are filled.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="text-center mb-10">
                <div className="inline-flex shrink-0 items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/30">
                    <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Create a Job Post</h1>
                <p className="mt-2 text-slate-500 font-medium">Find the perfect candidate for your local store</p>
            </div>

            <div className="glass-card rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -ml-32 -mb-32"></div>

                <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                    {error && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 font-medium text-sm p-4 rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* Image Upload Area */}
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-700 tracking-wide flex items-center gap-2">
                            <FileImage className="w-4 h-4 text-indigo-500" />
                            Job Display Image (Optional)
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-2xl bg-slate-50 relative group hover:border-indigo-400 transition-colors">
                            <div className="space-y-2 text-center relative z-10">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="mx-auto h-48 object-cover rounded-xl shadow-md mb-4" />
                                ) : (
                                    <UploadCloud className="mx-auto h-12 w-12 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                )}
                                <div className="flex text-sm text-slate-600 justify-center">
                                    <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-bold text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 px-3 py-1 shadow-sm border border-slate-200">
                                        <span>Click to upload image</span>
                                        <input id="image-upload" name="image" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                </div>
                                <p className="text-xs text-slate-500 font-medium">PNG, JPG, WEBP up to 5MB</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Title */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 tracking-wide mb-2 opacity-90">Job Title</label>
                            <input
                                required
                                name="title"
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium placeholder:text-slate-400 shadow-sm"
                                placeholder="e.g. Senior Barista"
                                value={formData.title}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 tracking-wide mb-2 opacity-90">Job Description</label>
                            <textarea
                                required
                                name="description"
                                rows={5}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium placeholder:text-slate-400 shadow-sm resize-none"
                                placeholder="Describe the daily responsibilities and role..."
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Job Type */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 tracking-wide flex items-center gap-2 mb-2 opacity-90">
                                <Briefcase className="w-4 h-4 text-indigo-500" />
                                Job Type
                            </label>
                            <select
                                name="job_type"
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 shadow-sm"
                                value={formData.job_type}
                                onChange={handleInputChange}
                            >
                                <option value="FULL_TIME">Full-Time</option>
                                <option value="PART_TIME">Part-Time</option>
                                <option value="REMOTE">Remote</option>
                                <option value="ON_SITE">On-Site</option>
                                <option value="HYBRID">Hybrid</option>
                                <option value="CONTRACT">Contract</option>
                            </select>
                        </div>

                        {/* Skills */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 tracking-wide flex items-center gap-2 mb-2 opacity-90">
                                <List className="w-4 h-4 text-indigo-500" />
                                Required Skills
                            </label>
                            <input
                                required
                                name="skills_required"
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium placeholder:text-slate-400 shadow-sm"
                                placeholder="e.g. Customer Service, Espresso Making, POS Systems"
                                value={formData.skills_required}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Experience */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 tracking-wide flex items-center gap-2 mb-2 opacity-90">
                                <Briefcase className="w-4 h-4 text-indigo-500" />
                                Experience Required
                            </label>
                            <input
                                required
                                name="experience_required"
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium placeholder:text-slate-400 shadow-sm"
                                placeholder="e.g. 1-2 Years"
                                value={formData.experience_required}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Education */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 tracking-wide flex items-center gap-2 mb-2 opacity-90">
                                <GraduationCap className="w-4 h-4 text-indigo-500" />
                                Education Required
                            </label>
                            <input
                                required
                                name="education_required"
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium placeholder:text-slate-400 shadow-sm"
                                placeholder="e.g. High School Diploma"
                                value={formData.education_required}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Salary */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 tracking-wide flex items-center gap-2 mb-2 opacity-90">
                                <DollarSign className="w-4 h-4 text-indigo-500" />
                                Salary Range (Optional)
                            </label>
                            <input
                                name="salary_range"
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium placeholder:text-slate-400 shadow-sm"
                                placeholder="e.g. $15 - $18 / hr"
                                value={formData.salary_range}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-4 px-4 rounded-xl shadow-lg border border-transparent text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:hover:translate-y-0"
                        >
                            {isSubmitting ? 'Posting...' : 'Post Job Vacancy'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateJob;
