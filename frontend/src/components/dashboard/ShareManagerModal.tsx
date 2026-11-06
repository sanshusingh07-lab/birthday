import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { 
  Share2, 
  Copy, 
  Check, 
  Download, 
  Lock, 
  Globe, 
  RefreshCw, 
  Eye, 
  Calendar, 
  ShieldAlert, 
  X, 
  ToggleLeft, 
  ToggleRight,
  ExternalLink,
  QrCode
} from 'lucide-react';
import type { BirthdaySurprise, AnalyticsData } from '../../types/birthday';
import { 
  updateShareSettings, 
  regenerateShareLink, 
  toggleShareLink, 
  getSurpriseAnalytics 
} from '../../utils/api';
import { sound } from '../../utils/audio';

interface ShareManagerModalProps {
  surprise: BirthdaySurprise;
  isOpen: boolean;
  onClose: () => void;
  onSurpriseUpdated?: (updated: BirthdaySurprise) => void;
}

export const ShareManagerModal: React.FC<ShareManagerModalProps> = ({
  surprise,
  isOpen,
  onClose,
  onSurpriseUpdated
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'share' | 'access' | 'analytics'>('share');
  const [slug, setSlug] = useState<string>(surprise.unique_slug);
  const [isActive, setIsActive] = useState<boolean>(surprise.is_active ?? true);
  const [visibility, setVisibility] = useState<string>(surprise.visibility || 'unlisted');
  const [password, setPassword] = useState<string>('');
  const [hasPassword, setHasPassword] = useState<boolean>(surprise.has_password ?? false);
  const [expiresAt, setExpiresAt] = useState<string>(surprise.expires_at ? surprise.expires_at.slice(0, 10) : '');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute full shareable URL
  const shareUrl = `${window.location.origin}/s/${slug}`;

  // Draw QR code on canvas whenever slug changes or modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, shareUrl, {
        width: 240,
        margin: 2,
        color: {
          dark: '#170D2D',
          light: '#FFFFFF'
        }
      }).catch(err => console.error("QR Code Error:", err));
    }

    // Fetch live analytics
    if (surprise.id) {
      getSurpriseAnalytics(surprise.id)
        .then(data => setAnalytics(data))
        .catch(() => {});
    }
  }, [isOpen, slug, shareUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPNG = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `birthday-surprise-${surprise.recipient_name.toLowerCase()}-qr.png`;
    a.click();
    sound.playSparkle();
  };

  const handleDownloadSVG = async () => {
    try {
      const svgString = await QRCode.toString(shareUrl, { type: 'svg', margin: 2 });
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `birthday-surprise-${surprise.recipient_name.toLowerCase()}-qr.svg`;
      a.click();
      sound.playSparkle();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAccessSettings = async () => {
    if (!surprise.id) return;
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await updateShareSettings(surprise.id, {
        visibility: visibility as any,
        password: password.trim() ? password.trim() : (hasPassword ? undefined : ''),
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        is_active: isActive
      });
      setStatusMsg("Access controls updated successfully! ✨");
      setHasPassword(res.has_password);
      if (onSurpriseUpdated) {
        onSurpriseUpdated({
          ...surprise,
          visibility: res.visibility,
          is_active: res.is_active,
          has_password: res.has_password,
          expires_at: res.expires_at
        });
      }
      sound.playSparkle();
    } catch (err: any) {
      setStatusMsg("Failed to update: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateLink = async () => {
    if (!surprise.id) return;
    const confirmed = window.confirm(
      "Regenerate Link? The previous link will become invalid immediately. The recipient will need the new link."
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await regenerateShareLink(surprise.id);
      setSlug(res.unique_slug);
      setStatusMsg("New unique link generated! Previous link was invalidated.");
      if (onSurpriseUpdated) {
        onSurpriseUpdated({ ...surprise, unique_slug: res.unique_slug });
      }
      sound.playSparkle();
    } catch (err: any) {
      setStatusMsg("Failed to regenerate: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!surprise.id) return;
    try {
      const res = await toggleShareLink(surprise.id);
      setIsActive(res.is_active);
      setStatusMsg(res.is_active ? "Link enabled! Recipient can view." : "Link disabled! Recipient cannot view.");
      if (onSurpriseUpdated) {
        onSurpriseUpdated({ ...surprise, is_active: res.is_active });
      }
      sound.playClick();
    } catch (err: any) {
      setStatusMsg("Failed to toggle link: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#FFBFA8]/60 relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E85B32] to-[#FF80AB] text-white flex items-center justify-center shadow-md">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#38251F]">
              Share & QR Code System
            </h3>
            <p className="text-xs text-[#38251F]/60">
              For {surprise.recipient_name}'s Birthday Surprise
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1 bg-[#FFF6F0] rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'share' ? 'bg-[#E85B32] text-white shadow-xs' : 'text-[#38251F]/70'
            }`}
          >
            Link & QR Code
          </button>
          <button
            onClick={() => setActiveTab('access')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'access' ? 'bg-[#E85B32] text-white shadow-xs' : 'text-[#38251F]/70'
            }`}
          >
            Access & Security
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'analytics' ? 'bg-[#E85B32] text-white shadow-xs' : 'text-[#38251F]/70'
            }`}
          >
            Analytics & Stats
          </button>
        </div>

        {/* Status Message Notification */}
        {statusMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
            <span>{statusMsg}</span>
            <button onClick={() => setStatusMsg(null)} className="text-emerald-600 font-bold ml-2">×</button>
          </div>
        )}

        {/* ── TAB 1: LINK & QR CODE ── */}
        {activeTab === 'share' && (
          <div className="space-y-6">
            {/* Share URL Box */}
            <div>
              <label className="block text-xs font-bold text-[#38251F] uppercase tracking-wider mb-2">
                Unique Shareable Birthday Link
              </label>
              <div className="flex items-center gap-2 p-2 rounded-2xl bg-[#FFF6F0] border border-[#FFBFA8]">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-1.5 bg-transparent text-xs font-mono text-[#38251F] outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#E85B32] hover:bg-[#d44e26] text-white shadow-xs'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Link"}</span>
                </button>
              </div>
            </div>

            {/* QR Code Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#FFF6F0] to-[#FFEBE5] border border-[#FFBFA8]/60 flex flex-col sm:flex-row items-center gap-6">
              <div className="p-2.5 bg-white rounded-2xl shadow-md border border-gray-100 shrink-0">
                <canvas ref={canvasRef} className="w-36 h-36 rounded-lg" />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h4 className="font-bold text-sm text-[#38251F] mb-1">
                  Branded Birthday QR Code
                </h4>
                <p className="text-xs text-[#38251F]/70 mb-4 leading-relaxed">
                  Print this QR code on a real gift card, send it via WhatsApp, or include it in a photo album!
                </p>

                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <button
                    onClick={handleDownloadPNG}
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#FFBFA8] hover:border-[#E85B32] text-xs font-bold text-[#E85B32] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </button>

                  <button
                    onClick={handleDownloadSVG}
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#FFBFA8] hover:border-[#E85B32] text-xs font-bold text-[#38251F] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download SVG</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Action: Open Preview in new tab */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <a
                href={`/s/${slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-[#E85B32] hover:underline flex items-center gap-1"
              >
                <span>Preview recipient experience in new tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleRegenerateLink}
                disabled={loading}
                className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                title="Invalidates current link and creates a new one"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Regenerate Link</span>
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 2: ACCESS & SECURITY ── */}
        {activeTab === 'access' && (
          <div className="space-y-5">
            {/* Link Active / Disabled Toggle */}
            <div className="p-4 rounded-2xl bg-[#FFF6F0] border border-[#FFBFA8] flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-[#38251F] uppercase tracking-wider">
                  Link Access Status
                </h4>
                <p className="text-xs text-[#38251F]/70">
                  {isActive ? "Link is Active (anyone with link can open)" : "Link is Disabled (access blocked)"}
                </p>
              </div>
              <button
                onClick={handleToggleActive}
                className="cursor-pointer text-[#E85B32]"
              >
                {isActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-gray-400" />}
              </button>
            </div>

            {/* Password Protection */}
            <div className="p-4 rounded-2xl bg-[#FFF6F0] border border-[#FFBFA8] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#E85B32]" />
                  <span className="font-bold text-xs text-[#38251F] uppercase tracking-wider">
                    Secret Password Protection
                  </span>
                </div>
                {hasPassword && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Protected
                  </span>
                )}
              </div>
              <p className="text-xs text-[#38251F]/70">
                When enabled, the birthday star must enter this secret code before the surprise reveals itself:
              </p>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={hasPassword ? "Leave blank to keep password, or enter new code" : "Set secret password (e.g. maya2026)"}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#FFBFA8] text-xs font-mono text-[#38251F] outline-none"
              />
              {hasPassword && (
                <button
                  type="button"
                  onClick={() => {
                    setPassword('');
                    setHasPassword(false);
                    setVisibility('unlisted');
                  }}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Remove Password Protection
                </button>
              )}
            </div>

            {/* Expiry Date */}
            <div className="p-4 rounded-2xl bg-[#FFF6F0] border border-[#FFBFA8] space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#E85B32]" />
                <span className="font-bold text-xs text-[#38251F] uppercase tracking-wider">
                  Automatic Expiration Date (Optional)
                </span>
              </div>
              <p className="text-xs text-[#38251F]/70">
                Surprise will automatically lock after this date:
              </p>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#FFBFA8] text-xs text-[#38251F] outline-none"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveAccessSettings}
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-[#E85B32] hover:bg-[#d44e26] text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "Saving Access Controls..." : "Save Access Settings"}
            </button>
          </div>
        )}

        {/* ── TAB 3: ANALYTICS & STATS ── */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <p className="text-xs text-[#38251F]/70 font-medium">
              Real-time activity and delivery metrics for this birthday surprise:
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-[#FFF6F0] border border-[#FFBFA8]/60 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#38251F]/60 mb-1">
                  <Eye className="w-3.5 h-3.5 text-[#E85B32]" />
                  <span>Total Views</span>
                </div>
                <span className="font-serif text-3xl font-black text-[#E85B32]">
                  {analytics?.view_count ?? surprise.view_count ?? 0}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF6F0] border border-[#FFBFA8]/60 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#38251F]/60 mb-1">
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Status</span>
                </div>
                <span className="font-bold text-sm text-emerald-700">
                  {analytics?.is_active ? "Active Link" : "Disabled"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-100 text-xs text-[#38251F]/80 space-y-2">
              <div className="flex items-center justify-between">
                <span>Last Viewed Timestamp:</span>
                <span className="font-mono text-gray-500">
                  {analytics?.last_viewed_at ? new Date(analytics.last_viewed_at).toLocaleString() : 'Not opened yet'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Access Security Mode:</span>
                <span className="font-semibold capitalize text-[#E85B32]">
                  {hasPassword ? 'Password Protected 🔒' : 'Unlisted Link 🌐'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Expiration:</span>
                <span className="font-mono text-gray-500">
                  {analytics?.expires_at ? new Date(analytics.expires_at).toLocaleDateString() : 'Never expires'}
                </span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

