import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Sparkles, Gift } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalTab, closeAuthModal, login, register, openAuthModal } = useAuth();

  const [tab, setTab] = useState<'login' | 'register'>(authModalTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Sync tab when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      setTab(authModalTab);
      setError('');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
  }, [isAuthModalOpen, authModalTab]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAuthModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeAuthModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (tab === 'register') {
      if (!name.trim()) return setError('Please enter your name.');
      if (password.length < 6) return setError('Password must be at least 6 characters.');
      if (password !== confirmPassword) return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      if (tab === 'login') {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === overlayRef.current) closeAuthModal(); }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md bg-[#FFF6F0] rounded-3xl shadow-2xl overflow-hidden z-10"
          >
            {/* Header gradient band */}
            <div className="bg-gradient-to-r from-[#E85B32] to-[#FFBFA8] px-8 pt-8 pb-6 relative">
              <button
                onClick={closeAuthModal}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-white">Birthday Magic</h2>
                  <p className="text-white/70 text-xs">Personalized Platform</p>
                </div>
              </div>

              <p className="text-white/90 text-sm mt-1">
                {tab === 'login'
                  ? 'Welcome back! Sign in to access your surprises.'
                  : 'Create an account to save and share birthday surprises! 🎁'}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#FFBFA8]/40 bg-white/50 mx-6 mt-5 rounded-xl overflow-hidden">
              {(['login', 'register'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(''); openAuthModal(t); }}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-all cursor-pointer rounded-xl ${
                    tab === t
                      ? 'bg-[#E85B32] text-white shadow-sm'
                      : 'text-[#38251F]/60 hover:text-[#E85B32]'
                  }`}
                >
                  {t === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {tab === 'register' && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E85B32]/60" />
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#FFBFA8]/60 bg-white text-[#38251F] text-sm placeholder-[#38251F]/40 focus:outline-none focus:ring-2 focus:ring-[#E85B32]/40 focus:border-[#E85B32] transition-all"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E85B32]/60" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#FFBFA8]/60 bg-white text-[#38251F] text-sm placeholder-[#38251F]/40 focus:outline-none focus:ring-2 focus:ring-[#E85B32]/40 focus:border-[#E85B32] transition-all"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E85B32]/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-[#FFBFA8]/60 bg-white text-[#38251F] text-sm placeholder-[#38251F]/40 focus:outline-none focus:ring-2 focus:ring-[#E85B32]/40 focus:border-[#E85B32] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#38251F]/40 hover:text-[#E85B32] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {tab === 'register' && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E85B32]/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#FFBFA8]/60 bg-white text-[#38251F] text-sm placeholder-[#38251F]/40 focus:outline-none focus:ring-2 focus:ring-[#E85B32]/40 focus:border-[#E85B32] transition-all"
                  />
                </div>
              )}

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-500 text-xs font-medium bg-red-50 border border-red-200 rounded-xl px-4 py-2.5"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E85B32] to-[#F7A6A0] hover:from-[#d44e26] hover:to-[#e88c85] text-white font-bold text-sm shadow-lg shadow-[#E85B32]/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {tab === 'login' ? 'Sign In' : 'Create Account'}
                  </>
                )}
              </button>

              <p className="text-center text-xs text-[#38251F]/50">
                {tab === 'login' ? (
                  <>Don't have an account?{' '}
                    <button type="button" onClick={() => { setTab('register'); setError(''); }} className="text-[#E85B32] font-semibold hover:underline cursor-pointer">Sign up free</button>
                  </>
                ) : (
                  <>Already have an account?{' '}
                    <button type="button" onClick={() => { setTab('login'); setError(''); }} className="text-[#E85B32] font-semibold hover:underline cursor-pointer">Sign in</button>
                  </>
                )}
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
