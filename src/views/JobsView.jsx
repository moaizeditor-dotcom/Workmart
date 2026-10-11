import React, { useState } from 'react';
import Card3DTilt from '../components/Card3DTilt';
import BorderBeam from '../components/BorderBeam';
import {
  Briefcase,
  Sparkles,
  MapPin,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Send,
  Zap,
  Bookmark,
  Plus,
  Search,
  Clock,
  Building,
  X,
  FileText,
  Check
} from 'lucide-react';

export default function JobsView({
  jobs,
  onNewJob,
  applications = [],
  onApplyJob,
  onToggleSaveJob,
  savedJobIds = [],
  currentUser
}) {
  const [jobList, setJobList] = useState(jobs);
  const [selectedJob, setSelectedJob] = useState(jobs[0] || null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'saved' | 'applied'

  React.useEffect(() => {
    setJobList(jobs);
    if (!selectedJob && jobs.length > 0) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs]);

  // Search & Filter State
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  // 1-Click Easy Apply Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    fullName: currentUser.name || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    workmarkDossierIncluded: true,
    coverNote: ''
  });
  const [hasAppliedSuccess, setHasAppliedSuccess] = useState(false);

  // Recruiter: Post a Job Modal State
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [postJobForm, setPostJobForm] = useState({
    title: '',
    company: currentUser.company || '',
    location: 'Remote / Hybrid',
    type: 'Full-time · Staff Tier',
    salary: '$180,000 - $260,000',
    skills: 'Distributed Systems, Cloud Architecture',
    description: '',
    benefits: 'Remote flexibility, Comprehensive health coverage, Equipment budget'
  });

  // Handle Apply Submission
  const handleConfirmApply = (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    if (onApplyJob) {
      onApplyJob(selectedJob, applyForm);
    }

    setHasAppliedSuccess(true);
    setTimeout(() => {
      setHasAppliedSuccess(false);
      setIsApplyModalOpen(false);
    }, 1800);
  };

  // Handle Post New Job Opening
  const handleCreateJob = (e) => {
    e.preventDefault();
    if (!postJobForm.title.trim()) return;

    const newJob = {
      id: `job_${Date.now()}`,
      title: postJobForm.title,
      company: postJobForm.company,
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      location: postJobForm.location,
      type: postJobForm.type,
      salary: postJobForm.salary,
      matchScore: 97,
      workmarkVerifiedEmployer: true,
      skillsRequired: postJobForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
      description: postJobForm.description,
      applicantsCount: 1,
      posted: 'Just now',
      benefits: postJobForm.benefits.split(',').map((b) => b.trim()).filter(Boolean)
    };

    const updated = [newJob, ...jobList];
    setJobList(updated);
    if (onNewJob) onNewJob(newJob);
    setSelectedJob(newJob);

    // Reset Form
    setPostJobForm({
      title: '',
      company: currentUser.company || '',
      location: 'Remote / Hybrid',
      type: 'Full-time · Staff Tier',
      salary: '$180,000 - $260,000',
      skills: 'Distributed Systems, Cloud Architecture',
      description: '',
      benefits: 'Remote flexibility, Comprehensive health coverage, Equipment budget'
    });
    setIsPostJobModalOpen(false);
  };

  // Filter Jobs
  const filteredJobs = jobList.filter((job) => {
    const matchesTitle =
      job.title.toLowerCase().includes(searchTitle.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTitle.toLowerCase());
    const matchesLoc = job.location.toLowerCase().includes(searchLocation.toLowerCase());
    if (activeTab === 'saved') return savedJobIds.includes(job.id);
    return matchesTitle && matchesLoc;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Search & Post a Job Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-[#0A66C2]" />
              Opportunities & Verified Roles
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              High-compensation career opportunities with cryptographic skill matching.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPostJobModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#0A66C2] text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 hover:bg-blue-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Post a Job Opening</span>
            </button>
          </div>
        </div>

        {/* Search Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-6">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, skill, or company..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#0A66C2]"
            />
          </div>

          <div className="md:col-span-4 relative">
            <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="City, state, or 'Remote'..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#0A66C2]"
            />
          </div>

          <div className="md:col-span-2">
            <button
              onClick={() => {
                setSearchTitle('');
                setSearchLocation('');
              }}
              className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Pills: All Roles / Saved Jobs / Applied */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: `All Opportunities (${jobList.length})` },
          { id: 'saved', label: `Saved Roles (${savedJobIds.length})` },
          { id: 'applied', label: `My Applications (${applications.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#0A66C2] text-white font-bold shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {activeTab === 'applied' ? (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 font-mono text-xs">
              You haven't submitted any applications yet. Explore openings and use "1-Click Easy Apply"!
            </div>
          ) : (
            applications.map((app, idx) => (
              <div key={idx} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={app.job.logo} alt={app.job.company} className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{app.job.title}</h4>
                    <p className="text-xs text-[#0A66C2] font-semibold">{app.job.company}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Applied {app.date}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {app.status || 'Under Review'}
                  </span>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">Dossier Delivered</div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Job Cards List */}
          <div className="lg:col-span-7 space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0A66C2] flex items-center justify-center mx-auto">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">No active roles found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {activeTab === 'saved'
                      ? 'You have not bookmarked any career opportunities yet.'
                      : 'Be the first hiring manager or technical recruiter to list an opening!'}
                  </p>
                </div>
                {activeTab !== 'saved' && (
                  <button
                    onClick={() => setIsPostJobModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A66C2] text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Post an Opportunity</span>
                  </button>
                )}
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                const isApplied = applications.some((a) => a.jobId === job.id);
                const isSaved = savedJobIds.includes(job.id);

                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all cursor-pointer shadow-sm ${
                      isSelected
                        ? 'border-[#0A66C2] ring-1 ring-[#0A66C2] bg-blue-50/20 dark:bg-blue-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={job.logo}
                          alt={job.company}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white hover:text-[#0A66C2] transition-colors">
                            {job.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-semibold text-[#0A66C2]">{job.company}</span>
                            {job.workmarkVerifiedEmployer && (
                              <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                                <ShieldCheck className="w-3 h-3" />
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSaveJob(job.id);
                          }}
                          className={`p-1 rounded-lg transition-colors ${
                            isSaved ? 'text-[#0A66C2]' : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title={isSaved ? 'Unsave' : 'Save'}
                        >
                          <Bookmark className="w-4 h-4 fill-current" />
                        </button>
                        <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-[#0A66C2] text-[10px] font-mono font-bold">
                          {job.matchScore}% Match
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-600 dark:text-slate-300 font-mono">
                      <div className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-600 font-semibold">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{job.salary}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.skillsRequired.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Detailed Job View & Easy Apply Action Pane */}
          <div className="lg:col-span-5">
            {selectedJob ? (
              <div className="sticky top-24 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <img
                      src={selectedJob.logo}
                      alt={selectedJob.company}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-md"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleSaveJob(selectedJob.id)}
                        className={`p-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors ${
                          savedJobIds.includes(selectedJob.id)
                            ? 'text-[#0A66C2] bg-blue-50'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4">{selectedJob.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-[#0A66C2]">{selectedJob.company}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500">{selectedJob.location}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                      {selectedJob.salary}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-medium">
                      {selectedJob.type}
                    </span>
                  </div>
                </div>

                {/* 1-Click Easy Apply Button (LinkedIn Signature Feature) */}
                <div className="pt-2">
                  {applications.some((a) => a.jobId === selectedJob.id) ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 cursor-default"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Application Delivered</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsApplyModalOpen(true)}
                      className="w-full py-3 rounded-2xl bg-[#0A66C2] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      <span>1-Click Easy Apply with Workmark Dossier</span>
                    </button>
                  )}
                </div>

                {/* About the Role */}
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    About The Role
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedJob.description}
                  </p>
                </div>

                {/* Key Skills */}
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.skillsRequired.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 font-mono text-xs">
                Select an opportunity to inspect dossier requirements.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== MODALS ===================== */}

      {/* Easy Apply Modal */}
      {isApplyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <img src={selectedJob.logo} alt={selectedJob.company} className="w-8 h-8 rounded-xl object-cover" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Apply to {selectedJob.title}</h4>
                  <p className="text-[10px] text-[#0A66C2]">{selectedJob.company}</p>
                </div>
              </div>
              <button onClick={() => setIsApplyModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {hasAppliedSuccess ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Application Successfully Delivered!</h4>
                <p className="text-xs text-slate-500">Your verified Workmark Dossier was sent directly to hiring leads.</p>
              </div>
            ) : (
              <form onSubmit={handleConfirmApply} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={applyForm.fullName}
                    onChange={(e) => setApplyForm({ ...applyForm, fullName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Email Address</label>
                    <input
                      type="email"
                      value={applyForm.email}
                      onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={applyForm.phone}
                      onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#0A66C2]" />
                    <span className="font-bold text-slate-900 dark:text-white text-xs">Workmark Dossier Auto-Enclosed</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Includes your verified projects, code benchmarks, and Workmark Score ({currentUser.workmarkScore} WM).
                  </p>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Direct Note to Hiring Team (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Briefly state your alignment with this team's roadmap..."
                    value={applyForm.coverNote}
                    onChange={(e) => setApplyForm({ ...applyForm, coverNote: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2] leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0A66C2] text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20"
                  >
                    Submit 1-Click Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Recruiter: Post a Job Modal */}
      {isPostJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Post an Opportunity to Workmark</h3>
              <button onClick={() => setIsPostJobModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. Staff Distributed Systems Architect"
                  value={postJobForm.title}
                  onChange={(e) => setPostJobForm({ ...postJobForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Hiring Company</label>
                  <input
                    type="text"
                    value={postJobForm.company}
                    onChange={(e) => setPostJobForm({ ...postJobForm, company: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Location</label>
                  <input
                    type="text"
                    value={postJobForm.location}
                    onChange={(e) => setPostJobForm({ ...postJobForm, location: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Compensation Range</label>
                <input
                  type="text"
                  placeholder="$250,000 - $350,000 + Equity"
                  value={postJobForm.salary}
                  onChange={(e) => setPostJobForm({ ...postJobForm, salary: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Required Skills</label>
                <input
                  type="text"
                  placeholder="Rust, Three.js, Distributed Consensus"
                  value={postJobForm.skills}
                  onChange={(e) => setPostJobForm({ ...postJobForm, skills: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Job Overview</label>
                <textarea
                  rows={4}
                  value={postJobForm.description}
                  onChange={(e) => setPostJobForm({ ...postJobForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2] leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPostJobModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0A66C2] text-white font-bold hover:bg-blue-700"
                >
                  Publish Role Opening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
