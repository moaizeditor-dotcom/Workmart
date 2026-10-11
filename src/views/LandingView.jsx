import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Users,
  KeyRound
} from 'lucide-react';
import { registerUser, loginUser, getOAuthConfig, setAuthToken } from '../api';

export default function LandingView({
  onLoginSuccess,
  onExploreGuest,
  onOpenAuth
}) {
  const [mode, setMode] = useState('signup'); // 'signup' | 'signin'
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [error, setError] = useState('');

  const handleSocialLogin = async (provider) => {
    setLoadingProvider(provider);
    setError('');

    try {
      const config = await getOAuthConfig();
      const provConfig = config ? config[provider] : null;

      if (provConfig && provConfig.configured) {
        const apiBaseUrl = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') : '');
        window.location.href = `${apiBaseUrl}/api/auth/oauth/${provider}`;
      } else {
        const provName = provider === 'google' ? 'Google' : provider === 'github' ? 'GitHub' : 'Twitter / X';
        setError(`${provName} sign-in is not yet configured on this deployment. Please register or sign in with your email and password below.`);
      }
    } catch (err) {
      setError(err.message || `Unable to initiate ${provider} authentication. Please try email login.`);
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailTrimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailTrimmed) {
      setError('Please provide an email address.');
      return;
    }
    if (!emailRegex.test(emailTrimmed)) {
      setError('Please enter a valid email format (e.g., name@company.com).');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (mode === 'signup' && !fullName.trim()) {
      setError('Please enter your full legal or professional name.');
      return;
    }

    setLoadingProvider('email');

    try {
      if (mode === 'signup') {
        const res = await registerUser({
          name: fullName.trim(),
          email: emailTrimmed,
          password,
          role: headline.trim() || 'Software Engineer'
        });
        setAuthToken(res.token);
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        }
      } else {
        const res = await loginUser({
          email: emailTrimmed,
          password
        });
        setAuthToken(res.token);
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0A66C2] to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="font-black text-white text-xl">W</span>
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Work<span className="text-[#0A66C2]">mark</span>
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium -mt-1 hidden sm:block">
              Verified Talent Network
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onExploreGuest && onExploreGuest()}
            className="hidden md:inline-flex px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#0A66C2] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Explore as Guest
          </button>
          <button
            onClick={() => {
              setMode('signup');
              if (onOpenAuth) onOpenAuth('signup');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#0A66C2] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Join now
          </button>
          <button
            onClick={() => {
              setMode('signin');
              if (onOpenAuth) onOpenAuth('signin');
            }}
            className="px-5 py-2 rounded-xl border border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-bold transition-all shadow-sm"
          >
            Sign in
          </button>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Heading & Authentication Form */}
        <div className="lg:col-span-7 space-y-6">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            Welcome to your <span className="text-[#0A66C2]">verified</span> professional community
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
            Showcase verified proof-of-work, connect with industry leaders, and discover high-impact roles at top technology companies.
          </p>

          {/* Inline Auth Card (Google, GitHub, Twitter, Email) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg">
            {/* Social Authentication */}
            <div className="space-y-3 mb-5">
              {/* Google */}
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={!!loadingProvider}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white text-xs font-bold transition-all shadow-sm hover:border-slate-400"
              >
                {loadingProvider === 'google' ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              {/* GitHub */}
              <button
                type="button"
                onClick={() => handleSocialLogin('github')}
                disabled={!!loadingProvider}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-[#24292F] hover:bg-[#1B1F24] text-white text-xs font-bold transition-all shadow-sm"
              >
                {loadingProvider === 'github' ? (
                  <div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                )}
                <span>Continue with GitHub</span>
              </button>

              {/* Twitter / X */}
              <button
                type="button"
                onClick={() => handleSocialLogin('twitter')}
                disabled={!!loadingProvider}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white text-xs font-bold transition-all shadow-sm"
              >
                {loadingProvider === 'twitter' ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                )}
                <span>Continue with X (Twitter)</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-medium">or with email</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3 text-xs">
              {error && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 text-xs">
                  {error}
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="6 or more characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0A66C2]"
                />
              </div>

              <button
                type="submit"
                disabled={!!loadingProvider}
                className="w-full py-3 mt-1 rounded-2xl bg-[#0A66C2] hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <span>{mode === 'signup' ? 'Agree & Join Workmark' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center text-[11px] text-slate-500">
                {mode === 'signup' ? (
                  <span>
                    Already on Workmark?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="text-[#0A66C2] font-bold hover:underline"
                    >
                      Sign in
                    </button>
                  </span>
                ) : (
                  <span>
                    New to Workmark?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-[#0A66C2] font-bold hover:underline"
                    >
                      Join now
                    </button>
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Platform Proof & Verified Features */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#0A66C2]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Proof-of-Work Verification</h4>
                <p className="text-xs text-slate-500">Cryptographically vouched code & architecture</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Unlike traditional resumes, Workmark anchors measurable benchmarks, system distribution breakdowns, and technical deliverables.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Direct Engineering Roles</h4>
                <p className="text-xs text-slate-500">Connect directly with engineering leaders</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              1-Click Easy Apply with your complete technical portfolio and distribution dossiers directly to hiring leads.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Verified Peer Constellation</h4>
                <p className="text-xs text-slate-500">1st, 2nd & 3rd degree talent graph</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Real-time messaging, interactive discussions, and endorsement tracking across the talent network.
            </p>
          </div>

          {/* Guest Link */}
          <div className="text-center pt-2">
            <button
              onClick={() => onExploreGuest && onExploreGuest()}
              className="text-xs text-[#0A66C2] font-bold hover:underline inline-flex items-center gap-1.5"
            >
              <span>Preview feed and explore network as guest</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-4 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-500 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-800 dark:text-slate-200">Workmark</span>
            <span>© 2026 Workmark Corporation. Verified Professional Network.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hover:text-[#0A66C2] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#0A66C2] cursor-pointer">User Agreement</span>
            <span className="hover:text-[#0A66C2] cursor-pointer">Cookie Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
