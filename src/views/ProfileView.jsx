import React, { useState } from 'react';
import Card3DTilt from '../components/Card3DTilt';
import ProofOfWorkBadge from '../components/ProofOfWorkBadge';
import {
  ShieldCheck,
  Award,
  ExternalLink,
  MapPin,
  Calendar,
  Building,
  Sparkles,
  Edit3,
  Plus,
  Trash2,
  CheckCircle2,
  Code2,
  Share2,
  Camera,
  FolderPlus,
  GraduationCap,
  Briefcase,
  Star,
  X,
  Save,
  Upload,
  Globe,
  Layers,
  FileText,
  Eye,
  Check
} from 'lucide-react';

export default function ProfileView({
  user,
  onUpdateUser,
  onAddArtifact,
  onDeleteArtifact,
  onAddSkill,
  onEndorseSkill
}) {
  const [activeTab, setActiveTab] = useState('artifacts');

  // Modal States
  const [isEditIntroOpen, setIsEditIntroOpen] = useState(false);
  const [isEditAboutOpen, setIsEditAboutOpen] = useState(false);
  const [isAddArtifactOpen, setIsAddArtifactOpen] = useState(false);
  const [isAddExperienceOpen, setIsAddExperienceOpen] = useState(false);
  const [isAddEducationOpen, setIsAddEducationOpen] = useState(false);
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);

  // Inspector Modal for inspecting full project & work distribution
  const [inspectingArtifact, setInspectingArtifact] = useState(null);

  // Intro Form State
  const [introForm, setIntroForm] = useState({
    name: user.name,
    headline: user.role,
    company: user.company,
    location: user.location,
    avatar: user.avatar,
    banner: user.banner,
    isOpenToWork: user.isOpenToWork ?? true
  });

  // About Form State
  const [aboutText, setAboutText] = useState(user.bio);

  // Comprehensive Work / Artifact Form State (Fixes user demand for distribution and optional image)
  const [artifactForm, setArtifactForm] = useState({
    title: '',
    role: 'Lead Architect & Developer',
    type: 'Full-Stack Web Application',
    distribution: '',
    metric: '',
    techStack: 'React, Node.js, Three.js, PostgreSQL',
    demoUrl: '',
    repoUrl: '',
    image: '',
    stars: '1.2k'
  });

  // Experience Form State
  const [expForm, setExpForm] = useState({
    role: '',
    company: '',
    period: '2024 - Present',
    location: 'Remote / Hybrid',
    description: '',
    skillsTagged: 'React, System Architecture, Distributed Systems'
  });

  // Education Form State
  const [eduForm, setEduForm] = useState({
    school: '',
    degree: 'B.S. in Computer Science & Engineering',
    year: '2023',
    activities: ''
  });

  // Skill Form State
  const [skillName, setSkillName] = useState('');

  // Handlers
  const handleSaveIntro = (e) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name: introForm.name,
      role: introForm.headline,
      company: introForm.company,
      location: introForm.location,
      avatar: introForm.avatar,
      banner: introForm.banner,
      isOpenToWork: introForm.isOpenToWork
    });
    setIsEditIntroOpen(false);
  };

  const handleSaveAbout = (e) => {
    e.preventDefault();
    onUpdateUser({ ...user, bio: aboutText });
    setIsEditAboutOpen(false);
  };

  const handleAddArtifact = (e) => {
    e.preventDefault();
    if (!artifactForm.title.trim()) return;

    const newArt = {
      id: `art_${Date.now()}`,
      title: artifactForm.title,
      role: artifactForm.role,
      type: artifactForm.type,
      distribution: artifactForm.distribution || 'Distributed development including architecture design, core implementation, and verification testing.',
      metric: artifactForm.metric || 'Successfully launched and verified on Workmark network.',
      techStack: artifactForm.techStack,
      demoUrl: artifactForm.demoUrl || '',
      link: artifactForm.repoUrl || artifactForm.demoUrl || 'workmark.io/verified-project',
      image: artifactForm.image.trim(),
      stars: artifactForm.stars || '1.0k',
      verified: true
    };

    onUpdateUser({
      ...user,
      artifacts: [newArt, ...(user.artifacts || [])]
    });
    if (onAddArtifact) {
      onAddArtifact(newArt);
    }

    setArtifactForm({
      title: '',
      role: 'Lead Architect & Developer',
      type: 'Full-Stack Web Application',
      distribution: '',
      metric: '',
      techStack: 'React, Node.js, Three.js, PostgreSQL',
      demoUrl: '',
      repoUrl: '',
      image: '',
      stars: '1.2k'
    });
    setIsAddArtifactOpen(false);
  };

  const handleDeleteArtifact = (artId) => {
    onUpdateUser({
      ...user,
      artifacts: user.artifacts.filter((a) => a.id !== artId)
    });
    if (onDeleteArtifact) {
      onDeleteArtifact(artId);
    }
  };

  const handleAddExperience = (e) => {
    e.preventDefault();
    if (!expForm.role.trim() || !expForm.company.trim()) return;
    const newExp = {
      role: expForm.role,
      company: expForm.company,
      period: expForm.period,
      location: expForm.location,
      description: expForm.description,
      skillsTagged: expForm.skillsTagged.split(',').map((s) => s.trim()).filter(Boolean)
    };
    onUpdateUser({
      ...user,
      experience: [newExp, ...(user.experience || [])]
    });
    setExpForm({
      role: '',
      company: '',
      period: '2024 - Present',
      location: 'Remote / Hybrid',
      description: '',
      skillsTagged: 'React, System Architecture, Distributed Systems'
    });
    setIsAddExperienceOpen(false);
  };

  const handleAddEducation = (e) => {
    e.preventDefault();
    if (!eduForm.school.trim()) return;
    const newEdu = {
      school: eduForm.school,
      degree: eduForm.degree,
      year: eduForm.year,
      activities: eduForm.activities
    };
    onUpdateUser({
      ...user,
      education: [newEdu, ...(user.education || [])]
    });
    setEduForm({
      school: '',
      degree: 'B.S. in Computer Science & Engineering',
      year: '2023',
      activities: ''
    });
    setIsAddEducationOpen(false);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    const newSkill = {
      name: skillName.trim(),
      score: 90,
      level: 'Advanced',
      endorsements: 12,
      verified: true
    };
    onUpdateUser({
      ...user,
      skills: [...(user.skills || []), newSkill]
    });
    if (onAddSkill) {
      onAddSkill(skillName.trim(), 90);
    }
    setSkillName('');
    setIsAddSkillOpen(false);
  };

  const handleEndorseSkill = (sName) => {
    const targetSkill = (user.skills || []).find((s) => s.name === sName);
    onUpdateUser({
      ...user,
      skills: user.skills.map((s) => {
        if (s.name === sName) {
          return {
            ...s,
            endorsements: (s.endorsements || 12) + 1,
            score: Math.min(100, s.score + 1)
          };
        }
        return s;
      })
    });
    if (onEndorseSkill && targetSkill?.id) {
      onEndorseSkill(targetSkill.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Professional Identity Hero Card (Light Theme First) */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Banner with Cover Image */}
        <div className="relative h-48 sm:h-60 w-full overflow-hidden group">
          <img src={user.banner} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

          {/* Edit Banner Shortcut Button */}
          <button
            onClick={() => setIsEditIntroOpen(true)}
            className="absolute top-4 right-4 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 hover:border-[#0A66C2] text-slate-800 dark:text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-[#0A66C2]" />
            <span>Edit Profile Intro</span>
          </button>
        </div>

        {/* Profile Details Container */}
        <div className="relative px-6 sm:px-8 pb-8 -mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              {/* Avatar with #OpenToWork Ring */}
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className={`w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-white dark:border-slate-900 shadow-xl ${
                    user.isOpenToWork ? 'ring-4 ring-emerald-500 shadow-emerald-500/20' : ''
                  }`}
                />
                {user.isOpenToWork && (
                  <span className="absolute -bottom-2 inset-x-0 mx-auto w-fit px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                    #OpenToWork
                  </span>
                )}
                <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-[#0A66C2] flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-white font-bold" />
                </div>
              </div>

              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {user.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950/50 text-[#0A66C2] border border-blue-200 dark:border-blue-900 w-fit mx-auto sm:mx-0">
                    {user.handle}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 max-w-xl">
                  {user.role} at <span className="text-[#0A66C2]">{user.company}</span>
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {user.location}
                  </span>
                  <span>·</span>
                  <span className="font-semibold text-[#0A66C2] hover:underline cursor-pointer">
                    {user.connectionsCount?.toLocaleString()} connections
                  </span>
                  <span>·</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Workmark Dossier
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center sm:justify-end gap-2.5">
              <button
                onClick={() => setIsEditIntroOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#0A66C2]" />
                <span>Edit Intro</span>
              </button>

              <button
                onClick={() => setIsAddArtifactOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#0A66C2] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Upload New Work</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: About & Skills */}
        <div className="lg:col-span-4 space-y-6">
          {/* About Narrative Card */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                About Narrative
              </h3>
              <button
                onClick={() => setIsEditAboutOpen(true)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0A66C2] transition-colors"
                title="Edit Bio"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {user.bio}
            </p>
          </div>

          {/* Proof of Work Score Card */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <ProofOfWorkBadge
              score={user.workmarkScore}
              hash={user.verifiedHash}
            />
          </div>

          {/* Skills & Endorsements Card */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Award className="w-4 h-4 text-[#0A66C2]" />
                Skills & Endorsements
              </h3>
              <button
                onClick={() => setIsAddSkillOpen(true)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[#0A66C2] transition-colors"
                title="Add Skill"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 pt-1">
              {(user.skills || []).map((s, idx) => {
                const skill = typeof s === 'string' ? { name: s, score: 92, endorsements: 14 } : s;
                return (
                  <div
                    key={skill.name || idx}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{skill.name}</span>
                      <button
                        onClick={() => handleEndorseSkill(skill.name)}
                        className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-[#0A66C2] text-[10px] font-mono font-bold border border-blue-200 dark:border-blue-800 transition-colors"
                        title="Click to endorse"
                      >
                        + Endorse ({skill.endorsements || 14})
                      </button>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0A66C2] to-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${skill.score || 85}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Featured Work & Portfolio & Career Experience */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tabs Pill Switcher */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('artifacts')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'artifacts'
                    ? 'bg-white dark:bg-slate-900 text-[#0A66C2] shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Featured Work & Distribution ({user.artifacts?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('experience')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'experience'
                    ? 'bg-white dark:bg-slate-900 text-[#0A66C2] shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Experience Timeline ({user.experience?.length || 0})
              </button>
            </div>

            {/* Action Buttons based on active tab */}
            {activeTab === 'artifacts' ? (
              <button
                onClick={() => setIsAddArtifactOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#0A66C2] text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 hover:bg-blue-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Work / Project</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAddExperienceOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#0A66C2] text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 hover:bg-blue-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Experience</span>
              </button>
            )}
          </div>

          {/* Tab 1: Featured Work & Portfolio Showcase with Work Distribution Breakdown */}
          {activeTab === 'artifacts' && (
            <div className="space-y-5">
              {(!user.artifacts || user.artifacts.length === 0) ? (
                <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 font-mono text-xs">
                  No work uploaded yet. Click "Upload Work / Project" to showcase your projects and distribution details!
                </div>
              ) : (
                user.artifacts.map((art) => (
                  <div
                    key={art.id}
                    className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-all group"
                  >
                    {/* Project Header Banner: Render uploaded image OR high-end blueprint graphic if image is omitted */}
                    {art.image ? (
                      <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={art.image}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/20 backdrop-blur-md">
                            {art.type}
                          </span>
                          <span className="text-xs font-mono font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                            ★ {art.stars}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Architectural Blueprint Banner when no image is uploaded */
                      <div className="relative h-36 w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-5 flex flex-col justify-between text-white overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-xl bg-blue-500/30 border border-blue-400/40 text-cyan-300">
                              <Code2 className="w-4 h-4" />
                            </span>
                            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-200">
                              {art.type}
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                            ★ {art.stars}
                          </span>
                        </div>
                        <div className="relative z-10">
                          <h4 className="text-base font-bold text-white truncate">{art.title}</h4>
                          <p className="text-xs text-cyan-200 font-mono mt-0.5">{art.role}</p>
                        </div>
                      </div>
                    )}

                    {/* Project Body */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {art.title}
                            {art.verified && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" title="Verified Proof of Work" />
                            )}
                          </h4>
                          <p className="text-xs font-semibold text-[#0A66C2] mt-0.5">
                            Role: {art.role || 'Lead Technical Contributor'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteArtifact(art.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                            title="Remove Project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Work Distribution Highlight Box (Key requirement) */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono">
                          <span className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-[#0A66C2]" />
                            Work Distribution & Responsibilities
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400">Verified</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line line-clamp-3">
                          {art.distribution || 'Distributed architecture, execution, and deliverables breakdown documented for peer review.'}
                        </p>
                      </div>

                      {/* Measurable Metric */}
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-300 bg-blue-50/70 dark:bg-blue-950/40 p-2.5 rounded-xl border border-blue-200/60 dark:border-blue-900/50">
                        <span className="font-bold text-[#0A66C2]">⚡ Impact:</span>
                        <span>{art.metric}</span>
                      </div>

                      {/* Tech Stack Pills */}
                      {art.techStack && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {art.techStack.split(',').map((tech, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            >
                              {tech.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer Actions: Inspect Modal & External Links */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <button
                          onClick={() => setInspectingArtifact(art)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#0A66C2] hover:text-white text-slate-800 dark:text-slate-200 font-bold transition-all flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Full Work & Distribution</span>
                        </button>

                        <div className="flex items-center gap-3">
                          {art.demoUrl && (
                            <a
                              href={art.demoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#0A66C2] font-semibold hover:underline flex items-center gap-1"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              <span>Live Demo</span>
                            </a>
                          )}
                          {art.link && (
                            <a
                              href={`https://${art.link.replace(/^https?:\/\//, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-mono"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Repository</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Experience Timeline */}
          {activeTab === 'experience' && (
            <div className="space-y-4">
              {user.experience.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{exp.role}</h4>
                      <div className="text-xs font-semibold text-[#0A66C2] mt-0.5">{exp.company}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1">
                        {exp.period} · {exp.location}
                      </div>
                    </div>
                    <Briefcase className="w-4 h-4 text-slate-400" />
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                    {exp.description}
                  </p>

                  {exp.skillsTagged && exp.skillsTagged.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      {exp.skillsTagged.map((sk, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===================== MODALS ===================== */}

      {/* 1. Edit Profile Intro Modal */}
      {isEditIntroOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Profile Information</h3>
              <button onClick={() => setIsEditIntroOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveIntro} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  value={introForm.name}
                  onChange={(e) => setIntroForm({ ...introForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Professional Headline</label>
                <input
                  type="text"
                  value={introForm.headline}
                  onChange={(e) => setIntroForm({ ...introForm, headline: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Current Company</label>
                  <input
                    type="text"
                    value={introForm.company}
                    onChange={(e) => setIntroForm({ ...introForm, company: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Location</label>
                  <input
                    type="text"
                    value={introForm.location}
                    onChange={(e) => setIntroForm({ ...introForm, location: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                  />
                </div>
              </div>

              <div className="space-y-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Profile Avatar</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 hover:border-[#0A66C2] text-[#0A66C2] font-bold text-xs flex items-center gap-2 shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Avatar</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => setIntroForm({ ...introForm, avatar: event.target.result });
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <span className="text-slate-400 text-[11px]">or image URL:</span>
                </div>
                <input
                  type="url"
                  placeholder="https://..."
                  value={introForm.avatar}
                  onChange={(e) => setIntroForm({ ...introForm, avatar: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                />
              </div>

              <div className="space-y-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Banner Cover Image</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 hover:border-[#0A66C2] text-[#0A66C2] font-bold text-xs flex items-center gap-2 shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Banner</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => setIntroForm({ ...introForm, banner: event.target.result });
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <span className="text-slate-400 text-[11px]">or banner URL:</span>
                </div>
                <input
                  type="url"
                  placeholder="https://..."
                  value={introForm.banner}
                  onChange={(e) => setIntroForm({ ...introForm, banner: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="openToWork"
                  checked={introForm.isOpenToWork}
                  onChange={(e) => setIntroForm({ ...introForm, isOpenToWork: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="openToWork" className="text-slate-700 dark:text-slate-300 font-bold">
                  Enable #OpenToWork badge on profile
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditIntroOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0A66C2] text-white font-bold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit About Narrative Modal */}
      {isEditAboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit About Narrative</h3>
              <button onClick={() => setIsEditAboutOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAbout} className="space-y-3 text-xs">
              <textarea
                rows={6}
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2] leading-relaxed"
                placeholder="Share your engineering journey, architectural principles, and career milestones..."
                required
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditAboutOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0A66C2] text-white font-bold"
                >
                  Update About
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Comprehensive Upload Work / Project Modal (Fixes User's Exact Demands) */}
      {isAddArtifactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-[#0A66C2]">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Upload Your Work & Project Distribution
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Showcase deliverables, execution breakdown, and measurable impact
                  </p>
                </div>
              </div>
              <button onClick={() => setIsAddArtifactOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddArtifact} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Project / Work Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Distributed Consensus Engine"
                    value={artifactForm.title}
                    onChange={(e) => setArtifactForm({ ...artifactForm, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Your Role in this Work *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Architect, Full-Stack Developer"
                    value={artifactForm.role}
                    onChange={(e) => setArtifactForm({ ...artifactForm, role: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Category / Type</label>
                  <select
                    value={artifactForm.type}
                    onChange={(e) => setArtifactForm({ ...artifactForm, type: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                  >
                    <option>Full-Stack Web Application</option>
                    <option>Open Source Library / SDK</option>
                    <option>AI & Neural Mesh Architecture</option>
                    <option>Mobile iOS / Android System</option>
                    <option>Technical Specification / RFC</option>
                    <option>Interactive WebGL 3D Platform</option>
                    <option>Enterprise Design System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Measurable Impact / Metric *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 112,000 tx/sec with 45% lower latency"
                    value={artifactForm.metric}
                    onChange={(e) => setArtifactForm({ ...artifactForm, metric: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                    required
                  />
                </div>
              </div>

              {/* Work Distribution & Technical Architecture (Key feature) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold">
                    Work Distribution & Technical Narrative *
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Detailed responsibilities</span>
                </div>
                <textarea
                  rows={4}
                  placeholder={`Detail your exact distribution of work, responsibilities, and architecture:
• System Architecture (35%): Designed microservices layout and data pipelines.
• Core Implementation (40%): Built backend services, frontend dashboard, and state machine.
• Deployment & Benchmarks (25%): Automated testing, Docker containerization, and AWS rollout.`}
                  value={artifactForm.distribution}
                  onChange={(e) => setArtifactForm({ ...artifactForm, distribution: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2] font-sans leading-relaxed"
                  required
                />
              </div>

              {/* Technologies Used */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Technologies & Skills (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Three.js, PostgreSQL, Docker"
                  value={artifactForm.techStack}
                  onChange={(e) => setArtifactForm({ ...artifactForm, techStack: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                />
              </div>

              {/* Project Image (Optional with explicit explanation) */}
              <div className="space-y-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Project Screenshot / Diagram <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 hover:border-[#0A66C2] text-[#0A66C2] font-bold text-xs flex items-center gap-2 shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Screenshot</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => setArtifactForm({ ...artifactForm, image: event.target.result });
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <span className="text-slate-400 text-[11px]">or image URL:</span>
                </div>
                <input
                  type="url"
                  placeholder="https://... (Leave empty to automatically generate clean architectural blueprint)"
                  value={artifactForm.image}
                  onChange={(e) => setArtifactForm({ ...artifactForm, image: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                />
                {artifactForm.image && (
                  <div className="relative mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-36">
                    <img src={artifactForm.image} alt="Upload preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setArtifactForm({ ...artifactForm, image: '' })}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  💡 If omitted, an executive architectural blueprint graphic will be rendered automatically.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Live Demo URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourproject.com"
                    value={artifactForm.demoUrl}
                    onChange={(e) => setArtifactForm({ ...artifactForm, demoUrl: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Code / Repository Link (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="github.com/username/project"
                    value={artifactForm.repoUrl}
                    onChange={(e) => setArtifactForm({ ...artifactForm, repoUrl: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddArtifactOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0A66C2] text-white font-bold"
                >
                  Publish & Verify Work
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Full Work & Distribution Inspector Modal */}
      {inspectingArtifact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
            {/* Header Banner */}
            {inspectingArtifact.image ? (
              <div className="relative h-56 w-full">
                <img src={inspectingArtifact.image} alt={inspectingArtifact.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <button
                  onClick={() => setInspectingArtifact(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/60 text-white hover:bg-slate-950 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative h-40 w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-6 flex flex-col justify-between text-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                    {inspectingArtifact.type}
                  </span>
                  <button
                    onClick={() => setInspectingArtifact(null)}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{inspectingArtifact.title}</h3>
                  <p className="text-xs text-cyan-200 font-mono mt-0.5">{inspectingArtifact.role}</p>
                </div>
              </div>
            )}

            <div className="p-6 space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {inspectingArtifact.title}
                  </h3>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Proof
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#0A66C2] mt-1">
                  Designation / Role: {inspectingArtifact.role}
                </p>
              </div>

              {/* Complete Work Distribution Section */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#0A66C2]" />
                  Work Distribution & Architecture Breakdown
                </h4>
                <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                  {inspectingArtifact.distribution}
                </div>
              </div>

              {/* Measurable Results */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50">
                <span className="text-xs font-mono font-bold text-[#0A66C2] block mb-1">
                  ⚡ Measurable Impact & Benchmarks:
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                  {inspectingArtifact.metric}
                </p>
              </div>

              {/* Tech Stack */}
              {inspectingArtifact.techStack && (
                <div>
                  <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Technologies & Skills Deployed:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {inspectingArtifact.techStack.split(',').map((t, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                      >
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links & Close */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {inspectingArtifact.demoUrl && (
                    <a
                      href={inspectingArtifact.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#0A66C2] text-white text-xs font-bold hover:bg-blue-700 flex items-center gap-1.5"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Open Live Demo</span>
                    </a>
                  )}
                  {inspectingArtifact.link && (
                    <a
                      href={`https://${inspectingArtifact.link.replace(/^https?:\/\//, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Source Code</span>
                    </a>
                  )}
                </div>

                <button
                  onClick={() => setInspectingArtifact(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Add Experience Modal */}
      {isAddExperienceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Experience Position</h3>
              <button onClick={() => setIsAddExperienceOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExperience} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Title / Role</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Software Architect"
                  value={expForm.role}
                  onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Company</label>
                <input
                  type="text"
                  placeholder="e.g. Meta / Google / BrainLink Labs"
                  value={expForm.company}
                  onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Time Period</label>
                  <input
                    type="text"
                    value={expForm.period}
                    onChange={(e) => setExpForm({ ...expForm, period: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Location</label>
                  <input
                    type="text"
                    value={expForm.location}
                    onChange={(e) => setExpForm({ ...expForm, location: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={expForm.description}
                  onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                  placeholder="Summarize key responsibilities and technical wins..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddExperienceOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0A66C2] text-white font-bold"
                >
                  Add Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Add Skill Modal */}
      {isAddSkillOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add New Skill</h3>
              <button onClick={() => setIsAddSkillOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Skill Name</label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Consensus, Next.js, Rust"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSkillOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0A66C2] text-white font-bold"
                >
                  Add Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
