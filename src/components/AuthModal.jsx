import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  KeyRound
} from 'lucide-react';
import { registerUser, loginUser, getOAuthConfig, setAuthToken } from '../api';

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'signin' // 'signin' | 'signup'
}) {
  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Keep mode synchronized with parent initialMode
  useEffect(() => {
    setMode(initialMode);
    setError('');
    setSuccessMsg('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  // Handle Real Social Providers (Google, GitHub, X)
  const handleSocialAuth = async (provider) => {
    setError('');
    setSuccessMsg('');
    setLoadingProvider(provider);

    try {
      const config = await getOAuthConfig();
      const provConfig = config ? config[provider] : null;

      if (provConfig && provConfig.configured) {
        // Real OAuth redirection
        const apiBaseUrl = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') : '');
        window.location.href = `${apiBaseUrl}/api/auth/oauth/${provider}`;
      } else {
        const provName = provider === 'google' ? 'Google' : provider === 'github' ? 'GitHub' : 'Twitter / X';
        setError(`${provName} sign-in is not yet configured on this deployment. Please sign in or register with your email and password below.`);
      }
    } catch (err) {
      setError(err.message || `Unable to initiate ${provider} authentication. Please try email login.`);
    } finally {
      setLoadingProvider(null);
    }
  };

  // Handle Email / Password Sign In & Sign Up
  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setOauthNotice(null);

    const emailTrimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailTrimmed) {
      setError('Email address is required.');
      return;
    }

    if (!emailRegex.test(emailTrimmed)) {
      setError('Please provide a valid email format (e.g., name@company.com).');
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
        setSuccessMsg('Account created successfully! Signing in...');
        setTimeout(() => {
          onLoginSuccess(res.user);
          onClose();
        }, 500);
      } else {
        const res = await loginUser({
          email: emailTrimmed,
          password
        });

        setAuthToken(res.token);
        setSuccessMsg('Welcome back! Signing in...');
        setTimeout(() => {
          onLoginSuccess(res.user);
          onClose();
        }, 500);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0A66C2] to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/25">
            <span className="text-white font-black text-2xl">W</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {mode === 'signup' ? 'Join Workmark' : 'Welcome Back'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'signup'
              ? 'Create your verified proof-of-work talent dossier'
              : 'Sign in to access your verified career network'}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 p-1 mb-5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError('');
              setSuccessMsg('');
            }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'signin'
                ? 'bg-white dark:bg-slate-900 text-[#0A66C2] shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
              setSuccessMsg('');
            }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-white dark:bg-slate-900 text-[#0A66C2] shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Social Authentication Buttons */}
        <div className="space-y-2.5 mb-5">
          {/* 1. Google OAuth */}
          <button
            type="button"
            onClick={() => handleSocialAuth('google')}
            disabled={!!loadingProvider}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all shadow-sm hover:border-slate-400 dark:hover:border-slate-600"
          >
            {loadingProvider === 'google' ? (
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {/* 2. GitHub OAuth */}
          <button
            type="button"
            onClick={() => handleSocialAuth('github')}
            disabled={!!loadingProvider}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-2xl bg-[#24292F] hover:bg-[#1B1F24] text-white text-xs font-bold transition-all shadow-sm"
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

          {/* 3. Twitter / X OAuth */}
          <button
            type="button"
            onClick={() => handleSocialAuth('twitter')}
            disabled={!!loadingProvider}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all shadow-sm"
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

        {/* Email & Password Form */}
        <form onSubmit={handleSubmitEmail} className="space-y-3 text-xs">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#0A66C2] text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Professional Title / Role
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Senior Software Architect"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#0A66C2] text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#0A66C2] text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#0A66C2] text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingProvider === 'email'}
            className="w-full py-2.5 mt-2 rounded-2xl bg-[#0A66C2] hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            {loadingProvider === 'email' ? (
              <div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'signup' ? 'Agree & Join Workmark' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Policy Info */}
        <p className="mt-4 text-[10px] text-center text-slate-400 leading-tight">
          By clicking Agree & Join, you accept Workmark's{' '}
          <span className="text-[#0A66C2] underline cursor-pointer">User Agreement</span>,{' '}
          <span className="text-[#0A66C2] underline cursor-pointer">Privacy Policy</span>, and{' '}
          <span className="text-[#0A66C2] underline cursor-pointer">Cookie Policy</span>.
        </p>
      </div>
    </div>
  );
}
